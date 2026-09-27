import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from backend/.env or workspace root .env
backend_dir = Path(__file__).resolve().parent.parent.parent
root_dir = backend_dir.parent

if (backend_dir / '.env').exists():
    load_dotenv(dotenv_path=backend_dir / '.env')
elif (root_dir / '.env').exists():
    load_dotenv(dotenv_path=root_dir / '.env')
else:
    load_dotenv()

# Check for database URL from environment
# Supports: DATABASE_URL, POSTGRES_URL, POSTGRESQL_URL, SUPABASE_DB_URL, SUPABASE_DATABASE_URL, DATABASE_INTERNAL_URL
raw_db_url = (
    os.getenv("DATABASE_URL")
    or os.getenv("POSTGRES_URL")
    or os.getenv("POSTGRESQL_URL")
    or os.getenv("SUPABASE_DB_URL")
    or os.getenv("SUPABASE_DATABASE_URL")
    or os.getenv("DATABASE_INTERNAL_URL")
)

is_postgres = False

if raw_db_url and raw_db_url.strip():
    raw_url = raw_db_url.strip()
    # Normalize postgres:// to postgresql:// for SQLAlchemy 2.x
    if raw_url.startswith("postgres://"):
        DATABASE_URL = raw_url.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = raw_url

    is_postgres = True
    safe_display = DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'configured'
    print(f"[DB] Initializing PostgreSQL / Supabase connection: {safe_display}")
    
    connect_args = {}
    # Ensure SSL is enabled for cloud PostgreSQL / Supabase connections if not specified
    if "sslmode=" not in DATABASE_URL and ("supabase" in DATABASE_URL.lower() or "render.com" in DATABASE_URL.lower()):
        connect_args["sslmode"] = "require"

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20,
        connect_args=connect_args
    )
else:
    # Persistent SQLite database file for local development
    db_file = backend_dir / "civisense_data.db"
    DATABASE_URL = f"sqlite:///{db_file}"
    print(f"[DB] No PostgreSQL DATABASE_URL found. Using local database: {db_file}")
    print("[DB NOTICE] For production deployment on Render, configure DATABASE_URL (Supabase/PostgreSQL) in environment variables for permanent cloud persistence.")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables on startup if they do not exist and aligns schema/sequences."""
    from app.db import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate any newly added columns if table already existed from earlier schema
    with engine.begin() as conn:
        # Check and add sentiment column if missing
        try:
            conn.execute(text("ALTER TABLE citizen_requests ADD COLUMN sentiment VARCHAR(64) DEFAULT 'Concerned';"))
        except Exception:
            pass  # Column already exists
        
        # Check and add key_entities column if missing
        try:
            conn.execute(text("ALTER TABLE citizen_requests ADD COLUMN key_entities TEXT DEFAULT '';"))
        except Exception:
            pass  # Column already exists

    # On PostgreSQL, ensure auto-increment sequence is in sync with highest existing id
    if is_postgres:
        try:
            with engine.begin() as conn:
                conn.execute(text(
                    "SELECT setval(pg_get_serial_sequence('citizen_requests', 'id'), COALESCE(MAX(id), 1)) FROM citizen_requests;"
                ))
            print("[DB] PostgreSQL sequence citizen_requests_id_seq synchronized successfully.")
        except Exception as e:
            print(f"[DB] Note: Sequence sync skipped or not required: {e}")

    print("[DB] Database tables initialized successfully.")


