import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createMinyan, updateMinyan } from "../api/minyanim";
import FormField from "./FormField";
import { dayLabels, formatTime, prayerLabels, toOptions } from "../labels";
import type { Minyan, SaveMinyanRequest } from "../types";

// טופס אחד להוספה ולעריכה.
// existing קיים => עריכה של המניין הזה. לא קיים => הוספה.
type MinyanFormProps = {
  existing?: Minyan;
};

function MinyanForm({ existing }: MinyanFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<SaveMinyanRequest>({
    // ערכים התחלתיים: בעריכה - מהמניין הקיים, בהוספה - ברירת מחדל
    defaultValues: existing
      ? {
          prayer: existing.prayer,
          days: existing.days,
          time: formatTime(existing.time),
          notes: existing.notes ?? "",
        }
      : { prayer: "Shacharit", days: "Weekdays", time: "", notes: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: SaveMinyanRequest) =>
      existing ? updateMinyan(existing.id, data) : createMinyan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["minyanim"] });
      navigate("/mine");
    },
  });

  const onSubmit = (data: SaveMinyanRequest) =>
    mutation.mutate({
      ...data,
      time: data.time.slice(0, 5) + ":00", // "13:30" => "13:30:00" (הפורמט שהשרת מצפה לו)
      notes: data.notes || null,            // הערה ריקה => null
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>{existing ? "עריכת מניין" : "הוספת מניין"}</h2>

      <FormField label="תפילה" error={errors.prayer?.message}>
        <select {...register("prayer", { required: "יש לבחור תפילה" })}>
          {toOptions(prayerLabels).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="ימים" error={errors.days?.message}>
        <select {...register("days", { required: "יש לבחור ימים" })}>
          {toOptions(dayLabels).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="שעה" error={errors.time?.message}>
        <input type="time" {...register("time", { required: "יש להזין שעה" })} />
      </FormField>

      <FormField label="הערות" error={errors.notes?.message}>
        <input {...register("notes", { maxLength: { value: 300, message: "עד 300 תווים" } })} />
      </FormField>

      {mutation.error && <p className="error">{mutation.error.message}</p>}

      <button disabled={mutation.isPending}>
        {mutation.isPending ? "שומר..." : "שמירה"}
      </button>
    </form>
  );
}

export default MinyanForm;
