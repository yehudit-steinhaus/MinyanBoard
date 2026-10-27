namespace MinyanBoard.Api.Models;

public class Synagogue
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public string? Neighborhood { get; set; }

    // Navigation property: כל המניינים של בית הכנסת (קשר יחיד-לרבים)
    public List<Minyan> Minyanim { get; set; } = [];
}
