using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MinyanBoard.Api.Data;
using MinyanBoard.Api.Dtos;
using MinyanBoard.Api.Models;
using MinyanBoard.Api.Services;

namespace MinyanBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]   // => api/auth
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    // הרשמה פתוחה רק לגבאים. המנהל נוצר ב-Seed.
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (await db.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict("האימייל כבר רשום במערכת");
        if (!await db.Synagogues.AnyAsync(s => s.Id == dto.SynagogueId))
            return BadRequest("בית הכנסת לא נמצא");

        var user = new User { FullName = dto.FullName, Email = dto.Email, Role = Role.Gabbai, SynagogueId = dto.SynagogueId };
        PasswordHelper.SetPassword(user, dto.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return ToResponse(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
        if (user is null || !PasswordHelper.Verify(user, dto.Password))
            return Unauthorized("אימייל או סיסמה שגויים");

        return ToResponse(user);
    }

    private AuthResponseDto ToResponse(User u) => new(tokens.Create(u), u.FullName, u.Role, u.SynagogueId);
}
