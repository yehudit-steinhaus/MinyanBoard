using Microsoft.AspNetCore.Identity;
using MinyanBoard.Api.Models;

namespace MinyanBoard.Api.Services;

// Hashing = הפיכת הסיסמה למחרוזת שאי אפשר לשחזר ממנה את המקור.
// בכניסה מחשבים שוב ומשווים.
public static class PasswordHelper
{
    private static readonly PasswordHasher<User> Hasher = new();

    public static void SetPassword(User user, string password) =>
        user.PasswordHash = Hasher.HashPassword(user, password);

    public static bool Verify(User user, string password) =>
        Hasher.VerifyHashedPassword(user, user.PasswordHash, password) != PasswordVerificationResult.Failed;
}
