const db = require("./db");

const mizunoTeams = [
  {id:209298,name:"BK Tromsø",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:69089,seasonId:80635,widgetName:"Eliteserien 25/26",slug:"bk-troms-t2750"},
  {id:300612,name:"Koll IL",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:69089,seasonId:80635,widgetName:"Eliteserien 25/26",slug:"koll-il-t4374"},
  {id:300614,name:"Randaberg IL",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:69089,seasonId:80635,widgetName:"Eliteserien 25/26",slug:"randaberg-il-t3844"},
  {id:330453,name:"NTNUI VolleyballL",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:69089,seasonId:80635,widgetName:"Eliteserien 25/26",slug:"ntnui-t4372"},
  {id:43050,name:"TIF Viking Volleyball",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:40673,seasonId:78408,widgetName:"Eredivisie 25/26",slug:"tif-viking-t4766"},
  {id:79857,name:"Førde VBK",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:40673,seasonId:78408,widgetName:"Eredivisie 25/26",slug:"frde-vbk-t1503"},
  {id:300615,name:"Topp Volley Norge",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:40673,seasonId:78408,widgetName:"Eredivisie 25/26",slug:"toppvolley-norge-t4375"},
  {id:330456,name:"OSI Volleyball",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:40673,seasonId:78408,widgetName:"Eredivisie 25/26",slug:"osi-t4380"},
  {id:491538,name:"Øksil",league:"Mizunoligaen 🇳🇴",country:"Norge",tournamentId:40673,seasonId:78408,widgetName:"Eredivisie 25/26",slug:"oksil-t17005"}
];

const abroadTeams = [
  {id:458327,name:"Selver/TalTech",league:"Baltic Men Volleyball League 🇪🇪",country:"Estland",tournamentId:15103,seasonId:83205,widgetName:"Baltic League 25/26",slug:"selver-tallinn-t357"},
  {id:56111,name:"Trefl Gdańsk",league:"PlusLiga 🇵🇱",country:"Polen",tournamentId:3781,seasonId:81027,widgetName:"PlusLiga 25/26",slug:"trefl-gdansk-t1897"},
  {id:107699,name:"BBTS Bielsko-Biała",league:"1. Liga 🇵🇱",country:"Polen",tournamentId:48739,seasonId:81029,widgetName:"1. Liga 25/26",slug:"bbts-bielsko-biala-t1358"},
  {id:447293,name:"Prima Donna Kaas Huizen",league:"Eredivisie 🇳🇱",country:"Nederland",tournamentId:40673,seasonId:78408,widgetName:"Eredivisie 25/26",slug:"prima-donna-kaas-huizen-t12094"},
  {id:43341,name:"Lycurgus Groningen",league:"Eredivisie 🇳🇱",country:"Nederland",tournamentId:40673,seasonId:78408,widgetName:"Eredivisie 25/26",slug:"lycurgus-volleyball-t1292"},
  {id:25947,name:"Knack Roeselare",league:"Liga Heren 🇧🇪",country:"Belgia",tournamentId:2763,seasonId:78324,widgetName:"Liga Heren 25/26",slug:"knack-roeselare-t1579"},
  {id:209169,name:"Nordenskov UIF",league:"VolleyLigaen 🇩🇰",country:"Danmark",tournamentId:1978,seasonId:79997,widgetName:"VolleyLigaen 25/26",slug:"nordenskov-uif-t6594"},
  {id:183831,name:"ASV Århus",league:"VolleyLigaen 🇩🇰",country:"Danmark",tournamentId:1978,seasonId:79997,widgetName:"VolleyLigaen 25/26",slug:"asv-elite-t4364"},
  {id:44675,name:"Tourcoing VB Lille Métropole",league:"Ligue A 🇫🇷",country:"Frankrike",tournamentId:1712,seasonId:81689,widgetName:"Ligue A 25/26",slug:"tourcoing-vlm-t248"},
  {id:122228,name:"CDV Rio Duero Soria",league:"Superliga 🇪🇸",country:"Spania",tournamentId:871,seasonId:80600,widgetName:"Superliga 25/26",slug:"rio-duero-soria-t3694"}
];

function insertTeam(t, groupType) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO teams (
        name, country, league, group_type,
        sofascore_team_id, tournament_id, season_id,
        widget_name, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      t.name,
      t.country,
      t.league,
      groupType,
      t.id,              // sofascore_team_id
      t.tournamentId,
      t.seasonId,
      t.widgetName,
      t.slug
    ];

    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function seed() {
  console.log("🧹 Sletter eksisterende lag...");
  await new Promise((resolve, reject) =>
    db.run("DELETE FROM teams", err => (err ? reject(err) : resolve()))
  );

  console.log("➕ Legger inn Mizunoliga-lag...");
  for (const t of mizunoTeams) {
    await insertTeam(t, "mizuno");
  }

  console.log("➕ Legger inn utlands-lag...");
  for (const t of abroadTeams) {
    await insertTeam(t, "abroad");
  }

  console.log("✅ Ferdig! Alle lag er lagt inn.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Feil under seeding:", err);
  process.exit(1);
});