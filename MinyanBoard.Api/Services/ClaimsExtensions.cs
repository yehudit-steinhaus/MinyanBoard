using System.Security.Claims;

namespace MinyanBoard.Api.Services;

// Extension methods: מוסיפים ל-User (המשתמש המחובר בתוך Controller) פעולות נוחות
public static class ClaimsExtensions
{
    public const string SynagogueIdClaim = "synagogueId";

    public static int? GetSynagogueId(this ClaimsPrincipal user) =>
        int.TryParse(user.FindFirstValue(SynagogueIdClaim), out var id) ? id : null;
}
