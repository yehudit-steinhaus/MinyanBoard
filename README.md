# לוח מניינים עירוני – שרת (ASP.NET Core Web API)

## מה השרת עושה
- **גבאי** נרשם, משויך לבית כנסת אחד, ומפרסם/מעדכן/מוחק את המניינים שלו.
- כל מניין חדש או מעודכן נכנס לסטטוס **ממתין (Pending)**.
- **מנהל** רואה את כל המניינים בכל הסטטוסים (עם סינון לפי סטטוס), ומאשר (Approved) או דוחה (Rejected).
- **כל אחד** (גם בלי כניסה) רואה את הלוח: רק מניינים מאושרים, עם סינון לפי תפילה, ימים ובית כנסת.

---

## מבנה התיקיות

```
MinyanBoard.Api/
├── Program.cs              ← נקודת הכניסה: רישום שירותים + סדר ה-Middleware
├── appsettings.json        ← הגדרות: מחרוזת חיבור, מפתח JWT, פרטי מנהל ראשוני
├── Models/                 ← ישויות = טבלאות במסד הנתונים
│   ├── User.cs, Synagogue.cs, Minyan.cs
│   └── Enums.cs            ← Role, Prayer, DayType, MinyanStatus
├── Data/
│   ├── AppDbContext.cs     ← הגשר ל-SQL (Entity Framework)
│   └── DbSeeder.cs         ← נתוני התחלה: מנהל + 3 בתי כנסת
├── Dtos/                   ← מה שעובר ברשת בין React לשרת
├── Services/
│   ├── TokenService.cs     ← יצירת JWT
│   ├── PasswordHelper.cs   ← הצפנת (Hash) סיסמאות ובדיקתן
│   └── ClaimsExtensions.cs ← שליפת בית הכנסת של המשתמש המחובר מהטוקן
└── Controllers/            ← נקודות הקצה (Endpoints) של ה-API
    ├── AuthController.cs
    ├── SynagoguesController.cs
    └── MinyanimController.cs
```

---

## מושגים – לפי הסדר שבו בקשה עוברת בשרת

### 1. Web API ו-REST
השרת לא מחזיר דפי HTML אלא **JSON**. כל פעולה היא שילוב של **כתובת** + **פועל HTTP**:

| פועל | משמעות | דוגמה |
|---|---|---|
| GET | קריאה | `GET api/minyanim` |
| POST | יצירה | `POST api/minyanim` |
| PUT | עדכון מלא | `PUT api/minyanim/5` |
| PATCH | עדכון חלקי | `PATCH api/minyanim/5/status` |
| DELETE | מחיקה | `DELETE api/minyanim/5` |

השרת מחזיר **קוד סטטוס**: `200 OK`, `204 NoContent` (הצליח, אין מה להחזיר), `400 BadRequest` (קלט שגוי), `401 Unauthorized` (לא מחובר), `403 Forbidden` (מחובר אבל אין הרשאה), `404 NotFound`, `409 Conflict` (למשל אימייל קיים).

### 2. Controller ו-Routing
Controller הוא מחלקה שמקבצת פעולות על נושא אחד.
- `[Route("api/[controller]")]` – `[controller]` מוחלף בשם המחלקה בלי המילה Controller, כלומר `MinyanimController` ← `api/minyanim`.
- `[HttpGet("mine")]` – מוסיף לכתובת: `api/minyanim/mine`.
- `[HttpPut("{id}")]` – `{id}` הוא **פרמטר מהכתובת**, ונכנס אוטומטית לפרמטר `int id` של הפונקציה.
- `[ApiController]` – מפעיל בדיקת קלט אוטומטית: אם ה-DTO לא תקין, הלקוח מקבל 400 עוד לפני שהקוד שלנו רץ.

### 3. Model / ישות (Entity)
מחלקה רגילה שכל אובייקט שלה הוא **שורה בטבלה**, וכל Property הוא **עמודה**.
- `Id` – הופך אוטומטית למפתח ראשי (Primary Key) עם מספור אוטומטי.
- `SynagogueId` – **מפתח זר (Foreign Key)**: מצביע על שורה בטבלה אחרת.
- `Synagogue` (בתוך Minyan) – **Navigation Property**: מאפשר לכתוב `m.Synagogue.Name` ו-EF יבצע JOIN בעצמו.
- `int?` / `string?` – סימן שאלה = מותר שיהיה ריק (NULL).

