import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { registerGabbai } from "../api/auth";
import { useSynagogues } from "../hooks/useSynagogues";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import type { RegisterRequest } from "../types";

function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // רשימת בתי הכנסת לבחירה בטופס
  const { data: synagogues } = useSynagogues();

  const mutation = useMutation({
    mutationFn: registerGabbai,
    onSuccess: (data) => {
      signIn(data);   // אחרי הרשמה - הגבאי כבר מחובר
      navigate("/mine");
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
      <h2>הרשמת גבאי</h2>

      <FormField label="שם מלא" error={errors.fullName?.message}>
        <input
          {...register("fullName", {
            required: "יש להזין שם",
            maxLength: { value: 100, message: "עד 100 תווים" },
          })}
        />
      </FormField>

      <FormField label="אימייל" error={errors.email?.message}>
        <input
          type="email"
          {...register("email", {
            required: "יש להזין אימייל",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "אימייל לא תקין" },
          })}
        />
      </FormField>

      <FormField label="סיסמה" error={errors.password?.message}>
        <input
          type="password"
          {...register("password", {
            required: "יש להזין סיסמה",
            minLength: { value: 6, message: "לפחות 6 תווים" },
          })}
        />
      </FormField>

      <FormField label="בית כנסת" error={errors.synagogueId?.message}>
        <select
          defaultValue=""
          {...register("synagogueId", {
            valueAsNumber: true,
            validate: (value) => value > 0 || "יש לבחור בית כנסת",
          })}
        >
          <option value="" disabled>-- בחירה --</option>
          {synagogues?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </FormField>

      {mutation.error && <p className="error">{mutation.error.message}</p>}

      <button disabled={mutation.isPending}>
        {mutation.isPending ? "נרשם..." : "הרשמה"}
      </button>
    </form>
  );
}

export default RegisterPage;