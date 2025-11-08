from fastapi import FastAPI, Query
import psycopg2
from psycopg2.extras import RealDictCursor
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import re
import os
import pickle

# -------------------------------
# ⚙️ 1. Konfigurácia DB
# -------------------------------
DB_SERVER = "localhost"
DB_USER = "receipts_user"
DB_PASSWORD = "mypassword"
DB_NAME = "receiptsdb"
PORT = 15432

# -------------------------------
# ⚙️ 2. Inicializácia aplikácie
# -------------------------------
app = FastAPI(title="Receipts Vector AI Backend (with SQL fallback + training)")

# -------------------------------
# 🧠 3. Pripojenie k DB
# -------------------------------
def fetch_all_receipts():
    conn = psycopg2.connect(
        host=DB_SERVER,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=PORT
    )
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM item;")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records

# -------------------------------
# 🔢 4. Modely a ukladanie indexu
# -------------------------------
embeddings = OllamaEmbeddings(model="mxbai-embed-large")
llm = OllamaLLM(model="llama3:instruct")

VECTOR_DIR = "vector_index"
os.makedirs(VECTOR_DIR, exist_ok=True)
FAISS_PATH = os.path.join(VECTOR_DIR, "receipts_index.faiss")
META_PATH = os.path.join(VECTOR_DIR, "receipts_meta.pkl")

vector_store = None

# -------------------------------
# 🚀 5. Endpoint: vektorizácia a uloženie
# -------------------------------
@app.get("/ai/vectorize")
async def vectorize_db():
    global vector_store
    records = fetch_all_receipts()
    if not records:
        return {"message": "Databáza je prázdna."}

    documents = []
    for r in records:
        text = " | ".join([f"{k}: {v}" for k, v in r.items()])
        documents.append(Document(page_content=text))

    # vytvor FAISS index a ulož ho
    vector_store = FAISS.from_documents(documents, embeddings)
    vector_store.save_local(FAISS_PATH)

    with open(META_PATH, "wb") as f:
        pickle.dump({"count": len(documents)}, f)

    return {"message": f"Naindexovaných {len(documents)} záznamov z databázy."}


# -------------------------------
# 🧬 6. Endpoint: tréning (rozšírenie indexu)
# -------------------------------
@app.get("/ai/train")
async def train_vector_model():
    """
    Pokročilý tréning – rozdelí texty z DB na menšie kúsky a vytvorí robustnejší FAISS index.
    Ide o formu "RAG tréningu", nie o klasický fine-tuning modelu.
    """
    global vector_store
    records = fetch_all_receipts()
    if not records:
        return {"message": "Databáza je prázdna."}

    documents = []
    for r in records:
        text = " | ".join([f"{k}: {v}" for k, v in r.items()])
        documents.append(Document(page_content=text))

    # rozdelenie textov na menšie kúsky
    splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    split_docs = splitter.split_documents(documents)

    vector_store = FAISS.from_documents(split_docs, embeddings)
    vector_store.save_local(FAISS_PATH)

    with open(META_PATH, "wb") as f:
        pickle.dump({"chunks": len(split_docs)}, f)

    return {"message": f"Model natrénovaný s {len(split_docs)} časticami (RAG index)."}


# -------------------------------
# 🧭 7. Endpoint: AI otázky s SQL fallbackom
# -------------------------------
@app.get("/ai/ask")
async def ask_ai(prompt: str = Query(..., description="Otázka pre AI")):
    global vector_store

    # 🧮 SQL fallback pre otázky o súčtoch, priemeroch a celkových sumách
    if re.search(r"(koľko|sum|spolu|celková|total|sumu|suma)", prompt.lower()):
        if re.search(r"(pivo|beer)", prompt.lower()):
            conn = psycopg2.connect(
                host=DB_SERVER, database=DB_NAME,
                user=DB_USER, password=DB_PASSWORD, port=PORT
            )
            cursor = conn.cursor()
            cursor.execute("""
                SELECT SUM(price) FROM item
                WHERE name ILIKE '%pivo%' OR ai_name_in_english_without_brand_and_quantity ILIKE '%beer%';
            """)
            total = cursor.fetchone()[0]
            cursor.close()
            conn.close()

            if total:
                return {"question": prompt, "answer": f"Spolu si minul {total:.2f} € na pivá 🍺."}
            else:
                return {"question": prompt, "answer": "V databáze som nenašiel žiadne pivá."}

    # 🔄 Načítaj FAISS index z disku, ak ešte nie je v pamäti
    if vector_store is None:
        try:
            vector_store = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
        except Exception:
            return {"error": "Vektorový index neexistuje. Najskôr spusti /ai/vectorize alebo /ai/train."}

    # 🔎 Vyhľadaj najrelevantnejšie riadky
    results = vector_store.similarity_search(prompt, k=20)
    if not results:
        return {"answer": "Nenašli sa žiadne relevantné výsledky."}

    # 🧹 Vyčisti kontext
    def clean_context(documents):
        cleaned = []
        for d in documents:
            text = re.sub(r'\s*\|\s*', ', ', d.page_content)
            cleaned.append(text)
        return "\n".join(cleaned)

    context = clean_context(results)

    # 🧠 Prompt pre LLaMA3
    full_prompt = f"""
    Si inteligentný analytický asistent. Na základe údajov z databázy odpovedz na otázku používateľa.
    Každý riadok obsahuje:
    - názov produktu (name)
    - cenu (price)
    - kategóriu (ai_category)
    - značku (ai_brand)

    Tu sú najrelevantnejšie dáta:
    {context}

    Odpovedz výhradne na základe údajov vyššie.
    Buď presný, odpovedz maximálne v 2 vetách.
    Otázka používateľa: {prompt}
    """

    answer = llm.invoke(full_prompt)

    return {
        "question": prompt,
        "answer": answer.strip(),
        "context_used": len(results)
    }


# -------------------------------
# 🏠 8. Root endpoint
# -------------------------------
@app.get("/")
async def root():
    return {"message": "Vector AI backend (LLaMA3 + SQL fallback + tréning) beží 🚀"}
