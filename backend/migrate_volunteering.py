from sqlalchemy import text, inspect
from database import engine

def migrate():
    print("Checking database columns for volunteerings table...")
    inspector = inspect(engine)
    if not inspector.has_table("volunteerings"):
        print("Table volunteerings does not exist.")
        return

    existing_cols = [col["name"] for col in inspector.get_columns("volunteerings")]
    print(f"Existing columns in DB: {existing_cols}")

    columns_to_add = [
        ("title", "VARCHAR(255) NULL"),
        ("hours", "INT DEFAULT 0"),
        ("cause", "VARCHAR(255) NULL"),
        ("status", "VARCHAR(100) DEFAULT 'Completed'"),
        ("url", "VARCHAR(500) NULL"),
        ("impact_text", "VARCHAR(255) NULL"),
    ]

    with engine.connect() as conn:
        for col_name, col_def in columns_to_add:
            if col_name not in existing_cols:
                sql = f"ALTER TABLE volunteerings ADD COLUMN {col_name} {col_def};"
                print(f"Adding column {col_name}...")
                try:
                    conn.execute(text(sql))
                    print(f"Successfully added column {col_name}")
                except Exception as e:
                    print(f"Error adding {col_name}: {e}")

        conn.commit()
    print("Volunteering migration completed successfully.")

if __name__ == "__main__":
    migrate()
