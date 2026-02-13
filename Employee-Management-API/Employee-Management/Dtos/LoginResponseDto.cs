namespace Employee_Management.Models;

public class LoginResponseDto
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string NationalId { get; set; }
    public int Age { get; set; }
    public string PhoneNumber { get; set; }
    public string? ElectronicSignature { get; set; }
    public string Role { get; set; }
    public string Token { get; set; }
}
