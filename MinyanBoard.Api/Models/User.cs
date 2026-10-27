namespace MinyanBoard.Api.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";   // לעולם לא שומרים סיסמה גלויה
    public Role Role { get; set; }

    // גבאי שייך לבית כנסת אחד; למנהל אין בית כנסת (לכן nullable)
    public int? SynagogueId { get; set; }
    public Synagogue? Synagogue { get; set; }
}
