// src/app/components/note-form/note-form.component.ts
import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note, NoteCreate, NoteUpdate } from '../../models/note.model';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="backdrop" (click)="cancel.emit()" [@fade]></div>

    <!-- Modal -->
    <div class="modal" role="dialog" aria-modal="true"
         [attr.aria-label]="note ? 'Edit note' : 'New note'">
      <header class="modal-header">
        <h2 class="modal-title">{{ note ? 'Edit Note' : 'New Note' }}</h2>
        <button class="close-btn" (click)="cancel.emit()" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      <div class="modal-body">
        <div class="field">
          <label for="title-input" class="field-label">Title</label>
          <input
            id="title-input"
            type="text"
            class="field-input"
            [(ngModel)]="title"
            placeholder="Note title..."
            maxlength="255"
            autofocus
          />
        </div>

        <div class="field">
          <label for="content-input" class="field-label">Content</label>
          <textarea
            id="content-input"
            class="field-textarea"
            [(ngModel)]="content"
            placeholder="Start writing..."
            rows="8"
          ></textarea>
          <span class="char-count">{{ content.length }} characters</span>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="btn btn-ghost" (click)="cancel.emit()">Cancel</button>
        <button
          class="btn btn-primary"
          [disabled]="!title.trim() || saving()"
          (click)="submit()"
        >
          @if (saving()) {
            <span class="spinner"></span> Saving…
          } @else {
            {{ note ? 'Save Changes' : 'Create Note' }}
          }
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(4px);
      z-index: 200;
      animation: fadeIn 0.2s ease;
    }

    .modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 201;
      width: min(560px, calc(100vw - 32px));
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.25);
      animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
      to   { opacity: 1; transform: translate(-50%, -50%); }
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border);
    }

    .modal-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.2rem; font-weight: 700;
      margin: 0; color: var(--text);
    }

    .close-btn {
      width: 32px; height: 32px;
      border-radius: 8px; border: none;
      background: transparent; color: var(--text-muted);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .close-btn:hover { background: var(--surface-hover); color: var(--text); }

    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }

    .field { display: flex; flex-direction: column; gap: 6px; }

    .field-label {
      font-size: 0.8rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .field-input, .field-textarea {
      background: var(--surface-raised);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.95rem;
      font-family: inherit;
      color: var(--text);
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      resize: none;
    }

    .field-input:focus, .field-textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .field-textarea { line-height: 1.6; }

    .char-count {
      font-size: 0.75rem; color: var(--text-subtle);
      text-align: right; margin-top: -2px;
    }

    .modal-footer {
      padding: 16px 24px 20px;
      border-top: 1px solid var(--border);
      display: flex; justify-content: flex-end; gap: 10px;
    }

    .btn {
      height: 40px; padding: 0 20px;
      border-radius: 10px; border: none;
      font-size: 0.9rem; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; gap: 8px;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
    }
    .btn:active { transform: scale(0.97); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-ghost {
      background: var(--surface-raised);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover:not(:disabled) { background: var(--surface-hover); color: var(--text); }

    .btn-primary {
      background: var(--accent);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class NoteFormComponent implements OnChanges {
  @Input()  note?: Note | null;
  @Output() saved  = new EventEmitter<NoteCreate | NoteUpdate>();
  @Output() cancel = new EventEmitter<void>();

  title   = '';
  content = '';
  saving  = signal(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['note']) {
      this.title   = this.note?.title   ?? '';
      this.content = this.note?.content ?? '';
    }
  }

  submit() {
    if (!this.title.trim()) return;
    this.saving.set(true);
    const payload: NoteCreate | NoteUpdate = { title: this.title.trim(), content: this.content };
    this.saved.emit(payload);
    // parent resets saving via component destruction
  }
}
