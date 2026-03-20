"""
ORM model and Pydantic schemas for Notes
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

from database import Base


# ─── ORM Model ────────────────────────────────────────────────────────────────
class Note(Base):
    __tablename__ = "notes"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(255), nullable=False, index=True)   # B-tree index
    content    = Column(Text, nullable=False, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    # Composite index for list ordering (very common query pattern)
    __table_args__ = (
        Index("ix_notes_updated_at", "updated_at"),
    )


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class NoteCreate(BaseModel):
    title:   str = Field(..., min_length=1, max_length=255, example="Shopping List")
    content: str = Field(default="", example="Milk, Eggs, Bread")


class NoteUpdate(BaseModel):
    title:   Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None


class NoteResponse(BaseModel):
    id:         int
    title:      str
    content:    str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedNotes(BaseModel):
    notes:       List[NoteResponse]
    total:       int
    page:        int
    page_size:   int
    total_pages: int


class SearchResponse(BaseModel):
    notes: List[NoteResponse]
    total: int
    query: str
