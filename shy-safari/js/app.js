import { MicMeter } from "./audio.js";
import { createDetector, dbToLevel, calibrationFrom, DEFAULT_CALIBRATION } from "./detector.js";
import { SCENES, pickAnimal } from "./scenes.js";
import { BACKDROPS } from "./backdrops.js";
import { youTubeId } from "./youtube.js";

const SETTINGS_KEY = "shy-safari:settings";
const COLLECTION_KEY = "shy-safari:collection";
const TICK_MS = 100;
const MAX_ANIMALS = 14;
const RUN_EVERY_S = 5;
const SETTLE_S = 4; // let echo cancellation adapt before judging the room

const $ = (id) => document.getElementById(id);
const app = $("app");

// ---------- Persistence ----------

const defaults = {
  scene: "savanna",
  goal: 38,
  pace: 5,
  loudMode: "run",
  showMeter: false,
  movieMode: false,
  calibration: { normal: null, movie: null },
};

function load(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return { ...fallback };
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const settings = load(SETTINGS_KEY, defaults);
if (!SCENES[settings.scene]) settings.scene = defaults.scene;
settings.calibration = { ...defaults.calibration, ...settings.calibration };
const collection = load(COLLECTION_KEY, {});
const saveSettings = () => save(SETTINGS_KEY, settings);

// ---------- State ----------

const meter = new MicMeter();
const detector = createDetector();
let running = false;
let animals = [];
let level = 0;
let lastTick = 0;
let quietProgress = 0;
let nextSpawnIn = firstWait();
let runTimer = 0;
let wasLoud = false;
let sampler = null; // collects dB readings during calibration

function firstWait() {
  return 10 + Math.random() * 10;
}
function laterWait() {
  return settings.pace * 60 * (0.8 + Math.random() * 0.4);
}
function calibration() {
  return settings.calibration[settings.movieMode ? "movie" : "normal"] ?? DEFAULT_CALIBRATION;
}

// ---------- Scene ----------

function applyScene() {
  const s = SCENES[settings.scene];
  app.dataset.scene = settings.scene;
  $("backdrop").innerHTML = BACKDROPS[settings.scene];
  $("sceneIcon").textContent = s.icon;
  $("sceneName").textContent = s.name;
  for (const a of animals) a.el.remove();
  animals = [];
  quietProgress = 0;
  nextSpawnIn = firstWait();
}

function sceneButtons(container, onPick) {
  container.innerHTML = "";
  for (const [id, s] of Object.entries(SCENES)) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.scene = id;
    b.setAttribute("aria-pressed", String(id === settings.scene));
    b.innerHTML = `<span class="ico">${s.icon}</span><span><strong>${s.name}</strong><small>${s.blurb}</small></span>`;
    b.addEventListener("click", () => onPick(id));
    container.append(b);
  }
}

function pickScene(id) {
  settings.scene = id;
  saveSettings();
  applyScene();
  for (const b of document.querySelectorAll("[data-scene][aria-pressed]")) {
    b.setAttribute("aria-pressed", String(b.dataset.scene === id));
  }
}

// ---------- Animals ----------

function spawn() {
  const def = pickAnimal(settings.scene);
  const band = def.band ?? SCENES[settings.scene].ground;
  const y = band[0] + Math.random() * (band[1] - band[0]);

  // Choose the spot farthest from animals already out.
  let x = 50;
  let best = -1;
  for (let i = 0; i < 10; i++) {
    const cx = 8 + Math.random() * 84;
    const d = Math.min(200, ...animals.map((a) => Math.hypot((a.x - cx) * 1.6, a.y - y)));
    if (d > best) {
      best = d;
      x = cx;
    }
  }

  const depth = Math.max(0, Math.min(1, (y - 15) / 75));
  const size = 7 * (0.55 + 0.75 * depth) * (def.size ?? 1);
  const fromLeft = x < 50;

  const el = document.createElement("div");
  el.className = "animal arriving new";
  el.title = def.name;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", def.name);
  el.innerHTML = `<span class="body"><span class="face">${def.emoji}</span></span>`;
  el.style.fontSize = `${size}vmin`;
  el.style.top = `${y}%`;
  el.style.zIndex = String(Math.round(y));
  el.style.left = fromLeft ? "-12%" : "112%";
  el.classList.toggle("flip", fromLeft); // emoji face left; flip to walk right
  $("stage").append(el);

  const animal = { el, def, x, y };
  animals.push(animal);

  el.getBoundingClientRect(); // commit the start position before moving
  el.style.transitionDuration = "5s";
  el.style.left = `${x}%`;
  setTimeout(() => {
    el.classList.remove("arriving");
    if (Math.random() < 0.5) el.classList.toggle("flip");
  }, 5000);
  setTimeout(() => el.classList.remove("new"), 9000);

  const seen = (collection[settings.scene] ??= {});
  seen[def.id] = (seen[def.id] ?? 0) + 1;
  save(COLLECTION_KEY, collection);
  if (def.rarity === "rare") toast(`✨ A rare ${def.name.toLowerCase()}!`);
}

