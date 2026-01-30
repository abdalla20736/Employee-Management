import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Attendance,
  AttendanceHistoryItem,
  CheckInRequest,
  CheckInResponse,
  WeeklyAttendanceItem,
} from '../models/attendance.model';

export type DailyAttendanceItem = AttendanceHistoryItem;
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private http = inject(HttpClient);

  checkIn(request: CheckInRequest): Observable<CheckInResponse> {
    var k = this.http.post<CheckInResponse>(API_ENDPOINTS.CHECK_IN, request);
    console.log('from API ', k);
    return k;
  }

  getAttendanceHistory(): Observable<AttendanceHistoryItem[]> {
    return this.http.get<AttendanceHistoryItem[]>(API_ENDPOINTS.ATTENDANCE_HISTORY);
  }

  getWeeklyByWeek(weekStart: string): Observable<WeeklyAttendanceItem[]> {
    return this.http.get<WeeklyAttendanceItem[]>(API_ENDPOINTS.ATTENDANCE_WEEKLY(weekStart));
  }

  getDailyAttendance(date: string): Observable<DailyAttendanceItem[]> {
    return this.http.get<DailyAttendanceItem[]>(API_ENDPOINTS.ATTENDANCE_DAILY(date));
  }

  getAttendancePerWeek(employeeId: string): Observable<number> {
    return this.http.get<number>(API_ENDPOINTS.ATTENDANCE_PER_WEEK(employeeId));
  }

  getAllAttendance(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(API_ENDPOINTS.ATTENDANCE);
  }
}
