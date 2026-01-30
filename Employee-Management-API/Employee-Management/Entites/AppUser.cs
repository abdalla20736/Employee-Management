
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Employee_Management.Entites;

public class AppUser : IdentityUser
{
    public string Role { get; set; } = "Employee";

    [Required(ErrorMessage = "First Name is required")]
    [MaxLength(50, ErrorMessage = "First Name cannot exceed 50 characters")]
    public string FirstName { get; set; }

    [Required(ErrorMessage = "Last Name is required")]
    [MaxLength(50, ErrorMessage = "Last Name cannot exceed 50 characters")]
    public string LastName { get; set; }

    [Required(ErrorMessage = "National ID is required")]
    [StringLength(14, MinimumLength = 14, ErrorMessage = "National ID must be exactly 14 characters")]
    public string NationalId { get; set; }

    [Required(ErrorMessage = "Age is required")]
    [Range(18, 120, ErrorMessage = "Age must be between 18 and 120")]
    public int Age { get; set; }

    [Phone(ErrorMessage = "Invalid phone number")]
    public override string PhoneNumber { get; set; }

    public string? ElectronicSignature { get; set; }
}
