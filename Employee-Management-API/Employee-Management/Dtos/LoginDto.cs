using System.ComponentModel.DataAnnotations;

namespace Employee_Management.Models;

public class LoginDto
{
    [Required(ErrorMessage = "Username is required")]
    [MinLength(4, ErrorMessage = "Username must be at least 4 characters")]
    public string UserName { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z]).{8,}$",
    ErrorMessage = "Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter.")]
    public string Password { get; set; }
}
