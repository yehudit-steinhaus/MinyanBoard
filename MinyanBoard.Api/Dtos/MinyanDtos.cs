using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using MinyanBoard.Api.Models;

namespace MinyanBoard.Api.Dtos;

public record MinyanDto(
    int Id, Prayer Prayer, DayType Days, TimeOnly Time, string? Notes,
    MinyanStatus Status, int SynagogueId, string SynagogueName)
{
    // Expression (ולא פונקציה רגילה) כדי ש-EF יתרגם אותו ל-SQL
    // ויביא רק את העמודות הדרושות, כולל שם בית הכנסת (JOIN אוטומטי).
    public static readonly Expression<Func<Minyan, MinyanDto>> FromEntity = m => new MinyanDto(
        m.Id, m.Prayer, m.Days, m.Time, m.Notes, m.Status, m.SynagogueId, m.Synagogue.Name);
}

// משמש גם ליצירה וגם לעדכון
public record SaveMinyanDto(
    Prayer Prayer,
    DayType Days,
    TimeOnly Time,
    [MaxLength(300)] string? Notes);

public record UpdateStatusDto(MinyanStatus Status);
