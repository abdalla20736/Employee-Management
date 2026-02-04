namespace Employee_Management.Services.Auth;

using Employee_Management.Entites;
using Employee_Management.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _config;

    public AuthService(UserManager<AppUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByNameAsync(dto.UserName);
        if (user == null) return new LoginResponseDto { };
        if (!await _userManager.CheckPasswordAsync(user, dto.Password)) return new LoginResponseDto { };

        return new LoginResponseDto
        {
            Id  = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            NationalId = user.NationalId,
            PhoneNumber = user.PhoneNumber,
            Age = user.Age,
            Role = user.Role,
            ElectronicSignature = user.ElectronicSignature,
            Token = await GenerateJwtToken(user)
        }; 
    }

    private Task<string> GenerateJwtToken(AppUser user)
    {
        var claims = new[]
        {
            new Claim (ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(double.Parse(_config["Jwt:DurationInMinutes"])),
            signingCredentials: creds
        );

        return Task.FromResult(new JwtSecurityTokenHandler().WriteToken(token));
    }
}