### 4. Enum
רשימה סגורה של ערכים אפשריים, למשל `Prayer { Shacharit, Mincha, Maariv }`. בטבלה נשמר כמספר, וב-JSON נשלח כטקסט (`"Mincha"`) בזכות `JsonStringEnumConverter` ב-Program.cs.

### 5. Entity Framework Core ו-DbContext
**ORM** = כלי שמתרגם קוד C# ל-SQL, כך שלא כותבים SQL ידנית.
- `DbSet<Minyan> Minyanim` = הטבלה `Minyanim`.
- `db.Minyanim.Where(...)` = `SELECT ... WHERE ...`
- `db.Minyanim.Add(x)` + `SaveChangesAsync()` = `INSERT`
- שינוי Property על אובייקט שנשלף + `SaveChangesAsync()` = `UPDATE` (EF "עוקב" אחרי האובייקט – Change Tracking).
- `OnModelCreating` – הגדרות נוספות: אינדקס ייחודי על אימייל, אורך מקסימלי לשדות, ומה קורה במחיקה (`SetNull` / `Cascade`).

### 6. Migrations
**Migration** = קובץ שמתאר שינוי במבנה מסד הנתונים. כל פעם שמשנים Model מריצים פקודה ש"משווה" ומייצרת Migration חדש. `db.Database.Migrate()` ב-Program.cs מחיל אותם אוטומטית בעליית השרת.

### 7. IQueryable ו-Expression
- `IQueryable` = שאילתה **שעוד לא רצה**. אפשר להוסיף לה `Where` בתנאים (כמו בסינון ב-`GetBoard`) והיא נשלחת ל-SQL רק ב-`ToListAsync()`.
- `MinyanDto.FromEntity` הוא `Expression` ולא פונקציה רגילה, כדי ש-EF יוכל **לתרגם אותו ל-SQL** ולהביא רק את העמודות שצריך.

### 8. async / await
פעולות מול מסד הנתונים לוקחות זמן. `await` משחרר את השרת לטפל בבקשות אחרות בזמן ההמתנה. לכן הפונקציות מחזירות `Task<...>` ומשתמשים ב-`ToListAsync`, `SaveChangesAsync` וכו'.

### 9. DTO (Data Transfer Object)
המבנה שעובר ברשת, נפרד מהישות. סיבות:
- לא לחשוף שדות פנימיים (למשל `PasswordHash`).
- לקבל מהלקוח רק את מה שמותר לו לשלוח (גבאי לא שולח `Status` – הוא נקבע בשרת).
- להחזיר מידע מוכן לתצוגה (למשל `SynagogueName`).

נכתבו כ-`record` – מחלקה קצרה לנתונים בלבד. המאפיינים `[Required]`, `[EmailAddress]`, `[MaxLength]` הם **Data Annotations** לבדיקת תקינות.

### 10. Dependency Injection (DI)
במקום שה-Controller ייצור בעצמו `new AppDbContext(...)`, הוא **מבקש** אותו בבנאי:
```csharp
public class MinyanimController(AppDbContext db) : ControllerBase
```
ASP.NET מספק אותו אוטומטית, כי רשמנו אותו ב-Program.cs (`AddDbContext`, `AddScoped<TokenService>`).
`Scoped` = מופע אחד לכל בקשה.

