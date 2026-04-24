import os
import psycopg2

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    print("Error: DATABASE_URL not found in environment.")
    exit(1)

try:
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    # Check if timezone column exists first to avoid errors
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='Campaign' and column_name='timezone';
    """)
    if not cursor.fetchone():
        print("Applying migration to Campaign table...")
        cursor.execute('''
            ALTER TABLE "Campaign" 
            ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
            ADD COLUMN "sendWindowStart" INTEGER NOT NULL DEFAULT 9,
            ADD COLUMN "sendWindowEnd" INTEGER NOT NULL DEFAULT 17,
            ADD COLUMN "sendDays" TEXT NOT NULL DEFAULT '1,2,3,4,5';
        ''')
        conn.commit()
        print("✅ Migration applied successfully! Your other tables are completely safe.")
    else:
        print("✅ Columns already exist!")
        
except Exception as e:
    print(f"❌ Database error: {e}")
finally:
    if 'cursor' in locals() and cursor:
        cursor.close()
    if 'conn' in locals() and conn:
        conn.close()
