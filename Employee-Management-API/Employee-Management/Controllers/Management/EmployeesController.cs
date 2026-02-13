using Employee_Management.Common;
using Employee_Management.Entites;
using Employee_Management.Models;
using Employee_Management.Services.EmployeeService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Employee_Management.Controllers.Management;


[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly IWebHostEnvironment _env;

    public EmployeesController(IEmployeeService service, IWebHostEnvironment env)
    {
        _employeeService = service;
        _env = env;
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Add([FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (string.IsNullOrEmpty(dto.Password)) return BadRequest("Password is required");

        var EmployeeId = await _employeeService.AddEmployeeAsync(dto);
        if (EmployeeId == null) return BadRequest("Add failed");

        return Ok(new { Id = EmployeeId });

    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetAll([FromQuery] string search = null,
                                            [FromQuery] string sortBy = null,
                                            [FromQuery] bool ascending = true,
                                            [FromQuery] int page = 1,
                                            [FromQuery] int pageSize = 10)
    {
        var employees = await _employeeService.GetAllEmployeesAsync(search, sortBy, ascending, page, pageSize);
   
        return Ok(employees);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetById(string id)
    {
        var employee = await _employeeService.GetEmployeeByIdAsync(id);
        if (employee == null) return NotFound();
        return Ok(employee);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateEmployeeDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (id == null) return BadRequest("Id not found");

        var updated = await _employeeService.UpdateEmployeeAsync(id, dto);
        if (!updated) return BadRequest("Update failed");

        var employee = await _employeeService.GetEmployeeByIdAsync(id);
        return Ok(employee);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _employeeService.DeleteEmployeeAsync(id);
        if (!deleted) return BadRequest("Delete failed");

        return Ok(new { message = "Deleted successfully" });
    }

    [HttpGet("signature")]
    [Authorize]
    public async Task<IActionResult> GetSignature()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var electronicSignture = await _employeeService.GetElectronicSigntureById(userId);

        return Ok(new { electronicSignture });
    }

    [HttpPost("{id}/signature")]
    [Consumes("multipart/form-data")]
    [Authorize]
    public async Task<IActionResult> UploadSignature(string id, [FromForm] IFormFile file)
    {


        if (file == null)
            return BadRequest("File is required");

        var userRole = User.FindFirstValue(ClaimTypes.Role);

        if(userRole != AppRoles.Admin) {
            id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        }


        var dto = new SignatureUploadDto
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
            Content = file.OpenReadStream()
        };

        var result = await _employeeService.AddOrUpdateSignatureAsync(id, dto, _env);
        return result.Success ? Ok(result.Message) : BadRequest(result.Message);
    }

  

}