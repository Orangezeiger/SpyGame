const storage = window.sessionStorage;
const nameStorage = window.localStorage;

const state = {
  roomId: storage.getItem("roomId") || "",
  playerId: storage.getItem("playerId") || "",
  playerName: storage.getItem("playerName") || "",
  userId: storage.getItem("userId") || "",
  userEmail: storage.getItem("userEmail") || "",
  username: storage.getItem("username") || "",
  lastPlayerName: nameStorage.getItem("lastPlayerName") || "",
  screen: "setup",
  roomPollHandle: null,
  timerHandle: null,
  friendPollHandle: null,
  presencePingHandle: null,
  gameDurationSeconds: 8 * 60,
  startedAtEpochMillis: 0,
  roleLoaded: false,
  categories: [],
  friends: [],
  createRoomPassword: "",
  joinRoomPassword: "",
  selectedCategoryIdBeforeModal: "0",
  pendingJoinRoomId: "",
};

const setupScreen = document.getElementById("setupScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const accountMenuBtn = document.getElementById("accountMenuBtn");
const accountDropdown = document.getElementById("accountDropdown");
const friendsMenuBtn = document.getElementById("friendsMenuBtn");
const friendsDropdown = document.getElementById("friendsDropdown");
const friendsOnlineDot = document.getElementById("friendsOnlineDot");
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
const categoryModal = document.getElementById("categoryModal");
const createOptionsModal = document.getElementById("createOptionsModal");
const joinOptionsModal = document.getElementById("joinOptionsModal");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const categoryError = document.getElementById("categoryError");
const joinOptionsError = document.getElementById("joinOptionsError");
const openLoginModalBtn = document.getElementById("openLoginModalBtn");
const openRegisterModalBtn = document.getElementById("openRegisterModalBtn");
const createRoomPasswordInput = document.getElementById("createRoomPassword");
const joinRoomPasswordInput = document.getElementById("joinRoomPassword");
const createPasswordStatus = document.getElementById("createPasswordStatus");
const joinPasswordStatus = document.getElementById("joinPasswordStatus");
const joinOptionsRoomId = document.getElementById("joinOptionsRoomId");
const joinOptionsTitle = document.getElementById("joinOptionsTitle");
const joinOptionsInfo = document.getElementById("joinOptionsInfo");
const friendUsernameInput = document.getElementById("friendUsernameInput");
const friendRequestsList = document.getElementById("friendRequestsList");
const friendsList = document.getElementById("friendsList");

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
  if (state.lastPlayerName) {
    nameStorage.setItem("lastPlayerName", state.lastPlayerName);
  }
}

function rememberPlayerName(name) {
  const clean = (name || "").trim();
  if (!clean) {
    return;
  }
  state.playerName = clean;
  state.lastPlayerName = clean;
  nameStorage.setItem("lastPlayerName", clean);
}

function updateRoomLabels() {
  roomIdLabel.textContent = state.roomId || "-";
  roomCodeLarge.textContent = state.roomId || "------";
  gameRoomCode.textContent = state.roomId || "------";
}

function updatePasswordHints() {
  createPasswordStatus.textContent = state.createRoomPassword
    ? "Lobby-Passwort ist gesetzt."
    : "Kein Lobby-Passwort gesetzt.";
  joinPasswordStatus.textContent = state.joinRoomPassword
    ? "Ein Join-Passwort ist vorgemerkt."
    : "Kein Lobby-Passwort gesetzt.";
}

function fillPlayerNameInputs() {
  const preferredName = state.lastPlayerName || state.username || "";
  if (!createPlayerNameInput.value.trim()) {
    createPlayerNameInput.value = preferredName;
  }
  if (!joinPlayerNameInput.value.trim()) {
    joinPlayerNameInput.value = preferredName;
  }
}

function updateAuthUi() {
  const loggedIn = Boolean(state.userId);
  authStatus.textContent = loggedIn
    ? `Angemeldet als ${state.username} (${state.userEmail})`
    : "Noch nicht angemeldet.";
  accountInitial.textContent = loggedIn ? state.username.charAt(0).toUpperCase() : "";
  accountInitial.classList.toggle("hidden", !loggedIn);
  accountGuestIcon.classList.toggle("hidden", loggedIn);
  openLoginModalBtn.classList.toggle("hidden", loggedIn);
  openRegisterModalBtn.classList.toggle("hidden", loggedIn);
  logoutBtn.classList.toggle("hidden", !loggedIn);
  customCategoryHint.textContent = loggedIn
    ? "Deine Kategorie wird zu deinen Standardkategorien hinzugefuegt und ist direkt in der Lobby waehlbar."
    : "Melde dich an, um eigene Kategorien zu speichern.";
}

