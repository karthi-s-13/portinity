import psycopg2
from rag.rag_engine import get_db, release_db

def get_blue_line_limits(user_id: int) -> tuple:
    """
    Queries the database to find the count of experience and projects for the user.
    Dynamically adapts the limits to balance vertical page budget for BlueLine template.
    
    Returns: (exp_limit, proj_limit, exp_bullets, proj_bullets)
    """
    conn = get_db()
    exp_count = 0
    proj_count = 0
    
    try:
        cur = conn.cursor()
        
        # Count experiences
        cur.execute("SELECT COUNT(*) FROM experiences WHERE user_id = %s;", (user_id,))
        exp_count = cur.fetchone()[0]
        
        # Count projects with mandatory GitHub link (repo_url)
        cur.execute(
            "SELECT COUNT(*) FROM projects WHERE user_id = %s AND repo_url IS NOT NULL AND TRIM(repo_url) != '';", 
            (user_id,)
        )
        proj_count = cur.fetchone()[0]
        
        cur.close()
    except Exception as e:
        print(f"⚠️ Error querying counts in dynamic adaptation: {e}")
        # Default fallback values
        exp_count = 3
        proj_count = 3
    finally:
        release_db(conn)
        
    # Dynamic adaptation algorithm to balance the page space:
    exp_limit = 3
    proj_limit = 3
    exp_bullets = "exactly 2"
    proj_bullets = "exactly 1"
    
    if exp_count == 0:
        exp_limit = 0
        proj_limit = min(proj_count, 3) if proj_count > 0 else 3
    elif proj_count == 0:
        proj_limit = 0
        exp_limit = min(exp_count, 3) if exp_count > 0 else 3
    else:
        if exp_count == 1:
            exp_limit = 1
            proj_limit = min(proj_count, 3) if proj_count > 0 else 3
        elif exp_count == 2:
            exp_limit = 2
            proj_limit = min(proj_count, 3) if proj_count > 0 else 2
        else:
            exp_limit = 3
            if proj_count == 1:
                proj_limit = 1
            elif proj_count == 2:
                proj_limit = 2
            else:
                proj_limit = 3
                
    return exp_limit, proj_limit, exp_bullets, proj_bullets
