namespace Employee_Management.Models;

public sealed class AttendanceSettings
{
    public TimeSpan CheckInStart { get; set; }
    public TimeSpan CheckInEnd { get; set; }
    public int HistoryDays { get; set; }
    public int DailyHours { get; set; }
}