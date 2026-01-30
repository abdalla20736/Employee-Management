import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { employeeGuard } from './core/guards/employee.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    data: { noLayout: true },
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/admin/employees/employee-list.component').then(
            (m) => m.EmployeeListComponent
          ),
      },
      {
        path: 'employees/add',
        loadComponent: () =>
          import('./features/admin/employees/employee-form.component').then(
            (m) => m.EmployeeFormComponent
          ),
      },
      {
        path: 'employees/edit/:id',
        loadComponent: () =>
          import('./features/admin/employees/employee-form.component').then(
            (m) => m.EmployeeFormComponent
          ),
      },
      {
        path: 'summaries',
        loadComponent: () =>
          import('./features/admin/summaries/admin-summaries.component').then(
            (m) => m.AdminSummariesComponent
          ),
      },
      {
        path: 'daily-attendance',
        loadComponent: () =>
          import('./features/admin/daily-attendance/admin-daily-attendance.component').then(
            (m) => m.AdminDailyAttendanceComponent
          ),
      },
    ],
  },
  {
    path: 'employee',
    canActivate: [authGuard, employeeGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/employee/dashboard/employee-dashboard.component').then(
            (m) => m.EmployeeDashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/employee/profile/employee-profile.component').then(
            (m) => m.EmployeeProfileComponent
          ),
      },
      {
        path: 'check-ins',
        loadComponent: () =>
          import('./features/employee/check-ins/employee-check-ins.component').then(
            (m) => m.EmployeeCheckInsComponent
          ),
      },
    ],
  },
  {
    path: 'unauthorized',
    data: { noLayout: true },
    loadComponent: () =>
      import('./features/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: '**',
    data: { noLayout: true },
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
