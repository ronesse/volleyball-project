const db = require("./db");

// Norske spillere hentet fra original index.html (norwegianPlayersAbroad)
const norwegianPlayers = [
  {
    teamSlug: "selver-tallinn-t357",
    name: "Mads Roness",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/mads-roness-p60414"
  },
  {
    teamSlug: "rio-duero-soria-t3694",
    name: "Mikal Kalstad",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/mikal-kalstad-p158538/clubs"
  },
  {
    teamSlug: "tourcoing-vlm-t248",
    name: "Eskil Engås",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/eskil-engs-p157395/clubs"
  },
  {
    teamSlug: "knack-roeselare-t1579",
    name: "Oskar Espeland",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/oskar-espeland-p44340/clubs"
  },
  {
    teamSlug: "prima-donna-kaas-huizen-t12094",
    name: "Samson Olsen",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/samson-olsen-p58498/clubs"
  },
  {
    teamSlug: "prima-donna-kaas-huizen-t12094",
    name: "Lars-Kristian Ekeland",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/lars-kristian-ekeland-p53712/clubs"
  },
  {
    teamSlug: "asv-elite-t4364",
    name: "Frithjof Moe Slinning",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/frithjof-moe-slinning-p158535/clubs"
  },
  {
    teamSlug: "nordenskov-uif-t6594",
    name: "Peder Senumstad",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/peder-senumstad-p177523/clubs"
  },
  {
    teamSlug: "bbts-bielsko-biala-t1358",
    name: "Jakob Solgaard Thelle",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/jakob-solgaard-thelle-p17581/clubs"
  },
  {
    teamSlug: "lycurgus-volleyball-t1292",
    name: "Jo Gladsøy Sunde",
    nationality: "Norge",
    position: null,
    jersey_number: null,
    external_url: "https://volleybox.net/jo-gladsy-sunde-p59716/clubs"
  }
];

// Hent team.id fra DB basert på slug (må matche slug i teams-seed)
function getTeamIdBySlug(slug) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM teams WHERE slug = ?", [slug], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve(row.id);
    });
  });
}

function insertPlayer(p, teamId) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO players (
        name, position, jersey_number,
        nationality, external_url, team_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      p.name,
      p.position,
      p.jersey_number,
      p.nationality,
      p.external_url,
      teamId
    ];
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

async function seedPlayers() {
  try {
    console.log("🧹 Sletter eksisterende spillere...");
    await new Promise((resolve, reject) =>
      db.run("DELETE FROM players", err => (err ? reject(err) : resolve()))
    );

    for (const p of norwegianPlayers) {
      const teamId = await getTeamIdBySlug(p.teamSlug);
      if (!teamId) {
        console.warn(`⚠️ Fant ikke lag i DB for slug '${p.teamSlug}' – hopper over ${p.name}`);
        continue;
      }
      await insertPlayer(p, teamId);
      console.log(`➕ La til spiller: ${p.name} (${p.teamSlug})`);
    }

    console.log("✅ Ferdig! Alle norske spillere fra original index.html er lagt inn.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Feil under seeding av spillere:", err);
    process.exit(1);
  }
}

seedPlayers();
