const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Bruk en fast sti til volley.db i backend-mappen
const dbPath = path.join(__dirname, "volley.db");
const db = new sqlite3.Database(dbPath);

// Opprett tabeller hvis de ikke finnes
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT,
      league TEXT,
      group_type TEXT,           -- 'mizuno' eller 'abroad'
      sofascore_team_id INTEGER, -- id fra SofaScore
      tournament_id INTEGER,
      season_id INTEGER,
      widget_name TEXT,
      slug TEXT
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
      team_id INTEGER,
      FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL
    )
  `);
});

module.exports = db;