import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ToastService } from '../../../core/services/toast.service';
import { WeeklyAttendanceItem } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-admin-summaries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-summaries.component.html',
  styleUrl: './admin-summaries.component.css',
})
export class AdminSummariesComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  selectedDate = this.getTodayString();
  weekStart = this.getMondayOfWeek(new Date());
  isLoading = false;
  weeklyItems: WeeklyAttendanceItem[] = [];
  totalHours = 0;
  totalDaysAttended = 0;

  ngOnInit(): void {
    this.loadWeekly();
  }

  getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  getMondayOfWeek(d: Date): string {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }

  getWeekLabel(): string {
    const mon = new Date(this.weekStart + 'T12:00:00');
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    return `${mon.toLocaleDateString()} – ${sun.toLocaleDateString()}`;
  }

  onDateChange(): void {
    const d = new Date(this.selectedDate + 'T12:00:00');
    this.weekStart = this.getMondayOfWeek(d);
    this.loadWeekly();
  }

  loadWeekly(): void {
    this.isLoading = true;
    this.weeklyItems = [];
    this.totalHours = 0;
    this.totalDaysAttended = 0;
    this.attendanceService
      .getWeeklyByWeek(this.weekStart)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (items) => {
          const list = Array.isArray(items) ? items : [];
          const first = list[0] as WeeklyAttendanceItem | undefined;
          this.weeklyItems = first ? [first] : [];
          this.totalHours = first?.totalHours ?? 0;
          this.totalDaysAttended = first?.daysAttended ?? 0;
        },
        error: () => {
          this.toastService.error('Failed to load weekly summaries');
        },
      });
  }

  formatWeekRange(item: WeeklyAttendanceItem): string {
    if (!item?.weekStart || !item?.weekEnd) return '—';
    const start = new Date(item.weekStart);
    const end = new Date(item.weekEnd);
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  }
}
