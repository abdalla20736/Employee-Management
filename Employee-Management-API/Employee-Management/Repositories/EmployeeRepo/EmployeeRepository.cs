using Employee_Management.Data;
using Employee_Management.Entites;
using Employee_Management.Models;
using Employee_Management.Models.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Employee_Management.Repositories.EmployeeRepo;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly EmployeeManagementDbContext _context;
    private readonly UserManager<AppUser> _userManager;

    public EmployeeRepository(UserManager<AppUser> userManager, EmployeeManagementDbContext dbContext)
    {
        _userManager = userManager;
        _context = dbContext;
    }

    public async Task<bool> AddAsync(EmployeeDto dto)
    {
        if (string.IsNullOrEmpty(dto.Password)) return false;


        var existingUser = await _userManager.FindByNameAsync(dto.UserName);
        if (existingUser != null) return false;

        var employee = new AppUser
        {
            UserName = dto.UserName,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            NationalId = dto.NationalId,
            Role = AppRoles.Employee,
            Age = dto.Age,
            ElectronicSignature = dto.ElectronicSignature
        };

        var result = await _userManager.CreateAsync(employee, dto.Password);
        if (!result.Succeeded) return false;

        return true; ;
    }

    public async Task<(IEnumerable<AppUser> , int)> GetAllAsync(string search = null, string sortBy = null, bool ascending = true, int page = 1, int pageSize = 10)
    {

        IQueryable<AppUser> query = _context.Users.Where(u => u.Role == AppRoles.Employee);

        
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e =>
                e.FirstName.Contains(search) ||
                e.LastName.Contains(search) ||
                e.NationalId.Contains(search) ||
                e.PhoneNumber.Contains(search) ||
                e.UserName.Contains(search));
        }

        var totalCount = await query.CountAsync(); 

        query = sortBy?.ToLower() switch
        {
            "username" => ascending ? query.OrderBy(e => e.UserName) : query.OrderByDescending(e => e.UserName),
            "firstname" => ascending ? query.OrderBy(e => e.FirstName) : query.OrderByDescending(e => e.FirstName),
            "lastname" => ascending ? query.OrderBy(e => e.LastName) : query.OrderByDescending(e => e.LastName),
            "age" => ascending ? query.OrderBy(e => e.Age) : query.OrderByDescending(e => e.Age),
            _ => query.OrderBy(e => e.FirstName)
        };
   
        query = query.Skip((page - 1) * pageSize).Take(pageSize);

        return (await query.ToListAsync(), totalCount);
    }

    public async Task<AppUser> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        return user.Role != AppRoles.Admin ? user : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> UpdateAsync(string id, UpdateEmployeeDto dto)
    {
        var existing = await _userManager.FindByIdAsync(id);
        if (existing == null) return false;

        if (!string.IsNullOrEmpty(dto.UserName))
            existing.UserName = dto.UserName;
        if (!string.IsNullOrWhiteSpace(dto.FirstName))
            existing.FirstName = dto.FirstName;

        if (!string.IsNullOrWhiteSpace(dto.LastName))
            existing.LastName = dto.LastName;

        if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            existing.PhoneNumber = dto.PhoneNumber;

        if (!string.IsNullOrWhiteSpace(dto.NationalId))
            existing.NationalId = dto.NationalId;

        if (dto.Age != null || (dto.Age > 18 && dto.Age < 120))
            existing.Age = dto.Age;

        if (dto.ElectronicSignature != null)
            existing.ElectronicSignature = dto.ElectronicSignature;

  
        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(existing);
            var passwordResult = await _userManager.ResetPasswordAsync(
                existing, token, dto.Password);

            if (!passwordResult.Succeeded)
                return false;
        }

        var result = await _userManager.UpdateAsync(existing);
        if (!result.Succeeded) return false;

        return true;
    }

   
    public async Task<bool> UpdateSignatureAsync(string userId, string signaturePath)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        user.ElectronicSignature = signaturePath;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }
}