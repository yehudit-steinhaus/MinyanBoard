import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getMine } from "../api/minyanim";
import MinyanForm from "../components/MinyanForm";

// /mine/new        => הוספה
// /mine/5/edit     => עריכת מניין 5
function MinyanFormPage() {
  const { id } = useParams(); // ה-id מהכתובת (אם יש)
  const isEdit = id !== undefined;

  // בעריכה: מביאים את המניינים של הגבאי ומוצאים את המניין הנכון
  const { data: mine, isLoading } = useQuery({
    queryKey: ["minyanim", "mine"],
    queryFn: getMine,
    enabled: isEdit, // בהוספה - לא צריך להביא כלום
  });

  if (!isEdit) return <MinyanForm />;
  if (isLoading) return <p>טוען...</p>;

  const existing = mine?.find((m) => m.id === Number(id));
  if (!existing) return <p>המניין לא נמצא</p>;

  return <MinyanForm existing={existing} />;
}

export default MinyanFormPage;
