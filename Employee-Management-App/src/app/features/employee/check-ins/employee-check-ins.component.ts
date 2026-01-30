import { Component, inject, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceHistoryItem } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-employee-check-ins',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-check-ins.component.html',
  styleUrl: './employee-check-ins.component.css',
})
export class EmployeeCheckInsComponent implements OnInit {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private cdr = inject(ChangeDetectorRef);

  lastCheckInTimes: AttendanceHistoryItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private static readonly MAX_LAST_CHECK_INS = 50;

  constructor() {
    afterNextRender(() => {
      if (this.lastCheckInTimes.length > 0) return;
      this.loadIfReady();
    });
  }

  ngOnInit(): void {
    this.loadIfReady();
  }

  loadIfReady(): void {
    const user = this.authService.getCurrentUser();
    if (user?.nationalId && this.authService.getToken()) {
      this.loadAttendanceHistory(user.nationalId);
    } else if (user?.nationalId) {
      setTimeout(() => this.loadIfReady(), 100);
    }
  }

  loadAttendanceHistory(employeeId: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.attendanceService
      .getAttendanceHistory()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (history) => {
          const list = Array.isArray(history) ? history : Object.values(history || {});
          const myRecords = (list as AttendanceHistoryItem[])
            .filter(
              (record) =>
                record &&
                (record.employeeId === employeeId || record.nationalId === employeeId) &&
                record.checkInTime
            )
            .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
          this.lastCheckInTimes = myRecords.slice(0, EmployeeCheckInsComponent.MAX_LAST_CHECK_INS);
          this.cdr.detectChanges();
        },
        error: () => {
          this.lastCheckInTimes = [];
          this.errorMessage = 'Could not load check-in history.';
          this.cdr.detectChanges();
        },
      });
  }

  formatCheckInTime(isoString: string): string {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
