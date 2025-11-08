from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama import OllamaLLM

app = FastAPI()

# inicializuj lokálny model z Ollamy
llm = OllamaLLM(model="phi3:mini")

class Query(BaseModel):
    prompt: str

@app.post("/ask")
async def ask(query: Query):
    """Endpoint, ktorý pošle prompt modelu"""
    answer = llm.invoke(query.prompt)
    return {"answer": answer}
