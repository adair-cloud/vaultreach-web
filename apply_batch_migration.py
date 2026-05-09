"""
Batch migration: apply all schema changes for VaultReach improvements #2, #3, #5, #6, #8.
Uses ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS — safe to re-run.
"""
import os
import psycopg2
from pathlib import Path

# Load .env file from the project root (same directory as this script)
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                # Only set if not already in environment (shell env takes priority)
                if key.strip() not in os.environ:
                    os.environ[key.strip()] = value.strip().strip('"').strip("'")

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    print("Error: DATABASE_URL not found in environment or .env file.")
    exit(1)


try:
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()

    # ── #8 + #6: Campaign — add lastRunSummary (Json) and name (multi-campaign) ──
    print("Checking Campaign table columns...")
    cursor.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='Campaign' AND column_name='lastRunSummary';
    """)
    if not cursor.fetchone():
        print("  Adding lastRunSummary to Campaign...")
        cursor.execute("""
            ALTER TABLE "Campaign"
            ADD COLUMN "lastRunSummary" JSONB;
        """)

    cursor.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='Campaign' AND column_name='name';
    """)
    if not cursor.fetchone():
        print("  Adding name to Campaign...")
        cursor.execute("""
            ALTER TABLE "Campaign"
            ADD COLUMN "name" TEXT NOT NULL DEFAULT 'My Campaign';
        """)

    # ── #2: Draft — add emailSubject, leadTitle, leadLinkedIn, followUpNum, sentAt ──
    print("Checking Draft table columns...")
    draft_columns = {
        "emailSubject": "ALTER TABLE \"Draft\" ADD COLUMN \"emailSubject\" TEXT;",
        "leadTitle":    "ALTER TABLE \"Draft\" ADD COLUMN \"leadTitle\" TEXT;",
        "leadLinkedIn": "ALTER TABLE \"Draft\" ADD COLUMN \"leadLinkedIn\" TEXT;",
        "followUpNum":  "ALTER TABLE \"Draft\" ADD COLUMN \"followUpNum\" INTEGER NOT NULL DEFAULT 0;",
        "sentAt":       "ALTER TABLE \"Draft\" ADD COLUMN \"sentAt\" TIMESTAMP(3);",
    }
    for col, sql in draft_columns.items():
        cursor.execute(f"""
            SELECT column_name FROM information_schema.columns
            WHERE table_name='Draft' AND column_name='{col}';
        """)
        if not cursor.fetchone():
            print(f"  Adding {col} to Draft...")
            cursor.execute(sql)

    # ── #5: Analytics — add draftsApproved, draftsRejected, emailsBounced ──
    print("Checking Analytics table columns...")
    analytics_columns = {
        "draftsApproved": "ALTER TABLE \"Analytics\" ADD COLUMN \"draftsApproved\" INTEGER NOT NULL DEFAULT 0;",
        "draftsRejected": "ALTER TABLE \"Analytics\" ADD COLUMN \"draftsRejected\" INTEGER NOT NULL DEFAULT 0;",
        "emailsBounced":  "ALTER TABLE \"Analytics\" ADD COLUMN \"emailsBounced\" INTEGER NOT NULL DEFAULT 0;",
    }
    for col, sql in analytics_columns.items():
        cursor.execute(f"""
            SELECT column_name FROM information_schema.columns
            WHERE table_name='Analytics' AND column_name='{col}';
        """)
        if not cursor.fetchone():
            print(f"  Adding {col} to Analytics...")
            cursor.execute(sql)

    # ── #3: ExcludedLead — new table ──
    print("Checking ExcludedLead table...")
    cursor.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_name='ExcludedLead';
    """)
    if not cursor.fetchone():
        print("  Creating ExcludedLead table...")
        cursor.execute("""
            CREATE TABLE "ExcludedLead" (
                "id"          TEXT NOT NULL,
                "campaignId"  TEXT NOT NULL,
                "email"       TEXT NOT NULL,
                "reason"      TEXT,
                "excludedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "ExcludedLead_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "ExcludedLead_campaignId_fkey"
                    FOREIGN KEY ("campaignId")
                    REFERENCES "Campaign"("id")
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "ExcludedLead_campaignId_email_key"
                    UNIQUE ("campaignId", "email")
            );
        """)

    conn.commit()
    print("\n✅ All batch migrations applied successfully.")
    print("   Campaign : +lastRunSummary, +name")
    print("   Draft    : +emailSubject, +leadTitle, +leadLinkedIn, +followUpNum, +sentAt")
    print("   Analytics: +draftsApproved, +draftsRejected, +emailsBounced")
    print("   New table: ExcludedLead")

except Exception as e:
    print(f"\n❌ Migration error: {e}")
    if 'conn' in locals():
        conn.rollback()
finally:
    if 'cursor' in locals() and cursor:
        cursor.close()
    if 'conn' in locals() and conn:
        conn.close()
