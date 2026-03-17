const state = {
  roomId: localStorage.getItem("roomId") || "",
  playerId: localStorage.getItem("playerId") || "",
};

const roomIdLabel = document.getElementById("roomIdLabel");
const playerIdLabel = document.getElementById("playerIdLabel");
const roleLabel = document.getElementById("roleLabel");
const wordLabel = document.getElementById("wordLabel");
const logEl = document.getElementById("log");

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

document.getElementById("createRoomBtn").addEventListener("click", async () => {
  try {
    const playerName = document.getElementById("playerName").value.trim();
    const data = await postJson("/create-room", { playerName });
    state.roomId = data.roomId;
    state.playerId = data.playerId;
    localStorage.setItem("roomId", state.roomId);
    localStorage.setItem("playerId", state.playerId);
    updateLabels();
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
    log("Rolle geladen.");
  } catch (err) {
    log(err.message);
  }
});

updateLabels();
