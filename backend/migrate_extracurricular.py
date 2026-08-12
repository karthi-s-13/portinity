from sqlalchemy import text, inspect
from database import engine

def migrate():
    print("Checking database columns for extracurriculars table...")
    inspector = inspect(engine)
    if not inspector.has_table("extracurriculars"):
        print("Table extracurriculars does not exist.")
        return
    
    existing_cols = [col["name"] for col in inspector.get_columns("extracurriculars")]
    print(f"Existing columns in DB: {existing_cols}")

    columns_to_add = [
        ("category", "VARCHAR(100) DEFAULT 'Leadership'"),
        ("role", "VARCHAR(255) NULL"),
        ("location", "VARCHAR(255) DEFAULT 'On Campus'"),
        ("skills", "VARCHAR(500) NULL"),
        ("is_current", "BOOLEAN DEFAULT FALSE"),
        ("url", "VARCHAR(500) NULL"),
    ]

    with engine.connect() as conn:
        for col_name, col_def in columns_to_add:
            if col_name not in existing_cols:
                sql = f"ALTER TABLE extracurriculars ADD COLUMN {col_name} {col_def};"
                print(f"Adding column {col_name}...")
                try:
                    conn.execute(text(sql))
                    print(f"Successfully added column {col_name}")
                except Exception as e:
                    print(f"Error adding {col_name}: {e}")

        conn.commit()
    print("Extracurricular migration completed successfully.")

if __name__ == "__main__":
    migrate()
