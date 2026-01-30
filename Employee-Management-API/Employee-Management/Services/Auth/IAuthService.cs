using Employee_Management.Models;

namespace Employee_Management.Services.Auth;

public interface IAuthService
{
    Task<string> RegisterAsync(EmployeeDto dto);
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
}

