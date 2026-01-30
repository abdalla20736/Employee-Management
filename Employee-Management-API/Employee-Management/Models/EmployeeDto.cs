using Employee_Management.Validators;
using System.ComponentModel.DataAnnotations;

namespace Employee_Management.Models;

public class EmployeeDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required(ErrorMessage = "Username is required")]
    [MinLength(4, ErrorMessage = "Username must be at least 4 characters")]
    [UniqueUsername]
    public string? UserName { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z]).{8,}$",
    ErrorMessage = "Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter.")]
    public string? Password { get; set; }

    [Required(ErrorMessage = "First name is required")]
    public string? FirstName { get; set; }

    [Required(ErrorMessage = "Last name is required")]
    public string? LastName { get; set; }

    [Required(ErrorMessage = "Phone number is required")]
    [Phone]
    public string PhoneNumber { get; set; }

    [Required(ErrorMessage = "National ID is required")]
    [RegularExpression(@"^\d{14}$", ErrorMessage = "National ID must be 14 digits")]
    public string NationalId { get; set; }

    [Range(18, 120)]
    public int Age { get; set; }

    [MaxLength(500, ErrorMessage = "Electronic Signature cannot exceed 500 characters")]
    public string? ElectronicSignature { get; set; }
}