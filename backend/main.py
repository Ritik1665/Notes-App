"""
Notes App - FastAPI Backend
High-performance REST API with SQLite FTS5 full-text search
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from typing import Optional
import uvicorn

from database import engine, Base, get_db
from models import NoteCreate, NoteUpdate, NoteResponse, PaginatedNotes, SearchResponse
import crud

# ─── Lifespan: create tables on startup ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Notes API",
    description="High-performance notes management with full-text search",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/notes/search", response_model=SearchResponse)
async def search_notes(
    q: str = Query(..., min_length=1, description="Search keyword"),
    db: AsyncSession = Depends(get_db),
):
    """
    Full-text search across note titles and content.
    Uses SQLite FTS5 for sub-millisecond performance.
    """
    notes, total = await crud.search_notes(db, query=q)
    return SearchResponse(notes=notes, total=total, query=q)


@app.get("/notes", response_model=PaginatedNotes)
async def get_notes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve paginated list of all notes, newest first."""
    notes, total = await crud.get_notes(db, page=page, page_size=page_size)
    return PaginatedNotes(
        notes=notes,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@app.post("/notes", response_model=NoteResponse, status_code=201)
async def create_note(note: NoteCreate, db: AsyncSession = Depends(get_db)):
    """Create a new note."""
    return await crud.create_note(db, note)


@app.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int, note: NoteUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing note by ID."""
    updated = await crud.update_note(db, note_id, note)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")
    return updated


@app.delete("/notes/{note_id}", status_code=204)
async def delete_note(note_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a note by ID."""
    deleted = await crud.delete_note(db, note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
