using Employee_Management.Entites;
using Employee_Management.Models;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace Employee_Management.Validators;

public sealed class UpdateEmployeeDtoValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeDtoValidator(UserManager<AppUser> userManager)
    {
        RuleFor(x => x.UserName)
            .MinimumLength(4)
            .When(x => !string.IsNullOrWhiteSpace(x.UserName))
            .MustAsync(async (userName, ct) =>
            {
                var user = await userManager.FindByNameAsync(userName!);
                return user == null;
            })
            .WithMessage("Username already exists");
    }
}