#!/bin/bash
set -e

echo "⌛ Waiting for database to be ready..."
python -c "
import sys, time
from sqlalchemy import create_engine
from config import settings

print(f'Testing database connection to: {settings.DATABASE_URL.split(\"@\")[-1]}')
for i in range(30):
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            print('🚀 Database is ready!')
            sys.exit(0)
    except Exception as e:
        print(f'Database not ready yet ({e}). Retrying in 2 seconds...')
        time.sleep(2)
sys.exit(1)
"

echo "⚙️ Running database migrations..."
python migrate_extracurricular.py
python migrate_publications.py
python migrate_volunteering.py

echo "🔥 Starting Portinity FastAPI Backend Server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
