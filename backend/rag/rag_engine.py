import os
import re
import json
import time
from typing import List, Dict, Any, Optional, Tuple
import psycopg2
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor, Json
from openai import OpenAI
from jinja2 import Template
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from config import settings

# Database & OpenRouter Settings
POSTGRES_URL = settings.DATABASE_URL
OPENROUTER_API_KEY = settings.OPENROUTER_API_KEY
OPENROUTER_BASE_URL = settings.OPENROUTER_BASE_URL
EMBEDDING_MODEL = settings.OPENROUTER_EMBEDDING_MODEL
LLM_MODEL = settings.OPENROUTER_LLM_MODEL

# Problem 11 Fix: Connection Pool
db_pool = None

def init_db_pool():
    global db_pool
    if db_pool is None:
        try:
            db_pool = ThreadedConnectionPool(minconn=1, maxconn=10, dsn=POSTGRES_URL)
            print("✅ PostgreSQL Connection Pool Initialized.")
        except Exception as e:
            print(f"⚠️ Connection Pool error: {e}")

def get_db():
    global db_pool
    if db_pool is None:
        init_db_pool()
    return db_pool.getconn()

def release_db(conn):
    global db_pool
    if db_pool and conn:
        db_pool.putconn(conn)

# OpenRouter Client
client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY,
    default_headers={
        "HTTP-Referer": "https://portinity.app",
        "X-Title": "Portinity AI Resume RAG",
    }
)

# Problem 10 Fix: In-memory Embedding Cache
JD_EMBEDDING_CACHE: Dict[str, List[float]] = {}
DETECTED_DIMENSION: Optional[int] = None

# Problem 8 & 9 Fix: Retry Logic & Timeout
def retry_with_backoff(func, max_retries=3, backoff_factor=2):
    def wrapper(*args, **kwargs):
        retries = 0
        while retries < max_retries:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                retries += 1
                if retries >= max_retries:
                    raise e
                sleep_time = backoff_factor ** retries
                print(f"⚠️ API Error ({e}). Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
    return wrapper

# Problem 1 Fix: Confirm Embedding Dimension First
def detect_embedding_dimension() -> int:
    global DETECTED_DIMENSION
    if DETECTED_DIMENSION is not None:
        return DETECTED_DIMENSION
    
    print("🔍 Confirming embedding vector dimension from OpenRouter...")
    try:
        res = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input="dimension_check",
            encoding_format="float",
            timeout=30
        )
        dim = len(res.data[0].embedding)
        DETECTED_DIMENSION = dim
        print(f"✅ Dynamic Embedding Dimension Confirmed: {dim}")
        return dim
    except Exception as e:
        print(f"⚠️ Dimension detection failed ({e}). Defaulting to 1024.")
        DETECTED_DIMENSION = 1024
        return 1024

