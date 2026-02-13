namespace Employee_Management.Services.AttendanceService;

using Employee_Management.Data;
using Employee_Management.Entites;
using Employee_Management.Models;
using Employee_Management.Repositories.AttendanceRepo;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _attendanceRepo;
    private readonly AttendanceSettings _settings;

    public AttendanceService(
        IAttendanceRepository attendanceRepo,
        IOptions<AttendanceSettings> options)
    {
        _attendanceRepo = attendanceRepo;
        _settings = options.Value;
    }

    public async Task<(bool Success, string Message)> CheckInAsync(string employeeId)
    {
        var now = DateTime.Now;

        if (now.TimeOfDay < _settings.CheckInStart || now.TimeOfDay > _settings.CheckInEnd)
            return (false, "Check-in is allowed only between 7:30 AM and 9:00 AM");

        if (await _attendanceRepo.HasCheckedInTodayAsync(employeeId))
            return (false, "You have already checked in today.");

        var attendance = new Attendance
        {
            EmployeeId = employeeId,
            CheckInTime = now
        };

        await _attendanceRepo.AddAsync(attendance);
        await _attendanceRepo.SaveChangesAsync();

        return (true, "Check-in successful");
    }

    public async Task<List<AttendanceDto>> GetDailyAttendanceAsync(DateTime date)
    {
        var attendances = await _attendanceRepo.GetByDateAsync(date);

        return attendances.Select(a => new AttendanceDto
        {
            Id = a.Id,
            EmployeeId = a.EmployeeId,
            FirstName = a.Employee.FirstName,
            LastName = a.Employee.LastName,
            PhoneNumber = a.Employee.PhoneNumber,
            Age = a.Employee.Age,
            NationalId = a.Employee.NationalId,
            ElectronicSignature = a.Employee.ElectronicSignature,
            CheckInTime = a.CheckInTime
        }).ToList();
    }

    public async Task<List<AttendanceDto>> GetLastWeekAttendanceHistoryAsync(string employeeId)
    {
        var now = DateTime.Now;
        var lastWeek = now.AddDays(-_settings.HistoryDays);

        var attendances = await _attendanceRepo.GetByEmployeeInRangeAsync(employeeId, lastWeek, now);

        return attendances.Select(a => new AttendanceDto
        {
            Id = a.Id,
            EmployeeId = employeeId,
            FirstName = a.Employee.FirstName,
            LastName = a.Employee.LastName,
            PhoneNumber = a.Employee.PhoneNumber,
            Age = a.Employee.Age,
            NationalId = a.Employee.NationalId,
            ElectronicSignature = a.Employee.ElectronicSignature,
            CheckInTime = a.CheckInTime

        }).ToList();
    }

    public async Task<int> GetWorkingHoursPerWeekByEmployee(string userId)
    {
        var today = DateTime.Now;
        var lastWeek = today.AddDays(-_settings.HistoryDays);

        var attendances = await _attendanceRepo.GetByEmployeeInRangeAsync(userId, lastWeek, today);

        return attendances.Count * _settings.DailyHours;
    }

    public async Task<WeeklyAttendanceSummaryDto> GetWeeklySummaryAsync(string userId, DateTime weekStart)
    {
        var weekEnd = weekStart.AddDays(_settings.HistoryDays);

        var attendances = await _attendanceRepo.GetByEmployeeInRangeAsync(userId, weekStart, weekEnd);

        return new WeeklyAttendanceSummaryDto
        {
            WeekStart = weekStart,
            WeekEnd = weekEnd,
            DaysAttended = attendances.Count,
            TotalHours = attendances.Count * _settings.DailyHours
        };
    }

    public async Task<IEnumerable<WeeklyAttendanceSummaryDto>> GetWeeklySummaryAllEmployesAsync(DateTime weekStart)
    {
        var weekEnd = weekStart.AddDays(_settings.HistoryDays);

        var attendances = await _attendanceRepo.GetAllInRangeAsync(weekStart, weekEnd);

        return attendances.Select(a => new WeeklyAttendanceSummaryDto
        {
            WeekStart = weekStart,
            WeekEnd = weekEnd,
            DaysAttended = attendances.Count,
            TotalHours = attendances.Count * _settings.DailyHours
        }).ToList();
    }
}
