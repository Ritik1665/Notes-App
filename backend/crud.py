"""
CRUD operations - all async for non-blocking performance
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, delete, update
from typing import Optional, Tuple, List
from datetime import datetime, timezone

from models import Note, NoteCreate, NoteUpdate, NoteResponse


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _to_response(note: Note) -> NoteResponse:
    return NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


# ─── Read ─────────────────────────────────────────────────────────────────────
async def get_notes(
    db: AsyncSession, page: int = 1, page_size: int = 20
) -> Tuple[List[NoteResponse], int]:
    offset = (page - 1) * page_size

    # Count total
    count_result = await db.execute(select(func.count()).select_from(Note))
    total = count_result.scalar_one()

    # Fetch page - sorted newest first
    result = await db.execute(
        select(Note)
        .order_by(Note.updated_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    notes = [_to_response(n) for n in result.scalars().all()]
    return notes, total


# ─── Search ───────────────────────────────────────────────────────────────────
async def search_notes(
    db: AsyncSession, query: str
) -> Tuple[List[NoteResponse], int]:
    """
    Uses SQLite FTS5 for ranked full-text search.
    Falls back to LIKE if FTS table doesn't exist yet.
    """
    # Sanitize query - escape special FTS5 characters
    safe_query = query.replace('"', '""').strip()

    try:
        # FTS5 ranked search - returns best matches first
        result = await db.execute(
            text("""
                SELECT n.id, n.title, n.content, n.created_at, n.updated_at
                FROM notes n
                JOIN notes_fts f ON n.id = f.rowid
                WHERE notes_fts MATCH :query
                ORDER BY rank
                LIMIT 100
            """),
            {"query": safe_query},
        )
        rows = result.fetchall()
    except Exception:
        # Fallback: LIKE search (case-insensitive via COLLATE NOCASE)
        like_q = f"%{query}%"
        result = await db.execute(
            text("""
                SELECT id, title, content, created_at, updated_at
                FROM notes
                WHERE title LIKE :q COLLATE NOCASE
                   OR content LIKE :q COLLATE NOCASE
                ORDER BY updated_at DESC
                LIMIT 100
            """),
            {"q": like_q},
        )
        rows = result.fetchall()

    notes = [
        NoteResponse(
            id=row[0],
            title=row[1],
            content=row[2],
            created_at=row[3],
            updated_at=row[4],
        )
        for row in rows
    ]
    return notes, len(notes)


# ─── Create ───────────────────────────────────────────────────────────────────
async def create_note(db: AsyncSession, data: NoteCreate) -> NoteResponse:
    note = Note(title=data.title, content=data.content)
    db.add(note)
    await db.flush()   # get the ID without committing
    await db.refresh(note)
    return _to_response(note)


# ─── Update ───────────────────────────────────────────────────────────────────
async def update_note(
    db: AsyncSession, note_id: int, data: NoteUpdate
) -> Optional[NoteResponse]:
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        return None

    if data.title is not None:
        note.title = data.title
    if data.content is not None:
        note.content = data.content
    # Manually set updated_at (onupdate may not fire for partial updates)
    note.updated_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(note)
    return _to_response(note)


# ─── Delete ───────────────────────────────────────────────────────────────────
async def delete_note(db: AsyncSession, note_id: int) -> bool:
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        return False
    await db.delete(note)
    return True
