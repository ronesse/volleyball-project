/* ===============================
   CONFIG / API HELPER
================================= */

const API_BASE = "/api";

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("API-feil: " + err);
  }

  return res.json();
}

/* ===============================
   SCROLL / RESET HELPERS
================================= */

function scrollToSection(id, focusId) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  setTimeout(() => document.getElementById(focusId).focus(), 200);
}

function resetTeamForm() {
  [
    "teamName",
    "teamCountry",
    "teamLeague",
    "teamGroup",
    "teamSofascoreId",
    "teamTournamentId",
    "teamSeasonId",
    "teamWidgetName",
    "teamSlug",
    "teamHomepageUrl",
    "teamStreamUrl",
  ].forEach(id => (document.getElementById(id).value = ""));

  editingTeamId = null;
  const btn = document.getElementById("teamSaveBtn");
  btn.textContent = "Lagre lag";
  btn.onclick = createTeam;
}

function resetPlayerForm() {
  [
    "playerName",
    "playerPosition",
    "playerNumber",
    "playerNationality",
    "playerUrl",
    "playerTeamSelect",
    "playerPhotoUrl",
    "playerYouthClub",
    "playerInstagram",
    "playerHeight",
    "playerBirthYear",
  ].forEach(id => (document.getElementById(id).value = ""));

  editingPlayerId = null;
  const btn = document.getElementById("playerSaveBtn");
  btn.textContent = "Lagre spiller";
  btn.onclick = createPlayer;
}

/* ===============================
   TEAM HANDLING
================================= */

let cachedTeams = [];
let editingTeamId = null;

/* ---------- RENDER TEAMS ---------- */

