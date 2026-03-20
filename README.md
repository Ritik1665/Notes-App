Notara
High-Performance Notes App
Angular 19  •  FastAPI  •  SQLite FTS5  •  Dark Mode

Overview
Notara is a production-ready, full-stack Notes application with fast full-text search, real-time UI updates, optimistic rendering, and dark mode. Built for performance and maintainability using modern Angular standalone components, async FastAPI, and SQLite FTS5.
Key highlights: 
•SQLite FTS5 full-text search — sub-millisecond keyword search with ranked results
•Angular 19 Signals — fine-grained reactivity with no zone.js overhead
•300ms debounced search with distinctUntilChanged — minimal API calls
•Optimistic UI updates — instant feedback before server confirms
•Dark mode — follows OS preference with manual toggle
•Keyword highlighting — matched terms highlighted in search results
•In-memory caching — avoids redundant GET requests

Tech Stack
Frontend:  Angular 19 (standalone components, Signals, RxJS)     Backend:  Python FastAPI (async, Pydantic v2)     Database:  SQLite with FTS5 virtual table

Prerequisites
Tool	Version	Purpose
Python	3.11+	Backend runtime
Node.js	20+	Angular build toolchain
npm	10+	Package manager

Quick Start
1 — Backend Setup
Open a terminal in the notes-app/backend directory and run:
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
 
# Install Python dependencies
pip install -r requirements.txt
 
# (Optional) Seed database with 8 demo notes
python seed.py
 
# Start the FastAPI server with hot-reload
uvicorn main:app --reload --port 8000
Backend is live at: http://localhost:8000   •   Interactive docs: http://localhost:8000/docs
2 — Frontend Setup
Open a second terminal in the notes-app/frontend directory and run:
# Install Angular CLI globally (skip if already installed)
npm install -g @angular/cli@19
 
# Install project dependencies
npm install
 
# Start the dev server (auto-proxies /notes → FastAPI on :8000)
npm start
Frontend is live at: http://localhost:4200

Folder Structure
notes-app/
├── backend/
│   ├── main.py          FastAPI app — routes, CORS, lifespan startup
│   ├── database.py      Async SQLAlchemy engine + FTS5 table + triggers
│   ├── models.py        ORM model (Note) + all Pydantic schemas
│   ├── crud.py          Async CRUD operations (FTS5 + LIKE fallback)
│   ├── seed.py          Populates 8 demo notes for testing
│   ├── requirements.txt 6 pinned Python dependencies
│   └── notes.db         SQLite file (auto-created on first run)
│
└── frontend/
    ├── proxy.conf.json          Dev proxy /notes → FastAPI :8000
    └── src/
        ├── main.ts              Bootstrap (provideHttpClient, standalone)
        ├── styles.css           CSS variable theme system (light + dark)
        └── app/
            ├── app.component.ts             Root shell + dark mode toggle
            ├── models/note.model.ts          TypeScript interfaces
            ├── services/notes.service.ts     HTTP + Signal-based state + cache
            └── components/
                ├── notes-list/              Smart container (pagination, states)
                ├── note-card/               OnPush card + keyword highlighting
                ├── note-form/               Create / Edit modal with animation
                └── search-bar/              Debounced search input (300ms)

API Reference
Base URL: http://localhost:8000

Method	Endpoint	Description
GET	/notes	List all notes (paginated)
POST	/notes	Create a new note
PUT	/notes/{id}	Update an existing note
DELETE	/notes/{id}	Delete a note
GET	/notes/search?q=kw	Full-text keyword search
GET	/health	Health check

API Testing Examples
List notes (paginated)
curl "http://localhost:8000/notes?page=1&page_size=20"
Create a note
curl -X POST "http://localhost:8000/notes" \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Note", "content": "Hello, Notara!"}'
Update a note
curl -X PUT "http://localhost:8000/notes/1" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "content": "Updated content"}'
Delete a note
curl -X DELETE "http://localhost:8000/notes/1"
Search notes
# FTS5 ranked full-text search (case-insensitive)
curl "http://localhost:8000/notes/search?q=sourdough"
Interactive API docs (Swagger UI)
Visit http://localhost:8000/docs in your browser for a full interactive API explorer.

