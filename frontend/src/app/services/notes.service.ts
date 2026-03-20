// src/app/services/notes.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Note, NoteCreate, NoteUpdate, PaginatedNotes, SearchResponse } from '../models/note.model';

const API = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class NotesService {
  // ─── Reactive State (Signals) ─────────────────────────────────────────────
  notes        = signal<Note[]>([]);
  total        = signal(0);
  currentPage  = signal(1);
  totalPages   = signal(1);
  loading      = signal(false);
  searchQuery  = signal('');
  isSearching  = signal(false);

  // Local cache: note id → Note (avoids redundant GET calls)
  private cache = new Map<number, Note>();

  constructor(private http: HttpClient) {}

  // ─── Load Notes ───────────────────────────────────────────────────────────
  loadNotes(page = 1): void {
    this.loading.set(true);
    this.http
      .get<PaginatedNotes>(`${API}/notes`, {
        params: new HttpParams().set('page', page).set('page_size', 20),
      })
      .pipe(
        tap(res => {
          this.notes.set(res.notes);
          this.total.set(res.total);
          this.currentPage.set(res.page);
          this.totalPages.set(res.total_pages);
          // Populate cache
          res.notes.forEach(n => this.cache.set(n.id, n));
          this.loading.set(false);
          this.isSearching.set(false);
          this.searchQuery.set('');
        }),
        catchError(err => { this.loading.set(false); return of(null); })
      )
      .subscribe();
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  search(query: string): void {
    if (!query.trim()) { this.loadNotes(); return; }
    this.loading.set(true);
    this.isSearching.set(true);
    this.searchQuery.set(query);
    this.http
      .get<SearchResponse>(`${API}/notes/search`, {
        params: new HttpParams().set('q', query),
      })
      .pipe(
        tap(res => {
          this.notes.set(res.notes);
          this.total.set(res.total);
          this.loading.set(false);
        }),
        catchError(() => { this.loading.set(false); return of(null); })
      )
      .subscribe();
  }

  // ─── Create ───────────────────────────────────────────────────────────────
  createNote(data: NoteCreate): Observable<Note> {
    return this.http.post<Note>(`${API}/notes`, data).pipe(
      tap(note => {
        this.cache.set(note.id, note);
        this.notes.update(list => [note, ...list]);
        this.total.update(t => t + 1);
      })
    );
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  updateNote(id: number, data: NoteUpdate): Observable<Note> {
    return this.http.put<Note>(`${API}/notes/${id}`, data).pipe(
      tap(updated => {
        this.cache.set(id, updated);
        this.notes.update(list => list.map(n => (n.id === id ? updated : n)));
      })
    );
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/notes/${id}`).pipe(
      tap(() => {
        this.cache.delete(id);
        this.notes.update(list => list.filter(n => n.id !== id));
        this.total.update(t => Math.max(0, t - 1));
      })
    );
  }

  // ─── Get from cache ───────────────────────────────────────────────────────
  getCached(id: number): Note | undefined {
    return this.cache.get(id);
  }
}
