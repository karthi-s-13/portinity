# Redirect module to backend/rag/rag_engine.py
from rag.rag_engine import (
    get_db_connection,
    init_pgvector_db,
    generate_embedding,
    embed_and_store_user_data,
    retrieve_relevant_context,
    generate_tailored_latex_resume
)

__all__ = [
    "get_db_connection",
    "init_pgvector_db",
    "generate_embedding",
    "embed_and_store_user_data",
    "retrieve_relevant_context",
    "generate_tailored_latex_resume"
]
