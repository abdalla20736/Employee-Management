namespace Employee_Management.Services.AttendanceService;

using Employee_Management.Data;
using Employee_Management.Entites;
using Employee_Management.Models;
using Employee_Management.Repositories.AttendanceRepo;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _attendanceRepo;


    public AttendanceService(
        IAttendanceRepository attendanceRepo)
    {
        _attendanceRepo = attendanceRepo;

    }

    public async Task<(bool Success, string Message)> CheckInAsync(string employeeId)
    {
       
        var now = DateTime.Now;

        var start = new TimeSpan(7, 30, 0);
        var end = new TimeSpan(9, 0, 0);

        if (now.TimeOfDay < start || now.TimeOfDay > end)
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
        var attendances = await _attendanceRepo.GetByEmployeeAsync(employeeId);

        var now = DateTime.Now;
        var lastWeek = now.AddDays(-7);
        return attendances.Where(a => a.CheckInTime >= lastWeek).Select(a => new AttendanceDto
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
        var lastWeek = today.AddDays(-7);

        var attendances = (await _attendanceRepo.GetByEmployeeAsync(userId))
            .Where(a => a.CheckInTime >= lastWeek)
            .ToList();

        return attendances.Count * 8;
    }

    public async Task<WeeklyAttendanceSummaryDto> GetWeeklySummaryAsync(string userId, DateTime weekStart)
    {
        var weekEnd = weekStart.AddDays(7);

        var attendances = (await _attendanceRepo.GetByEmployeeAsync(userId))
            .Where(a => a.CheckInTime >= weekStart && a.CheckInTime < weekEnd)
            .ToList();

        return new WeeklyAttendanceSummaryDto
        {
            WeekStart = weekStart,
            WeekEnd = weekEnd,
            DaysAttended = attendances.Count,
            TotalHours = attendances.Count * 8.0
        };
    }

    public async Task<IEnumerable<WeeklyAttendanceSummaryDto>> GetWeeklySummaryAllEmployesAsync(DateTime weekStart)
    {
        var weekEnd = weekStart.AddDays(7);

        var attendances = (await _attendanceRepo.GetAllAsync())
            .Where(a => a.CheckInTime >= weekStart && a.CheckInTime < weekEnd)
            .ToList();

        return attendances.Select( a => new WeeklyAttendanceSummaryDto
        {
            WeekStart = weekStart,
            WeekEnd = weekEnd,
            DaysAttended = attendances.Count,
            TotalHours = attendances.Count * 8.0
        }).ToList() ;

    }

}
