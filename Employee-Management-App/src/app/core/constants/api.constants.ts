export const API_BASE_URL = 'http://157.90.107.101:5065';

export function getSignatureImageUrl(value: string | undefined): string {
  if (!value) return '';
  if (value.startsWith('data:') || value.startsWith('http')) return value;
  return API_BASE_URL + (value.startsWith('/') ? value : '/' + value);
}

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  EMPLOYEES: `${API_BASE_URL}/api/employees`,
  EMPLOYEE_BY_ID: (id: string) => `${API_BASE_URL}/api/employees/${id}`,
  CHECK_IN: `${API_BASE_URL}/api/attendance/check-in`,
  ATTENDANCE_HISTORY: `${API_BASE_URL}/api/attendance/history`,
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  ATTENDANCE_WEEKLY: (weekStart: string) =>
    `${API_BASE_URL}/api/attendance/weekly?weekStart=${weekStart}`,
  ATTENDANCE_DAILY: (date: string) => `${API_BASE_URL}/api/attendance/daily?date=${date}`,
  ATTENDANCE_PER_WEEK: (employeeId: string) =>
    `${API_BASE_URL}/api/attendance/attendancePerWeek/${employeeId}`,
  UPLOAD_SIGNATURE: (employeeId: string) => `${API_BASE_URL}/api/employees/${employeeId}/signature`,
};
