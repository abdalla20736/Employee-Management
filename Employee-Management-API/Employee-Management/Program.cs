using Employee_Management.Entites;
using Employee_Management.Extensions;
using Employee_Management.Models;
using Microsoft.AspNetCore.Identity;
using FluentValidation;
using Employee_Management.Validators;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.RegisterRepositories();
builder.Services.RegisterServices();


builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddValidators();


builder.Services.AddOpenApi();

builder.Services.Configure<AttendanceSettings>(
    builder.Configuration.GetRequiredSection("Attendance"));
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

// CORS (restricted)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});
//-----------------------------------------------------------------

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseStaticFiles();
app.UseCors("AllowAngular");
//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
