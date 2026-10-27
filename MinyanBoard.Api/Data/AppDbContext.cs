using Microsoft.EntityFrameworkCore;
using MinyanBoard.Api.Models;

namespace MinyanBoard.Api.Data;

// DbContext = הגשר בין קוד C# לבין מסד הנתונים. כל DbSet הוא טבלה.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Synagogue> Synagogues => Set<Synagogue>();
    public DbSet<Minyan> Minyanim => Set<Minyan>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // בענן (PostgreSQL) הטבלאות נמצאות בתיקייה (schema) נפרדת בשם minyanboard,
        // כדי שלא יתנגשו עם טבלאות של פרויקט אחר באותו מסד נתונים
        if (Database.IsNpgsql()) b.HasDefaultSchema("minyanboard");

        b.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(200);
            e.Property(u => u.FullName).HasMaxLength(100);
            // מחיקת בית כנסת לא מוחקת את הגבאי, רק מנתקת אותו
            e.HasOne(u => u.Synagogue).WithMany().OnDelete(DeleteBehavior.SetNull);
        });

        b.Entity<Synagogue>(e =>
        {
            e.Property(s => s.Name).HasMaxLength(100);
            e.Property(s => s.Address).HasMaxLength(200);
            e.Property(s => s.Neighborhood).HasMaxLength(100);
        });

        b.Entity<Minyan>().Property(m => m.Notes).HasMaxLength(300);
    }
}
