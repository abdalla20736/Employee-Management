import { Injectable, inject, signal, afterNextRender } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, User } from '../models/user.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private authenticated = signal(this.checkAuthenticated());
  readonly isAuthenticatedSignal = this.authenticated.asReadonly();

  private readonly TOKEN_COOKIE_NAME = 'access_token';

  constructor() {
    const token = this.getToken();
    if (token && this.isTokenExpired(token)) {
      this.logout();
    } else {
      this.authenticated.set(this.checkAuthenticated());
    }
    afterNextRender(() => {
      this.authenticated.set(this.checkAuthenticated());
      const stored = this.getStoredUser();
      if (stored && this.currentUserSubject.value === null) {
        this.currentUserSubject.next(stored);
      }
    });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUser(response);
        this.currentUserSubject.next(response);
        this.authenticated.set(true);
      })
    );
  }

  logout(): void {
    this.cookieService.remove(this.TOKEN_COOKIE_NAME);
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.authenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.cookieService.get(this.TOKEN_COOKIE_NAME);
  }

  private checkAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  isAuthenticated(): boolean {
    return this.checkAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'Admin';
  }

  isEmployee(): boolean {
    return this.getCurrentUser()?.role === 'Employee';
  }

  updateCurrentUser(user: User): void {
    this.setUser(user);
    this.currentUserSubject.next(user);
  }

  private setToken(token: string): void {
    this.cookieService.set(this.TOKEN_COOKIE_NAME, token, 7);
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }
}
