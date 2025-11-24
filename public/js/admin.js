const API_BASE = "/api";

/* ------------------------------------------------
   HJELPEFUNKSJONER
--------------------------------------------------- */

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API-feil: ${res.status} ${txt}`);
  }
  return res.json();
}

/* ------------------------------------------------
   LAST LAG
--------------------------------------------------- */

let editingTeamId = null;

async function loadTeams() {
  const teams = await api("/teams");
  const select = document.getElementById("playerTeamSelect");
  const wrapper = document.getElementById("teamsTableWrapper");

  // dropdown
  select.innerHTML = `<option value="">(ingen)</option>` +
    teams.map(t => `<option value="${t.id}">${t.name}</option>`).join("");

  if (!teams.length) {
    wrapper.innerHTML = "<p>Ingen lag i databasen ennå.</p>";
    return;
  }

  const rows = teams.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.name}</td>
      <td>${t.country || ""}</td>
      <td>${t.league || ""}</td>
      <td>${t.group_type || ""}</td>
      <td>${t.sofascore_team_id || ""}</td>
      <td>
        <button class="small-btn" onclick="editTeam(${t.id})">Rediger</button>
        <button class="small-btn" onclick="deleteTeam(${t.id})">Slett</button>
      </td>
    </tr>
  `).join("");

  wrapper.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Navn</th><th>Land</th><th>Liga</th>
          <th>Gruppe</th><th>SofaScore-id</th><th>Handling</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ------------------------------------------------
   OPPRETT LAG
--------------------------------------------------- */

async function createTeam() {
  const body = {
    name: document.getElementById("teamName").value.trim(),
    country: document.getElementById("teamCountry").value.trim() || null,
    league: document.getElementById("teamLeague").value.trim() || null,
    group_type: document.getElementById("teamGroup").value.trim() || null,
    sofascore_team_id: Number(document.getElementById("teamSofascoreId").value) || null,
    tournament_id: Number(document.getElementById("teamTournamentId").value) || null,
    season_id: Number(document.getElementById("teamSeasonId").value) || null,
    widget_name: document.getElementById("teamWidgetName").value.trim() || null,
    slug: document.getElementById("teamSlug").value.trim() || null,
    homepage_url: document.getElementById("teamHomepageUrl").value.trim() || null,
    stream_url: document.getElementById("teamStreamUrl").value.trim() || null
  };

  if (!body.name) {
    alert("Navn er påkrevd.");
    return;
  }

  try {
    await api("/teams", {
      method: "POST",
      body: JSON.stringify(body)
    });

    alert("Lag opprettet.");
    await loadTeams();
  } catch (e) {
    console.error(e);
    alert("Feil ved opprettelse av lag.");
  }
}

/* ------------------------------------------------
   REDIGER LAG
--------------------------------------------------- */

async function editTeam(id) {
  const teams = await api("/teams");
  const t = teams.find(x => x.id === id);
  if (!t) return alert("Fant ikke laget.");

  editingTeamId = id;

  // fyll inn feltene
  document.getElementById("teamName").value = t.name || "";
  document.getElementById("teamCountry").value = t.country || "";
  document.getElementById("teamLeague").value = t.league || "";
  document.getElementById("teamGroup").value = t.group_type || "";
  document.getElementById("teamSofascoreId").value = t.sofascore_team_id || "";
  document.getElementById("teamTournamentId").value = t.tournament_id || "";
  document.getElementById("teamSeasonId").value = t.season_id || "";
  document.getElementById("teamWidgetName").value = t.widget_name || "";
  document.getElementById("teamSlug").value = t.slug || "";
  document.getElementById("teamHomepageUrl").value = t.homepage_url || "";
  document.getElementById("teamStreamUrl").value = t.stream_url || "";

  const btn = document.querySelector("button[onclick='createTeam()']");
  btn.innerText = "Oppdater lag";
  btn.onclick = saveTeamChanges;
}

