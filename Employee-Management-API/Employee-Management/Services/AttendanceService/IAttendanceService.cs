using Employee_Management.Entites;
using Employee_Management.Models;
using System.Security.Claims;

namespace Employee_Management.Services.AttendanceService;

public interface IAttendanceService
{
    Task<(bool Success, string Message)> CheckInAsync(string user);
    Task<List<AttendanceDto>> GetDailyAttendanceAsync(DateTime date);
    Task<List<AttendanceDto>> GetLastWeekAttendanceHistoryAsync(string employeeId);
    Task<WeeklyAttendanceSummaryDto> GetWeeklySummaryAsync(string userId, DateTime weekStart);
    Task<int> GetWorkingHoursPerWeekByEmployee(string userId);
    Task<IEnumerable<WeeklyAttendanceSummaryDto>> GetWeeklySummaryAllEmployesAsync(DateTime weekStart);

}