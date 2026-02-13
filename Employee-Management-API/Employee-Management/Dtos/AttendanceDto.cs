using System.ComponentModel.DataAnnotations;

namespace Employee_Management.Models;

public class AttendanceDto
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = null!;
    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string NationalId { get; set; } = null!;

    public int Age { get; set; }

    public string? ElectronicSignature { get; set; }
    public DateTime CheckInTime { get; set; }
}
