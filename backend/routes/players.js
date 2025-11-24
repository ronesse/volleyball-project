const express = require("express");
const router = express.Router();
const db = require("../db");

// Hent alle spillere (med lagnavn)
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, t.name AS team_name
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY p.name
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Opprett spiller
router.post("/", (req, res) => {
  const {
    name,
    position,
    jersey_number,
    nationality,
    external_url,
    team_id,
    photo_url
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const sql = `
    INSERT INTO players (
      name, position, jersey_number, nationality,
      external_url, team_id, photo_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name,
    position || null,
    jersey_number || null,
    nationality || null,
    external_url || null,
    team_id || null,
    photo_url || null
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Oppdater spiller
router.put("/:id", (req, res) => {
  const id = req.params.id;

  const {
    name,
    position,
    jersey_number,
    nationality,
    external_url,
    team_id,
    photo_url
  } = req.body;

  const sql = `
    UPDATE players
    SET name = ?, position = ?, jersey_number = ?, nationality = ?,
        external_url = ?, team_id = ?, photo_url = ?
    WHERE id = ?
  `;

  const params = [
    name,
    position || null,
    jersey_number || null,
    nationality || null,
    external_url || null,
    team_id || null,
    photo_url || null,
    id
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// Slett
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM players WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

module.exports = router;
