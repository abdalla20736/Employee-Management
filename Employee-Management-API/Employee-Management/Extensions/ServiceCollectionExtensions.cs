using Employee_Management.Data;
using Employee_Management.Entites;
using Employee_Management.Repositories.AttendanceRepo;
using Employee_Management.Repositories.EmployeeRepo;
using Employee_Management.Repositories.EmployeeRepo;
using Employee_Management.Services.AttendanceService;
using Employee_Management.Services.Auth;
using Employee_Management.Services.EmployeeService;
using Employee_Management.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;



namespace Employee_Management.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("EmployeeManagementDb");
        services.AddDbContext<EmployeeManagementDbContext>(options
            => options.UseSqlServer(connectionString));

        AddIdentity(services);
        RegisterJWTAuthentication(services, configuration);
        return services;
    }

    private static void AddIdentity(IServiceCollection services)
    {
        services.AddIdentity<AppUser, IdentityRole>(options =>
        {
            options.Password.RequireNonAlphanumeric = false;
            options.User.RequireUniqueEmail = false;
        })
        .AddEntityFrameworkStores<EmployeeManagementDbContext>()
        .AddDefaultTokenProviders();
    }


    private static void RegisterJWTAuthentication(IServiceCollection services, IConfiguration configuration)
    {
        var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]);
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };
        });

    }
    public static void RegisterServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
    }

    public static void RegisterRepositories(this IServiceCollection services)
    {
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IAttendanceRepository, AttendanceRepository>();


    }

    public static void AddValidators(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<UpdateEmployeeDtoValidator>();
        services.AddValidatorsFromAssemblyContaining<CreateEmployeeDtoValidator>();
    }

}
