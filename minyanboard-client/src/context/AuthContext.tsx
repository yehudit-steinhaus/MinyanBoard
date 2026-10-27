import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthResponse } from "../types";

type AuthContextValue = {
  user: AuthResponse | null;
  signIn: (data: AuthResponse) => void;
  signOut: () => void;
};

// יצירת ה"מחסן" - בהתחלה ריק (null)
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // ערך התחלתי: משתמש שנשמר בעבר, אם יש (כדי שרענון לא ינתק)
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const signIn = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}