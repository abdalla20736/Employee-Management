using Employee_Management.Entites;
using Employee_Management.Models.Common;
using Employee_Management.Services.AttendanceService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Employee_Management.Controllers.Management;

[Route("api/[controller]")]
[ApiController]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;


    public AttendanceController(IAttendanceService attendanceService, UserManager<AppUser> userManager)
    {
        _attendanceService = attendanceService;
    }

    [HttpPost("check-in")]
    [Authorize(Roles = AppRoles.Employee)]
    public async Task<IActionResult> CheckIn()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return NotFound("UserId Not Found");

        var result = await _attendanceService.CheckInAsync(userId);
        if (!result.Success) return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    [HttpGet("history")]
    [Authorize(Roles = AppRoles.Employee)]
    public async Task<IActionResult> GetHistory()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return NotFound("UserId Not Found");

        var history = await _attendanceService.GetLastWeekAttendanceHistoryAsync(userId!);
        return Ok(history);
    }

    [HttpGet("daily")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetDailyAttendance(DateTime? date)
    {
        var targetDate = date ?? DateTime.Now;
        var list = await _attendanceService.GetDailyAttendanceAsync(targetDate);
        return Ok(list);
    }

    [HttpGet("attendanceperweek/{id}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetWorkingHoursPerWeekByEmployee(string id)
    {

        var userRole = User.FindFirstValue(ClaimTypes.Role);

        var summary = await _attendanceService.GetWorkingHoursPerWeekByEmployee(id);

        if (summary == null)
             return NotFound("No attendance data found for this week.");

          return Ok(summary);
    }


    [HttpGet("weekly")]
    [Authorize]
    public async Task<IActionResult> GetWeeklySummary([FromQuery] DateTime weekStart)
    {
        string id = null;
        var userRole = User.FindFirstValue(ClaimTypes.Role);


        if (userRole != AppRoles.Admin)
        {
            id = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(id))
                return Unauthorized("User not found");

            var summary = await _attendanceService.GetWeeklySummaryAsync(id, weekStart);

            if (summary == null)
                return NotFound("No attendance data found for this week.");

            return Ok(summary);
        }
        else {

            var summary = await _attendanceService.GetWeeklySummaryAllEmployesAsync(weekStart);

            if (summary == null)
                return NotFound("No attendance data found for this week.");

            return Ok(summary);

        }

    }
}
