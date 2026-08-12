from sqlalchemy import text, inspect
from database import engine

def migrate():
    print("Checking database columns for publications table...")
    inspector = inspect(engine)
    if not inspector.has_table("publications"):
        print("Table publications does not exist.")
        return

    existing_cols = [col["name"] for col in inspector.get_columns("publications")]
    print(f"Existing columns in DB: {existing_cols}")

    columns_to_add = [
        ("pub_type", "VARCHAR(100) DEFAULT 'Journal Article'"),
        ("peer_reviewed", "BOOLEAN DEFAULT TRUE"),
        ("volume_issue", "VARCHAR(255) NULL"),
        ("authors", "VARCHAR(255) NULL"),
        ("tags", "VARCHAR(500) NULL"),
        ("citations", "INT DEFAULT 0"),
        ("pdf_url", "VARCHAR(500) NULL"),
    ]

    with engine.connect() as conn:
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

