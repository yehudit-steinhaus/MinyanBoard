import type { ReactNode } from "react";

// שדה בטופס: כותרת + השדה עצמו + הודעת שגיאה (אם יש)
// משמשת את כל הטפסים באפליקציה - כדי לא לשכפל קוד
type FormFieldProps = {
  label: string;       // הכותרת שמעל השדה
  error?: string;      // הודעת שגיאה - לא חובה (?)
  children: ReactNode; // השדה עצמו: input או select
};

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label>
        {label}
        {children}
      </label>
      {error && <span className="error">{error}</span>}
    </div>
  );
}

export default FormField;