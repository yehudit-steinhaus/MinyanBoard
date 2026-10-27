using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using MinyanBoard.Api.Data;
using MinyanBoard.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== שלב 1: רישום שירותים (Dependency Injection) =====

builder.Services.AddControllers()
    // enum יישלח כטקסט ("Mincha") ולא כמספר (1) - נוח יותר ללקוח React
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// מסד הנתונים: במחשב - SQL Server (LocalDB). בענן (Render) - PostgreSQL.
// ההחלטה לפי מחרוזת החיבור: בענן היא מתחילה ב-"postgres".
var connectionString = builder.Configuration.GetConnectionString("Default")!;
var usePostgres = connectionString.StartsWith("postgres");
builder.Services.AddDbContext<AppDbContext>(o =>
{
    if (usePostgres) o.UseNpgsql(ToNpgsqlConnectionString(connectionString));
    else o.UseSqlServer(connectionString);
});

builder.Services.AddScoped<TokenService>();

// אימות (Authentication): איך השרת מזהה מי שולח את הבקשה - לפי JWT
var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwt["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwt["Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!))
    });
builder.Services.AddAuthorization();

// CORS: מאפשר ללקוח React (שרץ בכתובת אחרת) לפנות לשרת.
// במחשב: localhost. בענן: הכתובת של האתר, מהגדרה בשם ClientUrl.
var allowedOrigins = new List<string> { "http://localhost:5173", "http://localhost:3000" };
if (builder.Configuration["ClientUrl"] is { Length: > 0 } clientUrl)
    allowedOrigins.Add(clientUrl.TrimEnd('/'));
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(allowedOrigins.ToArray()).AllowAnyHeader().AllowAnyMethod()));

// Swagger: דף בדיקה אוטומטי לכל ה-API, כולל כפתור Authorize להדבקת טוקן
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.MapType<TimeOnly>(() => new OpenApiSchema { Type = "string", Example = new OpenApiString("07:00") });
    o.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    o.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ===== שלב 2: יצירת/עדכון מסד הנתונים ונתוני התחלה =====
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // SQL Server: לפי ה-Migrations. PostgreSQL: יוצר את הטבלאות ישירות מה-Models.
    if (usePostgres) db.Database.EnsureCreated();
    else db.Database.Migrate();
    DbSeeder.Seed(db, app.Configuration);
}

// ===== שלב 3: Middleware - הסדר כאן חשוב! =====
// Swagger פתוח גם בענן, כדי שאפשר יהיה להציג את ה-API בבדיקה
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseAuthentication();   // קודם: מי אתה?
app.UseAuthorization();    // אחר כך: מה מותר לך?
app.MapControllers();

app.Run();

// Render נותן כתובת בצורה postgresql://user:password@host:port/db
// ו-Npgsql צריך אותה בצורה Host=...;Username=...;Password=...
static string ToNpgsqlConnectionString(string url)
{
    var uri = new Uri(url);
    var user = uri.UserInfo.Split(':', 2);
    var port = uri.Port > 0 ? uri.Port : 5432;
    return $"Host={uri.Host};Port={port};Database={uri.AbsolutePath.TrimStart('/')};" +
           $"Username={Uri.UnescapeDataString(user[0])};Password={Uri.UnescapeDataString(user[1])};SSL Mode=Prefer";
}
