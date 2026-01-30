using Employee_Management.Entites;
using Employee_Management.Models;
using Employee_Management.Models.Common;
using Employee_Management.Repositories.EmployeeRepo;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Employee_Management.Services.EmployeeService;


public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepo;


    public EmployeeService(IEmployeeRepository repo)
    {
        _employeeRepo = repo;
    
    }

    public async Task<string> AddEmployeeAsync(EmployeeDto dto)
    {
        var employee = await _employeeRepo.AddAsync(dto);
        if (employee)
        {
            return dto.Id;
        }
        return null;
    }

    public async Task<PaginatedResponse<GetEmployeeDto>> GetAllEmployeesAsync(string search = null, string sortBy = null, bool ascending = true, int page = 1, int pageSize = 10)
    {
        var (employeesQuery, totalCount) = await _employeeRepo.GetAllAsync(search, sortBy, ascending, page, pageSize);




        var pagedEmployees = employeesQuery
       .Select(e => new GetEmployeeDto
       {
           Id = e.Id,
           UserName = e.UserName!,
           FirstName = e.FirstName,
           LastName = e.LastName,
           PhoneNumber = e.PhoneNumber!,
           NationalId = e.NationalId,
           ElectronicSignature = e.ElectronicSignature,
           Age = e.Age
       })
       .ToList();

   

        return new PaginatedResponse<GetEmployeeDto>
        {
            Total = totalCount,
            IsNextPage = totalCount > page * pageSize,
            Page = page,
            Data = pagedEmployees,
            
        };

        
    }

    public async Task<GetEmployeeDto> GetEmployeeByIdAsync(string id)
    {
        var employee = await _employeeRepo.GetByIdAsync(id);
        return new GetEmployeeDto
        {
            Id = employee.Id,
            UserName = employee.UserName!,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            PhoneNumber = employee.PhoneNumber!,
            NationalId = employee.NationalId,
            ElectronicSignature = employee.ElectronicSignature,
            Age = employee.Age
        };
    }

    public async Task<bool> DeleteEmployeeAsync(string id)
    {
        return await _employeeRepo.DeleteAsync(id);
    }

    public async Task<bool> UpdateEmployeeAsync(string id, UpdateEmployeeDto dto)
    {
        return await _employeeRepo.UpdateAsync(id, dto);
    }

    public async Task<string?> GetElectronicSigntureById(string id)
    {
        var employee = await _employeeRepo.GetByIdAsync(id);

        return employee.ElectronicSignature;
    }

    public async Task<(bool Success, string Message)> AddOrUpdateSignatureAsync(
    string userId,
    SignatureUploadDto signature, IWebHostEnvironment env)
    {
        if (signature == null || signature.Length == 0)
            return (false, "Signature file is required");

        var allowedTypes = new[] { "image/png", "image/jpeg" };
        if (!allowedTypes.Contains(signature.ContentType))
            return (false, "Signature must be PNG or JPEG");

        const long maxSize = 2 * 1024 * 1024;
        if (signature.Length > maxSize)
            return (false, "Signature image must be less than 2MB");

        var folder = Path.Combine(env.WebRootPath, "signatures");
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(signature.FileName)}";
        var filePath = Path.Combine(folder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await signature.Content.CopyToAsync(stream);
        }

        var relativePath = $"signatures/{fileName}";

        var updated = await _employeeRepo.UpdateSignatureAsync(userId, relativePath);
        if (!updated)
            return (false, "User not found or failed to update signature");

        return (true, "Signature uploaded successfully");
    }

}