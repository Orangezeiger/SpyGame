const state = {
  roomId: localStorage.getItem("roomId") || "",
  playerId: localStorage.getItem("playerId") || "",
  screen: "setup",
  pollHandle: null,
  timerHandle: null,
  timerSeconds: 8 * 60,
};

const roomIdLabel = document.getElementById("roomIdLabel");
const playerIdLabel = document.getElementById("playerIdLabel");
const roleLabel = document.getElementById("roleLabel");
const wordLabel = document.getElementById("wordLabel");
const logEl = document.getElementById("log");
const playersList = document.getElementById("playersList");
const setupScreen = document.getElementById("setupScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const timerLabel = document.getElementById("timerLabel");

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
    stopPolling();
    log(`Lobby-Update gestoppt: ${err.message}`);
  }
}

function showSetup() {
  setupScreen.classList.remove("hidden");
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  state.screen = "setup";
}

function showLobby() {
  setupScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  state.screen = "lobby";
  startPolling();
}

function showGame() {
  setupScreen.classList.add("hidden");
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  state.screen = "game";
  stopPolling();
}

function startPolling() {
  if (state.pollHandle || !state.roomId) return;
  refreshPlayers();
  state.pollHandle = setInterval(refreshPlayers, 3000);
}

function stopPolling() {
  if (state.pollHandle) {
    clearInterval(state.pollHandle);
    state.pollHandle = null;
  }
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerLabel() {
  timerLabel.textContent = formatTime(state.timerSeconds);
}

function startTimer() {
  stopTimer();
  updateTimerLabel();
  state.timerHandle = setInterval(() => {
    if (state.timerSeconds <= 0) {
      stopTimer();
      log("Timer abgelaufen.");
      return;
    }
    state.timerSeconds -= 1;
    updateTimerLabel();
  }, 1000);
}

function stopTimer() {
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

function resetTimer() {
  state.timerSeconds = 8 * 60;
  startTimer();
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
    showLobby();
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
    showLobby();
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
    resetTimer();
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
    resetTimer();
    log("Rolle geladen.");
  } catch (err) {
    log(err.message);
  }
});

document.getElementById("backToLobbyBtn").addEventListener("click", () => {
  showLobby();
  stopTimer();
});

document.getElementById("restartTimerBtn").addEventListener("click", () => {
  resetTimer();
  log("Timer neu gestartet.");
});

document.getElementById("leaveRoomBtn").addEventListener("click", () => {
  state.roomId = "";
  state.playerId = "";
  localStorage.removeItem("roomId");
  localStorage.removeItem("playerId");
  updateLabels();
  stopPolling();
  stopTimer();
  showSetup();
  log("Raum verlassen.");
});

updateLabels();
if (state.roomId && state.playerId) {
  showLobby();
} else {
  showSetup();
}
updateTimerLabel();