function runAway(count = 1) {
  for (let i = 0; i < count && animals.length; i++) {
    const idx = Math.floor(Math.random() * animals.length);
    const [a] = animals.splice(idx, 1);
    const toLeft = a.x < 50;
    a.el.classList.remove("new");
    a.el.classList.add("leaving");
    a.el.classList.toggle("flip", !toLeft);
    a.el.style.transitionTimingFunction = "ease-in";
    a.el.style.transitionDuration = "1.4s";
    a.el.style.left = toLeft ? "-15%" : "115%";
    setTimeout(() => a.el.remove(), 1500);
  }
}

// ---------- Main loop ----------

function tick() {
  const now = performance.now();
  const dt = Math.min(1.5, (now - lastTick) / 1000); // tabs in the background tick slowly
  lastTick = now;

  const db = meter.readDb(dt);
  sampler?.push(db);
  level = dbToLevel(db, calibration());
  const loud = detector.update(level, settings.goal, dt);

  if (loud && !wasLoud) onLoud();
  if (!loud && wasLoud) onCalm();
  wasLoud = loud;

  if (!loud) {
    quietProgress += dt;
    if (quietProgress >= nextSpawnIn && animals.length < MAX_ANIMALS) {
      spawn();
      quietProgress = 0;
      nextSpawnIn = laterWait();
    }
  } else if (settings.loudMode === "run") {
    runTimer += dt;
    if (runTimer >= RUN_EVERY_S) {
      runTimer = 0;
      runAway(1 + Math.floor(Math.random() * 2));
    }
  }

  $("settlingBadge").hidden = !detector.settling;
  drawMeters();
}

function onLoud() {
  app.classList.add("loud");
  if (settings.loudMode === "run") {
    runAway(1);
    runTimer = 0;
    quietProgress = 0;
  } else {
    app.classList.add("frozen");
  }
}

function onCalm() {
  app.classList.remove("loud", "frozen");
  if (animals.length === 0) nextSpawnIn = firstWait();
}

function drawMeters() {
  const over = level > settings.goal;
  for (const [fill, goal] of [["meterFill", "meterGoal"], ["liveFill", "liveGoal"]]) {
    $(fill).style.width = `${level}%`;
    $(fill).classList.toggle("over", over);
    $(goal).style.left = `${settings.goal}%`;
  }
}

// ---------- Start ----------

async function start() {
  const err = $("startError");
  $("startBtn").disabled = true;
  try {
    settings.movieMode = $("startMovie").checked;
    saveSettings();
    await meter.start(settings.movieMode);
  } catch (e) {
    err.textContent =
      e?.name === "NotAllowedError"
        ? "Microphone access was blocked. Allow it in the browser's address bar, then press Start again."
        : `Couldn't open the microphone (${e?.message || e}).`;
    err.classList.add("error");
    $("startBtn").disabled = false;
    return;
  }
  $("start").hidden = true;
  running = true;
  if (settings.movieMode) detector.suspend(SETTLE_S);
  updateMovieUI();
  lastTick = performance.now();
  setInterval(tick, TICK_MS);
  keepAwake();
}

async function keepAwake() {
  try {
    await navigator.wakeLock?.request("screen");
  } catch {}
}
document.addEventListener("visibilitychange", () => {
  if (running && document.visibilityState === "visible") keepAwake();
});

// ---------- Music / Movie mode ----------

async function setMovieMode(on, reason) {
  if (on === settings.movieMode && (!running || meter.movieMode === on)) {
    updateMovieUI();
    return;
  }
  if (running) {
    try {
      await meter.setMovieMode(on);
    } catch (e) {
      // The mic stayed in its old mode; keep settings (and the calibration
      // slot) matching what is really being measured.
      settings.movieMode = meter.movieMode;
      saveSettings();
      updateMovieUI();
      toast(`Couldn't switch the microphone (${e?.message || e})`);
      return;
    }
    detector.suspend(SETTLE_S);
  }
  settings.movieMode = on;
  saveSettings();
  updateMovieUI();
  if (reason) toast(reason);
}

