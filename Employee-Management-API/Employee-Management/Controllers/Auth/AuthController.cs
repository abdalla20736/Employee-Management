using Employee_Management.Models;
using Employee_Management.Services.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Employee_Management.Controllers.Auth;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(EmployeeDto dto)
    {
        var token = await _authService.RegisterAsync(dto);
        if (token == null) return BadRequest("User registration failed");
        return Ok(new { token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        if (response.Token == null) return Unauthorized();
        return Ok(response);
    }

}
