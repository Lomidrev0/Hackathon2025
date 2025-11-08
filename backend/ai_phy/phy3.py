from fastapi import APIRouter, Request
import ollama

router = APIRouter()

@router.get("/ask")
async def ask_ai(prompt: str):
    response = ollama.chat(model="phi3:mini", messages=[
        {"role": "system", "content": "Si AI asistent pre prácu s databázou účteniek."},
        {"role": "user", "content": prompt}
    ])
    return {"response": response["message"]["content"]}
