"""
Migration: add_apollo_id_to_lead
Adds the 'apolloId' column (nullable text) to the 'Lead' table.
Bypasses local Prisma binary cache issues — uses raw psycopg2 against Neon DB.
"""
import os
import sys
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env")
    sys.exit(1)

SQL = """
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "apolloId" TEXT;
"""

try:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute(SQL)
    print('✅ Migration applied: "apolloId" column added to "Lead" table.')
    # Verify the column exists
    cursor.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Lead' AND column_name = 'apolloId';
    """)
    row = cursor.fetchone()
    if row:
        print(f"   Verified: column='{row[0]}' type='{row[1]}' nullable='{row[2]}'")
    else:
        print("⚠️  Column not found after migration — check table name casing.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"❌ Migration failed: {e}")
    sys.exit(1)
