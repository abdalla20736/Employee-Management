namespace Employee_Management.Models;

public class GetEmployeeDto
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string NationalId { get; set; } = null!;
    public string? ElectronicSignature { get; set; }
    public int Age { get; set; }
}
