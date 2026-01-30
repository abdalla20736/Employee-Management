import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ToastService } from '../../../core/services/toast.service';
import { CheckInRequest } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css',
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private toastService = inject(ToastService);

  currentUser$ = this.authService.currentUser$;
  isLoading = false;

  currentTime = new Date();
  canCheckIn = false;
  checkInMessage = '';
  isCheckingIn = false;
  hasCheckedInToday = false;
  lastCheckInTime: string | null = null;
  private timeInterval: any;
  private attendanceLoaded = false;

  constructor() {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateTime(): void {
    this.currentTime = new Date();
    this.validateCheckInTime();
  }

  validateCheckInTime(): void {
    const now = this.currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    const startMinutes = 7 * 60 + 30;
    const endMinutes = 9 * 60;
    this.canCheckIn = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  performCheckIn(): void {
    if (!this.canCheckIn) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.nationalId) {
      this.toastService.error('User not found');
      return;
    }

    this.isCheckingIn = true;
    const request: CheckInRequest = {
      employeeId: user.nationalId,
    };

    this.attendanceService.checkIn(request).subscribe({
      next: (response) => {
        this.isCheckingIn = false;
        if (response.success !== false) {
          this.toastService.success(response.message || 'Check-in successful!');
        } else {
          this.toastService.error(response.message || 'Check-in failed');
        }
      },
      error: (error) => {
        this.isCheckingIn = false;
        const errorMessage = error.error?.message || 'Check-in failed. Please try again.';
        this.toastService.error(errorMessage);
      },
    });
  }
}
