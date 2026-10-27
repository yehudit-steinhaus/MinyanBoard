import type { DayType, MinyanStatus, Prayer } from "./types";

// תרגום הערכים מהשרת לטקסט בעברית לתצוגה
export const prayerLabels: Record<Prayer, string> = {
  Shacharit: "שחרית",
  Mincha: "מנחה",
  Maariv: "ערבית",
};

export const dayLabels: Record<DayType, string> = {
  Weekdays: "ימי חול",
  Shabbat: "שבת",
};

export const statusLabels: Record<MinyanStatus, string> = {
  Pending: "ממתין לאישור",
  Approved: "מאושר",
  Rejected: "נדחה",
};

// "13:30:00" => "13:30"
export const formatTime = (time: string) => time.slice(0, 5);

// הופך מילון תרגום לרשימת אפשרויות לתיבת בחירה
// { Mincha: "מנחה" } => [{ value: "Mincha", label: "מנחה" }]
export const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));
