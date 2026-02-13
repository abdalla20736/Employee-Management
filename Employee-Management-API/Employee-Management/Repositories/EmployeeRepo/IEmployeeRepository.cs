using Employee_Management.Entites;
using Employee_Management.Models;


namespace Employee_Management.Repositories.EmployeeRepo;

public interface IEmployeeRepository
{
    Task<bool> AddAsync(CreateEmployeeDto dto);
    Task<(IEnumerable<AppUser>, int)> GetAllAsync(string search = null, string sortBy = null, bool ascending = true, int page = 1, int pageSize = 10);
    Task<AppUser> GetByIdAsync(string id);
    Task<bool> DeleteAsync(string id);
    Task<bool> UpdateAsync(string id, UpdateEmployeeDto dto);

    Task<bool> UpdateSignatureAsync(string userId, string signaturePath);
}

