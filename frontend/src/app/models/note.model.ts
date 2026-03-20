// src/app/models/note.model.ts

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
}

export interface PaginatedNotes {
  notes: Note[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SearchResponse {
  notes: Note[];
  total: number;
  query: string;
}
