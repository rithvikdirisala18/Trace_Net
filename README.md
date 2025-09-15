<!-- README.md -->

<div align="center">
  <h1>Trace_Net</h1>
  <p><strong>Grounded QA over web pages using RAG (FastAPI + Next.js)</strong></p>
  <p>
    <a href="https://trace-net-3jjb.vercel.app/">Live demo</a>
    <span> · </span>
    <em>Still in progress</em>
  </p>
  <p>Currently testing a web search step (Tavily vs Exa) to find relevant sources before ingestion.</p>
</div>

<hr/>

<h3>Stack</h3>

<table>
  <tr><td><strong>Frontend</strong></td><td>Next.js (Vercel)</td></tr>
  <tr><td><strong>Backend</strong></td><td>FastAPI (Render), Uvicorn</td></tr>
  <tr><td><strong>RAG</strong></td><td>LangChain (WebBaseLoader, Text Splitter, Chroma)</td></tr>
  <tr><td><strong>Embeddings</strong></td><td>OpenAI (text-embedding-3-*) or local (all-MiniLM-L6-v2)</td></tr>
  <tr><td><strong>Vector DB</strong></td><td>Chroma (persistent on disk)</td></tr>
</table>

<h3>How it works</h3>

<ol>
  <li><code>/ingest</code>: Load URL → split into chunks → embed → upsert to a Chroma collection for that URL.</li>
  <li><code>/chat</code>: Retrieve top-k chunks → prompt LLM with only that context → return the answer.</li>
</ol>

<h3>Quick start (local)</h3>

<b>Backend</b>
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# .env
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:3000
CHROMA_DIR=./chroma_langchain_db
# USE_LOCAL_EMBED=true  # optional
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

<b>Frontend</b>
```bash
cd web
npm i
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
```

