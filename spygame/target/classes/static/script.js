const storage = window.sessionStorage;

const state = {
  roomId: storage.getItem("roomId") || "",
  playerId: storage.getItem("playerId") || "",
  playerName: storage.getItem("playerName") || "",
  userId: storage.getItem("userId") || "",
  userEmail: storage.getItem("userEmail") || "",
  username: storage.getItem("username") || "",
  screen: "setup",
  roomPollHandle: null,
  timerHandle: null,
  gameDurationSeconds: 8 * 60,
  startedAtEpochMillis: 0,
  roleLoaded: false,
  categories: [],
};

const setupScreen = document.getElementById("setupScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const accountMenuBtn = document.getElementById("accountMenuBtn");
const accountDropdown = document.getElementById("accountDropdown");
const accountInitial = document.getElementById("accountInitial");
const accountGuestIcon = document.getElementById("accountGuestIcon");
const roomIdLabel = document.getElementById("roomIdLabel");
const roomCodeLarge = document.getElementById("roomCodeLarge");
const gameRoomCode = document.getElementById("gameRoomCode");
const hostLabel = document.getElementById("hostLabel");
const lobbyStateText = document.getElementById("lobbyStateText");
const roleLabel = document.getElementById("roleLabel");
const wordLabel = document.getElementById("wordLabel");
const timerLabel = document.getElementById("timerLabel");
const settingsHint = document.getElementById("settingsHint");
const authStatus = document.getElementById("authStatus");
const customCategoryHint = document.getElementById("customCategoryHint");
const logEl = document.getElementById("log");
const playersList = document.getElementById("playersList");
const startGameBtn = document.getElementById("startGameBtn");
const createPlayerNameInput = document.getElementById("createPlayerName");
const joinPlayerNameInput = document.getElementById("joinPlayerName");
const roomIdInput = document.getElementById("roomIdInput");
const minutesSelect = document.getElementById("minutesSelect");
const imposterSelect = document.getElementById("imposterSelect");
const categorySelect = document.getElementById("categorySelect");
const categoryStatus = document.getElementById("categoryStatus");
const registerUsernameInput = document.getElementById("registerUsername");
const registerEmailInput = document.getElementById("registerEmail");
const registerPasswordInput = document.getElementById("registerPassword");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const createCategoryNameInput = document.getElementById("customCategoryName");
const createCategoryWordsInput = document.getElementById("customCategoryWords");
const logoutBtn = document.getElementById("logoutBtn");
const createCategoryBtn = document.getElementById("createCategoryBtn");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const openLoginModalBtn = document.getElementById("openLoginModalBtn");
const openRegisterModalBtn = document.getElementById("openRegisterModalBtn");

function log(message) {
  const ts = new Date().toLocaleTimeString();
  logEl.textContent = `[${ts}] ${message}\n${logEl.textContent}`;
}

function persistSession() {
  storage.setItem("roomId", state.roomId);
  storage.setItem("playerId", state.playerId);
  storage.setItem("playerName", state.playerName);
  storage.setItem("userId", state.userId);
  storage.setItem("userEmail", state.userEmail);
  storage.setItem("username", state.username);
}

function clearSession() {
  storage.removeItem("roomId");
  storage.removeItem("playerId");
  storage.removeItem("playerName");
  storage.removeItem("userId");
  storage.removeItem("userEmail");
  storage.removeItem("username");
}

function updateRoomLabels() {
  roomIdLabel.textContent = state.roomId || "-";
  roomCodeLarge.textContent = state.roomId || "------";
  gameRoomCode.textContent = state.roomId || "------";
}

function updateAuthUi() {
  const loggedIn = Boolean(state.userId);
  authStatus.textContent = loggedIn
    ? `Angemeldet als ${state.username} (${state.userEmail})`
    : "Noch nicht angemeldet.";
  accountInitial.textContent = loggedIn ? state.username.charAt(0).toUpperCase() : "";
  accountInitial.classList.toggle("hidden", !loggedIn);
  accountGuestIcon.classList.toggle("hidden", loggedIn);
  customCategoryHint.textContent = loggedIn
    ? "Deine Kategorie wird zu deinen Standardkategorien hinzugefuegt und ist direkt im Warteraum auswählbar."
    : "Melde dich an, um eigene Kategorien mit eigenen Wörtern zu speichern.";
  logoutBtn.classList.toggle("hidden", !loggedIn);
  openLoginModalBtn.classList.toggle("hidden", loggedIn);
  openRegisterModalBtn.classList.toggle("hidden", loggedIn);
  createCategoryBtn.disabled = !loggedIn;
  if (loggedIn && !createPlayerNameInput.value.trim()) {
    createPlayerNameInput.value = state.username;
  }
  if (loggedIn && !joinPlayerNameInput.value.trim()) {
    joinPlayerNameInput.value = state.username;
  }
}

function openModal(modal) {
  clearAuthErrors();
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

function closeAllModals() {
  closeModal(loginModal);
  closeModal(registerModal);
  clearAuthErrors();
}

function setAuthError(target, message) {
  target.textContent = message;
  target.classList.remove("hidden");
}

function clearAuthErrors() {
  loginError.textContent = "";
  registerError.textContent = "";
  loginError.classList.add("hidden");
  registerError.classList.add("hidden");
}

function toggleAccountDropdown(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean"
    ? forceOpen
    : accountDropdown.classList.contains("hidden");
  accountDropdown.classList.toggle("hidden", !shouldOpen);
}

function sanitizeRoomId(value) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function splitWords(value) {
  return value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function clampImposterOptions(maxImposterCount, selectedCount) {
  Array.from(imposterSelect.options).forEach((option) => {
    const optionValue = Number(option.value);
    option.disabled = optionValue > maxImposterCount;
  });
  imposterSelect.value = String(Math.min(selectedCount, maxImposterCount));
}

function renderCategoryOptions(selectedCategoryId, selectedCategoryName) {
  categorySelect.innerHTML = "";

  const standardOption = document.createElement("option");
  standardOption.value = "0";
  standardOption.textContent = "Standard-Wortpool";
  categorySelect.appendChild(standardOption);

  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = String(category.id);
    option.textContent = category.defaultCategory ? category.name : `${category.name} (deins)`;
    categorySelect.appendChild(option);
  });

  if (selectedCategoryId && state.categories.some((category) => category.id === selectedCategoryId)) {
    categorySelect.value = String(selectedCategoryId);
    categoryStatus.textContent = selectedCategoryName || "Eigene Kategorie";
  } else {
    categorySelect.value = "0";
    categoryStatus.textContent = selectedCategoryName || "Standard-Wortpool";
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Unbekannter Fehler");
  }
  return data;
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

async function loadCategories() {
  const suffix = state.userId ? `?userId=${encodeURIComponent(state.userId)}` : "";
  state.categories = await fetchJson(`/categories${suffix}`);
  renderCategoryOptions(null, null);
}

async function updateRoomSettings(overrides = {}) {
  if (!state.roomId || !state.playerId) {
    return;
  }
  return postJson("/room-settings", {
    roomId: state.roomId,
    playerId: state.playerId,
    gameDurationMinutes: overrides.gameDurationMinutes ?? Number(minutesSelect.value),
    imposterCount: overrides.imposterCount ?? Number(imposterSelect.value),
    categoryId: overrides.categoryId ?? Number(categorySelect.value),
  });
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
  const data = await fetchJson(`/role?playerId=${encodeURIComponent(state.playerId)}`);
  roleLabel.textContent = data.role === "SPY" ? "Du bist der SPY" : "Du bist ein normaler Spieler";
  wordLabel.textContent = data.role === "SPY"
    ? "Du bekommst kein Wort. Bleib cool und bluff dich durch."
    : `Dein Wort: ${data.word}`;
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

  const data = await fetchJson(
    `/room-state?roomId=${encodeURIComponent(state.roomId)}&playerId=${encodeURIComponent(state.playerId)}`
  );

  updateRoomLabels();
  renderPlayers(data.players, data.hostPlayerId);
  hostLabel.textContent = data.host ? "Host" : "Spieler";
  minutesSelect.value = String(data.gameDurationMinutes);
  clampImposterOptions(data.maxImposterCount, data.imposterCount);
  minutesSelect.disabled = !data.host || data.started;
  imposterSelect.disabled = !data.host || data.started;
  categorySelect.disabled = !data.host || data.started;
  renderCategoryOptions(data.selectedCategoryId, data.selectedCategoryName);
  settingsHint.textContent = `Mindestens ${data.minPlayersToStart} Spieler. Aktuell sind ${data.players.length} da. Maximal ${data.maxImposterCount} Imposter moeglich.`;
  startGameBtn.disabled = !data.host || data.players.length < data.minPlayersToStart;
  startGameBtn.textContent = !data.host
    ? "Nur Host kann starten"
    : data.players.length < data.minPlayersToStart
      ? `Noch ${data.minPlayersToStart - data.players.length} Spieler fehlen`
      : "Spiel starten";
  lobbyStateText.textContent = data.started
    ? `Spiel startet gerade fuer alle Spieler... Kategorie: ${data.selectedCategoryName || "Standard-Wortpool"}`
    : data.host
      ? "Du bist Host. Stelle Dauer, Imposter und Kategorie ein und starte, sobald genug Spieler da sind."
      : `Warte, bis der Host das Spiel startet. Kategorie: ${data.selectedCategoryName || "Standard-Wortpool"}`;

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
  }, 2500);
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
  persistSession();
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

function syncPlayerNameInputs() {
  if (state.username) {
    createPlayerNameInput.value = state.username;
    joinPlayerNameInput.value = state.username;
  }
}

async function handleAuthResponse(promise, successMessage) {
  const user = await promise;
  state.userId = String(user.id);
  state.userEmail = user.email;
  state.username = user.username;
  updateAuthUi();
  syncPlayerNameInputs();
  persistSession();
  await loadCategories();
  closeAllModals();
  toggleAccountDropdown(false);
  log(successMessage.replace("{username}", user.username));
}

document.getElementById("registerBtn").addEventListener("click", async () => {
  try {
    clearAuthErrors();
    await handleAuthResponse(postJson("/auth/register", {
      username: registerUsernameInput.value.trim(),
      email: registerEmailInput.value.trim(),
      password: registerPasswordInput.value,
    }), "Account fuer {username} erstellt.");
  } catch (error) {
    setAuthError(registerError, error.message);
    log(error.message);
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    clearAuthErrors();
    await handleAuthResponse(postJson("/auth/login", {
      email: loginEmailInput.value.trim(),
      password: loginPasswordInput.value,
    }), "{username} ist jetzt angemeldet.");
  } catch (error) {
    setAuthError(loginError, error.message);
    log(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  state.userId = "";
  state.userEmail = "";
  state.username = "";
  updateAuthUi();
  persistSession();
  await loadCategories();
  toggleAccountDropdown(false);
  log("Du bist jetzt abgemeldet.");
});

document.getElementById("createCategoryBtn").addEventListener("click", async () => {
  try {
    if (!state.userId) {
      log("Bitte melde dich zuerst an.");
      return;
    }
    const words = splitWords(createCategoryWordsInput.value);
    const category = await postJson("/categories", {
      userId: Number(state.userId),
      name: createCategoryNameInput.value.trim(),
      words,
    });
    createCategoryNameInput.value = "";
    createCategoryWordsInput.value = "";
    await loadCategories();
    categorySelect.value = String(category.id);
    categoryStatus.textContent = category.name;
    if (state.roomId && state.playerId && hostLabel.textContent === "Host") {
      await updateRoomSettings({ categoryId: category.id });
    }
    log(`Eigene Kategorie "${category.name}" gespeichert.`);
  } catch (error) {
    log(error.message);
  }
});

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
    await syncRoomState();
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
    await syncRoomState();
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

minutesSelect.addEventListener("change", async () => {
  try {
    await updateRoomSettings({ gameDurationMinutes: Number(minutesSelect.value) });
    log(`Spieldauer auf ${minutesSelect.value} Minuten gesetzt.`);
    await syncRoomState();
  } catch (error) {
    log(error.message);
  }
});

imposterSelect.addEventListener("change", async () => {
  try {
    await updateRoomSettings({ imposterCount: Number(imposterSelect.value) });
    log(`Imposter-Anzahl auf ${imposterSelect.value} gesetzt.`);
    await syncRoomState();
  } catch (error) {
    log(error.message);
  }
});

categorySelect.addEventListener("change", async () => {
  try {
    const categoryId = Number(categorySelect.value);
    await updateRoomSettings({ categoryId });
    categoryStatus.textContent = categoryId === 0
      ? "Standard-Wortpool"
      : categorySelect.options[categorySelect.selectedIndex].textContent;
    log(`Kategorie gesetzt: ${categoryStatus.textContent}.`);
    await syncRoomState();
  } catch (error) {
    log(error.message);
  }
});

roomIdInput.addEventListener("input", () => {
  roomIdInput.value = sanitizeRoomId(roomIdInput.value);
});

accountMenuBtn.addEventListener("click", () => {
  toggleAccountDropdown();
});

openLoginModalBtn.addEventListener("click", () => {
  closeModal(registerModal);
  openModal(loginModal);
  toggleAccountDropdown(false);
});

openRegisterModalBtn.addEventListener("click", () => {
  closeModal(loginModal);
  openModal(registerModal);
  toggleAccountDropdown(false);
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", () => {
    const modal = document.getElementById(element.getAttribute("data-close-modal"));
    closeModal(modal);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".account-menu")) {
    toggleAccountDropdown(false);
  }
});

updateRoomLabels();
updateAuthUi();
syncPlayerNameInputs();
loadCategories()
  .catch((error) => log(error.message))
  .finally(() => {
    if (state.roomId && state.playerId) {
      showLobby();
    } else {
      showSetup();
    }
  });