function updateMovieUI() {
  const on = settings.movieMode;
  $("movieToggle").checked = on;
  $("startMovie").checked = on;
  $("movieBadge").hidden = !on || !running;
  $("movieBtn").classList.toggle("on", on);
  $("calMode").textContent = on ? "Music/Movie mode" : "normal mode";

  const status = $("aecStatus");
  status.className = "status-line";
  if (!running) {
    status.textContent = on ? "Will start in Music/Movie mode." : "";
  } else if (!on) {
    status.textContent = "Off: every sound the microphone hears counts.";
  } else if (meter.echoCancelling) {
    status.textContent = "✓ On: echo cancellation is removing this computer's sound.";
    status.classList.add("good");
  } else {
    status.textContent = "⚠ This browser didn't turn on echo cancellation, so music may still count. Try Chrome or Edge.";
    status.classList.add("warn");
  }
}

// ---------- Player ----------

let playerUrl = null;

function openPlayer(node, title, audioOnly = false) {
  closePlayer();
  $("playerBody").append(node);
  $("playerTitle").textContent = title;
  $("player").classList.toggle("audio-only", audioOnly);
  $("player").hidden = false;
}

function closePlayer() {
  $("playerBody").innerHTML = "";
  $("player").hidden = true;
  $("player").classList.remove("big");
  if (playerUrl) URL.revokeObjectURL(playerUrl);
  playerUrl = null;
}

function onMediaStart() {
  if (!settings.movieMode) {
    setMovieMode(true, "🎬 Music/Movie mode is on, so the animals won't hear it.");
  } else {
    detector.suspend(SETTLE_S);
  }
}

function playFile(file) {
  const audioOnly = file.type.startsWith("audio/");
  const media = document.createElement(audioOnly ? "audio" : "video");
  media.controls = true;
  media.autoplay = true;
  media.addEventListener("play", onMediaStart);
  openPlayer(media, file.name, audioOnly);
  playerUrl = URL.createObjectURL(file);
  media.src = playerUrl;
}

function playYouTube(link) {
  const id = youTubeId(link);
  if (!id) {
    toast("That doesn't look like a YouTube link.");
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
  iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  iframe.allowFullscreen = true;
  iframe.title = "YouTube video";
  openPlayer(iframe, "YouTube");
  onMediaStart();
}

// ---------- Calibration ----------

async function calibrate() {
  if (!running) return;
  const btn = $("calibrateBtn");
  const status = $("calStatus");
  const slot = settings.movieMode ? "movie" : "normal";
  btn.disabled = true;
  const collect = async (label) => {
    sampler = [];
    for (let s = 5; s > 0; s--) {
      status.textContent = `${label} ${s}…`;
      await new Promise((r) => setTimeout(r, 1000));
    }
    const vals = sampler.filter(Number.isFinite).sort((a, b) => a - b);
    sampler = null;
    return vals;
  };
  try {
    const quiet = await collect("🤫 Everyone silent please…");
    const talk = await collect("💬 Now talk in normal partner voices…");
    // Playing something switches Music/Movie mode on mid-calibration; the
    // samples would then mix two microphone setups.
    if ((settings.movieMode ? "movie" : "normal") !== slot) {
      status.textContent = "Music/Movie mode changed during calibration. Please calibrate again.";
      return;
    }
    const cal = calibrationFrom(quiet[Math.floor(quiet.length * 0.5)], talk[Math.floor(talk.length * 0.75)]);
    if (!cal) {
      status.textContent = "No sound readings came in. Keep this tab in front and try again.";
      return;
    }
    settings.calibration[slot] = cal;
    saveSettings();
    status.textContent = "✓ Calibrated. The goal presets now fit this room.";
  } finally {
    sampler = null;
    btn.disabled = false;
  }
}

// ---------- Panels & controls ----------

const panels = ["moviePanel", "settingsPanel", "collectionPanel"];
function togglePanel(id) {
  const open = $(id).hidden;
  for (const p of panels) $(p).hidden = true;
  $("sceneMenu").hidden = true;
  $(id).hidden = !open;
  if (open && id === "collectionPanel") renderCollection();
}

function renderCollection() {
  const out = $("collection");
  out.innerHTML = "";
  for (const [sid, s] of Object.entries(SCENES)) {
    const seen = collection[sid] ?? {};
    const found = s.animals.filter((a) => seen[a.id]).length;
    const sec = document.createElement("section");
    sec.className = "collection-scene";
    sec.innerHTML = `<h3><span>${s.icon} ${s.name}</span><span>${found}/${s.animals.length}</span></h3>`;
    const grid = document.createElement("div");
    grid.className = "collection-grid";
    for (const a of s.animals) {
      const d = document.createElement("div");
      if (!seen[a.id]) d.className = "unseen";
      else if (a.rarity === "rare") d.className = "rare";
      d.innerHTML = `<span class="em">${a.emoji}</span>${seen[a.id] ? `${a.name} ×${seen[a.id]}` : "?"}`;
      grid.append(d);
    }
    sec.append(grid);
    out.append(sec);
  }
}

function syncControls() {
  for (const c of document.querySelectorAll("[data-goal]")) {
    c.setAttribute("aria-checked", String(Number(c.dataset.goal) === settings.goal));
  }
  $("goalRange").value = settings.goal;
  for (const b of document.querySelectorAll("[data-pace]")) {
    b.setAttribute("aria-pressed", String(Number(b.dataset.pace) === settings.pace));
  }
  $("paceInput").value = settings.pace;
  for (const b of document.querySelectorAll("[data-mode]")) {
    b.setAttribute("aria-pressed", String(b.dataset.mode === settings.loudMode));
  }
  $("showMeter").checked = settings.showMeter;
  $("meter").hidden = !settings.showMeter;
  drawMeters();
}

function setGoal(v) {
  settings.goal = Math.max(5, Math.min(95, Math.round(v)));
  saveSettings();
  syncControls();
}

let toastTimer = 0;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 4000);
}

