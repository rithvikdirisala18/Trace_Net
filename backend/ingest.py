import os, hashlib
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_chroma import Chroma

load_dotenv()
CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_langchain_db")

def url_to_collection_name(url: str) -> str:
    import hashlib
    return "col_" + hashlib.md5(url.encode()).hexdigest()

def ingest_url(url: str):
    loader = WebBaseLoader(web_paths=(url,))
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = splitter.split_documents(docs)

    vectordb = Chroma(
        collection_name=url_to_collection_name(url),
        embedding_function=OpenAIEmbeddings(model="text-embedding-3-large"),
        persist_directory=f"{CHROMA_DIR}/{url_to_collection_name(url)}",
    )
    if splits:
        vectordb.add_documents(splits)
    print("Ingested:", len(splits))

if __name__ == "__main__":
    ingest_url("https://scienceleadership.org/blog/the_entire_bee_movie_script")
