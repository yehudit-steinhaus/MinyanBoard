import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import type { LoginRequest } from "../types";

function LoginPage() {
  // React Hook Form: מנהל את שדות הטופס ואת הבדיקות (Validation)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // useMutation: שליחת מידע לשרת (useQuery מביא, useMutation שולח)
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      signIn(data);   // שומרים את המשתמש ב-Context
      navigate(data.role === "Gabbai" ? "/mine" : "/admin"); // גבאי => המניינים שלו
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
      <h2>כניסה</h2>

      <FormField label="אימייל" error={errors.email?.message}>
        <input type="email" {...register("email", { required: "יש להזין אימייל" })} />
      </FormField>

      <FormField label="סיסמה" error={errors.password?.message}>
        <input type="password" {...register("password", { required: "יש להזין סיסמה" })} />
      </FormField>

      {mutation.error && <p className="error">{mutation.error.message}</p>}

      <button disabled={mutation.isPending}>
        {mutation.isPending ? "נכנס..." : "כניסה"}
      </button>
    </form>
  );
}

export default LoginPage;