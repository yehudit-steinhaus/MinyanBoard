import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMinyan, getAllMinyanim, updateMinyanStatus } from "../api/minyanim";
import MinyanTable from "../components/MinyanTable";
import SelectFilter from "../components/SelectFilter";
import { statusLabels, toOptions } from "../labels";
import type { MinyanStatus } from "../types";

// דף המנהל: כל המניינים, בכל הסטטוסים, עם אישור / דחייה / מחיקה
function AdminPage() {
  const queryClient = useQueryClient();

  // ברירת מחדל: רק הממתינים - זה מה שהמנהל צריך לטפל בו
  const [status, setStatus] = useState<MinyanStatus | "">("Pending");

  const { data: minyanim, isLoading, error } = useQuery({
    queryKey: ["minyanim", "all", status],
    queryFn: () => getAllMinyanim(status),
  });

  // אחרי כל שינוי: רשימות המניינים בזיכרון כבר לא נכונות => מביאים מחדש
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["minyanim"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: MinyanStatus }) =>
      updateMinyanStatus(id, newStatus),
    onSuccess: refresh,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMinyan,
    onSuccess: refresh,
  });

  const busy = statusMutation.isPending || deleteMutation.isPending;
  const actionError = statusMutation.error ?? deleteMutation.error;

  return (
    <div>
      <h2>ניהול מניינים</h2>

      <div className="filters">
        <SelectFilter
          value={status}
          allLabel="כל הסטטוסים"
          options={toOptions(statusLabels)}
          onChange={(value) => setStatus(value as MinyanStatus | "")}
        />
      </div>

      {isLoading && <p>טוען...</p>}
      {error && <p className="error">{error.message}</p>}
      {actionError && <p className="error">{actionError.message}</p>}

      {minyanim && (
        <MinyanTable
          minyanim={minyanim}
          showStatus
          actions={(m) => (
            <>
              {m.status !== "Approved" && (
                <button disabled={busy} onClick={() => statusMutation.mutate({ id: m.id, newStatus: "Approved" })}>
                  אישור
                </button>
              )}
              {m.status !== "Rejected" && (
                <button disabled={busy} onClick={() => statusMutation.mutate({ id: m.id, newStatus: "Rejected" })}>
                  דחייה
                </button>
              )}
              <button
                disabled={busy}
                onClick={() => window.confirm("למחוק את המניין?") && deleteMutation.mutate(m.id)}
              >
                מחיקה
              </button>
            </>
          )}
        />
      )}
    </div>
  );
}

export default AdminPage;