async function saveTeamChanges() {
  if (!editingTeamId) return;

  const body = {
    name: document.getElementById("teamName").value.trim(),
    country: document.getElementById("teamCountry").value.trim() || null,
    league: document.getElementById("teamLeague").value.trim() || null,
    group_type: document.getElementById("teamGroup").value.trim() || null,
    sofascore_team_id: Number(document.getElementById("teamSofascoreId").value) || null,
    tournament_id: Number(document.getElementById("teamTournamentId").value) || null,
    season_id: Number(document.getElementById("teamSeasonId").value) || null,
    widget_name: document.getElementById("teamWidgetName").value.trim() || null,
    slug: document.getElementById("teamSlug").value.trim() || null,
    homepage_url: document.getElementById("teamHomepageUrl").value.trim() || null,
    stream_url: document.getElementById("teamStreamUrl").value.trim() || null
  };

  try {
    await api(`/teams/${editingTeamId}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });

    alert("Lag oppdatert.");

    // reset
    editingTeamId = null;
    const btn = document.querySelector("button[onclick='saveTeamChanges()']");
    btn.innerText = "Lagre lag";
    btn.onclick = createTeam;

    document.querySelectorAll("input").forEach(i => i.value = "");

    await loadTeams();
  } catch (e) {
    console.error(e);
    alert("Feil ved oppdatering av lag.");
  }
}

/* ------------------------------------------------
   SLETT LAG
--------------------------------------------------- */

async function deleteTeam(id) {
  if (!confirm("Slette dette laget?")) return;
  try {
    await api(`/teams/${id}`, { method: "DELETE" });
    await loadTeams();
  } catch (e) {
    console.error(e);
    alert("Feil ved sletting av lag.");
  }
}

/* ------------------------------------------------
   SPILLERE
--------------------------------------------------- */

let editingPlayerId = null;

async function loadPlayers() {
  const players = await api("/players");
  const wrapper = document.getElementById("playersTableWrapper");

  if (!players.length) {
    wrapper.innerHTML = "<p>Ingen spillere i databasen ennå.</p>";
    return;
  }

  const rows = players.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.position || ""}</td>
        <td>${p.jersey_number || ""}</td>
        <td>${p.nationality || ""}</td>
        <td>${p.team_name || ""}</td>
        <td>${p.external_url ? `<a href="${p.external_url}" target="_blank">Lenke</a>` : ""}</td>
        <td>${p.photo_url ? `<img src="${p.photo_url}" style="width:40px;border-radius:6px;">` : ""}</td>
        <td>
          <button class="small-btn" onclick="editPlayer(${p.id})">Rediger</button>
          <button class="small-btn" onclick="deletePlayer(${p.id})">Slett</button>
        </td>
      </tr>
    `).join("");

  wrapper.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Navn</th><th>Posisjon</th><th>#</th>
          <th>Nasjonalitet</th><th>Lag</th><th>Lenke</th><th>Bilde</th><th>Handling</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ------------------------------------------------
   OPPRETT SPILLER
--------------------------------------------------- */

async function createPlayer() {
  const body = {
    name: document.getElementById("playerName").value.trim(),
    position: document.getElementById("playerPosition").value.trim() || null,
    jersey_number: Number(document.getElementById("playerNumber").value) || null,
    nationality: document.getElementById("playerNationality").value.trim() || null,
    external_url: document.getElementById("playerUrl").value.trim() || null,
    team_id: document.getElementById("playerTeamSelect").value || null,
    photo_url: document.getElementById("playerPhotoUrl").value.trim() || null
  };

  if (!body.name) {
    alert("Navn er påkrevd.");
    return;
  }

  try {
    await api("/players", {
      method: "POST",
      body: JSON.stringify(body)
    });

    alert("Spiller opprettet.");
    await loadPlayers();
  } catch (e) {
    console.error(e);
    alert("Feil ved opprettelse av spiller.");
  }
}

/* ------------------------------------------------
   REDIGER SPILLER
--------------------------------------------------- */

async function editPlayer(id) {
  const players = await api("/players");
  const p = players.find(x => x.id === id);
  if (!p) return alert("Fant ikke spilleren.");

  editingPlayerId = id;

  document.getElementById("playerName").value = p.name || "";
  document.getElementById("playerPosition").value = p.position || "";
  document.getElementById("playerNumber").value = p.jersey_number || "";
  document.getElementById("playerNationality").value = p.nationality || "";
  document.getElementById("playerUrl").value = p.external_url || "";
  document.getElementById("playerTeamSelect").value = p.team_id || "";
  document.getElementById("playerPhotoUrl").value = p.photo_url || "";

  const btn = document.querySelector("button[onclick='createPlayer()']");
  btn.innerText = "Oppdater spiller";
  btn.onclick = savePlayerChanges;
}

async function savePlayerChanges() {
  if (!editingPlayerId) return;

  const body = {
    name: document.getElementById("playerName").value.trim(),
    position: document.getElementById("playerPosition").value.trim() || null,
    jersey_number: Number(document.getElementById("playerNumber").value) || null,
    nationality: document.getElementById("playerNationality").value.trim() || null,
    external_url: document.getElementById("playerUrl").value.trim() || null,
    team_id: document.getElementById("playerTeamSelect").value || null,
    photo_url: document.getElementById("playerPhotoUrl").value.trim() || null
  };

  try {
    await api(`/players/${editingPlayerId}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });

    alert("Spiller oppdatert.");

    editingPlayerId = null;
    const btn = document.querySelector("button[onclick='savePlayerChanges()']");
    btn.innerText = "Lagre spiller";
    btn.onclick = createPlayer;

    document.getElementById("playerName").value = "";
    document.getElementById("playerPosition").value = "";
    document.getElementById("playerNumber").value = "";
    document.getElementById("playerNationality").value = "";
    document.getElementById("playerUrl").value = "";
    document.getElementById("playerTeamSelect").value = "";
    document.getElementById("playerPhotoUrl").value = "";

    await loadPlayers();
  } catch (e) {
    console.error(e);
    alert("Feil ved oppdatering av spiller.");
  }
}

/* ------------------------------------------------
   SLETT SPILLER
--------------------------------------------------- */

async function deletePlayer(id) {
  if (!confirm("Slette denne spilleren?")) return;
  try {
    await api(`/players/${id}`, { method: "DELETE" });
    await loadPlayers();
  } catch (e) {
    console.error(e);
    alert("Feil ved sletting av spiller.");
  }
}

/* ------------------------------------------------
   INIT → last lag og spillere
--------------------------------------------------- */

(async function init() {
  try {
    await loadTeams();
    await loadPlayers();
  } catch (e) {
    console.error(e);
    alert("Kunne ikke laste data fra API-et. Er serveren startet?");
  }
})();
