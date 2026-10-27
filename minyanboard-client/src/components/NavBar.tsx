import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";

// תפריט עליון - משתנה לפי מי שמחובר
function NavBar() {
  const { user, signOut } = useAuth();

  return (
    <nav>
      <NavLink to="/">לוח מניינים</NavLink>
      {user ? (
        <>
          {/* קישור לפי התפקיד */}
          {user.role === "Gabbai" && <>{" | "}<NavLink to="/mine">המניינים שלי</NavLink></>}
          {user.role === "Admin" && <>{" | "}<NavLink to="/admin">ניהול</NavLink></>}
          {" | "}שלום, {user.fullName}{" "}
          <button onClick={signOut}>יציאה</button>
        </>
      ) : (
        <>
          {" | "}<NavLink to="/login">כניסה</NavLink>
          {" | "}<NavLink to="/register">הרשמת גבאי</NavLink>
        </>
      )}
    </nav>
  );
}

export default NavBar;
