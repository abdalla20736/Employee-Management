using Employee_Management.Entites;
using Employee_Management.Extensions;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.



builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.RegisterRepositories();
builder.Services.RegisterServices();

builder.Services.AddAuthorization();
builder.Services.AddControllers();

builder.Services.AddOpenApi();

// Security !!!!
// it's critical to keep [AllowAnyOrigin] Only For TESTING !!!!

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .AllowAnyOrigin() // use WithOrigin(APIURL)
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