# Problem 13 Fix: Redesigned Flexible Database Schema
def init_pgvector_db():
    dim = detect_embedding_dimension()
    conn = get_db()
    try:
        cur = conn.cursor()
        
        # 1. Extension
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # 2. Table with Metadata JSONB and Unique Constraint
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS user_embeddings (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                entity_type VARCHAR(30) NOT NULL,
                entity_id INT NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                metadata JSONB,
                embedding vector({dim}),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_user_entity UNIQUE (user_id, entity_type, entity_id)
            );
        """)
        conn.commit()

        # 3. Alter Column Type dynamically if table already existed with different vector dimension
        try:
            cur.execute(f"ALTER TABLE user_embeddings ALTER COLUMN embedding TYPE vector({dim});")
            conn.commit()
        except Exception:
            conn.rollback()
            cur = conn.cursor()
            # If ALTER failed due to dimension incompatibility, drop table & recreate clean
            cur.execute("DROP TABLE IF EXISTS user_embeddings CASCADE;")
            cur.execute(f"""
                CREATE TABLE user_embeddings (
                    id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL,
                    entity_type VARCHAR(30) NOT NULL,
                    entity_id INT NOT NULL,
                    title TEXT,
                    content TEXT NOT NULL,
                    metadata JSONB,
                    embedding vector({dim}),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT unique_user_entity UNIQUE (user_id, entity_type, entity_id)
                );
            """)
            conn.commit()
        
        # 4. HNSW Index (pgvector index max limit is 2000 dimensions)
        if dim <= 2000:
            cur.execute("""
                CREATE INDEX IF NOT EXISTS user_embeddings_hnsw_idx 
                ON user_embeddings USING hnsw (embedding vector_cosine_ops);
            """)
            conn.commit()
        
        cur.close()
        print(f"✅ Table 'user_embeddings' with vector({dim}) and Unique Constraints initialized.")
    except Exception as err:
        conn.rollback()
        print(f"⚠️ Note on pgvector table init: {err}")
    finally:
        release_db(conn)

# Problem 12 Fix: Text Chunking
def chunk_text(text: str, max_words: int = 200, overlap: int = 30) -> List[str]:
    if not text:
        return []
    words = text.split()
    if len(words) <= max_words:
        return [text]
    
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + max_words])
        chunks.append(chunk)
        i += max_words - overlap
    return chunks

# Problem 3 & 9 Fix: Batch Embedding Requests with Timeout
def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    
    @retry_with_backoff
    def _call():
        res = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts,
            encoding_format="float",
            timeout=60
        )
        return [item.embedding for item in res.data]
    
    return _call()

# Problem 2 & 4 Fix: UPSERT with Metadata and ON CONFLICT DO UPDATE
def embed_and_store_user_data(user_id: int, entities: List[Dict[str, Any]]):
    """
    entities format:
    [{ 'type': 'project', 'id': 101, 'title': 'PlacementHub', 'content': '...', 'metadata': {'tags': ['react']} }]
    """
    if not entities:
        return
    
    # 1. Prepare batch contents for 1 API call
    contents = [e['content'] for e in entities]
    print(f"⚡ Batch embedding {len(contents)} entities in 1 API call...")
    embeddings = generate_embeddings_batch(contents)
    
    conn = get_db()
    try:
        cur = conn.cursor()
        
        # 2. Perform UPSERT with ON CONFLICT
        upsert_query = """
            INSERT INTO user_embeddings (user_id, entity_type, entity_id, title, content, metadata, embedding, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s::vector, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, entity_type, entity_id) 
            DO UPDATE SET
                title = EXCLUDED.title,
                content = EXCLUDED.content,
                metadata = EXCLUDED.metadata,
                embedding = EXCLUDED.embedding,
                updated_at = CURRENT_TIMESTAMP;
        """
        
        for entity, emb in zip(entities, embeddings):
            cur.execute(upsert_query, (
                user_id,
                entity['type'],
                entity['id'],
                entity.get('title', ''),
                entity['content'],
                Json(entity.get('metadata', {})),
                emb
            ))
            
        conn.commit()
        cur.close()
        print(f"✅ UPSERT completed for {len(entities)} items in PostgreSQL 17.")
    except Exception as err:
        conn.rollback()
        print(f"❌ Error during UPSERT in pgvector: {err}")
        raise err
    finally:
        release_db(conn)

# Problem 10 & 14 & 5 Fix: Cached JD Embedding, Categorized Retrieval, Rich Metadata Return
def retrieve_categorized_context(user_id: int, job_description: str, category_counts: Dict[str, int] = None) -> Dict[str, List[Dict]]:
    if category_counts is None:
        category_counts = {
            'experience': 5, 
            'project': 5, 
            'skill': 25, 
            'certification': 5,
            'achievement': 5,
            'publication': 5,
            'volunteering': 5,
            'extracurricular': 5
        }
    
    # Problem 10: In-Memory Cache
    if job_description in JD_EMBEDDING_CACHE:
        jd_emb = JD_EMBEDDING_CACHE[job_description]
    else:
        jd_emb = generate_embeddings_batch([job_description])[0]
        JD_EMBEDDING_CACHE[job_description] = jd_emb
    
    conn = get_db()
    results_by_category = {}
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        for entity_type, limit in category_counts.items():
            query = """
                SELECT id, entity_type, entity_id, title, content, metadata, 1 - (embedding <=> %s::vector) AS similarity
                FROM user_embeddings
                WHERE user_id = %s AND entity_type = %s
                ORDER BY embedding <=> %s::vector ASC
                LIMIT %s;
            """
            cur.execute(query, (jd_emb, user_id, entity_type, jd_emb, limit))
            rows = cur.fetchall()
            results_by_category[entity_type] = rows
            
        cur.close()
        return results_by_category
    finally:
        release_db(conn)

# Problem 6 Fix: Structured Prompt Context Builder
def build_structured_context_prompt(retrieved_data: Dict[str, List[Dict]]) -> str:
    sections = []
    
    if 'experience' in retrieved_data and retrieved_data['experience']:
        sections.append("### WORK EXPERIENCE")
        for item in retrieved_data['experience']:
            title = item.get('title') or 'Role'
            sections.append(f"• Title: {title}\n  Details: {item['content']}")
            
    if 'project' in retrieved_data and retrieved_data['project']:
        sections.append("\n### FEATURED PROJECTS")
        for item in retrieved_data['project']:
            title = item.get('title') or 'Project'
            sections.append(f"• Project: {title}\n  Details: {item['content']}")
            
    if 'skill' in retrieved_data and retrieved_data['skill']:
        sections.append("\n### SKILLS & COMPETENCIES")
        for item in retrieved_data['skill']:
            sections.append(f"• {item['content']}")
            
    if 'certification' in retrieved_data and retrieved_data['certification']:
        sections.append("\n### CERTIFICATIONS")
        for item in retrieved_data['certification']:
            title = item.get('title') or 'Certification'
            sections.append(f"• {title}: {item['content']}")

    if 'achievement' in retrieved_data and retrieved_data['achievement']:
        sections.append("\n### ACHIEVEMENTS")
        for item in retrieved_data['achievement']:
            title = item.get('title') or 'Achievement'
            sections.append(f"• {title}: {item['content']}")

    if 'publication' in retrieved_data and retrieved_data['publication']:
        sections.append("\n### PUBLICATIONS")
        for item in retrieved_data['publication']:
            title = item.get('title') or 'Publication'
            sections.append(f"• {title}: {item['content']}")

    if 'volunteering' in retrieved_data and retrieved_data['volunteering']:
        sections.append("\n### VOLUNTEERING")
        for item in retrieved_data['volunteering']:
            title = item.get('title') or 'Volunteering'
            sections.append(f"• {title}: {item['content']}")

    if 'extracurricular' in retrieved_data and retrieved_data['extracurricular']:
        sections.append("\n### EXTRACURRICULAR ACTIVITIES")
        for item in retrieved_data['extracurricular']:
            title = item.get('title') or 'Activity'
            sections.append(f"• {title}: {item['content']}")
            
    return "\n".join(sections)

from prompt_management.manager import render_latex_from_json, get_system_prompt, get_template_instructions

# Problem 7 & 8 & 9 Fix: LLM -> JSON Schema -> Jinja2 LaTeX Generation
def generate_tailored_resume(
    user_id: int, 
    job_description: str, 
    static_user_info: Dict[str, Any], 
    template_id: str = "blue-line",
    experience_level: str = ""
) -> Tuple[str, Dict[str, Any]]:
    # Calculate limits based on selected experience level
    exp_limit = 5
    proj_limit = 5
    exp_bullets = "2-3"
    proj_bullets = "3-4"
    
    if template_id == "blue-line":
        from prompt_management.adaptations.blue_line import get_blue_line_limits
        exp_limit, proj_limit, exp_bullets, proj_bullets = get_blue_line_limits(user_id)
    elif template_id == "gray-banner":
        from prompt_management.adaptations.gray_banner import get_gray_banner_limits
        exp_limit, proj_limit, exp_bullets, proj_bullets = get_gray_banner_limits(user_id)
    elif template_id == "elegant-beige":
        from prompt_management.adaptations.elegant_beige import get_elegant_beige_limits
        exp_limit, proj_limit, exp_bullets, proj_bullets = get_elegant_beige_limits(user_id)
    elif template_id == "minimal-classic":
        from prompt_management.adaptations.minimal_classic import get_minimal_classic_limits
        exp_limit, proj_limit, exp_bullets, proj_bullets = get_minimal_classic_limits(user_id)
    else:
        level = (experience_level or "").lower()
        if "entry" in level or "0-2" in level:
            exp_limit = 2
            proj_limit = 3
        elif "mid" in level or "2-5" in level:
            exp_limit = 3
            proj_limit = 2
        elif "senior" in level or "5-8" in level:
            exp_limit = 4
            proj_limit = 2
        elif "lead" in level or "8+" in level:
            exp_limit = 5
            proj_limit = 1

    category_counts = {
        'experience': exp_limit, 
        'project': proj_limit, 
        'skill': 25, 
        'certification': 5,
        'achievement': 5,
        'publication': 5,
        'volunteering': 5,
        'extracurricular': 5
    }

    # 1. Problem 14: Categorized context retrieval
    retrieved_data = retrieve_categorized_context(user_id, job_description, category_counts)
    
    # 2. Problem 6: Structured prompt
    structured_context = build_structured_context_prompt(retrieved_data)
    
    # Load template-specific instructions
    template_instructions = get_template_instructions(template_id)

    system_prompt = get_system_prompt()

    negative_constraints = []
    if not retrieved_data.get('experience'):
        negative_constraints.append("- The candidate has NO work experience. You MUST return \"experience\": [] in the JSON. Do NOT generate any job entries.")
    if not retrieved_data.get('project'):
        negative_constraints.append("- The candidate has NO projects. You MUST return \"projects\": [] in the JSON. Do NOT generate any project entries.")
    if not retrieved_data.get('certification'):
        negative_constraints.append("- The candidate has NO certifications. You MUST return \"certifications\": [] in the JSON. Do NOT generate any certifications.")
    if not retrieved_data.get('achievement'):
        negative_constraints.append("- The candidate has NO achievements/awards. You MUST return \"achievements\": [] in the JSON. Do NOT generate any achievements.")

    constraints_text = "\n".join(negative_constraints) if negative_constraints else ""

    user_prompt = f"""
