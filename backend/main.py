from fastapi import FastAPI

app = FastAPI()

DB_SERVER = "localhost"
DB_USER = "receipts_user"
DB_PASSWORD = "mypassword"
DB_NAME = "receipts_db"
PORT = 5432

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}

@app.get("/dball")
async def get_all_from_db():
    import psycopg2
    from psycopg2.extras import RealDictCursor

    conn = psycopg2.connect(
        host=DB_SERVER,
        database=DB_NAME,
        user=DB_USER,   
        password=DB_PASSWORD,
        port=PORT
    )   
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM receipts;")   
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"data": records}

    
