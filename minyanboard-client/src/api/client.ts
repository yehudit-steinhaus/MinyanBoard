// פונקציה מרכזית אחת לכל הקריאות לשרת.
// כל הקבצים האחרים בתיקיית api משתמשים בה, כדי לא לחזור על אותו קוד בכל קריאה.

// כתובת השרת. בהרצה מקומית: localhost:5080.
// בהעלאה לענן נגדיר את VITE_API_URL בקובץ .env ולא נצטרך לשנות קוד.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5080";

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  // הטוקן נשמר אחרי כניסה (בשלב 3). אם יש - מצרפים אותו, והשרת יודע מי אנחנו.
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // שגיאה (400, 401, 404...) - זורקים אותה, ו-React Query יעביר אותה למסך
  if (!res.ok) throw new Error(await readError(res));

  // 204 NoContent (למשל אחרי מחיקה) - אין גוף לתשובה
  if (res.status === 204) return undefined as T;

  return res.json();
}

// מוציא הודעת שגיאה קריאה מהתשובה של השרת
async function readError(res: Response): Promise<string> {
  const text = await res.text();
  if (text) {
    try {
      // שגיאות Validation מגיעות כ-JSON עם שדה title
      return JSON.parse(text).title ?? text;
    } catch {
      // הודעות שכתבנו בשרת, כמו "אימייל או סיסמה שגויים", מגיעות כטקסט רגיל
      return text;
    }
  }
  if (res.status === 401) return "יש להתחבר למערכת";
  if (res.status === 403) return "אין לך הרשאה לפעולה זו";
  return `שגיאה מהשרת (${res.status})`;
}

// קיצורים לכל פועל HTTP - כך שכל קריאה לשרת היא שורה אחת
export const api = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body: unknown) => request<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => request<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) => request<T>(path, "PATCH", body),
  delete: (path: string) => request<void>(path, "DELETE"),
};
