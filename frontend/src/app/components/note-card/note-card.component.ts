// src/app/components/note-card/note-card.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="note-card" [class.deleting]="deleting">
      <div class="card-body" (click)="edit.emit(note)">
        <h3 class="note-title" [innerHTML]="highlight(note.title)"></h3>
        <p  class="note-preview" [innerHTML]="highlight(truncate(note.content))"></p>
        <time class="note-time">{{ formatDate(note.updated_at) }}</time>
      </div>
      <div class="card-actions">
        <button class="btn-icon btn-edit"   (click)="edit.emit(note)"   title="Edit">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M10.5 2.5l2 2-8 8H2.5v-2l8-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="btn-icon btn-delete" (click)="onDelete()" title="Delete">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 4h11M5 4V2.5h5V4M6 7v5M9 7v5M3 4l1 9h7l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .note-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px 18px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.3s;
      animation: cardIn 0.25s ease both;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .note-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--shadow);
      border-color: var(--accent-dim);
    }

    .note-card.deleting { opacity: 0; transform: scale(0.95); }

    .card-body { flex: 1; min-width: 0; }

    .note-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 6px;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'Playfair Display', Georgia, serif;
    }

    .note-preview {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0 0 8px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .note-time {
      font-size: 0.75rem;
      color: var(--text-subtle);
      letter-spacing: 0.01em;
    }

    .card-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .btn-icon {
      width: 30px; height: 30px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: transparent;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }

    .btn-edit:hover  { background: var(--accent-bg); color: var(--accent); border-color: var(--accent-dim); }
    .btn-delete:hover{ background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

    :global(.dark) .btn-delete:hover { background: rgba(220,38,38,.15); border-color: rgba(220,38,38,.3); }

    :global(.highlight) { background: var(--highlight-bg); color: var(--highlight-text); border-radius: 3px; padding: 0 2px; font-weight: 600; }
  `]
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Input() searchQuery = '';
  @Output() edit   = new EventEmitter<Note>();
  @Output() delete = new EventEmitter<number>();

  deleting = false;

  truncate(text: string, max = 120): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  highlight(text: string): string {
    if (!this.searchQuery) return this.escapeHtml(text);
    const escaped = this.escapeHtml(text);
    const safe = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${safe})`, 'gi');
    return escaped.replace(re, '<mark class="highlight">$1</mark>');
  }

  escapeHtml(t: string): string {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onDelete() {
    this.deleting = true;
    setTimeout(() => this.delete.emit(this.note.id), 280);
  }
}
