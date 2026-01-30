import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AttendanceService, DailyAttendanceItem } from '../../../core/services/attendance.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-daily-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-daily-attendance.component.html',
  styleUrl: './admin-daily-attendance.component.css',
})
export class AdminDailyAttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  selectedDate = this.getTodayString();
  isLoading = false;
  dailyItems: DailyAttendanceItem[] = [];

  ngOnInit(): void {
    this.loadDaily();
  }

  getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  onDateChange(): void {
    this.loadDaily();
  }

  loadDaily(): void {
    this.isLoading = true;
    this.dailyItems = [];
    this.attendanceService
      .getDailyAttendance(this.selectedDate)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (items) => {
          this.dailyItems = Array.isArray(items) ? items : [];
        },
        error: () => {
          this.toastService.error('Failed to load daily attendance');
        },
      });
  }

  getEmployeeName(item: DailyAttendanceItem): string {
    return [item.firstName, item.lastName].filter(Boolean).join(' ') || '—';
  }

  formatCheckInTime(item: DailyAttendanceItem): string {
    if (!item?.checkInTime) return '—';
    const d = new Date(item.checkInTime);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getSelectedDateLabel(): string {
    if (!this.selectedDate) return '';
    return new Date(this.selectedDate + 'T12:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
