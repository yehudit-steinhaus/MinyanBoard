using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MinyanBoard.Api.Models;

namespace MinyanBoard.Api.Services;

// JWT = "תעודה" חתומה שהשרת נותן אחרי כניסה. הלקוח שולח אותה בכל בקשה,
// והשרת יודע ממנה מי המשתמש ומה התפקיד שלו, בלי לפנות למסד הנתונים.
public class TokenService(IConfiguration config)
{
    public string Create(User user)
    {
        var jwt = config.GetSection("Jwt");

        // Claims = הפרטים שנכתבים בתוך התעודה
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString())
        };
        if (user.SynagogueId is int synagogueId)
            claims.Add(new(ClaimsExtensions.SynagogueIdClaim, synagogueId.ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
