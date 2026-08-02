from sqlalchemy import text
from database import engine

def migrate():
    print("Checking database columns for publications table...")
    with engine.connect() as conn:
        res = conn.execute(text("SHOW COLUMNS FROM publications"))
        existing_cols = [row[0] for row in res.fetchall()]
        print(f"Existing columns in DB: {existing_cols}")

        columns_to_add = [
            ("pub_type", "VARCHAR(100) DEFAULT 'Journal Article'"),
            ("peer_reviewed", "TINYINT(1) DEFAULT 1"),
            ("volume_issue", "VARCHAR(255) NULL"),
            ("authors", "VARCHAR(255) NULL"),
            ("tags", "VARCHAR(500) NULL"),
            ("citations", "INT DEFAULT 0"),
            ("pdf_url", "VARCHAR(500) NULL"),
        ]

        for col_name, col_def in columns_to_add:
            if col_name not in existing_cols:
                sql = f"ALTER TABLE publications ADD COLUMN {col_name} {col_def};"
                print(f"Adding column {col_name}...")
                try:
                    conn.execute(text(sql))
                    print(f"Successfully added column {col_name}")
                except Exception as e:
                    print(f"Error adding {col_name}: {e}")

        conn.commit()
    print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()