function setVisibility(el, visible) {
  el.classList.toggle("hidden", !visible);
}

function clearUiErrors() {
  [loginError, registerError, categoryError, joinOptionsError].forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });
}

function showError(target, message) {
  target.textContent = message;
  target.classList.remove("hidden");
}

function openModal(modal) {
  clearUiErrors();
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

function closeAllModals() {
  [loginModal, registerModal, categoryModal, createOptionsModal, joinOptionsModal].forEach(closeModal);
  clearUiErrors();
}

function toggleDropdown(dropdown, forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : dropdown.classList.contains("hidden");
  if (dropdown === accountDropdown && shouldOpen) {
    friendsDropdown.classList.add("hidden");
  }
  if (dropdown === friendsDropdown && shouldOpen) {
    accountDropdown.classList.add("hidden");
  }
  dropdown.classList.toggle("hidden", !shouldOpen);
}

function sanitizeRoomId(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

function splitWords(value) {
  return value.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean);
}

function clampImposterOptions(maxImposterCount, selectedCount) {
  Array.from(imposterSelect.options).forEach((option) => {
    const optionValue = Number(option.value);
    option.disabled = optionValue > maxImposterCount;
  });
  imposterSelect.value = String(Math.min(selectedCount, maxImposterCount));
}

function renderCategoryOptions(selectedCategoryId, selectedCategoryName) {
  const previousValue = selectedCategoryId ? String(selectedCategoryId) : "0";
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

  const createOption = document.createElement("option");
  createOption.value = "__new__";
  createOption.textContent = "+ Neue Kategorie...";
  categorySelect.appendChild(createOption);

  categorySelect.value = previousValue;
  categoryStatus.textContent = selectedCategoryName || (previousValue === "0" ? "Standard-Wortpool" : categoryStatus.textContent);
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

function renderFriendsOverview(data) {
  state.friends = data.friends || [];
  setVisibility(friendsOnlineDot, Boolean(data.hasOnlineFriends));

  if (!data.incomingRequests.length) {
    friendRequestsList.className = "stack-list empty-state";
    friendRequestsList.textContent = "Noch keine offenen Anfragen.";
  } else {
    friendRequestsList.className = "stack-list";
    friendRequestsList.innerHTML = "";
    data.incomingRequests.forEach((request) => {
      const item = document.createElement("div");
      item.className = "stack-item";
      item.innerHTML = `
        <div class="stack-row">
          <strong>${request.username}</strong>
          <div class="stack-actions">
            <button class="icon-mini accept" data-request-id="${request.requestId}" data-accept="true">✓</button>
            <button class="icon-mini reject" data-request-id="${request.requestId}" data-accept="false">✕</button>
          </div>
        </div>`;
      friendRequestsList.appendChild(item);
    });
  }

  if (!state.friends.length) {
    friendsList.className = "stack-list empty-state";
    friendsList.textContent = "Noch keine Freunde gespeichert.";
  } else {
    friendsList.className = "stack-list";
    friendsList.innerHTML = "";
    state.friends.forEach((friend) => {
      const item = document.createElement("div");
      item.className = "stack-item";
      const action = friend.joinable
        ? `<button class="secondary-button" data-join-room="${friend.roomCode}" data-password-protected="${friend.passwordProtected}">Beitreten</button>`
        : "";
      const detail = friend.hosting && friend.roomCode
        ? `Hostet Lobby ${friend.roomCode}${friend.passwordProtected ? " (mit Passwort)" : ""}`
        : friend.online ? "Gerade online" : "Offline";
      item.innerHTML = `
        <div class="stack-row">
          <div>
            <strong>${friend.username}</strong>
            <div class="friend-pill ${friend.online ? "online" : ""}">${detail}</div>
          </div>
          <div class="stack-actions">${action}</div>
        </div>`;
      friendsList.appendChild(item);
    });
  }
}

async function loadFriends() {
  if (!state.userId) {
    setVisibility(friendsOnlineDot, false);
    friendRequestsList.className = "stack-list empty-state";
    friendRequestsList.textContent = "Nicht verfuegbar, solange du abgemeldet bist.";
    friendsList.className = "stack-list empty-state";
    friendsList.textContent = "Nicht verfuegbar, solange du abgemeldet bist.";
    return;
  }
  const data = await fetchJson(`/friends?userId=${encodeURIComponent(state.userId)}`);
  renderFriendsOverview(data);
}

async function pingPresence() {
  if (!state.userId) {
    return;
  }
  try {
    await postWithoutBody(`/presence/ping?userId=${encodeURIComponent(state.userId)}`);
  } catch (error) {
    log(error.message);
  }
}

function startPresenceHeartbeat() {
  stopPresenceHeartbeat();
  if (!state.userId) {
    return;
  }
  pingPresence();
  loadFriends().catch((error) => log(error.message));
  state.presencePingHandle = setInterval(pingPresence, 10000);
  state.friendPollHandle = setInterval(() => loadFriends().catch((error) => log(error.message)), 5000);
}

function stopPresenceHeartbeat() {
  if (state.presencePingHandle) {
    clearInterval(state.presencePingHandle);
    state.presencePingHandle = null;
  }
  if (state.friendPollHandle) {
    clearInterval(state.friendPollHandle);
    state.friendPollHandle = null;
  }
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

  const data = await fetchJson(`/room-state?roomId=${encodeURIComponent(state.roomId)}&playerId=${encodeURIComponent(state.playerId)}`);

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
      ? `Du bist Host. ${data.passwordProtected ? "Diese Lobby ist passwortgeschuetzt. " : ""}Stelle Dauer, Imposter und Kategorie ein.`
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
  state.roomPollHandle = setInterval(() => syncRoomState().catch(handleRoomStateError), 2500);
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
  if (state.userId) {
    loadFriends().catch((error) => log(error.message));
  }
}

function disconnectSession() {
  const params = new URLSearchParams();
  if (state.userId) {
    params.set("userId", state.userId);
  }
  if (state.playerId) {
    params.set("playerId", state.playerId);
  }
  if (!params.toString()) {
    return;
  }
  const url = `/presence/offline?${params.toString()}`;
  try {
    fetch(url, { method: "POST", keepalive: true });
  } catch (_error) {
    // Best-effort disconnect only.
  }
}

async function copyRoomId() {
  if (!state.roomId) {
    return;
  }
  try {
    await navigator.clipboard.writeText(state.roomId);
    log(`Lobby-Nummer ${state.roomId} kopiert.`);
  } catch {
    log("Kopieren nicht moeglich.");
  }
}

async function handleAuthResponse(promise, successMessage) {
  const user = await promise;
  state.userId = String(user.id);
  state.userEmail = user.email;
  state.username = user.username;
  updateAuthUi();
  fillPlayerNameInputs();
  persistSession();
  await loadCategories();
  await loadFriends();
  startPresenceHeartbeat();
  closeAllModals();
  toggleDropdown(accountDropdown, false);
  log(successMessage.replace("{username}", user.username));
}

async function submitJoin(roomIdOverride = null) {
  const playerName = (joinPlayerNameInput.value || joinPlayerNameInput.placeholder || "").trim();
  const roomId = sanitizeRoomId(roomIdOverride || roomIdInput.value || joinOptionsRoomId.value);
  roomIdInput.value = roomId;
  joinOptionsRoomId.value = roomId;
  const data = await postJson("/join-room", {
    roomId,
    playerName,
    userId: state.userId ? Number(state.userId) : null,
    roomPassword: state.joinRoomPassword || null,
  });
  rememberPlayerName(playerName);
  state.roomId = data.roomId;
  state.playerId = data.playerId;
  state.roleLoaded = false;
  persistSession();
  updateRoomLabels();
  closeModal(joinOptionsModal);
  showLobby();
  await syncRoomState();
  await loadFriends().catch(() => {});
  log(`Lobby ${state.roomId} beigetreten.`);
}

function openJoinOptions(roomId = "", requirePassword = false) {
  state.pendingJoinRoomId = sanitizeRoomId(roomId || roomIdInput.value);
  joinOptionsRoomId.value = state.pendingJoinRoomId;
  joinOptionsTitle.textContent = requirePassword ? "Passwortgeschuetzte Lobby" : "Lobby beitreten";
  joinOptionsInfo.textContent = requirePassword
    ? "Diese Lobby braucht ein Passwort. Gib die Nummer und das Passwort ein."
    : "Setze hier ein Lobby-Passwort, falls eines gebraucht wird.";
  openModal(joinOptionsModal);
}

async function saveCategoryFromModal() {
  if (!state.userId) {
    showError(categoryError, "Bitte melde dich zuerst an.");
    return;
  }
  const category = await postJson("/categories", {
    userId: Number(state.userId),
    name: createCategoryNameInput.value.trim(),
    words: splitWords(createCategoryWordsInput.value),
  });
  createCategoryNameInput.value = "";
  createCategoryWordsInput.value = "";
  await loadCategories();
  categorySelect.value = String(category.id);
  categoryStatus.textContent = category.name;
  if (state.roomId && state.playerId && hostLabel.textContent === "Host") {
    await updateRoomSettings({ categoryId: category.id });
  }
  closeModal(categoryModal);
  log(`Eigene Kategorie \"${category.name}\" gespeichert.`);
}

registerUsernameInput.addEventListener("input", () => registerError.classList.add("hidden"));
registerEmailInput.addEventListener("input", () => registerError.classList.add("hidden"));
registerPasswordInput.addEventListener("input", () => registerError.classList.add("hidden"));
loginEmailInput.addEventListener("input", () => loginError.classList.add("hidden"));
loginPasswordInput.addEventListener("input", () => loginError.classList.add("hidden"));
createCategoryNameInput.addEventListener("input", () => categoryError.classList.add("hidden"));
createCategoryWordsInput.addEventListener("input", () => categoryError.classList.add("hidden"));
joinRoomPasswordInput.addEventListener("input", () => joinOptionsError.classList.add("hidden"));
createPlayerNameInput.addEventListener("input", () => {
  rememberPlayerName(createPlayerNameInput.value);
  if (!joinPlayerNameInput.value.trim()) {
    joinPlayerNameInput.value = createPlayerNameInput.value.trim();
  }
});
joinPlayerNameInput.addEventListener("input", () => {
  rememberPlayerName(joinPlayerNameInput.value);
  if (!createPlayerNameInput.value.trim()) {
    createPlayerNameInput.value = joinPlayerNameInput.value.trim();
  }
});
roomIdInput.addEventListener("input", () => { roomIdInput.value = sanitizeRoomId(roomIdInput.value); });
joinOptionsRoomId.addEventListener("input", () => { joinOptionsRoomId.value = sanitizeRoomId(joinOptionsRoomId.value); });

accountMenuBtn.addEventListener("click", () => toggleDropdown(accountDropdown));
friendsMenuBtn.addEventListener("click", () => {
  if (state.userId) {
    loadFriends().catch((error) => log(error.message));
  }
  toggleDropdown(friendsDropdown);
});

openLoginModalBtn.addEventListener("click", () => {
  closeModal(registerModal);
  openModal(loginModal);
  toggleDropdown(accountDropdown, false);
});

openRegisterModalBtn.addEventListener("click", () => {
  closeModal(loginModal);
  openModal(registerModal);
  toggleDropdown(accountDropdown, false);
});

document.getElementById("openCreateOptionsBtn").addEventListener("click", () => {
  createRoomPasswordInput.value = state.createRoomPassword;
  openModal(createOptionsModal);
});

document.getElementById("openJoinOptionsBtn").addEventListener("click", () => {
  joinRoomPasswordInput.value = state.joinRoomPassword;
  openJoinOptions();
});

document.getElementById("saveCreateOptionsBtn").addEventListener("click", () => {
  state.createRoomPassword = createRoomPasswordInput.value.trim();
  updatePasswordHints();
  closeModal(createOptionsModal);
  log(state.createRoomPassword ? "Lobby-Passwort gespeichert." : "Lobby-Passwort entfernt.");
});

document.getElementById("confirmJoinOptionsBtn").addEventListener("click", async () => {
  try {
    state.joinRoomPassword = joinRoomPasswordInput.value.trim();
    updatePasswordHints();
    await submitJoin(state.pendingJoinRoomId || joinOptionsRoomId.value);
  } catch (error) {
    showError(joinOptionsError, error.message);
    log(error.message);
  }
});

document.getElementById("registerBtn").addEventListener("click", async () => {
  try {
    await handleAuthResponse(postJson("/auth/register", {
      username: registerUsernameInput.value.trim(),
      email: registerEmailInput.value.trim(),
      password: registerPasswordInput.value,
    }), "Account fuer {username} erstellt.");
  } catch (error) {
    showError(registerError, error.message);
    log(error.message);
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await handleAuthResponse(postJson("/auth/login", {
      email: loginEmailInput.value.trim(),
      password: loginPasswordInput.value,
    }), "{username} ist jetzt angemeldet.");
  } catch (error) {
    showError(loginError, error.message);
    log(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  disconnectSession();
  state.userId = "";
  state.userEmail = "";
  state.username = "";
  state.playerId = "";
  state.roomId = "";
  state.playerName = "";
  updateAuthUi();
  persistSession();
  stopPresenceHeartbeat();
  await loadCategories();
  await loadFriends();
  updateRoomLabels();
  showSetup();
  toggleDropdown(accountDropdown, false);
  toggleDropdown(friendsDropdown, false);
  log("Du bist jetzt abgemeldet.");
});

document.getElementById("createCategoryBtn").addEventListener("click", async () => {
  try {
    await saveCategoryFromModal();
  } catch (error) {
    showError(categoryError, error.message);
    log(error.message);
  }
});

document.getElementById("sendFriendRequestBtn").addEventListener("click", async () => {
  try {
    if (!state.userId) {
      log("Bitte melde dich zuerst an.");
      return;
    }
    await postJson("/friends/request", {
      requesterUserId: Number(state.userId),
      targetUsername: friendUsernameInput.value.trim(),
    });
    friendUsernameInput.value = "";
    await loadFriends();
    log("Freundschaftsanfrage gesendet.");
  } catch (error) {
    log(error.message);
  }
});

friendRequestsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-request-id]");
  if (!button || !state.userId) {
    return;
  }
  try {
    await postJson("/friends/respond", {
      userId: Number(state.userId),
      requestId: Number(button.dataset.requestId),
      accept: button.dataset.accept === "true",
    });
    await loadFriends();
    log(button.dataset.accept === "true" ? "Freundschaft angenommen." : "Freundschaftsanfrage abgelehnt.");
  } catch (error) {
    log(error.message);
  }
});

friendsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-join-room]");
  if (!button) {
    return;
  }
  const roomCode = sanitizeRoomId(button.dataset.joinRoom);
  roomIdInput.value = roomCode;
  if (button.dataset.passwordProtected === "true") {
    openJoinOptions(roomCode, true);
    return;
  }
  try {
    await submitJoin(roomCode);
    toggleDropdown(friendsDropdown, false);
  } catch (error) {
    log(error.message);
  }
});

