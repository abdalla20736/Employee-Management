using Employee_Management.Models;

namespace Employee_Management.Services.Auth;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
}