TARGET JOB DESCRIPTION:
{job_description}

STATIC CANDIDATE INFO:
{json.dumps(static_user_info)}

RETRIEVED CANDIDATE DATA:
{structured_context}

STRICT COUNT & LENGTH CONSTRAINTS FOR THIS TARGET ROLE ({experience_level or "General"}):
- Work Experience: Output a MAXIMUM of {exp_limit} experience items. For each experience, you MUST write exactly {exp_bullets} bullet points.
- Projects: Output a MAXIMUM of {proj_limit} project items. For each project, you MUST write exactly {proj_bullets} bullet points.
"""
    if template_instructions:
        user_prompt += f"\nTEMPLATE DESIGN GUIDELINES (Enforce these structural constraints):\n{template_instructions}\n"
    if constraints_text:
        user_prompt += f"\nCRITICAL CONSTRAINTS FOR THIS SPECIFIC GENERATION:\n{constraints_text}\n"

    @retry_with_backoff
    def _call_llm():
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            timeout=60
        )
        if not response or not hasattr(response, 'choices') or not response.choices:
            raise ValueError(f"Empty or invalid response from OpenRouter: {response}")
        
        choice = response.choices[0]
        if not choice or not hasattr(choice, 'message') or not choice.message:
            raise ValueError("Choice has no message.")
            
        content = choice.message.content
        if content is None:
            raise ValueError("Message content is None.")
            
        return content

    print("🚀 Invoking Nemotron LLM for JSON Resume generation...")
    raw_llm_json = _call_llm()
    
    # Extract JSON block
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', raw_llm_json, re.DOTALL | re.IGNORECASE)
    clean_json_str = match.group(1) if match else raw_llm_json.strip()
    
    try:
        parsed_json = json.loads(clean_json_str)
    except Exception as e:
        print(f"⚠️ JSON parse fallback ({e}). Using raw string context.")
        parsed_json = {}

    # Merge static info as defaults so header fields are always present
    final_data = {**static_user_info, **parsed_json}

    try:
        print("🎨 Rendering JSON data to LaTeX via Jinja2 template...")
        latex_code = render_latex_from_json(final_data, template_id)
        return latex_code, final_data
    except Exception as render_err:
        print(f"❌ Jinja2 Render Error: {render_err}")
        import traceback
        traceback.print_exc()
        raise render_err

if __name__ == "__main__":
    print("=== Portinity Production RAG Engine Initialized ===")
