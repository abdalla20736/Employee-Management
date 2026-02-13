using Employee_Management.Entites;
using Employee_Management.Models;


namespace Employee_Management.Services.EmployeeService;


public interface IEmployeeService
{
    Task<string> AddEmployeeAsync(CreateEmployeeDto dto);
    Task<PaginatedResponseDto<GetEmployeeDto>> GetAllEmployeesAsync(string search = null, string sortBy = null, bool ascending = true, int page = 1, int pageSize = 10);
    Task<GetEmployeeDto> GetEmployeeByIdAsync(string id);
    Task<string?> GetElectronicSigntureById(string id);
    Task<bool> DeleteEmployeeAsync(string id);
    Task<bool> UpdateEmployeeAsync(string id, UpdateEmployeeDto dto);
    Task<(bool Success, string Message)> AddOrUpdateSignatureAsync(string userId, SignatureUploadDto signature, IWebHostEnvironment env);
}
