// טיפוסים שמתארים את ה-JSON שמגיע מהשרת.
// כל טיפוס כאן מקביל ל-DTO או ל-enum בצד השרת (תיקיות Dtos ו-Models).

// ===== ערכים קבועים (מקבילים ל-enums ב-Models/Enums.cs) =====
// השרת שולח אותם כטקסט, ולכן כאן הם רשימה סגורה של מחרוזות.
export type Prayer = "Shacharit" | "Mincha" | "Maariv";
export type DayType = "Weekdays" | "Shabbat";
export type MinyanStatus = "Pending" | "Approved" | "Rejected";

// ===== בית כנסת (מקביל ל-SynagogueDto) =====
export type Synagogue = {
  id: number;
  name: string;
  address: string;
  neighborhood: string | null; // בשרת string? - יכול להיות ריק
};

// ===== מניין (מקביל ל-MinyanDto) =====
export type Minyan = {
  id: number;
  prayer: Prayer;
  days: DayType;
  time: string;         // בשרת TimeOnly - מגיע כטקסט, למשל "13:30:00"
  notes: string | null;
  status: MinyanStatus;
  synagogueId: number;
  synagogueName: string;
};
// ===== התחברות (מקביל ל-AuthDtos.cs) =====
export type Role = "Gabbai" | "Admin";

export type AuthResponse = {
  token: string;
  fullName: string;
  role: Role;
  synagogueId: number | null; // למנהל אין בית כנסת
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  synagogueId: number;
};


// ===== מניינים: סינון ושמירה =====
// "" = ללא סינון (הכל)
export type BoardFilters = {
  prayer: Prayer | "";
  days: DayType | "";
  synagogueId: string;
};

// מה שגבאי שולח בהוספה/עריכה (מקביל ל-SaveMinyanDto)
export type SaveMinyanRequest = {
  prayer: Prayer;
  days: DayType;
  time: string;
  notes: string | null;
};