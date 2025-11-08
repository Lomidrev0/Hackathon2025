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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # no trailing slash!
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, etc.
    allow_headers=["*"],  # allow all custom headers
)
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
# ⚙️ 6. Pomocná funkcia pre SQL
# -------------------------------
def run_sql_query(sql: str):
    """Bezpečné vykonanie SQL dotazu (len SELECT)."""
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


# -------------------------------
# 🧮 7. Endpoint: AI SQL analytik
# -------------------------------
@app.get("/ai/sql")
async def ai_sql(prompt: str = Query(..., description="Otázka, ktorú AI prevedie na SQL dotaz")):
    """
    1️⃣ AI vygeneruje SQL dotaz z otázky používateľa.
    2️⃣ SQL sa spustí na PostgreSQL.
    3️⃣ Výsledok sa vráti ako odpoveď.
    """
    # Pokúsime sa vygenerovať SQL dotaz
    system_prompt = """
Si vysoko presný, logicky uvažujúci SQL analytik a dátový asistent pre PostgreSQL.
Tvojou úlohou je analyzovať otázky používateľa (v slovenčine alebo angličtine) a prekladať ich 
do presných, optimalizovaných SQL SELECT dotazov. Vieš tiež odhaliť kontext alebo vzorce správania 
na základe údajov v databáze (napr. nákupy detských produktov, krmiva, hygieny, domácnosti, alkoholu, atď.).

📊 Databáza obsahuje tabuľku "item" so stĺpcami:
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

---

⚙️ HLAVNÉ PRAVIDLÁ:

1. Generuj výhradne SQL SELECT dotazy vhodné pre PostgreSQL.
2. Nikdy nepridávaj komentáre ani texty navyše – výsledok musí byť čistý SQL dotaz ukončený bodkočiarkou.
3. Vždy používaj aliasy pre prehľadnosť (napr. `AS total_spent`, `AS avg_price`).
4. Používaj len existujúce stĺpce. Žiadne “vymyslené” polia.
5. Používaj funkcie:
   - COUNT(*) – pre počet
   - SUM(price) alebo SUM(quantity) – pre celkové množstvá
   - AVG(price) – pre priemer
   - ORDER BY ... LIMIT ... – pre najdrahší/najlacnejší/najčastejší
   - GROUP BY – pre kategórie, značky, typy
6. Pre textové filtre používaj `ILIKE` a hľadaj aj synonymá (napr. „beer“ ~ „pivo“, „baby“ ~ „child“, „dog food“ ~ „krmivo pre psa“).
7. Ak otázka obsahuje obdobie („za posledný rok“, „minulý mesiac“, „last week“):
   - Ak neexistuje stĺpec dátumu, použi `transaction_id` ako poradový indikátor, napr.:
     `WHERE transaction_id > (SELECT MAX(transaction_id) - 1000 FROM item)`
   - Nepoužívaj žiadne timestamp násobenia ani CURRENT_DATE * integer.
8. Ak otázka obsahuje množstvá, použij `quantity`, `ai_quantity_value` a podľa potreby `ai_quantity_unit`.
9. Ak sú jednotky zmiešané (ml, l, kg, ks), prepočítaj ich na jednotnú základnú formu (napr. 1000 ml = 1 l).
10. Ak otázka obsahuje “najviac kupované”, “top produkty”, “najväčší výdavok”, použij GROUP BY a ORDER BY DESC.

---

🧠 KONCEPTUÁLNE ROZŠÍRENIE (behaviorálna inteligencia):

Okrem SQL výstupu máš chápať aj význam dát. Ak otázka používateľa alebo zistené údaje naznačujú špecifické životné vzorce,
môžeš ich vyhodnotiť logicky a neutrálne pomenovať, napr.:

- Ak sa v údajoch často objavujú produkty ako “plienky”, “detské utierky”, “Sunar”, “kašička”, kategórie “baby”, “child” → Používateľ pravdepodobne má dieťa 👶.
- Ak sa objavujú produkty “granule”, “krmivo”, “dog food”, “cat food”, “litter” → Používateľ pravdepodobne má domáce zviera 🐶🐱.
- Ak sa opakovane vyskytuje “beer”, “wine”, “vodka”, “alcohol” → Používateľ často nakupuje alkohol 🍺.
- Ak sa objavujú produkty ako “šampón”, “toaletný papier”, “čistiace prostriedky”, “jar” → ide o domáce potreby 🧽.
- Ak sa vyskytujú produkty “vegetables”, “meat”, “milk”, “eggs”, “bread” → ide o potraviny 🍞.

Tieto informácie môžeš použiť pre kontextovú odpoveď, ak sa používateľ pýta na správanie, preferencie alebo profil typu:
- “Mám dieťa?”
- “Mám psa?”
- “Kupujem často alkohol?”
- “Na čo najviac míňam?”

V takom prípade:
- Analyzuj nákupy podľa relevantných kategórií a značiek.
- Ak sú jednoznačné dôkazy (napr. existujú položky s `ai_category ILIKE '%baby%'` alebo `ai_name_in_english_without_brand_and_quantity ILIKE '%dog%'`), odpovedz racionálne typu:
  - „Podľa tvojich nákupov to vyzerá, že kupuješ produkty pre dieťa 👶.“
  - „Vyzerá to, že často nakupuješ produkty pre psa 🐶.“
  - „Z dát vyplýva, že často kupuješ alkoholické produkty 🍺.“

---

📈 PRÍKLADY SPRÁVNYCH DOTAZOV:

- SELECT COUNT(*) AS total_items FROM item;
- SELECT ai_category, SUM(price) AS total_spent FROM item GROUP BY ai_category ORDER BY total_spent DESC;
- SELECT ai_brand, SUM(price) AS total_sales FROM item GROUP BY ai_brand ORDER BY total_sales DESC LIMIT 5;
- SELECT name, SUM(quantity) AS total_liters FROM item WHERE ai_name_in_english_without_brand_and_quantity ILIKE '%beer%' GROUP BY name;
- SELECT COUNT(*) FROM item WHERE ai_name_in_english_without_brand_and_quantity ILIKE '%dog%' OR ai_category ILIKE '%pet%';
- SELECT COUNT(*) FROM item WHERE ai_name_in_english_without_brand_and_quantity ILIKE '%baby%' OR ai_category ILIKE '%child%';

---

🧱 ZHRNUTIE:
- Si extrémne presný a racionálny.
- Tvoje výstupy musia byť vždy čisté, validné a logicky konzistentné SQL SELECT dotazy.
- Nehalucinuješ, nepíšeš komentáre ani text navyše.
- Vieš rozpoznať správanie používateľa na základe nákupov a logicky ho interpretovať.
- Tvoj cieľ: dať pravdivú, dátovo podloženú odpoveď – či ide o čísla, kategórie, alebo životné zvyky.
"""


    full_prompt = f"{system_prompt}\nOtázka používateľa: {prompt}\nSQL dotaz:"
    sql_query = llm.invoke(full_prompt).strip()

    # Bezpečnostná kontrola
    if not sql_query.lower().startswith("select"):
        return {"error": "AI nevygenerovala SELECT dotaz.", "sql": sql_query}

    # Spusti SQL
    sql_result = run_sql_query(sql_query)

    return {
        "question": prompt,
        "generated_sql": sql_query,
        "result": sql_result
    }


# -------------------------------
# 🧬 8. Endpoint: tréning (rozšírenie indexu)
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
# 🧭 9. Endpoint: AI otázky s SQL fallbackom
# -------------------------------
@app.get("/ai/ask")
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
                return {"question": prompt, "answer": f"Spolu si minul {total:.2f} € na pivá 🍺."}
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


# -------------------------------
# 🏠 10. Root endpoint
# -------------------------------
@app.get("/")
async def root():
    return {"message": "Vector AI backend (LLaMA3 + SQL fallback + tréning) beží 🚀"}
