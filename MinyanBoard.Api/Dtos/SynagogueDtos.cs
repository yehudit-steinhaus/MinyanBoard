using System.ComponentModel.DataAnnotations;
using MinyanBoard.Api.Models;

namespace MinyanBoard.Api.Dtos;

public record SynagogueDto(int Id, string Name, string Address, string? Neighborhood)
{
    public static SynagogueDto From(Synagogue s) => new(s.Id, s.Name, s.Address, s.Neighborhood);
}

// משמש גם ליצירה וגם לעדכון
public record SaveSynagogueDto(
    [Required, MaxLength(100)] string Name,
    [Required, MaxLength(200)] string Address,
    [MaxLength(100)] string? Neighborhood);
