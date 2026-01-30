import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private document = inject(DOCUMENT);

  set(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const expiresString = expires.toUTCString();

    this.document.cookie = `${name}=${encodeURIComponent(value)};expires=${expiresString};path=/;SameSite=Lax`;
  }

  get(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = this.document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    return null;
  }

  remove(name: string): void {
    this.document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  has(name: string): boolean {
    return this.get(name) !== null;
  }
}
