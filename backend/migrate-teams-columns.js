const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "volley.db");
const db = new sqlite3.Database(dbPath);

console.log("🔍 Starter migrering av teams-tabellen...");

function addColumnIfNotExists(table, column, type) {
  return new Promise((resolve, reject) => {
    db.get(`PRAGMA table_info(${table});`, (err, row) => {
      if (err) return reject(err);

      db.all(`PRAGMA table_info(${table});`, (err, columns) => {
        if (err) return reject(err);

        const exists = columns.some(col => col.name === column);

        if (exists) {
          console.log(`✔ Kolonnen '${column}' finnes allerede. Hopper over.`);
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
  });
}

(async () => {
  try {
    await addColumnIfNotExists("teams", "homepage_url", "TEXT");
    await addColumnIfNotExists("teams", "stream_url", "TEXT");

    console.log("\n🎉 Migrering fullført!\n");
  } catch (err) {
    console.error("❌ Feil under migrering:", err);
  } finally {
    db.close();
  }
})();
