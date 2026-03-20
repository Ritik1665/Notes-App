// src/app/app.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesListComponent } from './components/notes-list/notes-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NotesListComponent],
  template: `
    <div class="app-shell" [class.dark]="darkMode()">
      <header class="app-header">
        <div class="header-inner">
          <div class="brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="6" fill="currentColor" opacity="0.15"/>
              <path d="M7 9h14M7 14h10M7 19h8" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round"/>
            </svg>
            <span class="brand-name">Notara</span>
          </div>
          <button class="theme-toggle" (click)="toggleDark()" [attr.aria-label]="darkMode() ? 'Switch to light mode' : 'Switch to dark mode'">
            <span class="theme-icon">{{ darkMode() ? '☀️' : '🌙' }}</span>
          </button>
        </div>
      </header>
      <main class="app-main">
        <app-notes-list />
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .app-shell {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      transition: background 0.3s ease, color 0.3s ease;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .header-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--accent);
    }

    .brand-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    .theme-toggle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--surface-raised);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background 0.2s;
    }

    .theme-toggle:hover { transform: scale(1.1); background: var(--surface-hover); }
    .theme-icon { font-size: 1rem; line-height: 1; }

    .app-main {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }
  `]
})
export class AppComponent {
  darkMode = signal<boolean>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  toggleDark() {
    this.darkMode.update(v => !v);
    document.documentElement.setAttribute(
      'data-theme',
      this.darkMode() ? 'dark' : 'light'
    );
  }

  constructor() {
    // Apply initial theme
    document.documentElement.setAttribute(
      'data-theme',
      this.darkMode() ? 'dark' : 'light'
    );
  }
}
