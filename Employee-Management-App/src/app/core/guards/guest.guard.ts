import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/employee/dashboard']);
  }
  return false;
};