function renderTeamsTable(teams) {
  const wrapper = document.getElementById("teamsTableWrapper");

  const rows = teams
    .map(
      t => `
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
    </tr>`
    )
    .join("");

  wrapper.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Navn</th><th>Land</th><th>Liga</th><th>Gruppe</th><th>SofaScore</th><th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------- LOAD TEAMS ---------- */

async function loadTeams() {
  cachedTeams = await api("/teams");

  const select = document.getElementById("playerTeamSelect");
  select.innerHTML =
    `<option value="">(velg lag)</option>` +
    cachedTeams.map(t => `<option value="${t.id}">${t.name}</option>`).join("");

  renderTeamsTable(cachedTeams);
}

/* ---------- SEARCH TEAMS ---------- */

document.getElementById("teamSearchInput").oninput = () => {
  const q = document.getElementById("teamSearchInput").value.toLowerCase();

  const filtered = cachedTeams.filter(
    t =>
      t.name.toLowerCase().includes(q) ||
      (t.country || "").toLowerCase().includes(q) ||
      (t.league || "").toLowerCase().includes(q)
  );

  renderTeamsTable(filtered);
};

/* ---------- CREATE TEAM ---------- */

async function createTeam() {
  const body = {
    name: teamName.value.trim(),
    country: teamCountry.value.trim() || null,
    league: teamLeague.value.trim() || null,
    group_type: teamGroup.value.trim() || null,
    sofascore_team_id: Number(teamSofascoreId.value) || null,
    tournament_id: Number(teamTournamentId.value) || null,
    season_id: Number(teamSeasonId.value) || null,
    widget_name: teamWidgetName.value.trim() || null,
    slug: teamSlug.value.trim() || null,
    homepage_url: teamHomepageUrl.value.trim() || null,
    stream_url: teamStreamUrl.value.trim() || null,
  };

  if (!body.name) return alert("Lag må ha navn.");

  await api("/teams", { method: "POST", body: JSON.stringify(body) });

  resetTeamForm();
  loadTeams();
}

/* ---------- EDIT TEAM ---------- */

function editTeam(id) {
  const t = cachedTeams.find(x => x.id === id);
  if (!t) return;

  editingTeamId = id;

  teamName.value = t.name;
  teamCountry.value = t.country || "";
  teamLeague.value = t.league || "";
  teamGroup.value = t.group_type || "";
  teamSofascoreId.value = t.sofascore_team_id || "";
  teamTournamentId.value = t.tournament_id || "";
  teamSeasonId.value = t.season_id || "";
  teamWidgetName.value = t.widget_name || "";
  teamSlug.value = t.slug || "";
  teamHomepageUrl.value = t.homepage_url || "";
  teamStreamUrl.value = t.stream_url || "";

  const btn = document.getElementById("teamSaveBtn");
  btn.textContent = "Oppdater lag";
  btn.onclick = saveTeamChanges;

  scrollToSection("teamSection", "teamName");
}

/* ---------- SAVE TEAM ---------- */

async function saveTeamChanges() {
  const body = {
    name: teamName.value.trim(),
    country: teamCountry.value.trim() || null,
    league: teamLeague.value.trim() || null,
    group_type: teamGroup.value.trim() || null,
    sofascore_team_id: Number(teamSofascoreId.value) || null,
    tournament_id: Number(teamTournamentId.value) || null,
    season_id: Number(teamSeasonId.value) || null,
    widget_name: teamWidgetName.value.trim() || null,
    slug: teamSlug.value.trim() || null,
    homepage_url: teamHomepageUrl.value.trim() || null,
    stream_url: teamStreamUrl.value.trim() || null,
  };

  await api(`/teams/${editingTeamId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  resetTeamForm();
  loadTeams();
}

/* ---------- DELETE TEAM ---------- */

async function deleteTeam(id) {
  if (!confirm("Slette lag?")) return;
  await api(`/teams/${id}`, { method: "DELETE" });
  loadTeams();
}

/* ===============================
   PLAYER HANDLING
================================= */

let cachedPlayers = [];
let editingPlayerId = null;

/* ---------- RENDER PLAYERS ---------- */

function renderPlayersTable(players) {
  const wrapper = document.getElementById("playersTableWrapper");

  const rows = players
    .map(
      p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.position || ""}</td>
      <td>${p.jersey_number || ""}</td>
      <td>${p.nationality || ""}</td>
      <td>${p.team_name || ""}</td>
      <td>${p.youth_club || ""}</td>
      <td>${p.instagram || ""}</td>
      <td>${p.height_cm || ""}</td>
      <td>${p.birth_year || ""}</td>
      <td>${p.photo_url ? `<img src="${p.photo_url}" width="40">` : ""}</td>
      <td>
        <button class="small-btn" onclick="editPlayer(${p.id})">Rediger</button>
        <button class="small-btn" onclick="deletePlayer(${p.id})">Slett</button>
      </td>
    </tr>`
    )
    .join("");

  wrapper.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Navn</th><th>Pos</th><th>#</th><th>Nasj</th><th>Lag</th>
          <th>Moderklubb</th><th>Instagram</th><th>Høyde</th><th>Født</th><th>Bilde</th><th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------- LOAD PLAYERS ---------- */

async function loadPlayers() {
  cachedPlayers = await api("/players");
  renderPlayersTable(cachedPlayers);
}

/* ---------- SEARCH PLAYERS ---------- */

document.getElementById("playerSearchInput").oninput = () => {
  const q = playerSearchInput.value.toLowerCase();

  const filtered = cachedPlayers.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      (p.position || "").toLowerCase().includes(q) ||
      (p.nationality || "").toLowerCase().includes(q) ||
      (p.team_name || "").toLowerCase().includes(q) ||
      (p.youth_club || "").toLowerCase().includes(q) ||
      (p.instagram || "").toLowerCase().includes(q)
  );

  renderPlayersTable(filtered);
};

/* ---------- CREATE PLAYER ---------- */

async function createPlayer() {
  const body = {
    name: playerName.value.trim(),
    position: playerPosition.value.trim() || null,
    jersey_number: Number(playerNumber.value) || null,
    nationality: playerNationality.value.trim() || null,
    external_url: playerUrl.value.trim() || null,
    photo_url: playerPhotoUrl.value.trim() || null,
    team_id: playerTeamSelect.value || null,
    youth_club: playerYouthClub.value.trim() || null,
    instagram: playerInstagram.value.trim() || null,
    height_cm: Number(playerHeight.value) || null,
    birth_year: Number(playerBirthYear.value) || null,
  };

  if (!body.name) return alert("Spiller må ha navn.");

  await api("/players", { method: "POST", body: JSON.stringify(body) });

  resetPlayerForm();
  loadPlayers();
}

/* ---------- EDIT PLAYER ---------- */

function editPlayer(id) {
  const p = cachedPlayers.find(x => x.id === id);
  if (!p) return;

  editingPlayerId = id;

  playerName.value = p.name;
  playerPosition.value = p.position || "";
  playerNumber.value = p.jersey_number || "";
  playerNationality.value = p.nationality || "";
  playerUrl.value = p.external_url || "";
  playerTeamSelect.value = p.team_id || "";
  playerPhotoUrl.value = p.photo_url || "";
  playerYouthClub.value = p.youth_club || "";
  playerInstagram.value = p.instagram || "";
  playerHeight.value = p.height_cm || "";
  playerBirthYear.value = p.birth_year || "";

  const btn = document.getElementById("playerSaveBtn");
  btn.textContent = "Oppdater spiller";
  btn.onclick = savePlayerChanges;

  scrollToSection("playerSection", "playerName");
}

/* ---------- SAVE PLAYER ---------- */

async function savePlayerChanges() {
  const body = {
    name: playerName.value.trim(),
    position: playerPosition.value.trim() || null,
    jersey_number: Number(playerNumber.value) || null,
    nationality: playerNationality.value.trim() || null,
    external_url: playerUrl.value.trim() || null,
    photo_url: playerPhotoUrl.value.trim() || null,
    team_id: playerTeamSelect.value || null,
    youth_club: playerYouthClub.value.trim() || null,
    instagram: playerInstagram.value.trim() || null,
    height_cm: Number(playerHeight.value) || null,
    birth_year: Number(playerBirthYear.value) || null,
  };

  await api(`/players/${editingPlayerId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  resetPlayerForm();
  loadPlayers();
}

/* ---------- DELETE PLAYER ---------- */

async function deletePlayer(id) {
  if (!confirm("Slette spiller?")) return;
  await api(`/players/${id}`, { method: "DELETE" });
  loadPlayers();
}

/* ===============================
   INIT
================================= */

loadTeams();
loadPlayers();