function wire() {
  sceneButtons($("startScenes"), pickScene);
  $("startBtn").addEventListener("click", start);

  $("sceneBtn").addEventListener("click", () => {
    const menu = $("sceneMenu");
    const open = menu.hidden;
    for (const p of panels) $(p).hidden = true;
    if (open) sceneButtons(menu, (id) => {
      pickScene(id);
      menu.hidden = true;
      $("sceneBtn").setAttribute("aria-expanded", "false");
    });
    menu.hidden = !open;
    $("sceneBtn").setAttribute("aria-expanded", String(open));
  });

  $("movieBtn").addEventListener("click", () => togglePanel("moviePanel"));
  $("settingsBtn").addEventListener("click", () => togglePanel("settingsPanel"));
  $("collectionBtn").addEventListener("click", () => togglePanel("collectionPanel"));
  for (const b of document.querySelectorAll("[data-close]")) {
    b.addEventListener("click", () => (b.closest(".drawer").hidden = true));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    for (const p of panels) $(p).hidden = true;
    $("sceneMenu").hidden = true;
  });

  $("fullscreenBtn").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });

  $("movieToggle").addEventListener("change", (e) => setMovieMode(e.target.checked));
  $("fileInput").addEventListener("change", (e) => {
    const f = e.target.files?.[0];
    if (f) playFile(f);
    e.target.value = "";
  });
  $("ytForm").addEventListener("submit", (e) => {
    e.preventDefault();
    playYouTube($("ytUrl").value);
  });
  $("playerClose").addEventListener("click", closePlayer);
  $("playerSize").addEventListener("click", () => $("player").classList.toggle("big"));

  for (const c of document.querySelectorAll("[data-goal]")) {
    c.addEventListener("click", () => setGoal(Number(c.dataset.goal)));
  }
  $("goalRange").addEventListener("input", (e) => setGoal(Number(e.target.value)));
  $("showMeter").addEventListener("change", (e) => {
    settings.showMeter = e.target.checked;
    saveSettings();
    syncControls();
  });
  for (const b of document.querySelectorAll("[data-pace]")) {
    b.addEventListener("click", () => {
      settings.pace = Number(b.dataset.pace);
      saveSettings();
      syncControls();
    });
  }
  $("paceInput").addEventListener("change", (e) => {
    const v = Number(e.target.value);
    if (v >= 0.5 && v <= 60) settings.pace = v;
    saveSettings();
    syncControls();
  });
  for (const b of document.querySelectorAll("[data-mode]")) {
    b.addEventListener("click", () => {
      settings.loudMode = b.dataset.mode;
      saveSettings();
      syncControls();
      if (detector.loud) app.classList.toggle("frozen", settings.loudMode === "pause");
    });
  }
  $("calibrateBtn").addEventListener("click", calibrate);
  $("calResetBtn").addEventListener("click", () => {
    settings.calibration[settings.movieMode ? "movie" : "normal"] = null;
    saveSettings();
    $("calStatus").textContent = "Calibration reset.";
  });
  $("collectionReset").addEventListener("click", () => {
    if (!confirm("Clear every animal the class has spotted?")) return;
    for (const k of Object.keys(collection)) delete collection[k];
    save(COLLECTION_KEY, collection);
    renderCollection();
  });

  // Hide the controls on the projector when nobody is using the mouse.
  let idleTimer = 0;
  const wake = () => {
    app.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => running && app.classList.add("idle"), 6000);
  };
  for (const ev of ["pointermove", "pointerdown", "keydown"]) document.addEventListener(ev, wake);
}

applyScene();
wire();
syncControls();
updateMovieUI();
