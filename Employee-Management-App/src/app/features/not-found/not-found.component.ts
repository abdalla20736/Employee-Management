import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <h1 class="not-found__title">404</h1>
      <p class="not-found__text">Page not found.</p>
      <a routerLink="/login" class="not-found__btn">Go to Home</a>
    </div>
  `,
  styles: `
    .not-found {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      text-align: center;
      background: var(--not-found-bg, #f5f5f5);
    }
    .not-found__title {
      margin: 0;
      font-size: 4rem;
      font-weight: 700;
      color: var(--not-found-title, #333);
    }
    .not-found__text {
      margin: 0.5rem 0 1.5rem;
      font-size: 1.125rem;
      color: var(--not-found-text, #666);
    }
    .not-found__btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      color: #fff;
      background: var(--not-found-btn-bg, #0d6efd);
      border-radius: 0.375rem;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .not-found__btn:hover {
      opacity: 0.9;
    }
  `,
})
export class NotFoundComponent {}
