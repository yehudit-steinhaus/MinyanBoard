import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { deleteMinyan, getMine } from "../api/minyanim";
import MinyanTable from "../components/MinyanTable";

// דף הגבאי: כל המניינים של בית הכנסת שלו, בכל הסטטוסים
function MyMinyanimPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: minyanim, isLoading, error } = useQuery({
    queryKey: ["minyanim", "mine"],
    queryFn: getMine,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMinyan,
    // אחרי מחיקה: הנתונים בזיכרון כבר לא נכונים => React Query יביא מחדש
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["minyanim"] }),
  });

  const handleDelete = (id: number) => {
    if (window.confirm("למחוק את המניין?")) deleteMutation.mutate(id);
  };

  return (
    <div>
      <h2>המניינים שלי</h2>
      <Link to="/mine/new">+ הוספת מניין</Link>
      <p>מניין חדש או מעודכן ממתין לאישור המנהל לפני שיופיע בלוח.</p>

      {isLoading && <p>טוען...</p>}
      {error && <p className="error">{error.message}</p>}
      {deleteMutation.error && <p className="error">{deleteMutation.error.message}</p>}

      {minyanim && (
        <MinyanTable
          minyanim={minyanim}
          showStatus
          actions={(m) => (
            <>
              <button onClick={() => navigate(`/mine/${m.id}/edit`)}>עריכה</button>
              <button onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending}>
                מחיקה
              </button>
            </>
          )}
        />
      )}
    </div>
  );
}

export default MyMinyanimPage;
