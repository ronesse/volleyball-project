const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/teams?group=mizuno|abroad (valgfri filter)
router.get("/", (req, res) => {
  const group = req.query.group;
  let sql = "SELECT * FROM teams";
  const params = [];

  if (group) {
    sql += " WHERE group_type = ?";
    params.push(group);
  }

  sql += " ORDER BY name ASC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Opprett nytt lag
router.post("/", (req, res) => {
  const {
    name,
    country,
    league,
    group_type,
    sofascore_team_id,
    tournament_id,
    season_id,
    widget_name,
    slug,
    homepage_url,
    stream_url
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const sql = `
    INSERT INTO teams (
      name, country, league, group_type,
      sofascore_team_id, tournament_id, season_id,
      widget_name, slug, homepage_url, stream_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    name,
    country || null,
    league || null,
    group_type || null,
    sofascore_team_id || null,
    tournament_id || null,
    season_id || null,
    widget_name || null,
    slug || null,
    homepage_url || null,
    stream_url || null
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Oppdater lag
router.put("/:id", (req, res) => {
  const id = req.params.id;

  const {
    name,
    country,
    league,
    group_type,
    sofascore_team_id,
    tournament_id,
    season_id,
    widget_name,
    slug,
    homepage_url,
    stream_url
  } = req.body;

  const sql = `
    UPDATE teams
    SET name = ?, country = ?, league = ?, group_type = ?,
        sofascore_team_id = ?, tournament_id = ?, season_id = ?,
        widget_name = ?, slug = ?, homepage_url = ?, stream_url = ?
    WHERE id = ?
  `;

  const params = [
    name,
    country || null,
    league || null,
    group_type || null,
    sofascore_team_id || null,
    tournament_id || null,
    season_id || null,
    widget_name || null,
    slug || null,
    homepage_url || null,
    stream_url || null,
    id
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// Slett lag
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM teams WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

module.exports = router;
