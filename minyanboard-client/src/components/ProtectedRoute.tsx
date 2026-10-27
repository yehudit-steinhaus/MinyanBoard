import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

// עוטף דף שמותר רק לתפקיד מסוים
type ProtectedRouteProps = {
  role: Role;          // מי מורשה: "Gabbai" או "Admin"
  children: ReactNode; // הדף עצמו
};

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;           // לא מחובר => לכניסה
  if (user.role !== role) return <p>אין לך הרשאה לדף זה</p>;    // תפקיד אחר
  return children;                                             // מורשה => מציגים את הדף
}

export default ProtectedRoute;
