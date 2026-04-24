import os
import psycopg2

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    print("No DATABASE_URL set.")
    exit(1)

try:
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    cursor.execute('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "appPassword" TEXT;')
    conn.commit()
    print("Migration successful! Column appPassword added to User table.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Migration failed: {e}")
