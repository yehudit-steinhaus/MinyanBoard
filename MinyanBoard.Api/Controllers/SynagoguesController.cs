using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MinyanBoard.Api.Data;
using MinyanBoard.Api.Dtos;
using MinyanBoard.Api.Models;

namespace MinyanBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]   // => api/synagogues
public class SynagoguesController(AppDbContext db) : ControllerBase
{
    // פתוח לכולם: רשימה לבחירה בהרשמה ולסינון בלוח
    [HttpGet]
    public async Task<IEnumerable<SynagogueDto>> GetAll() =>
        (await db.Synagogues.OrderBy(s => s.Name).ToListAsync()).Select(SynagogueDto.From);

    [HttpPost, Authorize(Roles = nameof(Role.Admin))]
    public async Task<ActionResult<SynagogueDto>> Create(SaveSynagogueDto dto)
    {
        var synagogue = new Synagogue();
        Apply(synagogue, dto);
        db.Synagogues.Add(synagogue);
        await db.SaveChangesAsync();
        return SynagogueDto.From(synagogue);
    }

    [HttpPut("{id}"), Authorize(Roles = nameof(Role.Admin))]
    public async Task<ActionResult<SynagogueDto>> Update(int id, SaveSynagogueDto dto)
    {
        var synagogue = await db.Synagogues.FindAsync(id);
        if (synagogue is null) return NotFound();

        Apply(synagogue, dto);
        await db.SaveChangesAsync();
        return SynagogueDto.From(synagogue);
    }

    [HttpDelete("{id}"), Authorize(Roles = nameof(Role.Admin))]
    public async Task<IActionResult> Delete(int id)
    {
        var synagogue = await db.Synagogues.FindAsync(id);
        if (synagogue is null) return NotFound();

        db.Synagogues.Remove(synagogue);   // המניינים שלו נמחקים איתו (Cascade)
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void Apply(Synagogue s, SaveSynagogueDto dto)
    {
        s.Name = dto.Name;
        s.Address = dto.Address;
        s.Neighborhood = dto.Neighborhood;
    }
}
