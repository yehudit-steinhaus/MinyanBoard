using MinyanBoard.Api.Models;
using MinyanBoard.Api.Services;

namespace MinyanBoard.Api.Data;

// Seed = נתונים התחלתיים, כדי שיהיה מנהל אחד ובתי כנסת לדוגמה כבר בהרצה הראשונה
public static class DbSeeder
{
    public static void Seed(AppDbContext db, IConfiguration config)
    {
        if (!db.Users.Any(u => u.Role == Role.Admin))
        {
            var admin = config.GetSection("Admin");
            var user = new User { FullName = admin["FullName"]!, Email = admin["Email"]!, Role = Role.Admin };
            PasswordHelper.SetPassword(user, admin["Password"]!);
            db.Users.Add(user);
        }

        if (!db.Synagogues.Any())
        {
            db.Synagogues.AddRange(
                new Synagogue { Name = "בית הכנסת הגדול", Address = "רחוב הרב קוק 12", Neighborhood = "מרכז" },
                new Synagogue { Name = "אהל יעקב", Address = "רחוב חזון איש 5", Neighborhood = "צפון" },
                new Synagogue { Name = "תפארת ישראל", Address = "רחוב רבי עקיבא 40", Neighborhood = "דרום" });
        }

        db.SaveChanges();
    }
}
