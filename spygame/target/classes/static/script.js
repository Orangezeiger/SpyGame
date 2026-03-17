const state = {
  roomId: localStorage.getItem("roomId") || "",
  playerId: localStorage.getItem("playerId") || "",
};

const roomIdLabel = document.getElementById("roomIdLabel");
const playerIdLabel = document.getElementById("playerIdLabel");
const roleLabel = document.getElementById("roleLabel");
const wordLabel = document.getElementById("wordLabel");
const logEl = document.getElementById("log");
const playersList = document.getElementById("playersList");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");

function updateLabels() {
  roomIdLabel.textContent = state.roomId || "-";
  playerIdLabel.textContent = state.playerId || "-";
}

function log(message) {
  const ts = new Date().toLocaleTimeString();
  logEl.textContent = `[${ts}] ${message}\n` + logEl.textContent;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Unbekannter Fehler");
  }
  return data;
}

async function refreshPlayers() {
  if (!state.roomId) {
    playersList.innerHTML = "";
    return;
  }
  try {
    const res = await fetch(`/room-players?roomId=${encodeURIComponent(state.roomId)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Unbekannter Fehler");
    }
    playersList.innerHTML = "";
    data.players.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = player.name;
      playersList.appendChild(li);
    });
  } catch (err) {
    log(err.message);
  }
}

function showLobby() {
  lobbyScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
}

function showGame() {
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

document.getElementById("createRoomBtn").addEventListener("click", async () => {
  try {
    const playerName = document.getElementById("playerName").value.trim();
    const data = await postJson("/create-room", { playerName });
    state.roomId = data.roomId;
    state.playerId = data.playerId;
    localStorage.setItem("roomId", state.roomId);
    localStorage.setItem("playerId", state.playerId);
    updateLabels();
    await refreshPlayers();
    log(`Raum erstellt: ${state.roomId}`);
  } catch (err) {
    log(err.message);
  }
});

document.getElementById("joinRoomBtn").addEventListener("click", async () => {
  try {
    const playerName = document.getElementById("playerName").value.trim();
    const roomId = document.getElementById("roomIdInput").value.trim();
    const data = await postJson("/join-room", { roomId, playerName });
    state.roomId = roomId;
    state.playerId = data.playerId;
    localStorage.setItem("roomId", state.roomId);
    localStorage.setItem("playerId", state.playerId);
    updateLabels();
    await refreshPlayers();
    log(`Raum beigetreten: ${roomId}`);
  } catch (err) {
    log(err.message);
  }
});

document.getElementById("startGameBtn").addEventListener("click", async () => {
  try {
    if (!state.roomId) {
      log("Erst Raum erstellen oder beitreten.");
      return;
    }
    await postJson("/start-game", { roomId: state.roomId });
    showGame();
    log("Spiel gestartet.");
  } catch (err) {
    log(err.message);
  }
});

document.getElementById("showRoleBtn").addEventListener("click", async () => {
  try {
    if (!state.playerId) {
      log("Erst Raum erstellen oder beitreten.");
      return;
    }
    const res = await fetch(`/role?playerId=${encodeURIComponent(state.playerId)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Unbekannter Fehler");
    }
    roleLabel.textContent = data.role === "SPY" ? "SPY" : "SPIELER";
    wordLabel.textContent = data.role === "SPY" ? "Kein Wort. Du bist der Spy." : `Wort: ${data.word}`;
    showGame();
    log("Rolle geladen.");
  } catch (err) {
    log(err.message);
  }
});

document.getElementById("backToLobbyBtn").addEventListener("click", () => {
  showLobby();
});

updateLabels();
refreshPlayers();
setInterval(refreshPlayers, 3000);
