const express = require("express");
const router = express.Router();
const db = require("../db");

/* -------------------------------------------
   Hent alle spillere
-------------------------------------------- */
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.position,
      p.jersey_number,
      p.nationality,
      p.external_url,
      p.photo_url,
      p.team_id,
      p.youth_club,
      p.instagram,
      p.height_cm,
      p.birth_year,
      t.name AS team_name
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY p.name ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/* -------------------------------------------
   Opprett spiller
-------------------------------------------- */
router.post("/", (req, res) => {
  const {
    name,
    position,
    jersey_number,
    nationality,
    external_url,
    photo_url,
    team_id,
    youth_club,
    instagram,
    height_cm,
    birth_year
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Navn er påkrevd" });
  }

  const sql = `
    INSERT INTO players (
      name,
      position,
      jersey_number,
      nationality,
      external_url,
      photo_url,
      team_id,
      youth_club,
      instagram,
      height_cm,
      birth_year
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name,
    position || null,
    jersey_number || null,
    nationality || null,
    external_url || null,
    photo_url || null,
    team_id || null,
    youth_club || null,
    instagram || null,
    height_cm || null,
    birth_year || null
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ id: this.lastID });
  });
});

/* -------------------------------------------
   Oppdater spiller
-------------------------------------------- */
router.put("/:id", (req, res) => {
  const id = req.params.id;

  const {
    name,
    position,
    jersey_number,
    nationality,
    external_url,
    photo_url,
    team_id,
    youth_club,
    instagram,
    height_cm,
    birth_year
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Navn er påkrevd" });
  }

  const sql = `
    UPDATE players SET
      name = ?,
      position = ?,
      jersey_number = ?,
      nationality = ?,
      external_url = ?,
      photo_url = ?,
      team_id = ?,
      youth_club = ?,
      instagram = ?,
      height_cm = ?,
      birth_year = ?
    WHERE id = ?
  `;

  const params = [
    name,
    position || null,
    jersey_number || null,
    nationality || null,
    external_url || null,
    photo_url || null,
    team_id || null,
    youth_club || null,
    instagram || null,
    height_cm || null,
    birth_year || null,
    id
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ updated: this.changes });
  });
});

/* -------------------------------------------
   Slett spiller
-------------------------------------------- */
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM players WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