document.getElementById("createRoomBtn").addEventListener("click", async () => {
  try {
    const playerName = createPlayerNameInput.value.trim();
    const data = await postJson("/create-room", {
      playerName,
      userId: state.userId ? Number(state.userId) : null,
      roomPassword: state.createRoomPassword || null,
    });
    rememberPlayerName(playerName);
    state.roomId = data.roomId;
    state.playerId = data.playerId;
    state.roleLoaded = false;
    persistSession();
    updateRoomLabels();
    showLobby();
    await syncRoomState();
    await loadFriends().catch(() => {});
    log(`Lobby ${state.roomId} erstellt.${state.createRoomPassword ? " Passwortschutz aktiv." : " Du bist der Host."}`);
  } catch (error) {
    log(error.message);
  }
});

document.getElementById("joinRoomBtn").addEventListener("click", async () => {
  try {
    await submitJoin();
  } catch (error) {
    if (String(error.message).includes("Passwort")) {
      showError(joinOptionsError, error.message);
      joinRoomPasswordInput.value = state.joinRoomPassword;
      openJoinOptions(roomIdInput.value, true);
    }
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
document.getElementById("refreshLobbyBtn").addEventListener("click", () => syncRoomState().catch(handleRoomStateError));

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

categorySelect.addEventListener("focus", () => {
  state.selectedCategoryIdBeforeModal = categorySelect.value;
});

categorySelect.addEventListener("change", async () => {
  try {
    if (categorySelect.value === "__new__") {
      categorySelect.value = state.selectedCategoryIdBeforeModal || "0";
      openModal(categoryModal);
      return;
    }
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

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", () => {
    const modal = document.getElementById(element.getAttribute("data-close-modal"));
    closeModal(modal);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".account-menu")) {
    toggleDropdown(accountDropdown, false);
  }
  if (!event.target.closest(".friends-menu")) {
    toggleDropdown(friendsDropdown, false);
  }
});

window.addEventListener("pagehide", disconnectSession);
window.addEventListener("beforeunload", disconnectSession);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    disconnectSession();
  }
});

updateRoomLabels();
updatePasswordHints();
updateAuthUi();
fillPlayerNameInputs();
loadCategories()
  .catch((error) => log(error.message))
  .finally(() => {
    if (state.userId) {
      startPresenceHeartbeat();
    }
    if (state.roomId && state.playerId) {
      showLobby();
    } else {
      showSetup();
    }
  });
