namespace Employee_Management.Models;

public class WeeklyAttendanceSummaryDto
{
    public DateTime WeekStart { get; set; }
    public DateTime WeekEnd { get; set; }
    public int DaysAttended { get; set; }
    public double TotalHours { get; set; }
}
