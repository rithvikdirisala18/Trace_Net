import os, hashlib
from typing import List
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain import hub
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_chroma import Chroma
from ingest import url_to_collection_name, ingest_url

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_langchain_db")
ALLOWED = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]


embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
llm = ChatOpenAI(model=OPENAI_MODEL, temperature=0)
rag_prompt = hub.pull("rlm/rag-prompt")


app = FastAPI(title="RAG API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_and_split(url: str):
    loader = WebBaseLoader(web_paths=(url,))
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    return splitter.split_documents(docs)

def ensure_index(url: str) -> Chroma:
    collection = url_to_collection_name(url)
    vectordb = Chroma(
        collection_name=collection,
        embedding_function=embeddings,
        persist_directory=f"{CHROMA_DIR}/{collection}",
    )
    if vectordb._collection.count() == 0:
        splits = load_and_split(url)
        if splits:
            vectordb.add_documents(documents=splits)
    return vectordb

class IngestReq(BaseModel):
    url: str

class ChatReq(BaseModel):
    url: str
    question: str
    k: int = 4

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/ingest")
def ingest(req: IngestReq):
    vectordb = ensure_index(req.url)
    return {
        "collection": url_to_collection_name(req.url),
        "count": vectordb._collection.count()
    }

@app.post("/chat")
def chat(req: ChatReq):
    vectordb = ensure_index(req.url)
    docs = vectordb.similarity_search(req.question, k=req.k)

    context = "\n\n".join(
        f"[Source] {d.metadata.get('source','')}\n{d.page_content}"
        for d in docs
    )
    prompt_msg = rag_prompt.invoke({"context": context, "question": req.question})
    ai = llm.invoke(prompt_msg)
    return {"answer": ai.content}
