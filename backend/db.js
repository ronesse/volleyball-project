const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// LOKAL database: backend/volley.db
// __dirname peker til backend/ *eller* backend/routes/
// Derfor må vi gå ett nivå opp for å finne volley.db
const localDB = path.join(__dirname, "..", "volley.db");

// RENDER-database:
const DB_PATH = process.env.DB_PATH || localDB;

// Hvis vi kjører på Render og databasen ikke finnes på persistent disk:
if (process.env.DB_PATH && !fs.existsSync(DB_PATH)) {
  console.log("📦 Kopierer volley.db til persistent disk første gang...");
  fs.copyFileSync(localDB, DB_PATH);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ SQLite error:", err.message);
  } else {
    console.log("✅ SQLite database OK:", DB_PATH);
  }
});

// Opprett tabeller hvis de ikke finnes
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT,
      league TEXT,
      group_type TEXT,
      sofascore_team_id INTEGER,
      tournament_id INTEGER,
      season_id INTEGER,
      widget_name TEXT,
      slug TEXT,
      homepage_url TEXT,
      stream_url TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT,
      jersey_number INTEGER,
      nationality TEXT,
      external_url TEXT,
      photo_url TEXT,
      youth_club TEXT,
      instagram TEXT,
      height_cm INTEGER,
      birth_year INTEGER,
      team_id INTEGER,
      FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL
    )
  `);
});

module.exports = db;
