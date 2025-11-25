const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "volley.db");
const db = new sqlite3.Database(dbPath);

function addColumnIfMissing(column, type) {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(players);", (err, cols) => {
      if (err) return reject(err);

      const exists = cols.some(c => c.name === column);

      if (exists) {
        console.log(`✔ Kolonnen '${column}' finnes allerede`);
        return resolve();
      }

      console.log(`➕ Legger til kolonne '${column}'...`);
      db.run(`ALTER TABLE players ADD COLUMN ${column} ${type}`, err => {
        if (err) return reject(err);
        console.log(`✔ '${column}' lagt til.`);
        resolve();
      });
    });
  });
}

(async () => {
  try {
    await addColumnIfMissing("photo_url", "TEXT");
    await addColumnIfMissing("youth_club", "TEXT");
    await addColumnIfMissing("instagram", "TEXT");
    await addColumnIfMissing("height_cm", "INTEGER");
    await addColumnIfMissing("birth_year", "INTEGER");

    console.log("\n🎉 Migrering fullført!\n");
  } catch (e) {
    console.error("❌ Feil:", e);
  } finally {
    db.close();
  }
})();
