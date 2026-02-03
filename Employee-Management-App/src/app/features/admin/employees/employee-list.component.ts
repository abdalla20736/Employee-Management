import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, skip } from 'rxjs/operators';
import { finalize } from 'rxjs';
import {
  EmployeeService,
  GetEmployeesParams,
  GetEmployeesResponse,
} from '../../../core/services/employee.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../../../core/models/employee.model';

const SORT_FIELD_TO_API: Record<string, string> = {
  firstName: 'firstname',
  lastName: 'lastname',
  phoneNumber: 'phonenumber',
  nationalId: 'nationalid',
  age: 'age',
};

const SORT_API_TO_FIELD: Record<string, keyof Employee> = {
  firstname: 'firstName',
  lastname: 'lastName',
  phonenumber: 'phoneNumber',
  nationalid: 'nationalId',
  age: 'age',
};

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private employeeService = inject(EmployeeService);
  private attendanceService = inject(AttendanceService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employees: Employee[] = [];
  isLoading = false;
  searchTerm = '';
  sortField: keyof Employee | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  isNextPage = false;
  hasLoadedOnce = false;

  showDeleteModal = false;
  employeeToDelete: { id: string; name: string } | null = null;
  isDeleting = false;

  showHoursModal = false;
  hoursModalEmployee: { id: string; name: string } | null = null;
  hoursLastWeek: number | null = null;
  isLoadingHours = false;

  private search$ = new Subject<string>();
  private queryParamsSub?: Subscription;
  private searchSub?: Subscription;
  private skipNextQueryParamsLoad = false;

  ngOnInit(): void {
    this.syncStateFromQueryParams(this.route.snapshot.queryParams);
    this.queryParamsSub = this.route.queryParams
      .pipe(
        skip(1),
        filter(() => !this.skipNextQueryParamsLoad),
      )
      .subscribe((params) => {
        this.syncStateFromQueryParams(params);
        this.loadEmployees();
      });
    this.searchSub = this.search$
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.updateUrl();
        this.loadEmployees();
      });
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  private syncStateFromQueryParams(params: Record<string, string | string[] | undefined>): void {
    const get = (key: string): string | undefined => {
      const v = params[key];
      return v == null ? undefined : Array.isArray(v) ? v[0] : v;
    };
    const search = get('search');
    if (search != null) this.searchTerm = search;
    const sortBy = get('sortBy');
    if (sortBy && SORT_API_TO_FIELD[sortBy.toLowerCase()]) {
      this.sortField = SORT_API_TO_FIELD[sortBy.toLowerCase()];
    }
    const ascending = get('ascending');
    if (ascending != null) {
      this.sortDirection = ascending === 'true' ? 'asc' : 'desc';
    }
    const page = get('page');
    if (page != null) {
      const n = parseInt(page, 10);
      if (!isNaN(n) && n > 0) this.currentPage = n;
    }
    const pagesize = get('pagesize');
    if (pagesize != null) {
      const n = parseInt(pagesize, 10);
      if (!isNaN(n) && n > 0) this.pageSize = n;
    }
  }

  private updateUrl(): void {
    this.skipNextQueryParamsLoad = true;
    const queryParams: Record<string, string | number> = {};
    if (this.searchTerm) queryParams['search'] = this.searchTerm;
    if (this.sortField && SORT_FIELD_TO_API[this.sortField]) {
      queryParams['sortBy'] = SORT_FIELD_TO_API[this.sortField];
      queryParams['ascending'] = this.sortDirection === 'asc' ? 'true' : 'false';
    }
    queryParams['page'] = this.currentPage;
    queryParams['pagesize'] = this.pageSize;
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: '',
        replaceUrl: true,
      })
      .then(() => {
        this.skipNextQueryParamsLoad = false;
      });
  }

  loadEmployees(): void {
    this.isLoading = true;
    const sortBy =
      this.sortField && SORT_FIELD_TO_API[this.sortField]
        ? SORT_FIELD_TO_API[this.sortField]
        : undefined;
    const params: GetEmployeesParams = {
      search: this.searchTerm || undefined,
      sortBy,
      ascending: this.sortDirection === 'asc',
      page: this.currentPage,
      pageSize: this.pageSize,
    };
    this.employeeService
      .getEmployees(params)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.hasLoadedOnce = true;
          this.employees = response.data ?? [];
          this.totalCount = response.total ?? 0;
          this.isNextPage = response.isNextPage ?? false;
        },
        error: () => {
          this.toastService.error('Failed to load employees');
        },
      });
  }

  onSearchInput(): void {
    this.search$.next(this.searchTerm);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateUrl();
    this.loadEmployees();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updateUrl();
    this.loadEmployees();
  }

  sort(field: keyof Employee): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.updateUrl();
    this.loadEmployees();
  }

  getSortIcon(field: keyof Employee): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  changePage(page: number): void {
    if (page < 1) return;
    if (page > this.currentPage && !this.isNextPage) return;
    this.currentPage = page;
    this.updateUrl();
    this.loadEmployees();
  }

  openDeleteModal(id: string, name: string): void {
    this.employeeToDelete = { id, name };
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    if (!this.isDeleting) {
      this.showDeleteModal = false;
      this.employeeToDelete = null;
    }
  }

  confirmDelete(): void {
    if (!this.employeeToDelete) return;
    this.isDeleting = true;
    this.employeeService.deleteEmployee(this.employeeToDelete.id).subscribe({
      next: () => {
        this.toastService.success('Employee deleted successfully');
        this.showDeleteModal = false;
        this.employeeToDelete = null;
        this.isDeleting = false;
        this.loadEmployees();
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to delete employee');
        this.isDeleting = false;
        this.cdr.detectChanges();
      },
    });
  }

  openHoursModal(employee: Employee): void {
    this.hoursModalEmployee = {
      id: employee.id!,
      name: `${employee.firstName} ${employee.lastName}`.trim(),
    };
    this.hoursLastWeek = null;
    this.isLoadingHours = true;
    this.showHoursModal = true;
    this.attendanceService.getAttendancePerWeek(employee.id!).subscribe({
      next: (hours) => {
        this.hoursLastWeek = hours;
        this.isLoadingHours = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to load hours for last week');
        this.isLoadingHours = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeHoursModal(): void {
    if (!this.isLoadingHours) {
      this.showHoursModal = false;
      this.hoursModalEmployee = null;
      this.hoursLastWeek = null;
    }
  }
}
