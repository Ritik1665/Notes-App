"""
Database configuration - async SQLAlchemy with SQLite
Includes FTS5 virtual table setup for full-text search
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event, text
import asyncio

DATABASE_URL = "sqlite+aiosqlite:///./notes.db"

# ─── Engine ───────────────────────────────────────────────────────────────────
engine = create_async_engine(
    DATABASE_URL,
    echo=False,           # Set True to debug SQL
    connect_args={
        "check_same_thread": False,
    },
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

class Base(DeclarativeBase):
    pass


# ─── Dependency ───────────────────────────────────────────────────────────────
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─── FTS5 Setup ───────────────────────────────────────────────────────────────
async def setup_fts(conn):
    """
    Create SQLite FTS5 virtual table for full-text search.
    Triggers keep it in sync with the notes table automatically.
    """
    await conn.execute(text("""
        CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts
        USING fts5(
            title,
            content,
            content='notes',
            content_rowid='id',
            tokenize='unicode61 remove_diacritics 1'
        )
    """))

    # Trigger: insert
    await conn.execute(text("""
        CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
            INSERT INTO notes_fts(rowid, title, content)
            VALUES (new.id, new.title, new.content);
        END
    """))

    # Trigger: delete
    await conn.execute(text("""
        CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
            INSERT INTO notes_fts(notes_fts, rowid, title, content)
            VALUES ('delete', old.id, old.title, old.content);
        END
    """))

    # Trigger: update
    await conn.execute(text("""
        CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
            INSERT INTO notes_fts(notes_fts, rowid, title, content)
            VALUES ('delete', old.id, old.title, old.content);
            INSERT INTO notes_fts(rowid, title, content)
            VALUES (new.id, new.title, new.content);
        END
    """))
