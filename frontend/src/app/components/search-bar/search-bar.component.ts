// src/app/components/search-bar/search-bar.component.ts
import {
  Component, Output, EventEmitter, signal, OnInit, OnDestroy, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-wrap">
      <div class="search-box" [class.focused]="focused()">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.8"/>
          <path d="M12 12l3.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <input
          #searchInput
          type="text"
          class="search-input"
          placeholder="Search notes..."
          [(ngModel)]="value"
          (ngModelChange)="onType($event)"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
          autocomplete="off"
          spellcheck="false"
        />
        @if (value) {
          <button class="clear-btn" (click)="clear()" aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-wrap { position: relative; }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface-raised);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 0 14px;
      height: 46px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-box.focused {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .search-icon { color: var(--text-muted); flex-shrink: 0; }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
    }

    .search-input::placeholder { color: var(--text-muted); }

    .clear-btn {
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      transition: color 0.15s, background 0.15s;
    }

    .clear-btn:hover { color: var(--text); background: var(--surface-hover); }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() queryChange = new EventEmitter<string>();
  @ViewChild('searchInput') searchInput!: ElementRef;

  value = '';
  focused = signal(false);

  private input$ = new Subject<string>();
  private sub!: Subscription;

  ngOnInit() {
    this.sub = this.input$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(q => this.queryChange.emit(q));
  }

  onType(val: string) {
    this.input$.next(val);
  }

  clear() {
    this.value = '';
    this.input$.next('');
    this.searchInput.nativeElement.focus();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
