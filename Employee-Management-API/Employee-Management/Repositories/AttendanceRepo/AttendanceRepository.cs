using Employee_Management.Data;
using Employee_Management.Entites;
using Employee_Management.Models.Common;
using Microsoft.EntityFrameworkCore;

namespace Employee_Management.Repositories.AttendanceRepo;

public class AttendanceRepository : IAttendanceRepository
{
    private readonly EmployeeManagementDbContext _context;

    public AttendanceRepository(EmployeeManagementDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Attendance attendance)
    {
        await _context.Attendances.AddAsync(attendance);
    }

    public async Task<bool> HasCheckedInTodayAsync(string employeeId)
    {
        return await _context.Attendances.AnyAsync(a =>
            a.EmployeeId == employeeId &&
            a.CheckInTime.Date == DateTime.Today);
    }

    public async Task<List<Attendance>> GetByEmployeeAsync(string employeeId)
    {
        return await _context.Attendances
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == employeeId)
            .OrderByDescending(a => a.CheckInTime)
            .ToListAsync();
    }

    public async Task<List<Attendance>> GetAllAsync()
    {
        return await _context.Attendances
            .Include(a => a.Employee)
            .OrderByDescending(a => a.CheckInTime)
            .ToListAsync();
    }

    public async Task<List<Attendance>> GetByDateAsync(DateTime date)
    {
        return await _context.Attendances
            .Include(a => a.Employee)
            .Where(a => a.CheckInTime.Date == date.Date)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}