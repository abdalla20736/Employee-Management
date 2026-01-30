using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Employee_Management.Entites;

public class Attendance
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string EmployeeId { get; set; } = null!; 

    [ForeignKey(nameof(EmployeeId))]
    public AppUser Employee { get; set; } = null!;

    [Required]
    public DateTime CheckInTime { get; set; }

}