using Employee_Management.Entites;

namespace Employee_Management.Repositories.AttendanceRepo;

public interface IAttendanceRepository
{
    Task AddAsync(Attendance attendance);
    Task<bool> HasCheckedInTodayAsync(string employeeId);
    Task<List<Attendance>> GetByEmployeeAsync(string employeeId);
    Task<List<Attendance>> GetAllAsync();
    Task<List<Attendance>> GetByDateAsync(DateTime date);
    Task<List<Attendance>> GetByEmployeeInRangeAsync(string employeeId, DateTime start, DateTime end);
    Task<List<Attendance>> GetAllInRangeAsync(DateTime start, DateTime end);
    Task SaveChangesAsync();
}