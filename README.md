# Trace_Net

Grounded question-answering over web pages using RAG (FastAPI + Next.js).

Live demo: https://trace-net-3jjb.vercel.app/ --> Still in profress

Stack

Frontend: Next.js (Vercel)

Backend: FastAPI (Render), Uvicorn

RAG: LangChain (WebBaseLoader, Text Splitter, Chroma)

Embeddings: OpenAI (text-embedding-3-*) or local (all-MiniLM-L6-v2)

Vector DB: Chroma (persistent on disk)

How it works

/ingest: Load a URL → split into chunks → embed → upsert into a Chroma collection for that URL.

/chat: Retrieve top-k chunks → prompt an LLM with only that context → return the answer.

Quick start (local)

Backend

cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# .env
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:3000
CHROMA_DIR=./chroma_langchain_db
# USE_LOCAL_EMBED=true  # optional for CPU embeddings
uvicorn app:app --host 0.0.0.0 --port 8000 --reload


Frontend

cd web
npm i
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev

Deploy

Render (backend)

Build: pip install -r requirements.txt

Start: uvicorn app:app --host 0.0.0.0 --port $PORT

Env vars:

OPENAI_API_KEY

CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app

CHROMA_DIR=/var/data/chroma_langchain_db (with a persistent disk)

Optional: OPENAI_MODEL=gpt-4o-mini, USE_LOCAL_EMBED=true

Vercel (frontend)

NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com

Project root: web/

API (brief)

POST /ingest

{"url": "https://example.com"}


→ { "collection": "...", "count": 123 }

POST /chat

{"url": "https://example.com", "question": "What’s the gist?", "k": 4}


→ { "answer": "..." }
