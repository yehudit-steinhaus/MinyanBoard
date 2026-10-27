using System.ComponentModel.DataAnnotations;
using MinyanBoard.Api.Models;

namespace MinyanBoard.Api.Dtos;

// DTO = מה שעובר בין הלקוח לשרת. לא חושפים את הישות עצמה (למשל PasswordHash).
public record RegisterDto(
    [Required, MaxLength(100)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    int SynagogueId);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record AuthResponseDto(string Token, string FullName, Role Role, int? SynagogueId);
