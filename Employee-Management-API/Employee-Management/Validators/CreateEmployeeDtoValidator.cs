using Employee_Management.Entites;
using Employee_Management.Models;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace Employee_Management.Validators;

public sealed class CreateEmployeeDtoValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeDtoValidator(UserManager<AppUser> userManager)
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .MinimumLength(4)
            .MustAsync(async (userName, ct) =>
            {
                var user = await userManager.FindByNameAsync(userName!);
                return user == null;
            })
            .WithMessage("Username already exists");
    }
}