const storage = window.sessionStorage;

const state = {
  roomId: storage.getItem("roomId") || "",
  playerId: storage.getItem("playerId") || "",
  playerName: storage.getItem("playerName") || "",
  screen: "setup",
  roomPollHandle: null,
  timerHandle: null,
  gameDurationSeconds: 8 * 60,
  startedAtEpochMillis: 0,
  roleLoaded: false,
};

const setupScreen = document.getElementById("setupScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const roomIdLabel = document.getElementById("roomIdLabel");
const roomCodeLarge = document.getElementById("roomCodeLarge");
const hostLabel = document.getElementById("hostLabel");
const lobbyStateText = document.getElementById("lobbyStateText");
const roleLabel = document.getElementById("roleLabel");
const wordLabel = document.getElementById("wordLabel");
const timerLabel = document.getElementById("timerLabel");
const logEl = document.getElementById("log");
const playersList = document.getElementById("playersList");
const startGameBtn = document.getElementById("startGameBtn");
const createPlayerNameInput = document.getElementById("createPlayerName");
const joinPlayerNameInput = document.getElementById("joinPlayerName");
const roomIdInput = document.getElementById("roomIdInput");

function log(message) {
  const ts = new Date().toLocaleTimeString();
  logEl.textContent = `[${ts}] ${message}\n${logEl.textContent}`;
}

function persistSession() {
  storage.setItem("roomId", state.roomId);
  storage.setItem("playerId", state.playerId);
  storage.setItem("playerName", state.playerName);
}

function clearSession() {
  storage.removeItem("roomId");
  storage.removeItem("playerId");
  storage.removeItem("playerName");
}

function updateRoomLabels() {
  roomIdLabel.textContent = state.roomId || "-";
  roomCodeLarge.textContent = state.roomId || "------";
}

function sanitizeRoomId(value) {
  return value.replace(/\D/g, "").slice(0, 6);
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

async function postWithoutBody(url) {
  const res = await fetch(url, { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Unbekannter Fehler");
  }
  return data;
}

function showSetup() {
  setupScreen.classList.remove("hidden");
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  state.screen = "setup";
  stopRoomPolling();
  stopTimer();
}

function showLobby() {
  setupScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  state.screen = "lobby";
  startRoomPolling();
}

function showGame() {
  setupScreen.classList.add("hidden");
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  state.screen = "game";
  startRoomPolling();
}

function renderPlayers(players, hostPlayerId) {
  playersList.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    const parts = [player.name];
    if (player.id === state.playerId) {
      parts.push("(du)");
    }
    if (player.id === hostPlayerId) {
      parts.push("Host");
    }
    li.textContent = parts.join(" - ");
    if (player.id === hostPlayerId) {
      li.classList.add("host-player");
    }
    playersList.appendChild(li);
  });
}

async function fetchRole() {
  const res = await fetch(`/role?playerId=${encodeURIComponent(state.playerId)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Unbekannter Fehler");
  }
  roleLabel.textContent = data.role === "SPY" ? "Du bist der SPY" : "Du bist ein normaler Spieler";
  wordLabel.textContent = data.role === "SPY" ? "Du bekommst kein Wort. Bleib cool und bluff dich durch." : `Dein Wort: ${data.word}`;
  state.roleLoaded = true;
}

function updateTimerFromStart() {
  if (!state.startedAtEpochMillis) {
    timerLabel.textContent = "08:00";
    return;
  }
  const elapsedSeconds = Math.floor((Date.now() - state.startedAtEpochMillis) / 1000);
  const remaining = Math.max(0, state.gameDurationSeconds - elapsedSeconds);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  timerLabel.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (remaining === 0) {
    stopTimer();
    lobbyStateText.textContent = "Zeit abgelaufen. Ihr koennt eine neue Runde starten.";
  }
}

function startTimer() {
  stopTimer();
  updateTimerFromStart();
  state.timerHandle = setInterval(updateTimerFromStart, 1000);
}

function stopTimer() {
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

async function syncRoomState() {
  if (!state.roomId || !state.playerId) {
    return;
  }

  const res = await fetch(
    `/room-state?roomId=${encodeURIComponent(state.roomId)}&playerId=${encodeURIComponent(state.playerId)}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Unbekannter Fehler");
  }

  updateRoomLabels();
  renderPlayers(data.players, data.hostPlayerId);
  hostLabel.textContent = data.host ? "Host" : "Spieler";
  startGameBtn.disabled = !data.host;
  startGameBtn.textContent = data.host ? "Spiel starten" : "Nur Host kann starten";
  lobbyStateText.textContent = data.started
    ? "Spiel startet gerade fuer alle Spieler..."
    : data.host
      ? "Du bist Host. Starte, sobald genug Spieler da sind."
      : "Warte, bis der Host das Spiel startet.";

  if (data.started) {
    state.startedAtEpochMillis = data.startedAtEpochMillis;
    state.gameDurationSeconds = data.gameDurationSeconds;
    if (state.screen !== "game") {
      showGame();
      log("Das Spiel wurde gestartet. Du bist jetzt im Spielraum.");
    }
    if (!state.roleLoaded) {
      await fetchRole();
    }
    startTimer();
  } else {
    state.roleLoaded = false;
    roleLabel.textContent = "Noch keine Rolle.";
    wordLabel.textContent = "";
    if (state.screen !== "lobby") {
      showLobby();
    }
  }
}

function startRoomPolling() {
  if (state.roomPollHandle || !state.roomId || !state.playerId) {
    return;
  }
  syncRoomState().catch(handleRoomStateError);
  state.roomPollHandle = setInterval(() => {
    syncRoomState().catch(handleRoomStateError);
  }, 2000);
}

function stopRoomPolling() {
  if (state.roomPollHandle) {
    clearInterval(state.roomPollHandle);
    state.roomPollHandle = null;
  }
}

function resetToSetup(reason) {
  state.roomId = "";
  state.playerId = "";
  state.playerName = "";
  state.startedAtEpochMillis = 0;
  state.roleLoaded = false;
  clearSession();
  updateRoomLabels();
  playersList.innerHTML = "";
  roleLabel.textContent = "Noch keine Rolle.";
  wordLabel.textContent = "";
  showSetup();
  if (reason) {
    log(reason);
  }
}

function handleRoomStateError(error) {
  stopRoomPolling();
  if (String(error.message).includes("Room not found") || String(error.message).includes("Player not found")) {
    resetToSetup("Die Lobby existiert nicht mehr oder dein Spieler wurde entfernt.");
    return;
  }
  log(error.message);
}

async function leaveCurrentRoom() {
  if (state.playerId) {
    try {
      await postWithoutBody(`/leave-room?playerId=${encodeURIComponent(state.playerId)}`);
    } catch (error) {
      log(error.message);
    }
  }
  resetToSetup("Du hast die Lobby verlassen.");
}

async function copyRoomId() {
  if (!state.roomId) {
    return;
  }
  try {
    await navigator.clipboard.writeText(state.roomId);
    log(`Lobby-Nummer ${state.roomId} kopiert.`);
  } catch (error) {
    log("Kopieren nicht moeglich.");
  }
}

document.getElementById("createRoomBtn").addEventListener("click", async () => {
  try {
    const playerName = createPlayerNameInput.value.trim();
    const data = await postJson("/create-room", { playerName });
    state.roomId = data.roomId;
    state.playerId = data.playerId;
    state.playerName = playerName;
    state.roleLoaded = false;
    persistSession();
    updateRoomLabels();
    showLobby();
    log(`Lobby ${state.roomId} erstellt. Du bist der Host.`);
  } catch (error) {
    log(error.message);
  }
});

document.getElementById("joinRoomBtn").addEventListener("click", async () => {
  try {
    const playerName = joinPlayerNameInput.value.trim();
    const roomId = sanitizeRoomId(roomIdInput.value.trim());
    roomIdInput.value = roomId;
    const data = await postJson("/join-room", { roomId, playerName });
    state.roomId = data.roomId;
    state.playerId = data.playerId;
    state.playerName = playerName;
    state.roleLoaded = false;
    persistSession();
    updateRoomLabels();
    showLobby();
    log(`Lobby ${state.roomId} beigetreten.`);
  } catch (error) {
    log(error.message);
  }
});

document.getElementById("startGameBtn").addEventListener("click", async () => {
  try {
    if (!state.roomId || !state.playerId) {
      log("Erstelle zuerst eine Lobby oder tritt einer bei.");
      return;
    }
    await postJson("/start-game", { roomId: state.roomId, playerId: state.playerId });
    await syncRoomState();
    log("Spiel wurde gestartet.");
  } catch (error) {
    log(error.message);
  }
});

document.getElementById("leaveRoomBtn").addEventListener("click", leaveCurrentRoom);
document.getElementById("leaveRoomBtnGame").addEventListener("click", leaveCurrentRoom);
document.getElementById("copyRoomBtn").addEventListener("click", copyRoomId);
document.getElementById("copyRoomBtnGame").addEventListener("click", copyRoomId);
document.getElementById("refreshLobbyBtn").addEventListener("click", () => {
  syncRoomState().catch(handleRoomStateError);
});
document.getElementById("restartTimerBtn").addEventListener("click", () => {
  if (!state.startedAtEpochMillis) {
    return;
  }
  startTimer();
  log("Timer lokal neu synchronisiert.");
});
roomIdInput.addEventListener("input", () => {
  roomIdInput.value = sanitizeRoomId(roomIdInput.value);
});

updateRoomLabels();
if (state.roomId && state.playerId) {
  showLobby();
} else {
  showSetup();
}
