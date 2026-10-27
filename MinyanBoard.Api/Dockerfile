# Render מריץ את השרת בתוך Docker: שלב 1 בונה, שלב 2 מריץ

# שלב 1: בנייה (עם ה-SDK המלא)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY MinyanBoard.Api.csproj .
RUN dotnet restore MinyanBoard.Api.csproj
COPY . .
RUN dotnet publish MinyanBoard.Api.csproj -c Release -o /app

# שלב 2: הרצה (רק מה שצריך כדי להריץ - קטן יותר)
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "MinyanBoard.Api.dll"]
