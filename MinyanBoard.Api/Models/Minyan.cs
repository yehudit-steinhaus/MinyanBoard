namespace MinyanBoard.Api.Models;

public class Minyan
{
    public int Id { get; set; }
    public Prayer Prayer { get; set; }
    public DayType Days { get; set; }
    public TimeOnly Time { get; set; }
    public string? Notes { get; set; }
    public MinyanStatus Status { get; set; } = MinyanStatus.Pending;

    // Foreign key + navigation property
    public int SynagogueId { get; set; }
    public Synagogue Synagogue { get; set; } = null!;
}