(הכתיבה `class X(AppDbContext db)` נקראת **Primary Constructor** – קיצור של C# 12 לבנאי ושדה.)

### 11. Hashing של סיסמאות
סיסמה **לעולם** לא נשמרת כמו שהיא. `PasswordHasher` הופך אותה למחרוזת חד-כיוונית (עם "מלח" אקראי). בכניסה מחשבים שוב ובודקים התאמה.

### 12. JWT – אימות (Authentication)
1. המשתמש שולח אימייל וסיסמה ל-`api/auth/login`.
2. השרת בודק, ומחזיר **טוקן** – מחרוזת חתומה שבתוכה **Claims**: מזהה, שם, תפקיד, ומזהה בית כנסת.
3. בכל בקשה הבאה הלקוח שולח כותרת: `Authorization: Bearer <הטוקן>`.
4. השרת בודק את החתימה עם המפתח הסודי (`Jwt:Key`) – אם מישהו שינה משהו בטוקן, החתימה לא תתאים.

היתרון: השרת לא צריך לזכור מי מחובר (**Stateless**) – הכל בטוקן.

### 13. Authorization – הרשאות
- `[Authorize]` – רק משתמש מחובר.
- `[Authorize(Roles = "Admin")]` – רק מי שבטוקן שלו התפקיד הוא Admin.
- בלי `[Authorize]` – פתוח לכולם (כמו הלוח הציבורי).
- בדיקת **בעלות**: ב-`Update` של מניין מחפשים `m.Id == id && m.SynagogueId == synagogueId` – כך גבאי לא יכול לגעת במניין של בית כנסת אחר, גם אם ינחש את ה-id.

### 14. Middleware ו-Program.cs
Program.cs בנוי משני חלקים:
1. **`builder.Services...`** – רישום כל מה שהאפליקציה צריכה (DI).
2. **`app.Use...`** – "צינור" שכל בקשה עוברת בו לפי הסדר. **הסדר חשוב**: קודם `UseAuthentication` (מי אתה?) ואז `UseAuthorization` (מה מותר לך?).

### 15. CORS
דפדפן חוסם כברירת מחדל בקשה מאתר בפורט אחד (React, למשל 5173) לשרת בפורט אחר (5080). `AddCors` מגדיר לשרת לאשר את זה לכתובות של React.

### 16. Swagger
דף שנוצר אוטומטית מכל ה-Controllers, ומאפשר לנסות כל Endpoint מהדפדפן. כפתור **Authorize** מאפשר להדביק טוקן ולבדוק גם פעולות מוגנות.

---

## הרצה

**דרישות:** .NET 9 SDK, SQL Server (LocalDB מגיע עם Visual Studio). ב-Visual Studio נדרשת גרסה 2022 17.12 ומעלה.

1. אם צריך, לעדכן ב-`appsettings.json` את `ConnectionStrings:Default` לשרת ה-SQL שלך.
2. ליצור את ה-Migration הראשון (פעם אחת):
   - ב-Visual Studio, ב-Package Manager Console:
     `Add-Migration Init`
   - או בטרמינל, מתוך תיקיית `MinyanBoard.Api`:
     ```
     dotnet tool install --global dotnet-ef --version 9.0.10
     dotnet ef migrations add Init
     ```
3. להריץ (F5 או `dotnet run`). מסד הנתונים נוצר אוטומטית ונפתח Swagger.

**מנהל ראשוני:** `admin@minyan.local` / `Admin123!` (ניתן לשנות ב-appsettings לפני ההרצה הראשונה).

---

## טבלת Endpoints

| פעולה | כתובת | מי |
|---|---|---|
| הרשמת גבאי | `POST api/auth/register` | כולם |
| כניסה | `POST api/auth/login` | כולם |
| רשימת בתי כנסת | `GET api/synagogues` | כולם |
| הוספה / עדכון / מחיקה של בית כנסת | `POST` / `PUT {id}` / `DELETE {id}` | מנהל |
| לוח מניינים מאושרים (+סינון) | `GET api/minyanim?prayer=&days=&synagogueId=` | כולם |
| המניינים שלי (כל הסטטוסים) | `GET api/minyanim/mine` | גבאי |
| הוספת מניין | `POST api/minyanim` | גבאי |
| עדכון מניין | `PUT api/minyanim/{id}` | גבאי (שלו) |
| מחיקת מניין | `DELETE api/minyanim/{id}` | גבאי (שלו) / מנהל |
| כל המניינים בכל הסטטוסים (+סינון לפי סטטוס) | `GET api/minyanim/all?status=` | מנהל |
| אישור / דחייה | `PATCH api/minyanim/{id}/status` | מנהל |

### דוגמאות JSON
הרשמה:
```json
{ "fullName": "משה כהן", "email": "moshe@test.com", "password": "123456", "synagogueId": 1 }
```
הוספת מניין:
```json
{ "prayer": "Mincha", "days": "Weekdays", "time": "13:30", "notes": "בבית המדרש הקטן" }
```
אישור:
```json
{ "status": "Approved" }
```

---

## תרחיש בדיקה ב-Swagger
1. `POST api/auth/register` עם `synagogueId: 1` → מעתיקים את `token`.
2. **Authorize** ← מדביקים את הטוקן.
3. `POST api/minyanim` → המניין נוצר כ-`Pending`.
4. `GET api/minyanim` → עדיין ריק (לא אושר).
5. `POST api/auth/login` כמנהל → Authorize עם הטוקן החדש.
6. `GET api/minyanim/all?status=Pending` → רואים את המניין; `PATCH .../status` עם `Approved`.
7. `GET api/minyanim` → המניין מופיע בלוח.
