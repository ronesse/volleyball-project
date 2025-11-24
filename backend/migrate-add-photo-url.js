const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "volley.db");
const db = new sqlite3.Database(dbPath);

console.log("🔧 Sjekker spiller-tabell…");

function addColumnIfNotExists(table, column, type) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, cols) => {
      if (err) return reject(err);

      const exists = cols.some(c => c.name === column);
      if (exists) {
        console.log(`✔ Kolonnen '${column}' finnes allerede.`);
        return resolve();
      }

      const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${type};`;
      db.run(sql, err => {
        if (err) return reject(err);
        console.log(`🆕 La til kolonnen '${column}' i tabellen '${table}'.`);
        resolve();
      });
    });
  });
}

(async () => {
  try {
    await addColumnIfNotExists("players", "photo_url", "TEXT");
    console.log("🎉 Ferdig!");
  } catch (e) {
    console.error("❌ Feil:", e);
  } finally {
    db.close();
  }
})();
