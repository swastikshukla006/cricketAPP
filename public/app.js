(() => {
  'use strict';

  const STORAGE_KEY = 'ballKhoGayiXISharedV3';
  const SESSION_KEY = 'ballKhoGayiXISessionV4';
  const LEGACY_SESSION_KEYS = ['ballKhoGayiXISessionV3'];
  const LAST_LOGIN_KEY = 'ballKhoGayiXILastLogin';
  const DEFAULT_PLAYER_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
  const DEFAULT_ADMIN_PIN_HASH = '1f6ebd8f003635e606b0822bf3301025ce467dc0fdbee1e964c9dcd2adc83471';
  const NOTIFICATION_PREF_KEY = 'bkgxiNotificationPreferencesV1';
  const DEFAULT_NOTIFICATION_PREFS = Object.freeze({
    matches: true,
    live: true,
    chat: true,
    announcements: true,
    team: true,
    game: true
  });

  const seedData = {
    settings: {
      version: 4,
      groupName: 'Ball Kho Gayi XI',
      tagline: 'Bat · Ball · Repeat',
      heroTitle: 'Our ground. Our squad. Our story.',
      heroSubtitle: 'Record matches after school, follow personal form, build practice teams and keep the whole group together.',
      heroImage: 'assets/cric-time-front.jpg',
      logoImage: 'assets/ball-kho-gayi-circle.png',
      homeGround: 'School Ground',
      adminName: 'Swastik Shukla',
      adminPinHash: DEFAULT_ADMIN_PIN_HASH,
      captainId: 'p6',
      viceCaptainId: 'p5',
      announcementTitle: 'Score likhna mat bhoolna.',
      announcementText: 'Ball kho jaaye to bhi theek hai — notebook mein runs, wickets, overs aur catches zaroor likhna.',
      savedToss: null,
      whatsappGroupUrl: 'https://chat.whatsapp.com/IHx3Ph3owBgFB0JYxm1vDp?s=cl&p=a&mlu=0&ilr=0&amv=2'
    },
    players: [
      makePlayer('p1', 'Priyanshu', 7, 'Batter', 'Right-hand bat', 'Part-time off spin', 'Top-order stroke player.'),
      makePlayer('p2', 'Abhinav', 18, 'All-rounder', 'Right-hand bat', 'Right-arm medium', 'Balances the side with bat and ball.'),
      makePlayer('p3', 'Adarsh', 11, 'Bowler', 'Right-hand bat', 'Right-arm fast', 'New-ball bowler who attacks the stumps.'),
      makePlayer('p4', 'Abhishek', 1, 'Wicketkeeper', 'Right-hand bat', 'Does not bowl', 'Wicketkeeper and middle-order finisher.'),
      makePlayer('p5', 'Ananya', 9, 'All-rounder', 'Left-hand bat', 'Left-arm spin', 'Vice-captain, all-rounder and sharp fielder.'),
      makePlayer('p6', 'Swastik', 10, 'All-rounder', 'Right-hand bat', 'Right-arm medium', 'Captain and administrator of the team website.'),
      makePlayer('p7', 'Ramest', 23, 'Bowler', 'Right-hand bat', 'Leg spin', 'Uses spin to break partnerships.'),
      makePlayer('p8', 'Amol', 45, 'Batter', 'Right-hand bat', 'Does not bowl', 'Attacking batter who likes pace on the ball.'),
      makePlayer('p9', 'Aman I', 27, 'Bowler', 'Right-hand bat', 'Right-arm medium-fast', 'Hits the deck hard in the middle overs.'),
      makePlayer('p10', 'Aman II', 99, 'Batter', 'Left-hand bat', 'Part-time spin', 'Flexible batter who can finish an innings.')
    ],
    matches: [
      { id: 'm-upcoming-1', status: 'Upcoming', opponent: 'School Strikers', opponentTeamId: '', venue: 'School Ground', date: futureDate(5), time: '07:30', overs: 10, ballType: 'Tennis', notes: 'Bring notebook, water and fielding energy.', createdAt: Date.now() - 1000 },
      completedMatch('m1', 'Green Park XI', pastDate(5), '96/5', '88/7', 'win', 'Won by 8 runs', [
        perf('p1',22,16,0,0,0,1), perf('p2',14,11,1,2,14,0), perf('p3',3,4,2,2,13,0), perf('p4',11,9,0,0,0,2), perf('p5',8,7,1,1,9,1), perf('p6',24,14,1,2,16,0), perf('p7',2,3,1,1,7,0), perf('p8',7,5,0,0,0,0), perf('p9',1,2,1,1,10,0), perf('p10',4,3,0,0,0,0)
      ]),
      completedMatch('m2', 'Boundary Breakers', pastDate(12), '74/6', '75/4', 'loss', 'Lost by 6 wickets', [
        perf('p1',19,14,0,0,0,0), perf('p2',6,7,0,1,11,0), perf('p3',1,2,1,2,18,0), perf('p4',9,8,0,0,0,1), perf('p5',17,12,1,2,14,1), perf('p6',10,8,0,1,9,0), perf('p7',2,3,0,1,12,0), perf('p8',5,4,0,0,0,0), perf('p9',0,0,1,1,7,0), perf('p10',3,2,0,0,0,0)
      ])
    ],
    availability: {},
    goals: {},
    opponentTeams: [],
    joinRequests: [],
    chat: [{ id: 'chat-welcome', senderId: 'p6', senderName: 'Swastik', senderRole: 'Captain', text: 'Welcome to the Ball Kho Gayi XI dressing room chat.', createdAt: new Date().toISOString() }],
    practiceTeams: { nameA: 'Team Green', nameB: 'Team Gold', teamA: [], teamB: [], updatedAt: null },
    liveScoring: defaultLiveScoring(),
    gameScores: []
  };

  let data = migrateData(deepClone(seedData));
  let session = null;
  let saveQueue = Promise.resolve();
  let matchFilter = 'Upcoming';
  let statMode = 'runs';
  let confirmAction = null;
  let tossState = { winner: '', result: '', opponent: '' };
  let toastTimer = null;
  let pushRegistration = null;
  let pushSubscription = null;
  let serverUpdatedAt = null;
  let appReady = false;
  let pendingLocalSave = false;

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function makePlayer(id, name, jersey, role, battingStyle, bowlingStyle, note) {
    return { id, name, jersey, role, className: 'School Squad', battingStyle, bowlingStyle, note, phone: '', photo: '', pinHash: DEFAULT_PLAYER_PIN_HASH, status: 'active' };
  }
  function defaultLiveScoring() {
    return { active:false, completed:false, matchId:'', opponent:'', battingSide:'our', oversLimit:10, target:0, runs:0, wickets:0, legalBalls:0, extras:0, striker:'', nonStriker:'', bowler:'', batting:{}, deliveries:[], history:[], startedAt:null, updatedAt:null, updatedBy:'' };
  }
  function completedMatch(id, opponent, date, ourScore, opponentScore, outcome, resultSummary, performances) {
    return { id, status: 'Completed', opponent, opponentTeamId: '', venue: 'School Ground', date, time: '', overs: 10, ballType: 'Tennis', ourScore, opponentScore, tossWinner: outcome === 'win' ? 'Our team' : 'Opponent', tossDecision: 'Bat first', outcome, resultSummary, notes: '', performances, createdAt: Date.now() };
  }
  function perf(playerId, runs, balls, wickets, oversBowled, runsConceded, catches) { return { playerId, runs, balls, wickets, oversBowled, runsConceded, catches }; }
  function deepClone(value) { return JSON.parse(JSON.stringify(value)); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  function pastDate(days) { const d = new Date(); d.setDate(d.getDate() - days); return toDateInput(d); }
  function futureDate(days) { const d = new Date(); d.setDate(d.getDate() + days); return toDateInput(d); }
  function toDateInput(date) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); }

  function migrateData(value) {
    const migrated = value && typeof value === 'object' ? value : deepClone(seedData);
    const oldVersion = Number(migrated.settings?.version || 0);
    migrated.settings = { ...deepClone(seedData.settings), ...(migrated.settings || {}) };
    migrated.settings.adminPinHash = migrated.settings.adminPinHash || DEFAULT_ADMIN_PIN_HASH;
    delete migrated.settings.adminPin;
    migrated.players = Array.isArray(migrated.players) ? migrated.players.map((p) => ({ phone: '', photo: '', pinHash: DEFAULT_PLAYER_PIN_HASH, status: 'active', className: 'School Squad', note: '', battingStyle: 'Right-hand bat', bowlingStyle: 'Does not bowl', ...p, pin: undefined })) : deepClone(seedData.players);
    migrated.players.forEach((p) => delete p.pin);
    migrated.matches = Array.isArray(migrated.matches) ? migrated.matches.map((m) => ({ opponentTeamId: '', time: '', notes: '', performances: [], ...m })) : deepClone(seedData.matches);
    migrated.availability = migrated.availability && typeof migrated.availability === 'object' ? migrated.availability : {};
    migrated.goals = migrated.goals && typeof migrated.goals === 'object' ? migrated.goals : {};
    migrated.opponentTeams = Array.isArray(migrated.opponentTeams) ? migrated.opponentTeams.map((team) => ({ color: '#d6a928', ground: '', players: [], ...team, players: Array.isArray(team.players) ? team.players : [] })) : [];
    migrated.joinRequests = Array.isArray(migrated.joinRequests) ? migrated.joinRequests : [];
    migrated.chat = Array.isArray(migrated.chat) ? migrated.chat.slice(-100) : deepClone(seedData.chat);
    migrated.practiceTeams = { ...deepClone(seedData.practiceTeams), ...(migrated.practiceTeams || {}) };
    migrated.liveScoring = { ...defaultLiveScoring(), ...(migrated.liveScoring || {}), batting: { ...((migrated.liveScoring || {}).batting || {}) }, deliveries: Array.isArray(migrated.liveScoring?.deliveries) ? migrated.liveScoring.deliveries.slice(-36) : [], history: Array.isArray(migrated.liveScoring?.history) ? migrated.liveScoring.history.slice(-25) : [] };
    migrated.gameScores = Array.isArray(migrated.gameScores) ? migrated.gameScores.filter((score) => score && Number.isFinite(Number(score.score))).slice(-50) : [];
    if (oldVersion < 3 && migrated.players.some((p) => p.id === 'p5')) migrated.settings.viceCaptainId = 'p5';
    if (oldVersion < 4) migrated.settings.version = 4;
    return migrated;
  }

  async function hashPin(pin) {
    const bytes = new TextEncoder().encode(String(pin));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function verifyStoredPin(pin, storedValue) {
    const value = String(storedValue || '').trim();
    const hash = await hashPin(pin);
    if (/^[a-f0-9]{64}$/i.test(value)) return { ok: value.toLowerCase() === hash, upgradedHash: '' };
    if (/^\d{4,6}$/.test(value) && value === String(pin)) return { ok: true, upgradedHash: hash };
    return { ok: false, upgradedHash: '' };
  }

  function persistLocalData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
    catch (error) { console.warn('Local backup could not be updated:', error); return false; }
  }

  async function loadDataFromServer() {
    try {
      const response = await fetch('/api/state', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`Database request failed (${response.status})`);
      const payload = await response.json();
      const needsMigrationSave = !payload.state || Number(payload.state?.settings?.version || 0) < 3;
      data = migrateData(payload.state || deepClone(seedData));
      serverUpdatedAt = payload.updatedAt || null;
      persistLocalData();
      if (needsMigrationSave) await saveData();
    } catch (error) {
      console.warn('MongoDB unavailable; using local backup:', error);
      try { data = migrateData(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || deepClone(seedData)); }
      catch { data = migrateData(deepClone(seedData)); }
    }
  }

  function emitSaveState(status, detail = {}) {
    window.dispatchEvent(new CustomEvent('bkgxi:save-state', { detail: { status, ...detail } }));
  }

  function saveData() {
    persistLocalData();
    pendingLocalSave = true;
    const snapshot = deepClone(data);
    emitSaveState('saving');
    saveQueue = saveQueue.catch(() => undefined).then(async () => {
      const response = await fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: snapshot, baseUpdatedAt: serverUpdatedAt })
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 409) {
        const conflict = new Error('Another device saved newer data. Refresh before trying again.');
        conflict.code = 'STATE_CONFLICT';
        emitSaveState('conflict');
        throw conflict;
      }
      if (!response.ok) throw new Error(payload.error || `Save failed (${response.status})`);
      serverUpdatedAt = payload.updatedAt || serverUpdatedAt;
      pendingLocalSave = false;
      emitSaveState('saved');
      return payload;
    }).catch((error) => {
      console.warn('MongoDB save failed; local backup kept:', error);
      pendingLocalSave = true;
      if (error?.code !== 'STATE_CONFLICT') emitSaveState(navigator.onLine ? 'error' : 'offline', { message: error.message });
      return null;
    });
    return saveQueue;
  }

  function saveMergedStateUpdate(mutator, attempts = 2) {
    persistLocalData();
    pendingLocalSave = true;
    emitSaveState('saving');
    saveQueue = saveQueue.catch(() => undefined).then(async () => {
      let lastError = null;
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const latestResponse = await fetch('/api/state', { headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (!latestResponse.ok) throw new Error(`Could not load the latest team data (${latestResponse.status}).`);
        const latestPayload = await latestResponse.json();
        const merged = migrateData(latestPayload.state || deepClone(seedData));
        await mutator(merged);
        const response = await fetch('/api/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: merged, baseUpdatedAt: latestPayload.updatedAt || null })
        });
        const payload = await response.json().catch(() => ({}));
        if (response.status === 409) { lastError = new Error('Another phone saved at the same time. Retrying…'); continue; }
        if (!response.ok) throw new Error(payload.error || `Save failed (${response.status})`);
        data = merged;
        serverUpdatedAt = payload.updatedAt || latestPayload.updatedAt || serverUpdatedAt;
        pendingLocalSave = false;
        persistLocalData();
        emitSaveState('saved');
        return payload;
      }
      const conflict = lastError || new Error('Another device keeps updating the data. Please try again.');
      conflict.code = 'STATE_CONFLICT';
      emitSaveState('conflict');
      throw conflict;
    }).catch((error) => {
      console.warn('Merged MongoDB save failed; local backup kept:', error);
      pendingLocalSave = true;
      if (error?.code !== 'STATE_CONFLICT') emitSaveState(navigator.onLine ? 'error' : 'offline', { message: error.message });
      return null;
    });
    return saveQueue;
  }

  function savePlayerProfileUpdate(playerId, patch) {
    const localPlayer = data.players.find((player) => player.id === playerId && player.status === 'active');
    if (!localPlayer) return Promise.resolve(null);
    Object.assign(localPlayer, patch);
    persistLocalData();
    return saveMergedStateUpdate((latest) => {
      const target = latest.players.find((player) => player.id === playerId && player.status === 'active');
      if (!target) throw new Error('This player profile is no longer active.');
      Object.assign(target, patch);
    });
  }

  async function refreshFromServer() {
    if (document.hidden) return;
    try {
      await saveQueue.catch(() => undefined);
      const response = await fetch('/api/state', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload.state) { data = migrateData(payload.state); serverUpdatedAt = payload.updatedAt || serverUpdatedAt; persistLocalData(); renderAll(); }
    } catch { /* quiet background refresh */ }
  }

  function loadSession() {
    const keys = [SESSION_KEY, ...LEGACY_SESSION_KEYS];
    for (const key of keys) {
      for (const store of [localStorage, sessionStorage]) {
        try {
          const parsed = JSON.parse(store.getItem(key) || 'null');
          if (!parsed) continue;
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) { store.removeItem(key); continue; }
          if (parsed.type === 'admin') return { type:'admin', remember: parsed.remember !== false };
          if (parsed.type === 'player' && data.players.some((p) => p.id === parsed.playerId && p.status === 'active')) return { type:'player', playerId:parsed.playerId, remember:parsed.remember !== false };
        } catch { /* try the next store */ }
      }
    }
    return null;
  }
  function saveSession() {
    [SESSION_KEY, ...LEGACY_SESSION_KEYS].forEach((key) => { localStorage.removeItem(key); sessionStorage.removeItem(key); });
    if (!session) return;
    const remember = session.remember !== false;
    const stored = { ...session, expiresAt: remember ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 12 * 60 * 60 * 1000 };
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(stored));
  }

  function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char])); }
  function safeImage(value, fallback = '') { const v = String(value || ''); return /^(data:image\/|assets\/)/.test(v) ? v : fallback; }
  function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'XI'; }
  function formatDate(value) { if (!value) return 'Date not set'; return new Intl.DateTimeFormat('en-IN', { day:'numeric', month:'short', year:'numeric' }).format(new Date(`${value}T12:00:00`)); }
  function formatTime(value) { try { return new Intl.DateTimeFormat('en-IN', { hour:'numeric', minute:'2-digit' }).format(new Date(value)); } catch { return ''; } }
  function parseScore(score = '') { const match = String(score).match(/\d+/); return match ? Number(match[0]) : 0; }
  function oversToBalls(overs) { const value = Number(overs || 0); return Number.isFinite(value) ? Math.floor(value) * 6 + Math.min(5, Math.max(0, Math.round((value - Math.floor(value)) * 10))) : 0; }
  function activePlayers() { return data.players.filter((p) => p.status !== 'removed'); }
  function getUpcomingMatch() { return data.matches.filter((m) => m.status === 'Upcoming').sort((a,b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))[0] || null; }
  function getSessionPlayer() { if (session?.type === 'player') return data.players.find((p) => p.id === session.playerId) || null; if (session?.type === 'admin') return data.players.find((p) => p.id === data.settings.captainId) || null; return null; }
  function isAdmin() { return session?.type === 'admin'; }
  function isCaptain() { const p = getSessionPlayer(); return Boolean(p && p.id === data.settings.captainId); }
  function isViceCaptain() { const p = getSessionPlayer(); return Boolean(p && p.id === data.settings.viceCaptainId); }
  function canManage() { return isAdmin() || isCaptain() || isViceCaptain(); }
  function canScore() { return canManage(); }
  function leadershipLabel(id) { if (id === data.settings.captainId) return 'Captain'; if (id === data.settings.viceCaptainId) return 'Vice-Captain'; return data.players.find((p) => p.id === id)?.role || 'Player'; }
  function phoneVisible(player) { return isAdmin() || canManage() || session?.playerId === player.id; }
  function displayPhone(player) { if (!player.phone) return ''; if (phoneVisible(player)) return player.phone; const digits = player.phone.replace(/\D/g,''); return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : 'Private'; }
  function jerseyAvailable(jersey, excludeId = '') { return !activePlayers().some((p) => p.id !== excludeId && Number(p.jersey) === Number(jersey)); }
  function validPin(pin) { return /^\d{4,6}$/.test(String(pin)); }
  function validPhone(phone) { const count = String(phone).replace(/\D/g,'').length; return count >= 7 && count <= 15; }

  function avatarHtml(player, size = '') {
    const photo = safeImage(player?.photo);
    return `<div class="profile-photo ${size}">${photo ? `<img src="${photo}" alt="${escapeHtml(player.name)} profile photo" />` : `<span>${initials(player?.name)}</span>`}</div>`;
  }

  function notificationIdentity() {
    const player = getSessionPlayer();
    if (isAdmin()) return { userId: 'admin', userName: data.settings.adminName, role: 'Administrator' };
    if (player) return { userId: player.id, userName: player.name, role: leadershipLabel(player.id) };
    return { userId: '', userName: '', role: 'Guest' };
  }

  function getNotificationPreferences() {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATION_PREF_KEY) || 'null');
      return { ...DEFAULT_NOTIFICATION_PREFS, ...(stored && typeof stored === 'object' ? stored : {}) };
    } catch {
      return { ...DEFAULT_NOTIFICATION_PREFS };
    }
  }

  function saveNotificationPreferences(preferences) {
    const next = { ...DEFAULT_NOTIFICATION_PREFS, ...(preferences || {}) };
    localStorage.setItem(NOTIFICATION_PREF_KEY, JSON.stringify(next));
    return next;
  }

  function readNotificationPreferencesFromUI() {
    const next = getNotificationPreferences();
    $$('[data-notification-pref]').forEach((input) => { next[input.dataset.notificationPref] = Boolean(input.checked); });
    return saveNotificationPreferences(next);
  }

  function renderNotificationPreferences() {
    const preferences = getNotificationPreferences();
    $$('[data-notification-pref]').forEach((input) => {
      input.checked = preferences[input.dataset.notificationPref] !== false;
      input.disabled = !session;
    });
  }

  function urlBase64ToUint8Array(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
  }

  async function getPushRegistration() {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers are not supported on this device.');
    if (!pushRegistration) pushRegistration = await navigator.serviceWorker.ready;
    return pushRegistration;
  }

  async function syncPushSubscription(subscription) {
    if (!subscription || !session) return;
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON(), identity: notificationIdentity(), preferences: getNotificationPreferences() })
    });
  }

  async function initializePushNotifications() {
    updateNotificationUI();
    if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) return;
    try {
      const registration = await getPushRegistration();
      pushSubscription = await registration.pushManager.getSubscription();
      if (pushSubscription && session) await syncPushSubscription(pushSubscription);
    } catch (error) {
      console.warn('Notification initialization failed:', error);
    }
    updateNotificationUI();
  }

  async function updateNotificationPreferencesFromUI() {
    const preferences = readNotificationPreferencesFromUI();
    try {
      if (pushSubscription && session) await syncPushSubscription(pushSubscription);
      toast('Notification choices saved');
    } catch (error) {
      console.warn('Could not sync notification choices:', error);
      toast('Choices saved on this phone and will sync later');
    }
    return preferences;
  }

  function updateNotificationUI() {
    renderNotificationPreferences();
    const card = $('notificationCard'), button = $('notificationToggleBtn'), test = $('notificationTestBtn'), status = $('notificationStatus');
    if (!card || !button || !status) return;
    card.classList.remove('enabled', 'blocked');
    if (!('Notification' in window) || !('PushManager' in window)) {
      status.textContent = 'Notifications are not supported on this browser.';
      button.textContent = 'Not Supported'; button.disabled = true; test?.classList.add('hidden'); return;
    }
    if (Notification.permission === 'denied') {
      status.textContent = 'Blocked in phone settings. Allow notifications for Ball Kho Gayi XI.';
      button.textContent = 'Notifications Blocked'; button.disabled = true; card.classList.add('blocked'); test?.classList.add('hidden'); return;
    }
    button.disabled = false;
    if (pushSubscription) {
      status.textContent = 'Enabled on this phone.';
      button.textContent = 'Disable Notifications'; card.classList.add('enabled'); test?.classList.toggle('hidden', !session);
    } else {
      status.textContent = session ? 'Tap below to receive cricket updates.' : 'Log in, then enable notifications.';
      button.textContent = 'Enable Notifications'; test?.classList.add('hidden');
    }
  }

  async function enablePushNotifications() {
    if (!session) return requireLogin('Log in before enabling notifications.');
    if (!('Notification' in window) || !('PushManager' in window)) return toast('Notifications are not supported on this phone');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { updateNotificationUI(); return toast('Notification permission was not allowed'); }
      const keyResponse = await fetch('/api/push/public-key', { cache: 'no-store' });
      const keyPayload = await keyResponse.json();
      if (!keyResponse.ok || !keyPayload.publicKey) throw new Error(keyPayload.error || 'Push key is unavailable.');
      const registration = await getPushRegistration();
      pushSubscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyPayload.publicKey)
      });
      await syncPushSubscription(pushSubscription);
      updateNotificationUI();
      toast('Notifications enabled on this phone');
    } catch (error) {
      console.error('Could not enable notifications:', error);
      toast(error.message || 'Could not enable notifications');
    }
  }

  async function disablePushNotifications() {
    if (!pushSubscription) return;
    try {
      const endpoint = pushSubscription.endpoint;
      await pushSubscription.unsubscribe();
      await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint }) });
      pushSubscription = null;
      updateNotificationUI();
      toast('Notifications disabled on this phone');
    } catch (error) {
      console.warn('Could not disable notifications:', error);
      toast('Could not disable notifications');
    }
  }

  async function togglePushNotifications() {
    if (pushSubscription) return disablePushNotifications();
    return enablePushNotifications();
  }

  async function sendPushNotification(payload) {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, excludeEndpoint: payload.excludeEndpoint ?? pushSubscription?.endpoint ?? '' })
      });
      return response.ok ? response.json() : null;
    } catch (error) {
      console.warn('Push notification could not be sent:', error);
      return null;
    }
  }

  async function sendTestNotification() {
    if (!pushSubscription) return toast('Enable notifications first');
    const result = await sendPushNotification({
      title: 'Ball Kho Gayi XI Notifications', body: 'Notifications are working on this phone 🏏',
      url: '/#chat', tag: `test-${Date.now()}`, type: 'test', audience: 'endpoint',
      targetEndpoint: pushSubscription.endpoint, excludeEndpoint: ''
    });
    toast(result?.sent ? 'Test notification sent' : 'Test could not be delivered');
  }

  function calculatePlayerStats() {
    const map = {};
    activePlayers().forEach((p) => { map[p.id] = { player:p, matches:0, runs:0, balls:0, wickets:0, ballsBowled:0, runsConceded:0, catches:0, highScore:0, bestWickets:0 }; });
    data.matches.filter((m) => m.status === 'Completed').forEach((match) => (match.performances || []).forEach((performance) => {
      const row = map[performance.playerId]; if (!row) return;
      const appeared = ['runs','balls','wickets','oversBowled','runsConceded','catches'].some((key) => Number(performance[key] || 0) > 0);
      if (appeared) row.matches += 1;
      row.runs += Number(performance.runs || 0); row.balls += Number(performance.balls || 0); row.wickets += Number(performance.wickets || 0); row.ballsBowled += oversToBalls(performance.oversBowled); row.runsConceded += Number(performance.runsConceded || 0); row.catches += Number(performance.catches || 0); row.highScore = Math.max(row.highScore, Number(performance.runs || 0)); row.bestWickets = Math.max(row.bestWickets, Number(performance.wickets || 0));
    }));
    return Object.values(map).map((row) => ({ ...row, strikeRate: row.balls ? row.runs / row.balls * 100 : 0, economy: row.ballsBowled ? row.runsConceded / (row.ballsBowled / 6) : 0 }));
  }

  function renderAll() {
    renderBrand(); renderSummary(); renderLeadership(); renderAccount(); renderMatches(); renderLiveScoring(); renderTeams(); renderPractice(); renderChat(); renderToss(); renderStats(); renderAdmin(); renderLoginOptions(); renderPerformanceRows(); renderOpponentOptions(); applyPermissions(); renderPremiumHome();
    window.BKGXIRouter?.refresh({ scroll: false });
    window.dispatchEvent(new CustomEvent('bkgxi:render', { detail: { reason: 'renderAll' } }));
  }

  function renderBrand() {
    const s = data.settings;
    $('brandName').textContent = s.groupName; $('brandTagline').textContent = s.tagline; $('footerBrand').textContent = s.groupName; $('ourTeamName').textContent = s.groupName;
    $('heroTitle').textContent = s.heroTitle; $('heroSubtitle').textContent = s.heroSubtitle;
    const logo = safeImage(s.logoImage, 'assets/ball-kho-gayi-circle.png'); const hero = safeImage(s.heroImage, 'assets/cric-time-front.jpg');
    ['headerLogo','heroLogo','teamSectionLogo','footerLogo'].forEach((id) => { if ($(id)) $(id).src = logo; }); $('heroImage').src = hero;
    document.title = `${s.groupName} — School Cricket`;
    ['chatWhatsappLink','thankWhatsappLink','profileWhatsappLink'].forEach((id)=>{if($(id))$(id).href=s.whatsappGroupUrl||'#';});
    const completed = data.matches.filter((m) => m.status === 'Completed'); const wins = completed.filter((m) => m.outcome === 'win').length;
    $('heroPlayers').textContent = activePlayers().length; $('heroMatches').textContent = completed.length; $('heroWins').textContent = wins; $('heroRuns').textContent = completed.reduce((sum,m) => sum + parseScore(m.ourScore), 0);
    const upcoming = getUpcomingMatch(); $('nextMatchTitle').textContent = upcoming ? `${s.groupName} vs ${upcoming.opponent}` : 'No match scheduled'; $('nextMatchMeta').textContent = upcoming ? `${formatDate(upcoming.date)} · ${upcoming.time || 'Time TBA'} · ${upcoming.venue}` : 'Captain or admin can add one';
  }

  function renderSummary() {
    const completed = data.matches.filter((m) => m.status === 'Completed'); const wins = completed.filter((m) => m.outcome === 'win').length; const losses = completed.filter((m) => m.outcome === 'loss').length; const ties = completed.filter((m) => m.outcome === 'tie').length;
    $('seasonRecord').textContent = `${wins}W · ${losses}L${ties ? ` · ${ties}T` : ''}`;
    const stats = calculatePlayerStats(); const batter = [...stats].sort((a,b) => b.runs-a.runs)[0]; const bowler = [...stats].sort((a,b) => b.wickets-a.wickets)[0];
    $('topBatter').textContent = batter?.player.name || '—'; $('topBatterStat').textContent = `${batter?.runs || 0} runs`; $('topBowler').textContent = bowler?.player.name || '—'; $('topBowlerStat').textContent = `${bowler?.wickets || 0} wickets`;
    $('announcementTitle').textContent = data.settings.announcementTitle; $('announcementText').textContent = data.settings.announcementText;
  }

  function homeActionIcon(name) {
    const icons = {
      login:'mobile-check', matches:'matches', squad:'squad', chat:'link', profile:'profile',
      live:'live', schedule:'schedule', result:'trophy', notice:'web', admin:'dashboard', game:'game',
      stats:'stats', practice:'team', toss:'cricket', settings:'settings', players:'players'
    };
    const file = icons[name] || 'dashboard';
    return `<img src="assets/ui-icons/${file}.png" alt="" />`;
  }

  function homeActionButton({ action, label, detail, icon, primary = false }) {
    return `<button class="home-action ${primary ? 'primary' : ''}" type="button" data-home-action="${escapeHtml(action)}"><span class="home-action-icon">${homeActionIcon(icon || action)}</span><span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></span></button>`;
  }

  function renderPremiumHome() {
    if (!$('appHomeView')) return;
    const settings = data.settings;
    const player = getSessionPlayer();
    const displayName = isAdmin() ? settings.adminName : player?.name || '';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    $('homeGreeting').textContent = session ? `${greeting}, ${displayName.split(' ')[0]}` : 'Welcome to';
    $('homeHeading').textContent = settings.groupName;
    $('homeRoleBadge').textContent = session ? (isAdmin() ? 'Administrator' : leadershipLabel(player?.id)) : 'Team hub';
    $('homeTeamLogo').src = safeImage(settings.logoImage, 'assets/ball-kho-gayi-circle.png');
    $('homeTeamLogo').alt = `${settings.groupName} logo`;
    const avatar = $('homeProfileButton');
    avatar.innerHTML = player?.photo ? `<img src="${safeImage(player.photo)}" alt="${escapeHtml(displayName)}" />` : `<span id="homeProfileAvatar">${initials(displayName || settings.groupName)}</span>`;
    avatar.setAttribute('aria-label', session ? `Open ${displayName}'s profile` : 'Log in or join');

    const live = data.liveScoring || defaultLiveScoring();
    const liveCard = $('homeLiveCard');
    liveCard.classList.toggle('is-live', Boolean(live.active));
    $('homeLiveStatus').textContent = live.active ? 'Live now' : live.completed ? 'Innings ended' : 'No live match';
    const overs = oversLabel(live.legalBalls || 0);
    const runRate = live.legalBalls ? (live.runs / (live.legalBalls / 6)).toFixed(2) : '0.00';
    $('homeLiveOver').textContent = live.active ? `${overs} of ${live.oversLimit || 10} overs` : live.completed ? `Final innings · ${overs} overs` : 'Ready when the toss is done';
    $('homeLiveOpponent').textContent = live.opponent ? `${settings.groupName} vs ${live.opponent}` : 'The scoreboard is waiting';
    $('homeLiveScore').textContent = `${Number(live.runs || 0)}/${Number(live.wickets || 0)}`;
    $('homeLiveMeta').innerHTML = `<span>${overs} overs</span><span>Run rate ${runRate}</span>${live.target ? `<span>Target ${Number(live.target)}</span>` : ''}`;
    const striker = live.striker ? liveBatter(live.striker) : null;
    const nonStriker = live.nonStriker ? liveBatter(live.nonStriker) : null;
    $('homeLiveBatters').innerHTML = live.opponent ? `<span><strong>${escapeHtml(live.striker || 'Striker')}</strong>${striker ? ` · ${striker.runs} (${striker.balls})` : ''}</span><span>${escapeHtml(live.nonStriker || 'Non-striker')}${nonStriker ? ` · ${nonStriker.runs} (${nonStriker.balls})` : ''}${live.bowler ? ` · Bowler ${escapeHtml(live.bowler)}` : ''}</span>` : '<span>No innings in progress</span><span>Leadership can start scoring from Quick Actions.</span>';
    const liveAction = $('homeLiveAction');
    liveAction.dataset.homeAction = canManage() ? 'live' : 'matches';
    liveAction.textContent = live.active && canManage() ? 'Open scorer' : canManage() ? 'Start live score' : 'View matches';

    const upcoming = getUpcomingMatch();
    if (upcoming) {
      const date = new Date(`${upcoming.date}T12:00:00`);
      $('homeUpcomingDate').innerHTML = `<strong>${date.getDate()}</strong><span>${date.toLocaleDateString('en-IN', { month:'short' })}</span>`;
      $('homeUpcomingOpponent').textContent = `${settings.groupName} vs ${upcoming.opponent}`;
      $('homeUpcomingMeta').textContent = `${upcoming.time || 'Time TBA'} · ${upcoming.venue} · ${upcoming.overs} overs · ${upcoming.ballType || 'Ball TBA'}`;
      if (isAdmin()) {
        const responses = Object.values(data.availability[upcoming.id] || {});
        $('homeUpcomingStatus').textContent = `${responses.filter((value) => value === 'Available').length} players available`;
      } else if (player) {
        const availability = data.availability[upcoming.id]?.[player.id] || '';
        $('homeUpcomingStatus').textContent = availability ? `You are ${availability.toLowerCase()}` : 'Availability not set';
      } else $('homeUpcomingStatus').textContent = 'Log in for availability';
    } else {
      $('homeUpcomingDate').innerHTML = '<strong>—</strong><span>TBA</span>';
      $('homeUpcomingOpponent').textContent = 'No fixture scheduled';
      $('homeUpcomingMeta').textContent = 'The next match will appear here when leadership schedules it.';
      $('homeUpcomingStatus').textContent = canManage() ? 'Ready to schedule' : 'Not scheduled';
    }

    const recent = data.matches.filter((match) => match.status === 'Completed').sort((a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`))[0];
    const outcome = $('homeRecentOutcome');
    outcome.classList.remove('win', 'loss');
    if (recent) {
      const outcomeText = recent.outcome === 'win' ? 'Win' : recent.outcome === 'loss' ? 'Loss' : recent.outcome === 'tie' ? 'Tie' : 'No result';
      outcome.textContent = outcomeText;
      if (recent.outcome === 'win' || recent.outcome === 'loss') outcome.classList.add(recent.outcome);
      $('homeRecentOpponent').textContent = `${settings.groupName} vs ${recent.opponent}`;
      $('homeRecentScores').innerHTML = `<div><small>${escapeHtml(settings.groupName)}</small><strong>${escapeHtml(recent.ourScore || '—')}</strong></div><div><small>${escapeHtml(recent.opponent)}</small><strong>${escapeHtml(recent.opponentScore || '—')}</strong></div>`;
      $('homeRecentSummary').textContent = recent.resultSummary || formatDate(recent.date);
    } else {
      outcome.textContent = 'No result';
      $('homeRecentOpponent').textContent = 'No completed match yet';
      $('homeRecentScores').innerHTML = `<div><small>${escapeHtml(settings.groupName)}</small><strong>—</strong></div><div><small>Opponent</small><strong>—</strong></div>`;
      $('homeRecentSummary').textContent = 'Completed scorecards will appear here.';
    }

    $('homeAnnouncementTitle').textContent = settings.announcementTitle || 'Captain’s board';
    $('homeAnnouncementText').textContent = settings.announcementText || 'Team announcements will appear here.';

    let actions;
    if (!session) {
      actions = [
        { action:'login', label:'Log in or join', detail:'Enter your private dressing room', icon:'login', primary:true },
        { action:'matches', label:'Matches', detail:'Fixtures and scorecards', icon:'matches' },
        { action:'squad', label:'Squad', detail:'Players and season stats', icon:'squad' },
        { action:'chat', label:'Team chat', detail:'Open the dressing room', icon:'chat' },
        { action:'game', label:'Boundary Blitz', detail:'Play the cricket mini-game', icon:'game' }
      ];
      $('homeQuickCaption').textContent = 'Explore the team or enter your player account.';
    } else if (isAdmin()) {
      actions = [
        { action:'admin', label:'Admin dashboard', detail:'Players, teams and settings', icon:'admin', primary:true },
        { action:'live', label:'Live scoring', detail:'Start or continue an innings', icon:'live' },
        { action:'schedule', label:'Schedule match', detail:'Create the next fixture', icon:'schedule' },
        { action:'result', label:'Add result', detail:'Upload a completed scorecard', icon:'result' },
        { action:'game', label:'Boundary Blitz', detail:'Team high-score challenge', icon:'game' }
      ];
      $('homeQuickCaption').textContent = 'Administrative and match-day controls.';
    } else if (canManage()) {
      actions = [
        { action:'live', label:'Live scoring', detail:'Start or continue an innings', icon:'live', primary:true },
        { action:'schedule', label:'Schedule match', detail:'Create the next fixture', icon:'schedule' },
        { action:'result', label:'Add result', detail:'Upload a completed scorecard', icon:'result' },
        { action:'notice', label:'Announcement', detail:'Update the captain’s board', icon:'notice' },
        { action:'game', label:'Boundary Blitz', detail:'Team high-score challenge', icon:'game' }
      ];
      $('homeQuickCaption').textContent = 'Leadership controls for the next match.';
    } else {
      actions = [
        { action:'matches', label:'Matches', detail:'Fixtures and scorecards', icon:'matches', primary:true },
        { action:'squad', label:'Squad', detail:'Player profiles and statistics', icon:'squad' },
        { action:'chat', label:'Team chat', detail:'Message the whole group', icon:'chat' },
        { action:'profile', label:'My profile', detail:'Stats, goal and availability', icon:'profile' },
        { action:'game', label:'Boundary Blitz', detail:'Play and set a high score', icon:'game' }
      ];
      $('homeQuickCaption').textContent = 'Your fastest routes around the team app.';
    }
    $('homeQuickActions').innerHTML = actions.map(homeActionButton).join('');
  }

  function handleHomeAction(action) {
    if (action === 'login') return openModal('loginModal');
    if (action === 'profile') return session ? window.BKGXIRouter?.navigate('profile') : openModal('loginModal');
    if (action === 'game') { window.location.href = '/game.html'; return; }
    if (['matches','squad','chat','admin'].includes(action)) return window.BKGXIRouter?.navigate(action);
    if (action === 'live') return canManage() ? openLiveSetup() : window.BKGXIRouter?.navigate('matches');
    if (action === 'schedule') return canManage() ? openModal('scheduleModal') : requireLogin();
    if (action === 'result') return openResultModal();
    if (action === 'notice') {
      if (!canManage()) return requireLogin();
      $('noticeTitleInput').value = data.settings.announcementTitle;
      $('noticeTextInput').value = data.settings.announcementText;
      return openModal('noticeModal');
    }
  }

  function renderLeadership() {
    $('captainName').textContent = data.players.find((p) => p.id === data.settings.captainId)?.name || 'Not assigned';
    $('viceCaptainName').textContent = data.players.find((p) => p.id === data.settings.viceCaptainId)?.name || 'Not assigned';
  }

  function renderAccount() {
    const dashboard = $('my-dashboard');
    if (!session) { dashboard.classList.add('hidden'); $('loginBtn').classList.remove('hidden'); $('accountBtn').classList.add('hidden'); $('mobileAccountBtn')?.querySelector('span:last-child') && ($('mobileAccountBtn').querySelector('span:last-child').textContent = 'Profile'); return; }
    dashboard.classList.remove('hidden'); $('loginBtn').classList.add('hidden'); $('accountBtn').classList.remove('hidden'); $('mobileAccountBtn')?.querySelector('span:last-child') && ($('mobileAccountBtn').querySelector('span:last-child').textContent = 'Profile');
    const player = getSessionPlayer(); const displayName = isAdmin() ? data.settings.adminName : player?.name || 'Player'; const role = isAdmin() ? 'Administrator' : leadershipLabel(player?.id);
    $('accountAvatar').textContent = initials(displayName); $('accountName').textContent = displayName; $('accountRole').textContent = role; $('dashboardName').textContent = displayName; $('dashboardRole').textContent = role; $('dashboardGreeting').textContent = `Welcome back, ${displayName.split(' ')[0]}`; $('dashboardEyebrow').textContent = isAdmin() ? 'Administrator Dashboard' : isCaptain() ? 'Captain Dashboard' : isViceCaptain() ? 'Vice-Captain Dashboard' : 'My Dressing Room';
    const photoBox = $('dashboardPhoto'); photoBox.innerHTML = player?.photo ? `<img src="${safeImage(player.photo)}" alt="${escapeHtml(displayName)}" />` : `<span id="dashboardAvatar">${initials(displayName)}</span>`;
    if (!player) { $('dashboardPlayerMeta').textContent = 'Website administration account'; $('dashboardPhone').textContent = ''; ['myMatches','myRuns','myWickets','myCatches'].forEach((id) => $(id).textContent = '—'); $('myStrikeRate').textContent = '—'; $('myEconomy').textContent = '—'; $('recentForm').innerHTML = '<p class="muted">No linked player profile.</p>'; renderCaptainDashboard(); return; }
    const stats = calculatePlayerStats(); const stat = stats.find((s) => s.player.id === player.id) || { matches:0,runs:0,wickets:0,catches:0,strikeRate:0,economy:0,ballsBowled:0 };
    $('dashboardPlayerMeta').textContent = `Jersey ${player.jersey} · ${player.role} · ${player.className || 'School Squad'}`; $('dashboardPhone').textContent = displayPhone(player);
    $('myMatches').textContent = stat.matches; $('myRuns').textContent = stat.runs; $('myWickets').textContent = stat.wickets; $('myCatches').textContent = stat.catches; $('myStrikeRate').textContent = stat.strikeRate.toFixed(1); $('myEconomy').textContent = stat.ballsBowled ? stat.economy.toFixed(2) : '—';
    const runRank = [...stats].sort((a,b) => b.runs-a.runs).findIndex((s) => s.player.id===player.id)+1; const wicketRank = [...stats].sort((a,b) => b.wickets-a.wickets).findIndex((s) => s.player.id===player.id)+1;
    $('myBatRank').textContent = `Batting rank #${runRank}`; $('myBowlRank').textContent = `Bowling rank #${wicketRank}`; $('personalGoalInput').value = data.goals[player.id] || '';
    renderPersonalMatch(player); renderRecentForm(player); renderCaptainDashboard();
  }

  function renderPersonalMatch(player) {
    const match = getUpcomingMatch(); const buttons = $$('[data-availability]', $('availabilityButtons'));
    if (!match) { $('myNextMatch').textContent='No match scheduled'; $('myNextMatchMeta').textContent='A match will appear here when scheduled.'; $('matchCountdown').textContent='No countdown'; $('availabilitySaved').textContent=''; buttons.forEach((b)=>{b.disabled=true;b.classList.remove('active');}); return; }
    $('myNextMatch').textContent = `${data.settings.groupName} vs ${match.opponent}`; $('myNextMatchMeta').textContent = `${formatDate(match.date)} · ${match.time || 'Time TBA'} · ${match.venue} · ${match.overs} overs`;
    const days = Math.ceil((new Date(`${match.date}T${match.time || '00:00'}`)-new Date())/86400000); $('matchCountdown').textContent = days>1?`${days} days to go`:days===1?'Tomorrow':days===0?'Match day':'Fixture date passed';
    const status = data.availability[match.id]?.[player.id] || ''; buttons.forEach((b)=>{b.disabled=false;b.classList.toggle('active',b.dataset.availability===status);}); $('availabilitySaved').textContent = status ? `Saved: ${status}` : 'Not answered yet';
  }

  function renderRecentForm(player) {
    const recent = data.matches.filter((m)=>m.status==='Completed' && (m.performances||[]).some((p)=>p.playerId===player.id)).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5).map((match)=>({match,performance:match.performances.find((p)=>p.playerId===player.id)}));
    if (!recent.length) { $('recentForm').innerHTML='<p class="muted">No match performance uploaded yet.</p>'; $('bestPerformance').textContent='Play a match and ask the captain to upload the scorecard.'; return; }
    const maxRuns=Math.max(20,...recent.map((r)=>Number(r.performance.runs||0))); $('recentForm').innerHTML=recent.reverse().map(({match,performance})=>`<div class="form-bar-item"><div class="form-bar" style="height:${Math.max(10,Math.round(Number(performance.runs||0)/maxRuns*100))}%"><span>${performance.runs||0}</span></div><small>${escapeHtml(match.opponent.slice(0,5))}</small><b>${performance.wickets||0}W</b></div>`).join('');
    const best=[...recent].sort((a,b)=>(b.performance.runs+b.performance.wickets*18+b.performance.catches*8)-(a.performance.runs+a.performance.wickets*18+a.performance.catches*8))[0]; $('bestPerformance').innerHTML=`<strong>Best recent impact:</strong> ${escapeHtml(best.match.opponent)} · ${best.performance.runs||0} runs · ${best.performance.wickets||0} wickets`;
  }

  function renderCaptainDashboard() {
    const node=$('captainDashboard'); if(!canManage()){node.classList.add('hidden');return;} node.classList.remove('hidden');
    const completed=data.matches.filter((m)=>m.status==='Completed').sort((a,b)=>new Date(b.date)-new Date(a.date)); const wins=completed.filter((m)=>m.outcome==='win').length;
    $('captainWins').textContent=wins; $('captainRecord').textContent=`${completed.length} completed matches`; $('captainWinRate').textContent=completed.length?`${Math.round(wins/completed.length*100)}%`:'0%'; $('captainTeamRuns').textContent=completed.reduce((s,m)=>s+parseScore(m.ourScore),0); $('captainStreak').textContent=completed.slice(0,5).map((m)=>m.outcome==='win'?'W':m.outcome==='loss'?'L':'T').join(' · ')||'—';
    const upcoming=getUpcomingMatch(); $('availabilityMatchTitle').textContent=upcoming?`vs ${upcoming.opponent}`:'No upcoming fixture';
    if(!upcoming){$('captainAvailability').innerHTML='<p class="muted">Schedule a match to collect availability.</p>';} else {const map=data.availability[upcoming.id]||{};$('captainAvailability').innerHTML=activePlayers().map((p)=>`<div class="availability-person">${avatarHtml(p)}<div><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(leadershipLabel(p.id))}</small></div><b class="availability-status">${escapeHtml(map[p.id]||'No reply')}</b></div>`).join('');}
    const stats=calculatePlayerStats(); const leaders=[['Top runs',[...stats].sort((a,b)=>b.runs-a.runs)[0],(s)=>`${s.runs} runs`],['Top wickets',[...stats].sort((a,b)=>b.wickets-a.wickets)[0],(s)=>`${s.wickets} wickets`],['Top catches',[...stats].sort((a,b)=>b.catches-a.catches)[0],(s)=>`${s.catches} catches`]];
    $('captainLeaders').innerHTML=leaders.map(([label,stat,fmt])=>`<div>${avatarHtml(stat?.player)}<div><small>${label}</small><strong>${escapeHtml(stat?.player.name||'—')}</strong></div><b>${stat?fmt(stat):'—'}</b></div>`).join('');
  }

  function matchDateParts(match) {
    if (!match?.date) return { day:'—', month:'TBA', year:'' };
    const date = new Date(`${match.date}T12:00:00`);
    if (Number.isNaN(date.getTime())) return { day:'—', month:'TBA', year:'' };
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: date.toLocaleDateString('en-IN', { month:'short' }),
      year: String(date.getFullYear())
    };
  }

  function matchAvailabilityText(match) {
    if (match.status !== 'Upcoming') return '';
    const player = getSessionPlayer();
    const availability = data.availability[match.id] || {};
    if (canManage()) {
      const replies = Object.values(availability);
      const available = replies.filter((value) => value === 'Available').length;
      const pending = Math.max(0, activePlayers().length - replies.length);
      return `${available} available${pending ? ` · ${pending} awaiting reply` : ' · all replies received'}`;
    }
    if (player) {
      const answer = availability[player.id];
      return answer ? `Your availability: ${answer}` : 'Your availability has not been set';
    }
    return 'Log in to update your availability';
  }

  function renderMatches() {
    const allMatches = [...data.matches];
    const upcomingMatches = allMatches
      .filter((match) => match.status === 'Upcoming')
      .sort((a,b) => new Date(`${a.date || '9999-12-31'}T${a.time || '23:59'}`) - new Date(`${b.date || '9999-12-31'}T${b.time || '23:59'}`));
    const completedMatches = allMatches
      .filter((match) => match.status === 'Completed')
      .sort((a,b) => new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`) - new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`));
    const wins = completedMatches.filter((match) => match.outcome === 'win').length;
    const losses = completedMatches.filter((match) => match.outcome === 'loss').length;
    const ties = completedMatches.filter((match) => match.outcome === 'tie').length;
    const winRate = completedMatches.length ? Math.round((wins / completedMatches.length) * 100) : 0;

    if ($('matchesRecord')) $('matchesRecord').textContent = `${wins}W · ${losses}L${ties ? ` · ${ties}T` : ''}`;
    if ($('matchesRecordLabel')) $('matchesRecordLabel').textContent = completedMatches.length ? `${completedMatches.length} completed match${completedMatches.length === 1 ? '' : 'es'} this season` : 'No completed matches yet';
    if ($('matchesUpcomingCount')) $('matchesUpcomingCount').textContent = upcomingMatches.length;
    if ($('matchesCompletedCount')) $('matchesCompletedCount').textContent = completedMatches.length;
    if ($('matchesWinRate')) $('matchesWinRate').textContent = `${winRate}%`;
    if ($('matchesWinRateLabel')) $('matchesWinRateLabel').textContent = completedMatches.length ? `${wins} win${wins === 1 ? '' : 's'} from ${completedMatches.length}` : 'This season';
    if ($('matchesUpcomingTabCount')) $('matchesUpcomingTabCount').textContent = upcomingMatches.length;
    if ($('matchesCompletedTabCount')) $('matchesCompletedTabCount').textContent = completedMatches.length;
    if ($('matchesAllTabCount')) $('matchesAllTabCount').textContent = allMatches.length;
    if ($('matchesSubtitle')) $('matchesSubtitle').textContent = allMatches.length ? `${allMatches.length} match${allMatches.length === 1 ? '' : 'es'} recorded for ${data.settings.groupName}.` : `Fixtures and scorecards for ${data.settings.groupName}.`;

    $$('[data-match-filter]').forEach((button) => {
      const active = button.dataset.matchFilter === matchFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });

    let matches;
    if (matchFilter === 'Upcoming') matches = upcomingMatches;
    else if (matchFilter === 'Completed') matches = completedMatches;
    else matches = [...upcomingMatches, ...completedMatches];

    const caption = matchFilter === 'Upcoming'
      ? 'Upcoming fixtures, ordered by match time.'
      : matchFilter === 'Completed'
        ? 'Latest completed scorecards first.'
        : 'Every fixture and result in one place.';
    if ($('matchesFilterCaption')) $('matchesFilterCaption').textContent = caption;

    $('matchGrid').innerHTML = matches.map((match) => {
      const completed = match.status === 'Completed';
      const date = matchDateParts(match);
      const opponentTeam = data.opponentTeams.find((team) => team.id === match.opponentTeamId);
      const availabilityText = matchAvailabilityText(match);
      const actions = [
        `<button class="match-card-action ${completed ? 'primary' : ''}" type="button" data-scorecard="${escapeHtml(match.id)}">${completed ? 'View scorecard' : 'View details'}</button>`,
        !completed && canScore() ? `<button class="match-card-action primary" type="button" data-live-match="${escapeHtml(match.id)}">Open live scorer</button>` : '',
        !completed && canScore() ? `<button class="match-card-action" type="button" data-complete-match="${escapeHtml(match.id)}">Add result</button>` : '',
        isAdmin() ? `<button class="match-card-action danger" type="button" data-delete-match="${escapeHtml(match.id)}">Delete</button>` : ''
      ].filter(Boolean).join('');
      const scorePanel = completed ? `<div class="match-score-panel"><div><small>${escapeHtml(data.settings.groupName)}</small><strong>${escapeHtml(match.ourScore || '—')}</strong></div><b>FINAL</b><div><small>${escapeHtml(match.opponent)}</small><strong>${escapeHtml(match.opponentScore || '—')}</strong></div></div>` : '';
      const result = completed ? `<p class="match-card-result">${escapeHtml(match.resultSummary || 'Match completed')}</p>` : '';
      const note = escapeHtml(match.notes || (completed ? 'Scorecard saved.' : 'Fixture scheduled.'));
      return `<article class="match-list-card ${completed ? 'is-completed' : 'is-upcoming'}" data-match-detail="${escapeHtml(match.id)}" aria-label="${escapeHtml(data.settings.groupName)} versus ${escapeHtml(match.opponent)}">
        <div class="match-card-date"><span>${escapeHtml(date.month)}</span><strong>${escapeHtml(date.day)}</strong><small>${escapeHtml(date.year)}</small></div>
        <div class="match-card-body">
          <div class="match-card-topline"><span class="match-card-status ${completed ? 'completed' : ''}">${completed ? 'Completed' : 'Upcoming'}</span><span class="match-card-type">${Number(match.overs || 0)} overs</span></div>
          <div class="match-versus">
            <div class="match-team"><span class="match-team-badge">${escapeHtml(initials(data.settings.groupName))}</span><div><small>Our team</small><strong>${escapeHtml(data.settings.groupName)}</strong></div></div>
            <span class="match-vs">VS</span>
            <div class="match-team away"><div><small>Opponent</small><strong>${escapeHtml(match.opponent)}</strong></div><span class="match-team-badge">${escapeHtml(initials(match.opponent))}</span></div>
          </div>
          ${scorePanel}
          <div class="match-card-meta"><span>⌚ ${escapeHtml(match.time || 'Time TBA')}</span><span>⌖ ${escapeHtml(match.venue || 'Venue TBA')}</span><span>● ${escapeHtml(match.ballType || 'Tennis')} ball</span>${opponentTeam ? `<span>♟ ${opponentTeam.players.length} listed players</span>` : ''}</div>
          ${result}
          <p class="match-card-note">${note}</p>
          ${availabilityText ? `<p class="match-card-availability">${escapeHtml(availabilityText)}</p>` : ''}
          ${actions ? `<div class="match-card-actions">${actions}</div>` : ''}
        </div>
      </article>`;
    }).join('');

    const empty = matches.length === 0;
    $('matchEmpty').classList.toggle('hidden', !empty);
    if (empty && $('matchesEmptyTitle')) {
      $('matchesEmptyTitle').textContent = matchFilter === 'Completed' ? 'No completed scorecards' : matchFilter === 'all' ? 'No matches recorded' : 'No upcoming fixtures';
      $('matchesEmptyCopy').textContent = matchFilter === 'Completed'
        ? 'Completed matches will appear here after leadership saves a result.'
        : matchFilter === 'all'
          ? 'Schedule the first fixture to begin the season record.'
          : canManage() ? 'Use Schedule Match when the team is ready for its next fixture.' : 'Leadership will add the next fixture when it is confirmed.';
    }
  }

  function liveBatter(name) {
    const key = String(name || 'Batter').trim() || 'Batter';
    data.liveScoring.batting[key] = data.liveScoring.batting[key] || { runs:0, balls:0 };
    return data.liveScoring.batting[key];
  }
  function liveScoreText() {
    const s=data.liveScoring; const overs=`${Math.floor(s.legalBalls/6)}.${s.legalBalls%6}`;
    return `${data.settings.groupName} live score: ${s.runs}/${s.wickets} in ${overs} overs vs ${s.opponent || 'Opponent'}${s.target ? ` | Target ${s.target}` : ''}`;
  }
  function pushLiveHistory() {
    const s=data.liveScoring; const {history,...snapshot}=s; s.history.push(JSON.stringify(snapshot)); s.history=s.history.slice(-25);
  }
  function swapLiveStrike(save=true) {
    const s=data.liveScoring; [s.striker,s.nonStriker]=[s.nonStriker,s.striker]; if(save){s.updatedAt=new Date().toISOString();saveData();renderLiveScoring();renderPremiumHome();}
  }
  function recordLiveBall(type,value) {
    if(!canScore())return requireLogin('Admin, captain or vice-captain login required.');
    const s=data.liveScoring;if(!s.active)return toast('Start the live scoreboard first');pushLiveHistory();
    const batter=liveBatter(s.striker);let label=String(value),legal=false,runs=0;
    if(type==='run'){runs=Number(value);s.runs+=runs;batter.runs+=runs;batter.balls+=1;legal=true;}
    else if(type==='wicket'){s.wickets=Math.min(10,s.wickets+1);batter.balls+=1;legal=true;label='W';}
    else if(type==='wide'){s.runs+=1;s.extras+=1;label='Wd';}
    else if(type==='noball'){s.runs+=1;s.extras+=1;label='Nb';}
    else if(type==='bye'||type==='legbye'){s.runs+=1;s.extras+=1;batter.balls+=1;legal=true;label=type==='bye'?'B':'Lb';runs=1;}
    if(legal){s.legalBalls+=1;if(runs%2===1)swapLiveStrike(false);if(s.legalBalls%6===0)swapLiveStrike(false);}
    s.deliveries.push({label,type,over:`${Math.floor(Math.max(0,s.legalBalls-1)/6)}.${s.legalBalls%6}`,at:new Date().toISOString()});s.deliveries=s.deliveries.slice(-36);s.updatedAt=new Date().toISOString();s.updatedBy=isAdmin()?data.settings.adminName:(getSessionPlayer()?.name||'Scorer');
    if(s.wickets>=10 || s.legalBalls>=Number(s.oversLimit||10)*6 || (s.target && s.runs>=s.target)){s.active=false;s.completed=true;}
    const importantBall = label === 'W' || label === '4' || label === '6' || s.completed;
    if (importantBall) sendPushNotification({title:s.completed?'Innings Update':`${label === 'W' ? 'Wicket!' : `${label} runs!`} · Ball Kho Gayi XI`,body:liveScoreText(),url:'/#/live-scoring',tag:'live-score',type:'live-score'});
    saveData();renderLiveScoring();renderPremiumHome();
  }
  function undoLiveBall(){if(!canScore())return;const s=data.liveScoring,previous=s.history.pop();if(!previous)return toast('Nothing to undo');const history=[...s.history];data.liveScoring={...defaultLiveScoring(),...JSON.parse(previous),history};saveData();renderLiveScoring();renderPremiumHome();toast('Last ball undone');}
  function resetLiveScore(){if(!canScore())return;askConfirm('Reset live score?','All current ball-by-ball entries will be cleared.',()=>{data.liveScoring=defaultLiveScoring();saveData();renderLiveScoring();renderPremiumHome();toast('Live score reset');});}
  function openLiveSetup(matchId=''){if(!canScore())return requireLogin('Admin, captain or vice-captain login required.');renderLiveSetupOptions();const s=data.liveScoring;const selected=matchId||s.matchId||getUpcomingMatch()?.id||'';$('liveMatchSelect').value=selected;const m=data.matches.find((x)=>x.id===selected);$('liveOpponentInput').value=m?.opponent||s.opponent||'';$('liveOversInput').value=m?.overs||s.oversLimit||10;$('liveBattingSide').value=s.battingSide||'our';$('liveTargetInput').value=s.target||'';$('liveStrikerInput').value=s.striker||activePlayers()[0]?.name||'';$('liveNonStrikerInput').value=s.nonStriker||activePlayers()[1]?.name||'';$('liveBowlerInput').value=s.bowler||'';openModal('liveSetupModal');}
  function renderLiveSetupOptions(){const upcoming=data.matches.filter((m)=>m.status==='Upcoming');$('liveMatchSelect').innerHTML=`<option value=\"\">Custom live match</option>${upcoming.map((m)=>`<option value=\"${m.id}\">${escapeHtml(m.opponent)} · ${formatDate(m.date)}</option>`).join('')}`;$('livePlayerNames').innerHTML=activePlayers().map((p)=>`<option value=\"${escapeHtml(p.name)}\"></option>`).join('');const opponentNames=data.opponentTeams.flatMap((t)=>t.players.map((p)=>p.name));$('liveAllNames').innerHTML=[...activePlayers().map((p)=>p.name),...opponentNames].map((name)=>`<option value=\"${escapeHtml(name)}\"></option>`).join('');}
  function renderLiveScoring(){
    const s=data.liveScoring||defaultLiveScoring(),overs=`${Math.floor(s.legalBalls/6)}.${s.legalBalls%6}`,rate=s.legalBalls?(s.runs/(s.legalBalls/6)).toFixed(2):'0.00',striker=liveBatter(s.striker||'Striker'),non=liveBatter(s.nonStriker||'Non-striker'),need=s.target?Math.max(0,s.target-s.runs):null;
    $('liveStatus').textContent=s.active?'LIVE':s.completed?'INNINGS ENDED':'NOT STARTED';$('liveStatus').classList.toggle('live',s.active);$('liveFixture').textContent=s.opponent?`${data.settings.groupName} vs ${s.opponent}`:'Choose a match to begin';$('liveTotal').textContent=`${s.runs}/${s.wickets}`;$('liveOvers').textContent=overs;$('liveRunRate').textContent=rate;$('liveTargetDisplay').textContent=s.target||'—';$('liveNeed').textContent=need===null?'—':need;$('liveExtras').textContent=s.extras;$('liveBattingTeam').textContent=s.battingSide==='our'?`${data.settings.groupName} batting`:`${s.opponent||'Opponent'} batting`;$('liveStrikerName').textContent=s.striker||'Striker';$('liveStrikerStat').textContent=`${striker.runs} (${striker.balls})`;$('liveNonStrikerName').textContent=s.nonStriker||'Non-striker';$('liveNonStrikerStat').textContent=`${non.runs} (${non.balls})`;$('liveBowlerName').textContent=s.bowler||'Bowler';$('liveLimit').textContent=`${s.oversLimit||10} overs`;$('liveSavedAt').textContent=s.updatedAt?`Last saved ${formatTime(s.updatedAt)} by ${s.updatedBy||'scorer'}`:'Set up a match to start scoring.';
    const recent=s.deliveries.slice(-18);$('liveDeliveries').innerHTML=recent.length?recent.map((d)=>`<span class=\"delivery-ball ${d.label==='W'?'wicket':(['4','6'].includes(d.label)?'boundary':'')}\">${escapeHtml(d.label)}</span>`).join(''):'<span class=\"muted\">No balls recorded yet.</span>';
    $$('[data-live-ball]').forEach((b)=>b.disabled=!s.active||!canScore());['liveUndoBtn','liveSwapBtn','liveChangePlayersBtn','liveUseResultBtn','liveShareBtn','liveEndBtn'].forEach((id)=>{if($(id))$(id).disabled=!s.active||!canScore();});
  }
  function useLiveInResult(){const s=data.liveScoring;if(!s.opponent)return toast('Start a live match first');openResultModal(s.matchId||'');$('resultOpponent').value=s.opponent;const score=`${s.runs}/${s.wickets}`;if(s.battingSide==='our')$('ourScore').value=score;else $('opponentScore').value=score;$('resultNotes').value=`Live innings: ${oversLabel(s.legalBalls)} overs. ${s.extras} extras.`;}
  function oversLabel(balls){return `${Math.floor(Number(balls||0)/6)}.${Number(balls||0)%6}`;}
  async function shareLiveScore(){const text=liveScoreText();try{if(navigator.share){await navigator.share({title:'Ball Kho Gayi XI Live Score',text});}else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('Live score copied');}else{window.prompt('Copy live score',text);}}catch{/* share cancelled */}}

  function renderTeams() {
    const stats=new Map(calculatePlayerStats().map((row)=>[row.player.id,row])); $('ourPlayerGrid').innerHTML=activePlayers().sort((a,b)=>a.name.localeCompare(b.name)).map((p)=>playerCard(p,stats.get(p.id))).join('');
    $('opponentTeamGrid').innerHTML=data.opponentTeams.map((team)=>`<article class="opponent-card"><div class="opponent-head"><span class="opponent-logo" style="background:${escapeHtml(team.color)}">${initials(team.name)}</span><div><h3>${escapeHtml(team.name)}</h3><small>${escapeHtml(team.ground||'Ground not set')} · ${team.players.length} players</small></div><div class="opponent-actions">${isAdmin()?`<button class="card-btn" data-edit-opponent-team="${team.id}">Edit</button><button class="card-btn danger-text" data-delete-opponent-team="${team.id}">Delete</button>`:''}</div></div><div class="opponent-roster">${team.players.length?team.players.map((p)=>`<div class="opponent-player"><span>${initials(p.name)}</span><div><strong>${escapeHtml(p.name)}</strong><small>#${escapeHtml(p.jersey||'—')} · ${escapeHtml(p.role||'Player')}</small></div>${isAdmin()?`<button class="message-delete" data-edit-opponent-player="${p.id}" data-team-id="${team.id}">Edit</button><button class="message-delete" data-delete-opponent-player="${p.id}" data-team-id="${team.id}">×</button>`:''}</div>`).join(''):'<p class="muted">No players added yet.</p>'}</div>${isAdmin()?`<button class="secondary-btn small wide" data-add-opponent-player="${team.id}">Add Opponent Player</button>`:''}</article>`).join(''); $('opponentEmpty').classList.toggle('hidden',data.opponentTeams.length>0);
  }

  function playerCard(player, stat) {
    return `<article class="premium-player-card" data-player-name="${escapeHtml(player.name.toLowerCase())}" data-player-role="${escapeHtml(player.role)}"><div class="player-card-top">${avatarHtml(player)}<span class="jersey">#${escapeHtml(player.jersey)}</span></div><h3>${escapeHtml(player.name)}</h3><p class="player-role">${escapeHtml(leadershipLabel(player.id))}</p><p class="player-meta">${escapeHtml(player.role)} · ${escapeHtml(player.className || 'School Squad')}</p><div class="player-mini-stats"><span><b>${stat?.matches||0}</b><small>Matches</small></span><span><b>${stat?.runs||0}</b><small>Runs</small></span><span><b>${stat?.wickets||0}</b><small>Wickets</small></span></div><div class="player-card-footer"><button data-player-detail="${player.id}">View profile</button>${isAdmin()?`<button data-edit-player="${player.id}">Edit</button>`:''}</div></article>`;
  }

  function renderPractice() {
    const pt=data.practiceTeams; $('practiceNameA').textContent=pt.nameA; $('practiceNameB').textContent=pt.nameB;
    const renderList=(ids,side)=>ids.length?ids.map((id)=>{const p=data.players.find((x)=>x.id===id);if(!p)return'';return `<div class="practice-member">${avatarHtml(p)}<div><strong>${escapeHtml(p.name)}</strong><small>#${p.jersey} · ${escapeHtml(p.role)}</small></div>${canManage()?`<button data-move-practice="${p.id}" data-from="${side}">Move →</button>`:''}</div>`;}).join(''):'<p class="muted">Shuffle the squad to create this side.</p>';
    $('practiceTeamA').innerHTML=renderList(pt.teamA||[],'A'); $('practiceTeamB').innerHTML=renderList(pt.teamB||[],'B'); $('practiceUpdated').textContent=pt.updatedAt?`Last distributed ${formatTime(pt.updatedAt)} · ${formatDate(pt.updatedAt.slice(0,10))}`:'Teams have not been distributed yet.';
  }

  function chatDayLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const key = date.toDateString();
    if (key === today.toDateString()) return 'Today';
    if (key === yesterday.toDateString()) return 'Yesterday';
    return new Intl.DateTimeFormat('en-IN', { day:'numeric', month:'short', year:'numeric' }).format(date);
  }

  function renderChat() {
    const list = $('chatMessages');
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 120;
    const messages = [...data.chat].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).slice(-100);
    if (!messages.length) {
      list.innerHTML = '<div class="chat-empty">No messages yet. Start the cricket conversation.</div>';
    } else {
      let lastDay = '';
      list.innerHTML = messages.map((m) => {
        const player = data.players.find((p)=>p.id===m.senderId);
        const mine = session && (session.type==='admin' ? m.senderRole==='Administrator' : m.senderId===session.playerId);
        const day = chatDayLabel(m.createdAt);
        const separator = day && day !== lastDay ? `<div class="chat-date-separator"><span>${escapeHtml(day)}</span></div>` : '';
        lastDay = day;
        const delivery = m.delivery === 'sending' ? '<span class="message-delivery sending">Sending…</span>' : m.delivery === 'failed' ? `<button class="message-delivery failed" type="button" data-retry-message="${escapeHtml(m.id)}">Not sent · Retry</button>` : '';
        return `${separator}<div class="message ${mine?'mine':''}">${avatarHtml(player||{name:m.senderName})}<div><div class="message-bubble"><div class="message-head"><strong>${escapeHtml(m.senderName)}</strong><span>${escapeHtml(m.senderRole||'Player')} · ${formatTime(m.createdAt)}</span></div><p>${escapeHtml(m.text)}</p></div><div class="message-actions">${delivery}${isAdmin()||mine?`<button class="message-delete" data-delete-message="${escapeHtml(m.id)}">Delete</button>`:''}</div></div></div>`;
      }).join('');
    }
    $('chatInput').disabled = !session;
    $('chatInput').placeholder = session ? 'Write a message…' : 'Log in to send a message';
    $('chatStatus').textContent = !navigator.onLine ? 'Offline — messages will stay on this phone until you reconnect.' : session ? 'Connected · messages sync through MongoDB.' : 'Player login required to post.';
    updateNotificationUI();
    requestAnimationFrame(()=>{ if (nearBottom || !list.dataset.initialized) list.scrollTop=list.scrollHeight; list.dataset.initialized='true'; });
  }

  function renderToss() {
    const options=['<option value="Custom opponent">Custom opponent</option>',...data.opponentTeams.map((t)=>`<option value="${escapeHtml(t.name)}">${escapeHtml(t.name)}</option>`)]; $('tossOpponent').innerHTML=options.join(''); const saved=data.settings.savedToss; $('savedToss').textContent=saved?`${saved.winner} chose to ${saved.decision.toLowerCase()} first vs ${saved.opponent}`:'No toss saved yet.';
  }

  function renderStats() {
    let stats=calculatePlayerStats(); const configs={runs:{label:'Runs',value:(s)=>s.runs,secondary:(s)=>`${s.matches} matches · HS ${s.highScore}`,sort:(a,b)=>b.runs-a.runs,display:(v)=>Math.round(v)},wickets:{label:'Wickets',value:(s)=>s.wickets,secondary:(s)=>`${s.matches} matches · Best ${s.bestWickets}`,sort:(a,b)=>b.wickets-a.wickets,display:(v)=>Math.round(v)},catches:{label:'Catches',value:(s)=>s.catches,secondary:(s)=>`${s.matches} matches`,sort:(a,b)=>b.catches-a.catches,display:(v)=>Math.round(v)},strikeRate:{label:'Strike Rate',value:(s)=>s.strikeRate,secondary:(s)=>`${s.runs} runs from ${s.balls} balls`,sort:(a,b)=>b.strikeRate-a.strikeRate,display:(v)=>v.toFixed(1)},economy:{label:'Economy',value:(s)=>s.ballsBowled?s.economy:999,secondary:(s)=>`${s.wickets} wickets`,sort:(a,b)=>(a.ballsBowled?a.economy:999)-(b.ballsBowled?b.economy:999),display:(v)=>v===999?'—':v.toFixed(2)}}; const c=configs[statMode]; stats.sort(c.sort); const top=stats[0];
    $('podium').innerHTML=top?`${avatarHtml(top.player,'large')}<h3>${escapeHtml(top.player.name)}</h3><div class="podium-value">${c.display(c.value(top))}</div><span>${c.label} leader</span>`:'<p>No statistics yet.</p>';
    $('leaderHead').innerHTML=`<tr><th>Rank</th><th>Player</th><th>${c.label}</th><th>Details</th></tr>`; $('leaderRows').innerHTML=stats.map((s,i)=>`<tr><td><span class="rank-dot">${i+1}</span></td><td><div class="table-player">${avatarHtml(s.player)}<div><strong>${escapeHtml(s.player.name)}</strong><small>${escapeHtml(leadershipLabel(s.player.id))}</small></div></div></td><td><strong>${c.display(c.value(s))}</strong></td><td>${escapeHtml(c.secondary(s))}</td></tr>`).join('');
  }

  function renderAdmin() {
    if(!isAdmin())return;
    const s=data.settings; $('groupNameInput').value=s.groupName; $('taglineInput').value=s.tagline; $('heroTitleInput').value=s.heroTitle; $('heroSubtitleInput').value=s.heroSubtitle; $('homeGroundInput').value=s.homeGround; $('whatsappGroupInput').value=s.whatsappGroupUrl||''; $('adminPinInput').value='';
    const options=`<option value="">Not assigned</option>${activePlayers().map((p)=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}`; $('captainSelect').innerHTML=options; $('viceCaptainSelect').innerHTML=options; $('captainSelect').value=s.captainId||''; $('viceCaptainSelect').value=s.viceCaptainId||'';
    $('joinRequestList').innerHTML=data.joinRequests.length?data.joinRequests.map((r)=>`<div class="request-item">${avatarHtml(r)}<div><strong>${escapeHtml(r.name)}</strong><small>#${r.jersey} · ${escapeHtml(r.role)} · ${escapeHtml(r.phone)}</small></div><div class="section-actions"><button class="card-btn" data-approve-request="${r.id}">Approve</button><button class="card-btn danger-text" data-reject-request="${r.id}">Reject</button></div></div>`).join(''):'<p class="muted">No pending requests.</p>';
    $('adminPlayerList').innerHTML=activePlayers().map((p)=>`<div class="admin-item">${avatarHtml(p)}<div><strong>${escapeHtml(p.name)}</strong><small>#${p.jersey} · ${escapeHtml(leadershipLabel(p.id))} · ${escapeHtml(p.phone||'No phone')}</small></div><div class="section-actions"><button class="card-btn" data-edit-player="${p.id}">Edit</button><button class="card-btn danger-text" data-delete-player="${p.id}">Remove</button></div></div>`).join('');
  }

  function renderLoginOptions() {
    const select = $('loginAccount');
    if (!select) return;
    const last = localStorage.getItem(LAST_LOGIN_KEY) || '';
    const preferred = last.startsWith('player:') ? last : `player:${data.settings.captainId || activePlayers()[0]?.id || ''}`;
    const current = select.value || preferred;
    select.innerHTML = `${activePlayers().map((p)=>`<option value="player:${p.id}">${escapeHtml(p.name)} — ${escapeHtml(leadershipLabel(p.id))}</option>`).join('')}<option value="admin">${escapeHtml(data.settings.adminName)} — Administrator settings</option>`;
    if ([...select.options].some((option)=>option.value===current)) select.value=current;
    else if ([...select.options].some((option)=>option.value===preferred)) select.value=preferred;
  }
  function renderPerformanceRows() { $('performanceRows').innerHTML=activePlayers().map((p)=>`<tr data-performance-player="${p.id}"><td><strong>${escapeHtml(p.name)}</strong><br><small>${escapeHtml(p.role)}</small></td>${['runs','balls','wickets','oversBowled','runsConceded','catches'].map((field)=>`<td><input type="number" min="0" ${field==='oversBowled'?'step="0.1"':''} data-field="${field}" /></td>`).join('')}</tr>`).join(''); }
  function renderOpponentOptions() { const options=`<option value="">Custom opponent</option>${data.opponentTeams.map((t)=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('')}`; $('scheduleOpponentTeam').innerHTML=options; }
  function applyPermissions() { $$('[data-admin-only]').forEach((el)=>el.classList.toggle('permission-hidden',!isAdmin())); $$('[data-manager-only]').forEach((el)=>el.classList.toggle('permission-hidden',!canManage())); $('admin').classList.toggle('hidden',!isAdmin()); }

  function openModal(id) { const modal=$(id); if(!modal)return; modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeModal(id) { const modal=$(id); if(!modal)return; modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); if(!document.querySelector('.modal.show'))document.body.style.overflow=''; }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent=message; $('toast').classList.add('show'); toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600); }
  function askConfirm(title,text,action){$('confirmTitle').textContent=title;$('confirmText').textContent=text;confirmAction=action;$('confirmDialog').classList.add('show');}
  function closeConfirm(){confirmAction=null;$('confirmDialog').classList.remove('show');}
  function requireLogin(message='Please log in first.'){toast(message);openModal('loginModal');}

  function applyTheme(theme, persist = true) {
    const dark = theme === 'dark';
    document.body.classList.toggle('dark', dark);
    if (persist) localStorage.setItem('ballKhoTheme', dark ? 'dark' : 'light');
    const nextLabel = dark ? 'Switch to light mode' : 'Switch to dark mode';
    const nextIcon = dark ? '☀' : '☾';
    const nextText = dark ? 'Light' : 'Dark';
    if ($('themeBtn')) {
      $('themeBtn').textContent = nextIcon;
      $('themeBtn').setAttribute('aria-label', nextLabel);
      $('themeBtn').title = nextLabel;
    }
    if ($('mobileThemeBtn')) {
      $('mobileThemeBtn').setAttribute('aria-label', nextLabel);
      $('mobileThemeBtn').title = nextLabel;
    }
    if ($('mobileThemeIcon')) $('mobileThemeIcon').textContent = nextIcon;
    if ($('mobileThemeText')) $('mobileThemeText').textContent = nextText;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#08100b' : '#173b1c');
  }

  function toggleTheme() {
    applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
  }

  async function readCompressedImage(file,maxWidth=420,maxHeight=420,quality=.78){
    if(!file)return'';
    const fileName=String(file.name||'').toLowerCase();
    const looksLikeImage=String(file.type||'').startsWith('image/')||/\.(jpe?g|png|webp|heic|heif)$/i.test(fileName);
    if(!looksLikeImage)throw new Error('Please choose a photo file.');
    if(Number(file.size||0)>15*1024*1024)throw new Error('This photo is larger than 15 MB. Choose a smaller image.');

    let source=null,width=0,height=0,release=()=>{};
    if('createImageBitmap' in window){
      try{
        const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
        source=bitmap;width=bitmap.width;height=bitmap.height;release=()=>bitmap.close?.();
      }catch{/* fallback below */}
    }
    if(!source){
      const objectUrl=URL.createObjectURL(file);
      release=()=>URL.revokeObjectURL(objectUrl);
      try{
        source=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('This image format is not supported on this phone. Choose JPG, PNG or WebP.'));img.src=objectUrl;});
        width=source.naturalWidth||source.width;height=source.naturalHeight||source.height;
      }catch(error){release();throw error;}
    }
    if(!width||!height){release();throw new Error('This photo could not be read. Choose another image.');}
    const scale=Math.min(1,maxWidth/width,maxHeight/height);
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
    const context=canvas.getContext('2d',{alpha:false});
    context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(source,0,0,canvas.width,canvas.height);
    release();
    const result=canvas.toDataURL('image/jpeg',quality);
    if(!result||result.length<100)throw new Error('The photo could not be prepared. Try another image.');
    return result;
  }

  function openPlayerModal(id='') {
    if(!isAdmin())return requireLogin('Administrator login required.'); const p=data.players.find((x)=>x.id===id); $('editingPlayerId').value=id; $('playerModalTitle').textContent=p?'Edit player':'Add player'; $('playerName').value=p?.name||''; $('playerPhone').value=p?.phone||''; $('playerJersey').value=p?.jersey??''; $('playerRole').value=p?.role||'Batter'; $('playerClass').value=p?.className||''; $('playerPin').value=''; $('playerBatting').value=p?.battingStyle||'Right-hand bat'; $('playerBowling').value=p?.bowlingStyle||'Does not bowl'; $('playerNote').value=p?.note||''; $('playerPhoto').value=''; openModal('playerModal');
  }

  function openProfileModal() {
    const p=getSessionPlayer();
    if(!p)return requireLogin();
    $('profileName').value=p.name; $('profilePhone').value=p.phone||''; $('profileJersey').value=p.jersey; $('profileRole').value=p.role||'Batter'; $('profileClass').value=p.className||''; $('profileBatting').value=p.battingStyle||''; $('profileBowling').value=p.bowlingStyle||''; $('profileNote').value=p.note||''; $('profilePhoto').value=''; if($('profileCamera'))$('profileCamera').value='';
    const form=$('profileForm'); form._photoData=''; form._photoRemoved=false;
    const preview=$('profilePhotoPreview'); if(preview) preview.innerHTML=p.photo?`<img src="${safeImage(p.photo)}" alt="${escapeHtml(p.name)} profile preview"/>`:`<span>${initials(p.name)}</span>`;
    const photoStatus=$('profilePhotoStatus');if(photoStatus){photoStatus.textContent='Choose a JPG, PNG or WebP image up to 15 MB. It will be compressed before saving.';photoStatus.className='';}
    $('profileFormMessage').textContent=''; form.dataset.dirty='false';
    openModal('profileModal');
  }

  function openOpponentTeamModal(id='') { if(!isAdmin())return requireLogin(); const t=data.opponentTeams.find((x)=>x.id===id); $('editingOpponentTeamId').value=id; $('opponentTeamModalTitle').textContent=t?'Edit team':'Add team'; $('opponentTeamName').value=t?.name||''; $('opponentTeamColor').value=t?.color||'#d6a928'; $('opponentTeamGround').value=t?.ground||''; openModal('opponentTeamModal'); }
  function openOpponentPlayerModal(teamId,playerId=''){if(!isAdmin())return requireLogin();const t=data.opponentTeams.find((x)=>x.id===teamId);const p=t?.players.find((x)=>x.id===playerId);$('opponentPlayerTeamId').value=teamId;$('editingOpponentPlayerId').value=playerId;$('opponentPlayerName').value=p?.name||'';$('opponentPlayerJersey').value=p?.jersey??'';$('opponentPlayerRole').value=p?.role||'Batter';$('opponentPlayerNote').value=p?.note||'';openModal('opponentPlayerModal');}

  function openResultModal(matchId='') { if(!canManage())return requireLogin('Admin, captain or vice-captain login required.'); $('resultForm').reset(); $('resultForm').dataset.matchId=matchId; $('resultDate').value=toDateInput(new Date()); $('resultOvers').value=10; renderPerformanceRows(); if(matchId){const m=data.matches.find((x)=>x.id===matchId);if(m){$('resultOpponent').value=m.opponent;$('resultDate').value=m.date;$('resultVenue').value=m.venue;$('resultOvers').value=m.overs;}} openModal('resultModal'); }
  function collectPerformances(){return $$('[data-performance-player]').map((row)=>{const r={playerId:row.dataset.performancePlayer};$$('[data-field]',row).forEach((input)=>r[input.dataset.field]=Number(input.value||0));return r;}).filter((p)=>['runs','balls','wickets','oversBowled','runsConceded','catches'].some((key)=>Number(p[key])>0));}

  function openScorecard(matchId){ if(!data.matches.some((match)=>match.id===matchId)) return; window.BKGXIRouter?.navigate('match', matchId); }

  function openPlayerDetail(id){ if(!data.players.some((player)=>player.id===id)) return; window.BKGXIRouter?.navigate('player', id); }

  function shufflePracticeTeams(){if(!canManage())return requireLogin();const players=[...activePlayers()].sort(()=>Math.random()-.5);const a=[],b=[];players.forEach((p,i)=>(i%2?a:b).push(p.id));data.practiceTeams={...data.practiceTeams,teamA:a,teamB:b,updatedAt:new Date().toISOString()};saveData();sendPushNotification({title:'Practice teams ready',body:`${data.practiceTeams.nameA} and ${data.practiceTeams.nameB} have been reshuffled.`,url:'/#/practice',tag:'practice-teams',type:'practice'});renderPractice();toast('Practice teams distributed');}

  window.BKGXIApp = {
    getData: () => data,
    getSession: () => session,
    getSessionPlayer,
    isAdmin,
    isCaptain,
    isViceCaptain,
    canManage,
    canScore,
    activePlayers,
    calculatePlayerStats,
    leadershipLabel,
    displayPhone,
    formatDate,
    formatTime,
    initials,
    escapeHtml,
    safeImage,
    prepareProfileImage: readCompressedImage,
    getNotificationPreferences,
    saveNotificationPreferences,
    saveData,
    renderAll,
    renderMatches,
    renderTeams,
    renderStats,
    renderChat,
    renderAdmin,
    openModal,
    closeModal,
    openProfileModal,
    openPlayerModal,
    openOpponentTeamModal,
    openOpponentPlayerModal,
    openResultModal,
    openLiveSetup,
    toggleTheme,
    togglePushNotifications,
    sendPushNotification,
    sendTestNotification,
    toast,
    askConfirm,
    uid,
    isReady: () => appReady,
    handleHomeAction,
    recordLiveBall,
    undoLiveBall,
    resetLiveScore,
    swapLiveStrike,
    useLiveInResult,
    shareLiveScore,
    shufflePracticeTeams,
    renderPractice,
    renderToss,
    renderAccount
  };

  function bindEvents() {
    const openProfileRoute = () => session ? window.BKGXIRouter?.navigate('profile') : openModal('loginModal');
    $('loginBtn').addEventListener('click',()=>openModal('loginModal')); $('heroLoginBtn').addEventListener('click',openProfileRoute); $('mobileAccountBtn').addEventListener('click',openProfileRoute); $('accountBtn').addEventListener('click',openProfileRoute); $('homeProfileButton').addEventListener('click',openProfileRoute);
    $('themeBtn').addEventListener('click', toggleTheme); $('mobileThemeBtn').addEventListener('click', toggleTheme);
    $('notificationToggleBtn').addEventListener('click', togglePushNotifications); $('notificationTestBtn').addEventListener('click', sendTestNotification);
    $$('[data-notification-pref]').forEach((input)=>input.addEventListener('change',updateNotificationPreferencesFromUI));
    $$('[data-close]').forEach((b)=>b.addEventListener('click',()=>closeModal(b.dataset.close))); $$('.modal').forEach((m)=>m.addEventListener('click',(e)=>{if(e.target===m)closeModal(m.id);}));
    $('openJoinBtn').addEventListener('click',()=>{closeModal('loginModal');openModal('joinModal');});

    let loginInProgress=false;
    async function performLogin(e){
      e?.preventDefault?.();
      if(loginInProgress)return;
      const account=$('loginAccount')?.value||'';
      const pin=String($('loginPin')?.value||'').replace(/\D/g,'').slice(0,6);
      const message=$('loginMessage'),submit=$('loginSubmitBtn');
      if($('loginPin'))$('loginPin').value=pin;
      message.textContent='';message.className='form-message';
      if(!account){message.textContent='Choose an account first.';message.classList.add('error');return;}
      if(!validPin(pin)){message.textContent='Enter a 4–6 digit PIN. Your digits should be visible in the box.';message.classList.add('error');$('loginPin')?.focus();return;}
      loginInProgress=true;submit.disabled=true;submit.textContent='Checking PIN…';message.textContent='Checking your account…';message.classList.add('hint');
      try{
        const remember=$('rememberLogin')?.checked!==false;
        if(account==='admin'){
          const verification=await verifyStoredPin(pin,data.settings.adminPinHash);
          if(!verification.ok){message.textContent='Incorrect Administrator PIN. Choose your captain player profile for captain access.';message.className='form-message error';return;}
          if(verification.upgradedHash){data.settings.adminPinHash=verification.upgradedHash;await saveData();}
          session={type:'admin',remember};
        }else{
          const id=account.split(':')[1],p=data.players.find((x)=>x.id===id&&x.status==='active');
          if(!p){renderLoginOptions();message.textContent='That player account is unavailable. Choose another account.';message.className='form-message error';return;}
          const verification=await verifyStoredPin(pin,p.pinHash);
          if(!verification.ok){message.textContent=`Incorrect PIN for ${p.name}. Ask the administrator to reset it if forgotten.`;message.className='form-message error';return;}
          if(verification.upgradedHash){p.pinHash=verification.upgradedHash;await saveData();}
          session={type:'player',playerId:p.id,remember};
        }
        localStorage.setItem(LAST_LOGIN_KEY,account);saveSession();$('loginPin').value='';closeModal('loginModal');renderAll();initializePushNotifications();window.BKGXIRouter?.navigate('home');toast('Login successful');
      }catch(error){message.textContent=`Login failed: ${error?.message||'Please try again.'}`;message.className='form-message error';console.error('Login failed:',error);}
      finally{loginInProgress=false;submit.disabled=false;submit.textContent='Enter dressing room';}
    }
    $('loginForm').addEventListener('submit',performLogin);
    $('loginSubmitBtn').addEventListener('click',performLogin);
    $('loginPin').addEventListener('input',(e)=>{const clean=e.target.value.replace(/\D/g,'').slice(0,6);if(e.target.value!==clean)e.target.value=clean;const message=$('loginMessage');if(message?.classList.contains('error')){message.textContent='';message.className='form-message';}});
    $('loginPin').addEventListener('keydown',(e)=>{if(e.key==='Enter')performLogin(e);});
    $('logoutBtn').addEventListener('click',()=>{session=null;saveSession();renderAll();toast('Logged out');});

    $('joinForm').addEventListener('submit',async(e)=>{e.preventDefault();const name=$('joinName').value.trim(),phone=$('joinPhone').value.trim(),jersey=Number($('joinJersey').value),pin=$('joinPin').value.trim();if(!validPhone(phone))return toast('Enter a valid phone number');if(!validPin(pin))return toast('PIN must contain 4–6 numbers');if(!jerseyAvailable(jersey))return toast('That jersey number is already used');if(data.joinRequests.some((r)=>r.phone.replace(/\D/g,'')===phone.replace(/\D/g,'')))return toast('A request already exists for this phone');let photo='';try{photo=await readCompressedImage($('joinPhoto').files[0]);}catch(err){return toast(err.message);}data.joinRequests.push({id:uid('request'),name,phone,jersey,role:$('joinRole').value,className:$('joinClass').value.trim()||'School Squad',note:$('joinNote').value.trim(),photo,pinHash:await hashPin(pin),createdAt:new Date().toISOString()});saveData();sendPushNotification({title:'New Ball Kho Gayi XI Join Request',body:`${name} requested to join as ${$('joinRole').value}.`,url:'/#/admin',tag:'join-request',type:'join-request',audience:'leadership'});e.target.reset();closeModal('joinModal');toast('Join request sent to Swastik admin');renderAdmin();});

    $('editProfileBtn').addEventListener('click',openProfileModal); $('profileForm').addEventListener('submit',async(e)=>{
      e.preventDefault();const p=getSessionPlayer();if(!p)return;
      const form=e.currentTarget,message=$('profileFormMessage'),saveButton=$('profileSaveBtn'),jersey=Number($('profileJersey').value),phone=$('profilePhone').value.trim(),name=$('profileName').value.trim();
      message.textContent='';message.className='form-message full';
      if(name.length<2){message.textContent='Enter your full name.';message.classList.add('error');return;}
      if(!jerseyAvailable(jersey,p.id)){message.textContent='That jersey number is already used.';message.classList.add('error');return;}
      if(phone&&!validPhone(phone)){message.textContent='Enter a valid phone number.';message.classList.add('error');return;}
      saveButton.disabled=true;saveButton.textContent='Saving…';let photo=p.photo||'';
      try{
        if(form._photoRemoved) photo='';
        else if(form._photoData) photo=form._photoData;
        else {
          const selectedFile=$('profilePhoto').files[0]||$('profileCamera')?.files?.[0];
          if(selectedFile)photo=await readCompressedImage(selectedFile);
        }
        const patch={name,phone,jersey,role:$('profileRole').value,className:$('profileClass').value.trim()||'School Squad',battingStyle:$('profileBatting').value.trim()||'Right-hand bat',bowlingStyle:$('profileBowling').value.trim()||'Does not bowl',note:$('profileNote').value.trim(),photo};
        const saved=await savePlayerProfileUpdate(p.id,patch);
        form.dataset.dirty='false';form._photoData='';form._photoRemoved=false;
        message.textContent=saved?'Profile and photo saved successfully.':'Saved on this phone. It will sync when the connection is restored.';message.classList.add(saved?'success':'warning');
        if(saved)sendPushNotification({title:'Profile Updated',body:`${name}, your Ball Kho Gayi XI profile was updated.`,url:'/#/profile',tag:`profile-${p.id}`,type:'profile',audience:'player',targetUserId:p.id});
        renderAll();setTimeout(()=>closeModal('profileModal'),saved?650:1300);toast(saved?'Profile updated on all devices':'Profile saved locally');
      }catch(err){message.textContent=err.message||'Could not save your profile.';message.classList.add('error');}
      finally{saveButton.disabled=false;saveButton.textContent='Save changes';}
    });
    $('changePinBtn').addEventListener('click',()=>openModal('pinModal')); $('pinForm').addEventListener('submit',async(e)=>{e.preventDefault();const current=$('currentPin').value.trim(),next=$('newPin').value.trim(),confirm=$('confirmPin').value.trim();if(!validPin(next)||next!==confirm)return toast('New PINs must match and contain 4–6 numbers');let targetUserId='';let targetAudience='player';if(isAdmin()){const check=await verifyStoredPin(current,data.settings.adminPinHash);if(!check.ok)return toast('Current PIN is incorrect');data.settings.adminPinHash=await hashPin(next);targetUserId='admin';targetAudience='admin';}else{const p=getSessionPlayer();if(!p)return requireLogin();const check=await verifyStoredPin(current,p.pinHash);if(!check.ok)return toast('Current PIN is incorrect');p.pinHash=await hashPin(next);targetUserId=p.id;}const saved=await saveData();if(saved)sendPushNotification({title:'Security update',body:'Your Ball Kho Gayi XI login PIN was changed.',url:'/#/profile',tag:`pin-${targetUserId}`,type:'security',audience:targetAudience,targetUserId});e.target.reset();closeModal('pinModal');toast(saved?'PIN updated':'PIN changed on this phone; reconnect to sync');});

    $$('[data-availability]').forEach((b)=>b.addEventListener('click',()=>{const p=getSessionPlayer(),m=getUpcomingMatch();if(!p||!m)return;const value=b.dataset.availability;data.availability[m.id]=data.availability[m.id]||{};data.availability[m.id][p.id]=value;saveData();sendPushNotification({title:'Availability updated',body:`${p.name} is ${value.toLowerCase()} for ${data.settings.groupName} vs ${m.opponent}.`,url:`/#/match/${m.id}`,tag:`availability-${m.id}-${p.id}`,type:'availability',audience:'leadership'});renderAccount();toast(`Availability: ${value}`);})); $('saveGoalBtn').addEventListener('click',()=>{const p=getSessionPlayer();if(!p)return requireLogin();data.goals[p.id]=$('personalGoalInput').value.trim();saveData();toast('Goal saved');});

    $('scheduleBtn').addEventListener('click',()=>canManage()?openModal('scheduleModal'):requireLogin()); $('captainScheduleBtn').addEventListener('click',()=>openModal('scheduleModal')); $('quickResultBtn').addEventListener('click',()=>openResultModal()); $('captainResultBtn').addEventListener('click',()=>openResultModal());
    $('startLiveBtn').addEventListener('click',()=>openLiveSetup()); $('liveSetupBtn').addEventListener('click',()=>openLiveSetup()); $('liveUndoBtn').addEventListener('click',undoLiveBall); $('liveResetBtn').addEventListener('click',resetLiveScore); $('liveSwapBtn').addEventListener('click',()=>swapLiveStrike()); $('liveChangePlayersBtn').addEventListener('click',()=>openLiveSetup(data.liveScoring.matchId)); $('liveUseResultBtn').addEventListener('click',useLiveInResult); $('liveShareBtn').addEventListener('click',shareLiveScore); $('liveEndBtn').addEventListener('click',()=>askConfirm('End this innings?','The score will remain saved and can be copied into the Result Desk.',()=>{data.liveScoring.active=false;data.liveScoring.completed=true;data.liveScoring.updatedAt=new Date().toISOString();saveData();sendPushNotification({title:'Innings ended',body:liveScoreText(),url:'/#/live-scoring',tag:'live-ended',type:'live-score'});renderLiveScoring();renderPremiumHome();toast('Innings ended');}));
    $('liveMatchSelect').addEventListener('change',()=>{const m=data.matches.find((x)=>x.id===$('liveMatchSelect').value);if(m){$('liveOpponentInput').value=m.opponent;$('liveOversInput').value=m.overs;}});
    $('liveSetupForm').addEventListener('submit',(e)=>{e.preventDefault();if(!canScore())return requireLogin();const previous=data.liveScoring,matchId=$('liveMatchSelect').value,opponent=$('liveOpponentInput').value.trim(),sameMatch=!previous.completed&&previous.opponent===opponent&&previous.matchId===matchId,base=sameMatch?previous:defaultLiveScoring();data.liveScoring={...base,active:true,completed:false,matchId,opponent,battingSide:$('liveBattingSide').value,oversLimit:Number($('liveOversInput').value||10),target:Number($('liveTargetInput').value||0),striker:$('liveStrikerInput').value.trim(),nonStriker:$('liveNonStrikerInput').value.trim(),bowler:$('liveBowlerInput').value.trim(),startedAt:base.startedAt||new Date().toISOString(),updatedAt:new Date().toISOString(),updatedBy:isAdmin()?data.settings.adminName:(getSessionPlayer()?.name||'Scorer')};liveBatter(data.liveScoring.striker);liveBatter(data.liveScoring.nonStriker);saveData();sendPushNotification({title:'Live Scoring Started',body:liveScoreText(),url:'/#/live-scoring',tag:'live-start',type:'live-score'});closeModal('liveSetupModal');renderLiveScoring();renderPremiumHome();window.BKGXIRouter?.navigate('live-scoring');toast('Live scoreboard ready');});
    $$('[data-live-ball]').forEach((b)=>b.addEventListener('click',()=>recordLiveBall(b.dataset.liveBall,b.dataset.value)));
    $('scheduleForm').addEventListener('submit',(e)=>{e.preventDefault();if(!canManage())return requireLogin();const teamId=$('scheduleOpponentTeam').value;const team=data.opponentTeams.find((t)=>t.id===teamId);const opponent=team?.name||$('scheduleOpponent').value.trim();if(!opponent)return toast('Choose or enter an opponent');data.matches.push({id:uid('match'),status:'Upcoming',opponent,opponentTeamId:teamId,venue:$('scheduleVenue').value.trim(),date:$('scheduleDate').value,time:$('scheduleTime').value,overs:Number($('scheduleOvers').value),ballType:$('scheduleBall').value,notes:$('scheduleNotes').value.trim(),createdAt:Date.now()});saveData();sendPushNotification({title:'New Match Scheduled',body:`${data.settings.groupName} vs ${opponent} · ${formatDate($('scheduleDate').value)} at ${$('scheduleTime').value || 'time TBA'}`,url:'/#/matches',tag:'match-scheduled',type:'match'});e.target.reset();closeModal('scheduleModal');renderAll();toast('Fixture scheduled');});
    $('resultForm').addEventListener('submit',(e)=>{e.preventDefault();if(!canManage())return requireLogin();const existingId=e.target.dataset.matchId;const old=data.matches.find((m)=>m.id===existingId);const match={id:existingId||uid('match'),status:'Completed',opponent:$('resultOpponent').value.trim(),opponentTeamId:old?.opponentTeamId||'',date:$('resultDate').value,venue:$('resultVenue').value.trim(),time:old?.time||'',overs:Number($('resultOvers').value),ballType:old?.ballType||'Tennis',ourScore:$('ourScore').value.trim(),opponentScore:$('opponentScore').value.trim(),tossWinner:$('resultTossWinner').value,tossDecision:$('resultTossDecision').value,outcome:$('resultOutcome').value,resultSummary:$('resultSummary').value.trim(),notes:$('resultNotes').value.trim(),performances:collectPerformances(),createdAt:Date.now()};data.matches=existingId?data.matches.map((m)=>m.id===existingId?match:m):[...data.matches,match];saveData();sendPushNotification({title:'Match Result Added',body:`${data.settings.groupName} ${match.ourScore} · ${match.resultSummary}`,url:'/#/matches',tag:'match-result',type:'match'});closeModal('resultModal');renderAll();toast('Match saved and stats updated');});
    $$('[data-match-filter]').forEach((button)=>button.addEventListener('click',()=>{matchFilter=button.dataset.matchFilter;renderMatches();}));

    $('addPlayerBtn').addEventListener('click',()=>openPlayerModal()); $('playerForm').addEventListener('submit',async(e)=>{e.preventDefault();if(!isAdmin())return requireLogin();const id=$('editingPlayerId').value,existing=data.players.find((p)=>p.id===id),jersey=Number($('playerJersey').value),phone=$('playerPhone').value.trim(),newPin=$('playerPin').value.trim();if(!jerseyAvailable(jersey,id))return toast('That jersey number is already used');if(phone&&!validPhone(phone))return toast('Enter a valid phone number');if(newPin&&!validPin(newPin))return toast('PIN must contain 4–6 numbers');let photo=existing?.photo||'';try{if($('playerPhoto').files[0])photo=await readCompressedImage($('playerPhoto').files[0]);}catch(err){return toast(err.message);}const p={id:id||uid('player'),name:$('playerName').value.trim(),phone,jersey,role:$('playerRole').value,className:$('playerClass').value.trim()||'School Squad',pinHash:newPin?await hashPin(newPin):(existing?.pinHash||DEFAULT_PLAYER_PIN_HASH),battingStyle:$('playerBatting').value.trim()||'Right-hand bat',bowlingStyle:$('playerBowling').value.trim()||'Does not bowl',note:$('playerNote').value.trim(),photo,status:'active'};data.players=id?data.players.map((x)=>x.id===id?p:x):[...data.players,p];const saved=await saveData();if(saved){if(id){sendPushNotification({title:newPin?'Profile and PIN updated':'Player profile updated',body:`${p.name}, your team profile was updated by the administrator.`,url:`/#/player/${p.id}`,tag:`profile-admin-${p.id}`,type:newPin?'security':'profile',audience:'player',targetUserId:p.id});}else{sendPushNotification({title:'New player added',body:`${p.name} joined ${data.settings.groupName} as ${p.role}.`,url:'/#/squad',tag:`player-added-${p.id}`,type:'team'});}}closeModal('playerModal');renderAll();toast(id?'Player updated':'Player added');});

    $('addOpponentTeamBtn').addEventListener('click',()=>openOpponentTeamModal()); $('opponentTeamForm').addEventListener('submit',(e)=>{e.preventDefault();if(!isAdmin())return;const id=$('editingOpponentTeamId').value,existing=data.opponentTeams.find((t)=>t.id===id);const t={id:id||uid('opponent'),name:$('opponentTeamName').value.trim(),color:$('opponentTeamColor').value,ground:$('opponentTeamGround').value.trim(),players:existing?.players||[]};data.opponentTeams=id?data.opponentTeams.map((x)=>x.id===id?t:x):[...data.opponentTeams,t];saveData();closeModal('opponentTeamModal');renderAll();toast('Opponent team saved');});
    $('opponentPlayerForm').addEventListener('submit',(e)=>{e.preventDefault();if(!isAdmin())return;const team=data.opponentTeams.find((t)=>t.id===$('opponentPlayerTeamId').value);if(!team)return;const id=$('editingOpponentPlayerId').value;const p={id:id||uid('opp-player'),name:$('opponentPlayerName').value.trim(),jersey:Number($('opponentPlayerJersey').value||0),role:$('opponentPlayerRole').value,note:$('opponentPlayerNote').value.trim()};team.players=id?team.players.map((x)=>x.id===id?p:x):[...team.players,p];saveData();closeModal('opponentPlayerModal');renderAll();toast('Opponent player saved');});

    $('shuffleTeamsBtn').addEventListener('click',shufflePracticeTeams); $('renamePracticeBtn').addEventListener('click',()=>{$('practiceNameInputA').value=data.practiceTeams.nameA;$('practiceNameInputB').value=data.practiceTeams.nameB;openModal('practiceNameModal');}); $('practiceNameForm').addEventListener('submit',(e)=>{e.preventDefault();data.practiceTeams.nameA=$('practiceNameInputA').value.trim();data.practiceTeams.nameB=$('practiceNameInputB').value.trim();saveData();sendPushNotification({title:'Practice teams renamed',body:`The practice sides are now ${data.practiceTeams.nameA} and ${data.practiceTeams.nameB}.`,url:'/#/practice',tag:'practice-team-names',type:'practice'});closeModal('practiceNameModal');renderPractice();toast('Practice teams renamed');});

    $('chatForm').addEventListener('submit',async(e)=>{e.preventDefault();if(!session)return requireLogin();const text=$('chatInput').value.trim();if(!text)return;const p=getSessionPlayer(),senderName=isAdmin()?data.settings.adminName:p.name,senderRole=isAdmin()?'Administrator':leadershipLabel(p.id),message={id:uid('message'),senderId:p?.id||'admin',senderName,senderRole,text,createdAt:new Date().toISOString(),delivery:'sending'};data.chat.push(message);data.chat=data.chat.slice(-100);$('chatInput').value='';renderChat();const saved=await saveData();message.delivery=saved?'sent':'failed';renderChat();if(saved)sendPushNotification({title:`${senderName} · Ball Kho Gayi XI`,body:text,url:'/#/chat',tag:'group-chat',type:'chat'});});

    $('flipCoinBtn').addEventListener('click',()=>{if(!canManage())return requireLogin('Captain or vice-captain login required.');const opponent=$('tossOpponent').value||'Opponent',call=$('tossCall').value,result=Math.random()<.5?'Heads':'Tails',won=call===result;tossState={result,winner:won?data.settings.groupName:opponent,opponent};$('coin').classList.remove('flip-heads','flip-tails');void $('coin').offsetWidth;$('coin').classList.add(result==='Heads'?'flip-heads':'flip-tails');$('coinLabel').textContent='Coin in the air…';$('decisionButtons').classList.add('hidden');setTimeout(()=>{$('coinLabel').textContent=`${result}! ${tossState.winner} won.`;$('tossWinnerText').textContent='Choose bat or bowl:';$('decisionButtons').classList.remove('hidden');},1300);});
    $$('[data-decision]').forEach((b)=>b.addEventListener('click',()=>{if(!canManage())return requireLogin('Captain or vice-captain login required.');if(!tossState.winner)return toast('Flip the coin first');data.settings.savedToss={winner:tossState.winner,decision:b.dataset.decision,opponent:tossState.opponent,result:tossState.result,savedAt:new Date().toISOString()};saveData();sendPushNotification({title:'Toss result',body:`${tossState.winner} won the toss and chose to ${b.dataset.decision.toLowerCase()} first vs ${tossState.opponent}.`,url:'/#/toss',tag:'match-toss',type:'toss'});renderToss();toast('Toss saved');}));

    $$('[data-stat]').forEach((b)=>b.addEventListener('click',()=>{statMode=b.dataset.stat;$$('[data-stat]').forEach((x)=>x.classList.toggle('active',x===b));renderStats();}));
    $('editNoticeBtn').addEventListener('click',()=>{if(!canManage())return requireLogin();$('noticeTitleInput').value=data.settings.announcementTitle;$('noticeTextInput').value=data.settings.announcementText;openModal('noticeModal');}); $('noticeForm').addEventListener('submit',(e)=>{e.preventDefault();data.settings.announcementTitle=$('noticeTitleInput').value.trim();data.settings.announcementText=$('noticeTextInput').value.trim();saveData();sendPushNotification({title:data.settings.announcementTitle||'Captain Announcement',body:data.settings.announcementText,url:'/#/home',tag:'captain-announcement',type:'announcement'});closeModal('noticeModal');renderSummary();renderPremiumHome();toast('Notice published');});

    $('saveSettingsBtn').addEventListener('click',async()=>{
      if(!isAdmin())return;
      const oldCaptain=data.settings.captainId,oldVice=data.settings.viceCaptainId;
      const captain=$('captainSelect').value,vice=$('viceCaptainSelect').value,newPin=$('adminPinInput').value.trim();
      if(captain&&vice&&captain===vice)return toast('Captain and vice-captain must be different');
      if(newPin&&!validPin(newPin))return toast('Admin PIN must contain 4–6 numbers');
      let hero=data.settings.heroImage,logo=data.settings.logoImage;
      try{if($('heroImageInput').files[0])hero=await readCompressedImage($('heroImageInput').files[0],1600,1200,.82);if($('logoImageInput').files[0])logo=await readCompressedImage($('logoImageInput').files[0],512,512,.82);}catch(err){return toast(err.message);}
      Object.assign(data.settings,{groupName:$('groupNameInput').value.trim()||'Ball Kho Gayi XI',tagline:$('taglineInput').value.trim()||'Bat · Ball · Repeat',heroTitle:$('heroTitleInput').value.trim(),heroSubtitle:$('heroSubtitleInput').value.trim(),homeGround:$('homeGroundInput').value.trim(),whatsappGroupUrl:$('whatsappGroupInput').value.trim(),captainId:captain,viceCaptainId:vice,heroImage:hero,logoImage:logo});
      if(newPin)data.settings.adminPinHash=await hashPin(newPin);
      $('adminPinInput').value='';
      const saved=await saveData();
      if(saved&&(oldCaptain!==captain||oldVice!==vice)){
        const captainName=data.players.find((p)=>p.id===captain)?.name||'Not assigned';
        const viceName=data.players.find((p)=>p.id===vice)?.name||'Not assigned';
        sendPushNotification({title:'Team leadership updated',body:`Captain: ${captainName} · Vice-captain: ${viceName}`,url:'/#/squad',tag:'leadership-updated',type:'team'});
      }
      if(saved&&newPin)sendPushNotification({title:'Administrator security update',body:'The administrator PIN was changed.',url:'/#/profile',tag:'admin-pin-updated',type:'security',audience:'admin'});
      renderAll();toast('Website settings saved');
    });
    $('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ball-kho-gayi-xi-backup.json';a.click();URL.revokeObjectURL(url);}); $('importInput').addEventListener('change',async(e)=>{const file=e.target.files[0];if(!file)return;try{data=migrateData(JSON.parse(await file.text()));saveData();renderAll();toast('Backup imported');}catch{toast('Invalid backup file');}e.target.value='';}); $('resetBtn').addEventListener('click',()=>askConfirm('Reset all website data?','This restores the original squad, matches and settings.',()=>{data=migrateData(deepClone(seedData));session=null;saveSession();saveData();renderAll();toast('Website reset');}));

    $('confirmCancel').addEventListener('click',closeConfirm); $('confirmOk').addEventListener('click',()=>{const action=confirmAction;closeConfirm();if(action)action();});

    document.addEventListener('click',(e)=>{
      const target=e.target.closest('button,[data-player-detail]');if(!target)return;
      if(target.dataset.homeAction){handleHomeAction(target.dataset.homeAction);return;}
      if(target.dataset.scorecard)return openScorecard(target.dataset.scorecard);
      if(target.dataset.liveMatch)return openLiveSetup(target.dataset.liveMatch);
      if(target.dataset.completeMatch)return openResultModal(target.dataset.completeMatch);
      if(target.dataset.deleteMatch)return askConfirm('Delete this match?','The scorecard and its stats will be removed.',()=>{const removed=data.matches.find((m)=>m.id===target.dataset.deleteMatch);data.matches=data.matches.filter((m)=>m.id!==target.dataset.deleteMatch);saveData();if(removed)sendPushNotification({title:removed.status==='Upcoming'?'Match cancelled':'Match removed',body:`${data.settings.groupName} vs ${removed.opponent} was removed from the app.`,url:'/#/matches',tag:`match-removed-${removed.id}`,type:'match'});renderAll();toast('Match deleted');});
      if(target.dataset.playerDetail)return openPlayerDetail(target.dataset.playerDetail);
      if(target.dataset.editPlayer)return openPlayerModal(target.dataset.editPlayer);
      if(target.dataset.deletePlayer)return askConfirm('Remove this player?','Past scorecards remain, but the player leaves the active squad.',()=>{const p=data.players.find((x)=>x.id===target.dataset.deletePlayer);if(p){sendPushNotification({title:'Squad account update',body:`${p.name}, your Ball Kho Gayi XI player profile was removed by the administrator.`,url:'/#/home',tag:`player-removed-${p.id}`,type:'team',audience:'player',targetUserId:p.id,excludeEndpoint:''});p.status='removed';}saveData();renderAll();toast('Player removed');});
      if(target.dataset.editOpponentTeam)return openOpponentTeamModal(target.dataset.editOpponentTeam);
      if(target.dataset.deleteOpponentTeam)return askConfirm('Delete opponent team?','Its directory and players will be removed. Existing match names stay.',()=>{data.opponentTeams=data.opponentTeams.filter((t)=>t.id!==target.dataset.deleteOpponentTeam);saveData();renderAll();});
      if(target.dataset.addOpponentPlayer)return openOpponentPlayerModal(target.dataset.addOpponentPlayer);
      if(target.dataset.editOpponentPlayer)return openOpponentPlayerModal(target.dataset.teamId,target.dataset.editOpponentPlayer);
      if(target.dataset.deleteOpponentPlayer){const t=data.opponentTeams.find((x)=>x.id===target.dataset.teamId);if(t)t.players=t.players.filter((p)=>p.id!==target.dataset.deleteOpponentPlayer);saveData();renderAll();}
      if(target.dataset.approveRequest){const r=data.joinRequests.find((x)=>x.id===target.dataset.approveRequest);if(!r)return;if(!jerseyAvailable(r.jersey))return toast('That jersey is already taken. Edit the request after approval.');data.players.push({id:uid('player'),name:r.name,phone:r.phone,jersey:r.jersey,role:r.role,className:r.className,note:r.note,photo:r.photo,pinHash:r.pinHash,battingStyle:'Right-hand bat',bowlingStyle:'Does not bowl',status:'active'});data.joinRequests=data.joinRequests.filter((x)=>x.id!==r.id);saveData();sendPushNotification({title:'New Player Added',body:`${r.name} has joined ${data.settings.groupName}.`,url:'/#/squad',tag:'player-approved',type:'team'});renderAll();toast('Player approved');}
      if(target.dataset.rejectRequest){data.joinRequests=data.joinRequests.filter((x)=>x.id!==target.dataset.rejectRequest);saveData();renderAll();toast('Request rejected');}
      if(target.dataset.movePractice){const p=target.dataset.movePractice,from=target.dataset.from;if(from==='A'){data.practiceTeams.teamA=data.practiceTeams.teamA.filter((id)=>id!==p);data.practiceTeams.teamB.push(p);}else{data.practiceTeams.teamB=data.practiceTeams.teamB.filter((id)=>id!==p);data.practiceTeams.teamA.push(p);}data.practiceTeams.updatedAt=new Date().toISOString();saveData();renderPractice();}
      if(target.dataset.retryMessage){const message=data.chat.find((m)=>m.id===target.dataset.retryMessage);if(!message)return;message.delivery='sending';renderChat();saveData().then((saved)=>{message.delivery=saved?'sent':'failed';renderChat();if(saved)toast('Message sent');});return;}
      if(target.dataset.deleteMessage){data.chat=data.chat.filter((m)=>m.id!==target.dataset.deleteMessage);saveData();renderChat();}
    });

    document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){$$('.modal.show').forEach((m)=>closeModal(m.id));closeConfirm();}});
  }

  async function registerServiceWorker(){
    if(!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return null;
    try {
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading || sessionStorage.getItem('bkgxi-sw-reloaded') === '1') return;
        reloading = true;
        sessionStorage.setItem('bkgxi-sw-reloaded', '1');
        window.location.reload();
      });
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'APP_UPDATED') {
          sessionStorage.removeItem('bkgxi-sw-reloaded');
        }
      });
      pushRegistration = await navigator.serviceWorker.register('/sw.js?v=15', { updateViaCache: 'none' });
      await pushRegistration.update();
      if (pushRegistration.waiting) pushRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      pushRegistration.addEventListener('updatefound', () => {
        const worker = pushRegistration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
      return pushRegistration;
    } catch(error){ console.warn('Service worker registration failed:', error); return null; }
  }

  registerServiceWorker();

  async function startApp(){
    applyTheme(localStorage.getItem('ballKhoTheme') === 'dark' ? 'dark' : 'light', false);
    await loadDataFromServer(); session=loadSession(); bindEvents(); renderAll(); appReady=true; window.dispatchEvent(new CustomEvent('bkgxi:ready')); await initializePushNotifications(); setInterval(refreshFromServer,30000); setInterval(()=>{const route=window.BKGXIRouter?.current?.();if(route==='chat'||route==='live-scoring')refreshFromServer();},8000); window.addEventListener('online',()=>{if(pendingLocalSave)saveData();});
  }

  startApp().catch((error)=>{console.error('Application startup failed:',error);toast('Could not start the app. Refresh the page.');});
})();
