using Employee_Management.Entites;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Employee_Management.Data;

public class EmployeeManagementDbContext(DbContextOptions<EmployeeManagementDbContext> options) : IdentityDbContext<AppUser>(options)
{


    public DbSet<Attendance> Attendances { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Ignore<IdentityRole>();
        modelBuilder.Ignore<IdentityUserRole<string>>();
        modelBuilder.Ignore<IdentityUserClaim<string>>();
        modelBuilder.Ignore<IdentityUserLogin<string>>();
        modelBuilder.Ignore<IdentityUserToken<string>>();
        modelBuilder.Ignore<IdentityRoleClaim<string>>();
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.Ignore(e => e.Email);
            entity.Ignore(e => e.EmailConfirmed);
            entity.Ignore(e => e.PhoneNumberConfirmed);
            entity.Ignore(e => e.TwoFactorEnabled);
            entity.Ignore(e => e.LockoutEnabled);
            entity.Ignore(e => e.LockoutEnd);
            entity.Ignore(e => e.AccessFailedCount);
            entity.Ignore(e => e.NormalizedEmail);
        });

        modelBuilder.Entity<AppUser>()
            .Property(u => u.Role)
            .HasDefaultValue("Employee");

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable(name: "Users");
        });

    }
}
