
using System.ComponentModel.DataAnnotations;
using Employee_Management.Entites;
using Microsoft.AspNetCore.Identity;

namespace Employee_Management.Validators
{
    public class UniqueUsernameAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var userManager = (UserManager<AppUser>)validationContext.GetService(typeof(UserManager<AppUser>));
            var username = value as string;

            if (string.IsNullOrEmpty(username))
                return ValidationResult.Success;

            var existingUser = userManager.FindByNameAsync(username).Result;
            if (existingUser != null)
                return new ValidationResult("Username already exists");

            return ValidationResult.Success;
        }
    }
}