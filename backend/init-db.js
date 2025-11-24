const fs = require("fs");
const db = require("./db");

console.log("🔧 Leser schema.sql...");

const schema = fs.readFileSync("./backend/schema.sql", "utf8");

console.log("🔧 Kjører schema på volley.db...");

db.exec(schema, err => {
  if (err) {
    console.error("❌ Feil under initiering:", err);
  } else {
    console.log("✅ Database er opprettet/oppdatert!");
  }
  process.exit();
});
