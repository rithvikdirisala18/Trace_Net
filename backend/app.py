import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI(title="RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/chat")
def chat(payload: dict = Body(...)):
    query = payload.get("query", "")
    k = payload.get("k", 4)
    return {"answer": f"(stub) you asked: {query} with k={k}"}
