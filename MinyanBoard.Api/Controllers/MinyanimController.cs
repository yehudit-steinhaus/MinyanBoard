using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MinyanBoard.Api.Data;
using MinyanBoard.Api.Dtos;
using MinyanBoard.Api.Models;
using MinyanBoard.Api.Services;

namespace MinyanBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]   // => api/minyanim
public class MinyanimController(AppDbContext db) : ControllerBase
{
    private const string Gabbai = nameof(Role.Gabbai);
    private const string Admin = nameof(Role.Admin);

    // ===== לוח ציבורי: רק מניינים מאושרים, עם סינון אופציונלי =====
    // GET api/minyanim?prayer=Mincha&days=Weekdays&synagogueId=2
    [HttpGet]
    public Task<List<MinyanDto>> GetBoard(Prayer? prayer, DayType? days, int? synagogueId)
    {
        var query = db.Minyanim.Where(m => m.Status == MinyanStatus.Approved);
        if (prayer is not null) query = query.Where(m => m.Prayer == prayer);
        if (days is not null) query = query.Where(m => m.Days == days);
        if (synagogueId is not null) query = query.Where(m => m.SynagogueId == synagogueId);
        return ToDtos(query);
    }

    // ===== גבאי: כל המניינים של בית הכנסת שלו, בכל סטטוס =====
    [HttpGet("mine"), Authorize(Roles = Gabbai)]
    public Task<List<MinyanDto>> GetMine()
    {
        var synagogueId = User.GetSynagogueId();
        return ToDtos(db.Minyanim.Where(m => m.SynagogueId == synagogueId));
    }

    [HttpPost, Authorize(Roles = Gabbai)]
    public async Task<ActionResult<MinyanDto>> Create(SaveMinyanDto dto)
    {
        if (User.GetSynagogueId() is not int synagogueId)
            return BadRequest("הגבאי אינו משויך לבית כנסת");

        var minyan = new Minyan { SynagogueId = synagogueId };
        Apply(minyan, dto);
        db.Minyanim.Add(minyan);
        await db.SaveChangesAsync();
        return await FindDto(minyan.Id);
    }

    // גבאי מעדכן רק מניין של בית הכנסת שלו
    [HttpPut("{id}"), Authorize(Roles = Gabbai)]
    public async Task<ActionResult<MinyanDto>> Update(int id, SaveMinyanDto dto)
    {
        var synagogueId = User.GetSynagogueId();
        var minyan = await db.Minyanim.SingleOrDefaultAsync(m => m.Id == id && m.SynagogueId == synagogueId);
        if (minyan is null) return NotFound();

        Apply(minyan, dto);
        await db.SaveChangesAsync();
        return await FindDto(id);
    }

    // גבאי מוחק מניין שלו; מנהל יכול למחוק כל מניין
    [HttpDelete("{id}"), Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var minyan = await db.Minyanim.FindAsync(id);
        if (minyan is null) return NotFound();
        if (!User.IsInRole(Admin) && minyan.SynagogueId != User.GetSynagogueId()) return Forbid();

        db.Minyanim.Remove(minyan);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ===== מנהל: אישור ודחייה =====
    [HttpGet("pending"), Authorize(Roles = Admin)]
    public Task<List<MinyanDto>> GetPending() =>
        ToDtos(db.Minyanim.Where(m => m.Status == MinyanStatus.Pending));

    [HttpPatch("{id}/status"), Authorize(Roles = Admin)]
    public async Task<ActionResult<MinyanDto>> UpdateStatus(int id, UpdateStatusDto dto)
    {
        var minyan = await db.Minyanim.FindAsync(id);
        if (minyan is null) return NotFound();

        minyan.Status = dto.Status;
        await db.SaveChangesAsync();
        return await FindDto(id);
    }

    // ===== עזרים משותפים, כדי לא לחזור על אותו קוד =====

    // כל יצירה או עדכון של גבאי מחזירים את המניין לסטטוס "ממתין" עד אישור מנהל
    private static void Apply(Minyan m, SaveMinyanDto dto)
    {
        m.Prayer = dto.Prayer;
        m.Days = dto.Days;
        m.Time = dto.Time;
        m.Notes = dto.Notes;
        m.Status = MinyanStatus.Pending;
    }

    private Task<List<MinyanDto>> ToDtos(IQueryable<Minyan> query) =>
        query.OrderBy(m => m.Days).ThenBy(m => m.Prayer).ThenBy(m => m.Time)
             .Select(MinyanDto.FromEntity)
             .ToListAsync();

    private async Task<MinyanDto> FindDto(int id) =>
        await db.Minyanim.Where(m => m.Id == id).Select(MinyanDto.FromEntity).SingleAsync();
}