File Reference
Backend Files
File	Purpose
main.py	FastAPI application factory, all route definitions, CORS middleware, lifespan
database.py	Async SQLAlchemy engine setup, FTS5 virtual table creation, 3 sync triggers
models.py	SQLAlchemy Note ORM model, NoteCreate / NoteUpdate / NoteResponse Pydantic schemas
crud.py	All async DB operations: get_notes, search_notes (FTS5), create, update, delete
seed.py	Standalone seeder — run once to populate the DB with 8 realistic demo notes
requirements.txt	fastapi, uvicorn, sqlalchemy, aiosqlite, pydantic, python-multipart (6 packages)

Frontend Files
File	Purpose
app.component.ts	Root shell: renders header + dark mode toggle; sets data-theme on <html>
notes.service.ts	All HTTP calls, Signal-based state (notes, loading, searchQuery), in-memory cache
notes-list.component.ts	Smart container: orchestrates search, pagination, modal open/close, skeleton UI
note-card.component.ts	OnPush presentational card: XSS-safe keyword highlight, relative timestamps
note-form.component.ts	Modal for create/edit: slide-up animation, validation, loading spinner
search-bar.component.ts	Debounced input: Subject + debounceTime(300) + distinctUntilChanged
note.model.ts	TypeScript interfaces: Note, NoteCreate, NoteUpdate, PaginatedNotes, SearchResponse
styles.css	CSS custom properties for full light/dark theming; highlight mark styles
proxy.conf.json	ng serve proxy: forwards /notes/* to http://localhost:8000 during development

Performance Optimizations

Technique	Description	Benefit
SQLite FTS5	Full-text search via inverted index	O(log n) vs O(n) for LIKE
SQL Triggers	Auto-sync FTS table on INSERT/UPDATE/DELETE	Zero app-level sync code
B-tree indexes	On title and updated_at columns	Fast sort & filter queries
Async FastAPI	All routes use async/await with aiosqlite	Non-blocking I/O
Signal state	Angular Signals for fine-grained reactivity	No zone.js overhead
Debounced search	300ms debounce + distinctUntilChanged	1 API call vs 9 per word
Optimistic updates	UI updates before HTTP response returns	Instant perceived feedback
OnPush detection	NoteCardComponent uses OnPush strategy	Fewer re-renders
In-memory cache	Map<id, Note> in NotesService	No redundant GET calls
FTS5 deep-dive: The FTS5 virtual table maintains an inverted index — a sorted map from token to list of (rowid, position) pairs. A query for "sourdough" does a binary search on the index rather than scanning all rows. On a table of 100,000 notes, FTS5 returns results in under 1ms. The rank column (BM25 scoring) orders results by relevance automatically.

UI & UX Features
•Dark mode — persists based on OS preference; toggle button in header
•Keyword highlighting — matched text shown in yellow in search results (XSS-safe via manual HTML escaping)
•Relative timestamps — shows "Just now", "2h ago", "3d ago" etc.
•Smooth animations — card entry fade-in, modal slide-up, delete fade-out transition
•Skeleton loading — shimmer grid shown while API request is in-flight
•Empty states — contextual messages for zero notes and zero search results
•Responsive grid — CSS auto-fill minmax(260px, 1fr) adapts to any screen width
•Pagination — page controls appear when total notes exceed page size

Future Enhancements
•Tags / Labels — categorize notes with colored tags and filter by tag
•Pin notes — keep important notes at the top of the list
•Export — download notes as Markdown, PDF, or plain text
•Rich text editor — replace textarea with TipTap or Quill
•Authentication — JWT-based multi-user support with per-user notes
•PostgreSQL — swap SQLite for pg_trgm or tsvector full-text search at scale
•WebSockets — real-time sync across browser tabs
•Offline mode — service worker + IndexedDB for offline note editing

Troubleshooting
CORS errors in browser console
Ensure the backend is running on port 8000 and the CORS origin http://localhost:4200 is in main.py. Do not change the Angular dev port without updating the backend CORS config.
"Module not found" on npm start
Run npm install from the frontend/ directory to install all Angular dependencies.
Database not found / empty
The notes.db file is created automatically on first startup. Run python seed.py to populate it with demo data.
FTS5 search returns no results
FTS5 triggers populate the search index on INSERT. If you migrated an existing DB without the triggers, run: INSERT INTO notes_fts(notes_fts) VALUES('rebuild') in the SQLite shell.
