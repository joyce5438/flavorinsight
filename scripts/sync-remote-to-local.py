#!/usr/bin/env python3
import subprocess
import json
import sqlite3
import os
import sys

content_tables = [
    "_emdash_collections",
    "_emdash_fields",
    "_emdash_sections",
    "_emdash_taxonomy_defs",
    "_emdash_taxonomy_def_groups",
    "taxonomies",
    "content_taxonomies",
    "ec_posts",
    "ec_pages",
    "_emdash_seo",
    "options",
    "users",
    "credentials",
    "media",
    "media_folders",
    "_emdash_menus",
    "_emdash_menu_items",
    "_emdash_bylines",
    "_emdash_content_bylines",
    "_emdash_byline_fields",
    "_plugin_state",
    "revisions",
]

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
os.chdir(project_dir)

backup_dir = os.path.join(project_dir, "backup")
os.makedirs(backup_dir, exist_ok=True)
sql_dump_file = os.path.join(backup_dir, "flavorinsight-remote-latest.sql")

all_statements = [
    "-- FlavorInsight Remote D1 Sync Dump",
    "PRAGMA foreign_keys = OFF;",
]

print("📥 Fetching latest data from remote Cloudflare D1 (flavorinsight-db)...")

for table in content_tables:
    try:
        res = subprocess.run(
            ["npx", "wrangler", "d1", "execute", "flavorinsight-db", "--remote", "--command", f"SELECT * FROM \"{table}\";", "--json"],
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            data = json.loads(res.stdout)
            rows = data[0].get("results", [])
            print(f"  ✓ {table}: {len(rows)} rows")
            all_statements.append(f"DELETE FROM \"{table}\";")
            if rows:
                cols = list(rows[0].keys())
                cols_str = ", ".join([f"\"{c}\"" for c in cols])
                for r in rows:
                    vals = []
                    for c in cols:
                        v = r[c]
                        if v is None:
                            vals.append("NULL")
                        elif isinstance(v, (int, float)):
                            vals.append(str(v))
                        else:
                            v_str = str(v).replace("'", "''")
                            vals.append(f"'{v_str}'")
                    vals_str = ", ".join(vals)
                    all_statements.append(f"INSERT OR REPLACE INTO \"{table}\" ({cols_str}) VALUES ({vals_str});")
        else:
            print(f"  ✗ {table}: query returned non-zero code")
    except Exception as e:
        print(f"  ✗ Error fetching {table}: {e}")

all_statements.append("PRAGMA foreign_keys = ON;")
full_sql = "\n".join(all_statements)
with open(sql_dump_file, "w", encoding="utf-8") as f:
    f.write(full_sql)

print(f"💾 Dump saved to {sql_dump_file} ({round(len(full_sql) / 1024, 1)} KB)")

# Target the active local miniflare SQLite database
d1_dir = os.path.join(project_dir, ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject")
active_db_id = "097e2130de5629472a4defb8dd7f7c130fb2423b9a1d90146f3ee81e651d8ece.sqlite"
local_db = os.path.join(d1_dir, active_db_id)

if os.path.exists(local_db):
    print(f"🔄 Applying dump to active local SQLite database ({active_db_id})...")
    conn = sqlite3.connect(local_db)
    cur = conn.cursor()

    # Temporarily drop triggers
    cur.execute("SELECT name, sql FROM sqlite_master WHERE type='trigger' AND sql IS NOT NULL;")
    triggers = cur.fetchall()
    for name, _ in triggers:
        cur.execute(f"DROP TRIGGER IF EXISTS \"{name}\";")

    cur.executescript(full_sql)

    # Restore triggers
    for name, trigger_sql in triggers:
        try:
            cur.execute(trigger_sql)
        except Exception:
            pass

    # Rebuild FTS
    try:
        cur.execute("INSERT INTO _emdash_fts_posts(_emdash_fts_posts) VALUES('rebuild');")
        cur.execute("INSERT INTO _emdash_fts_pages(_emdash_fts_pages) VALUES('rebuild');")
    except Exception:
        pass

    conn.commit()
    conn.close()
    print("✅ Local SQLite database successfully synchronized with remote D1!")
