// src/app/components/notes-list/notes-list.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { NotesService }   from '../../services/notes.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { NoteCardComponent }  from '../note-card/note-card.component';
import { NoteFormComponent }  from '../note-form/note-form.component';
import { Note, NoteCreate, NoteUpdate } from '../../models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, NoteCardComponent, NoteFormComponent],
  template: `
    <!-- Top bar: search + new button -->
    <div class="top-bar">
      <app-search-bar (queryChange)="onSearch($event)" />
      <button class="btn-new" (click)="openCreate()" title="New note">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
        <span>New</span>
      </button>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar">
      @if (svc.isSearching()) {
        <span class="badge badge-search">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 8l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          "{{ svc.searchQuery() }}" · {{ svc.total() }} result{{ svc.total() !== 1 ? 's' : '' }}
        </span>
      } @else {
        <span class="stat-text">{{ svc.total() }} note{{ svc.total() !== 1 ? 's' : '' }}</span>
      }
    </div>

    <!-- Loading skeleton -->
    @if (svc.loading()) {
      <div class="notes-grid">
        @for (i of skeletons; track i) {
          <div class="skeleton-card">
            <div class="sk sk-title"></div>
            <div class="sk sk-line"></div>
            <div class="sk sk-line sk-short"></div>
          </div>
        }
      </div>
    }

    <!-- Notes grid -->
    @if (!svc.loading()) {
      @if (svc.notes().length === 0) {
        <div class="empty-state">
          @if (svc.isSearching()) {
            <div class="empty-icon">🔍</div>
            <h3>No results for "{{ svc.searchQuery() }}"</h3>
            <p>Try different keywords or clear your search</p>
          } @else {
            <div class="empty-icon">📝</div>
            <h3>No notes yet</h3>
            <p>Create your first note to get started</p>
            <button class="btn-create-first" (click)="openCreate()">Create a note</button>
          }
        </div>
      } @else {
        <div class="notes-grid">
          @for (note of svc.notes(); track note.id) {
            <app-note-card
              [note]="note"
              [searchQuery]="svc.searchQuery()"
              (edit)="openEdit($event)"
              (delete)="onDelete($event)"
            />
          }
        </div>

        <!-- Pagination -->
        @if (!svc.isSearching() && svc.totalPages() > 1) {
          <div class="pagination">
            <button class="pg-btn" [disabled]="svc.currentPage() === 1"
                    (click)="goPage(svc.currentPage() - 1)">← Prev</button>
            <span class="pg-info">{{ svc.currentPage() }} / {{ svc.totalPages() }}</span>
            <button class="pg-btn" [disabled]="svc.currentPage() === svc.totalPages()"
                    (click)="goPage(svc.currentPage() + 1)">Next →</button>
          </div>
        }
      }
    }

    <!-- Modal -->
    @if (showForm()) {
      <app-note-form
        [note]="editingNote()"
        (saved)="onSave($event)"
        (cancel)="closeForm()"
      />
    }
  `,
  styles: [`
    .top-bar {
      display: flex; gap: 12px; align-items: center;
      margin-bottom: 16px;
    }

    app-search-bar { flex: 1; }

    .btn-new {
      display: flex; align-items: center; gap: 7px;
      height: 46px; padding: 0 18px;
      border-radius: 12px;
      border: none;
      background: var(--accent);
      color: #fff;
      font-size: 0.9rem; font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s, transform 0.1s;
      flex-shrink: 0;
    }
    .btn-new:hover  { background: var(--accent-hover); }
    .btn-new:active { transform: scale(0.97); }

    .stats-bar {
      margin-bottom: 20px;
      min-height: 24px;
      display: flex; align-items: center;
    }

    .stat-text { font-size: 0.8rem; color: var(--text-subtle); }

    .badge { display: inline-flex; align-items: center; gap: 5px; }
    .badge-search {
      font-size: 0.8rem; color: var(--accent);
      background: var(--accent-bg); border-radius: 20px;
      padding: 3px 10px;
    }

    /* Grid */
    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    /* Skeleton */
    .skeleton-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .sk {
      background: var(--surface-hover);
      border-radius: 6px;
      animation: shimmer 1.4s ease infinite;
    }
    .sk-title  { height: 18px; width: 70%; }
    .sk-line   { height: 12px; }
    .sk-short  { width: 45%; }

    @keyframes shimmer {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.3rem; font-weight: 700;
      color: var(--text); margin: 0 0 8px;
    }
    .empty-state p { font-size: 0.9rem; margin: 0 0 24px; }

    .btn-create-first {
      display: inline-flex;
      padding: 10px 24px;
      border-radius: 12px;
      border: 2px dashed var(--accent);
      background: var(--accent-bg);
      color: var(--accent);
      font-size: 0.9rem; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-create-first:hover { background: var(--accent-bg-hover); }

    /* Pagination */
    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; margin-top: 32px;
    }
    .pg-btn {
      height: 36px; padding: 0 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface-raised);
      color: var(--text);
      font-size: 0.85rem; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .pg-btn:hover:not(:disabled) { background: var(--surface-hover); }
    .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .pg-info { font-size: 0.85rem; color: var(--text-muted); }
  `]
})
export class NotesListComponent implements OnInit {
  skeletons = [1, 2, 3, 4, 5, 6];

  showForm   = signal(false);
  editingNote = signal<Note | null>(null);

  constructor(public svc: NotesService) {}

  ngOnInit() { this.svc.loadNotes(); }

  onSearch(q: string) { this.svc.search(q); }

  openCreate() { this.editingNote.set(null); this.showForm.set(true); }
  openEdit(n: Note) { this.editingNote.set(n); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editingNote.set(null); }

  onSave(payload: any) {
    const editing = this.editingNote();
    if (editing) {
      this.svc.updateNote(editing.id, payload).subscribe({
        next: () => this.closeForm(),
        error: console.error,
      });
    } else {
      this.svc.createNote(payload).subscribe({
        next: () => this.closeForm(),
        error: console.error,
      });
    }
  }

  onDelete(id: number) {
    this.svc.deleteNote(id).subscribe({ error: console.error });
  }

  goPage(p: number) { this.svc.loadNotes(p); }
}
