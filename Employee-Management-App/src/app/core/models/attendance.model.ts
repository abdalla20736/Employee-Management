export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  checkInTime: string;
  checkInDate: string;
  workingHours?: number;
}

export interface AttendanceHistoryItem {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId: string;
  age: number;
  electronicSignature?: string;
  checkInTime: string;
}

export interface CheckInRequest {
  employeeId: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  attendance?: Attendance;
}

export interface WeeklyAttendanceItem {
  weekStart: string;
  weekEnd: string;
  daysAttended: number;
  totalHours: number;
}

export interface WeeklyAttendanceSummary {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  daysWorked: number;
  weekStart: string;
  weekEnd: string;
}
