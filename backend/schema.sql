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

    -- Nye felter
    homepage_url TEXT,
    stream_url TEXT
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT,
    jersey_number INTEGER,
    nationality TEXT,
    external_url TEXT,
    team_id INTEGER,
    FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL
);
