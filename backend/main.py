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
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body

DB_SERVER = "localhost"
DB_USER = "receipts_user"
DB_PASSWORD = "mypassword"
DB_NAME = "receiptsdb"
PORT = 15432

app = FastAPI(title="Receipts Vector AI Backend (with SQL fallback + training)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_all_receipts():   #<< nacitanie z databazy
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

embeddings = OllamaEmbeddings(model="mxbai-embed-large")
llm = OllamaLLM(model="llama3:instruct")

VECTOR_DIR = "vector_index"
os.makedirs(VECTOR_DIR, exist_ok=True)
FAISS_PATH = os.path.join(VECTOR_DIR, "receipts_index.faiss")
META_PATH = os.path.join(VECTOR_DIR, "receipts_meta.pkl")

vector_store = None

@app.get("/ai/vectorize")    #<< vektorizovanie, spracovanie databazy do vektorov 
async def vectorize_db():
    global vector_store
    records = fetch_all_receipts()
    if not records:
        return {"message": "Databáza je prázdna."}

    documents = []
    for r in records:
        text = " | ".join([f"{k}: {v}" for k, v in r.items()])
        documents.append(Document(page_content=text))

    vector_store = FAISS.from_documents(documents, embeddings)
    vector_store.save_local(FAISS_PATH)

    with open(META_PATH, "wb") as f:
        pickle.dump({"count": len(documents)}, f)

    return {"message": f"Naindexovaných {len(documents)} záznamov z databázy."}

def run_sql_query(sql: str):  
    if not sql.strip().lower().startswith("select"):
        return {"error": "Povolené sú len SELECT dotazy!"}
    try:
        conn = psycopg2.connect(
            host=DB_SERVER, database=DB_NAME,
            user=DB_USER, password=DB_PASSWORD, port=PORT
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(sql)
        records = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"result": records}
    except Exception as e:
        return {"error": str(e)}

@app.get("/ai/sql")   #pociatocna query pre trenovanie + spracovany prompt od usera posunuty ai modelu
async def ai_sql(prompt: str = Query(..., description="Otázka, ktorú AI prevedie na SQL dotaz")):
    system_prompt = """
Si vysoko presný, logicky uvažujúci SQL analytik a dátový asistent pre PostgreSQL.
Tvojou úlohou je analyzovať otázky používateľa (v slovenčine alebo angličtine) a prekladať ich 
do presných, optimalizovaných SQL SELECT dotazov. Vieš tiež odhaliť kontext alebo vzorce správania 
na základe údajov v databáze (napr. nákupy detských produktov, krmiva, hygieny, domácnosti, alkoholu, atď.).

Databáza obsahuje tabuľku "item" so stĺpcami:
- id (integer)
- transaction_id (integer)
- quantity (float)
- name (text)
- price (float)
- ai_name_without_brand_and_quantity (text)
- ai_name_in_english_without_brand_and_quantity (text)
- ai_brand (text)
- ai_category (text)
- ai_quantity_value (float)
- ai_quantity_unit (text)

Generuj výhradne SQL SELECT dotazy vhodné pre PostgreSQL.
Nikdy nepridávaj komentáre ani texty navyše – výsledok musí byť čistý SQL dotaz ukončený bodkočiarkou.
Vždy používaj aliasy pre prehľadnosť.
Používaj len existujúce stĺpce.
Používaj COUNT(*), SUM(price), AVG(price), ORDER BY, LIMIT, GROUP BY.
Používaj ILIKE pre textové filtre a synonymá.
Ak otázka obsahuje obdobie, použi transaction_id ako poradový indikátor.
Ak otázka obsahuje množstvá, použij quantity, ai_quantity_value a ai_quantity_unit.
Ak otázka obsahuje “najviac kupované”, “top produkty”, “najväčší výdavok”, použij GROUP BY a ORDER BY DESC.

Ak otázka naznačuje správanie používateľa, analyzuj údaje logicky a neutrálne:
- baby produkty → má dieťa
- pet produkty → má domáce zviera
- alkohol → kupuje alkohol
- domáce potreby → domáce potreby
- potraviny → potraviny

V takých prípadoch odpovedz dátovo podloženým záverom.
"""

    full_prompt = f"{system_prompt}\nOtázka používateľa: {prompt}\nSQL dotaz:"
    sql_query = llm.invoke(full_prompt).strip()

    if not sql_query.lower().startswith("select"):
        return {"error": "AI nevygenerovala SELECT dotaz.", "sql": sql_query}

    sql_result = run_sql_query(sql_query)

    return {
        "question": prompt,
        "generated_sql": sql_query,
        "result": sql_result
    }

@app.get("/ai/train")     #<< trenovanie modelu na zaklade vektorov vo FAISS
async def train_vector_model():
    global vector_store
    records = fetch_all_receipts()
    if not records:
        return {"message": "Databáza je prázdna."}

    documents = []
    for r in records:
        text = " | ".join([f"{k}: {v}" for k, v in r.items()])
        documents.append(Document(page_content=text))

    splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    split_docs = splitter.split_documents(documents)

    vector_store = FAISS.from_documents(split_docs, embeddings)
    vector_store.save_local(FAISS_PATH)

    with open(META_PATH, "wb") as f:
        pickle.dump({"chunks": len(split_docs)}, f)

    return {"message": f"Model natrénovaný s {len(split_docs)} časticami (RAG index)."}

@app.get("/ai/ask")    #<<posielanie promptov ai modelu
async def ask_ai(prompt: str = Query(..., description="Otázka pre AI")):
    global vector_store

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
                return {"question": prompt, "answer": f"Spolu si minul {total:.2f} € na pivá."}
            else:
                return {"question": prompt, "answer": "V databáze som nenašiel žiadne pivá."}

    if vector_store is None:
        try:
            vector_store = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
        except Exception:
            return {"error": "Vektorový index neexistuje. Najskôr spusti /ai/vectorize alebo /ai/train."}

    results = vector_store.similarity_search(prompt, k=20)
    if not results:
        return {"answer": "Nenašli sa žiadne relevantné výsledky."}

    def clean_context(documents):
        cleaned = []
        for d in documents:
            text = re.sub(r'\s*\|\s*', ', ', d.page_content)
            cleaned.append(text)
        return "\n".join(cleaned)

    context = clean_context(results)

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

@app.get("/")
async def root():
    return {"message": "Vector AI backend (LLaMA3 + SQL fallback + tréning) beží"}


def get_db_connection():
    return psycopg2.connect(
        host=DB_SERVER,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=PORT
    )


def fetch_all_goals(conn):
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM saving_goals ORDER BY end_date;")
    records = cursor.fetchall()
    cursor.close()
    return records


@app.post("/goals")
async def add_goal(
    name: str = Body(...),
    category: str = Body(...),
    description: str = Body(None),
    budget_ai: float = Body(...),
    target_amount: float = Body(...),
    start_date: str = Body(...),
    end_date: str = Body(...),
    user_id: int = Body(1),
    penalty: str = Body(None),
):
    """
    Pridá nový cieľ sporenia do tabuľky saving_goals.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO saving_goals
            (user_id, name, category, description, budget_ai, target_amount, start_date, end_date, penalty)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (user_id, name, category, description, budget_ai, target_amount, start_date, end_date, penalty))
        conn.commit()
        cursor.close()
        records = fetch_all_goals(conn)
        return {"message": f"Goal '{name}' bol úspešne pridaný.", "goals": records}
    except Exception as e:
        return {"error": str(e), "goals": []}
    finally:
        if conn:
            conn.close()


@app.get("/goals")
async def get_all_goals():
    """
    Načíta všetky ciele sporenia z databázy.
    """
    conn = None
    try:
        conn = get_db_connection()
        records = fetch_all_goals(conn)
        return {"goals": records if records else []}
    except Exception as e:
        return {"error": str(e), "goals": []}
    finally:
        if conn:
            conn.close()
