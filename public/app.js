(() => {
  'use strict';

  const STORAGE_KEY = 'ballKhoGayiXISharedV3';
  const SESSION_KEY = 'ballKhoGayiXISessionV3';
  const DEFAULT_PLAYER_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
  const DEFAULT_ADMIN_PIN_HASH = '1f6ebd8f003635e606b0822bf3301025ce467dc0fdbee1e964c9dcd2adc83471';

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
    liveScoring: defaultLiveScoring()
  };

  let data = migrateData(deepClone(seedData));
  let session = null;
  let saveQueue = Promise.resolve();
  let matchFilter = 'all';
  let statMode = 'runs';
  let confirmAction = null;
  let tossState = { winner: '', result: '', opponent: '' };
  let toastTimer = null;

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
    if (oldVersion < 3 && migrated.players.some((p) => p.id === 'p5')) migrated.settings.viceCaptainId = 'p5';
    if (oldVersion < 4) migrated.settings.version = 4;
    return migrated;
  }

  async function hashPin(pin) {
    const bytes = new TextEncoder().encode(String(pin));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function loadDataFromServer() {
    try {
      const response = await fetch('/api/state', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`Database request failed (${response.status})`);
      const payload = await response.json();
      const needsMigrationSave = !payload.state || Number(payload.state?.settings?.version || 0) < 3;
      data = migrateData(payload.state || deepClone(seedData));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (needsMigrationSave) await saveData();
    } catch (error) {
      console.warn('MongoDB unavailable; using local backup:', error);
      try { data = migrateData(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || deepClone(seedData)); }
      catch { data = migrateData(deepClone(seedData)); }
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const snapshot = deepClone(data);
    saveQueue = saveQueue.catch(() => undefined).then(async () => {
      const response = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: snapshot }) });
      if (!response.ok) throw new Error(await response.text() || `Save failed (${response.status})`);
    }).catch((error) => console.warn('MongoDB save failed; local backup kept:', error));
    return saveQueue;
  }

  async function refreshFromServer() {
    if (document.hidden) return;
    try {
      await saveQueue.catch(() => undefined);
      const response = await fetch('/api/state', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload.state) { data = migrateData(payload.state); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); renderAll(); }
    } catch { /* quiet background refresh */ }
  }

  function loadSession() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!parsed) return null;
      if (parsed.type === 'admin') return parsed;
      if (parsed.type === 'player' && data.players.some((p) => p.id === parsed.playerId && p.status === 'active')) return parsed;
      return null;
    } catch { return null; }
  }
  function saveSession() { session ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)) : sessionStorage.removeItem(SESSION_KEY); }

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
    renderBrand(); renderSummary(); renderLeadership(); renderAccount(); renderMatches(); renderLiveScoring(); renderTeams(); renderPractice(); renderChat(); renderToss(); renderStats(); renderAdmin(); renderLoginOptions(); renderPerformanceRows(); renderOpponentOptions(); applyPermissions();
  }

  function renderBrand() {
    const s = data.settings;
    $('brandName').textContent = s.groupName; $('brandTagline').textContent = s.tagline; $('footerBrand').textContent = s.groupName; $('ourTeamName').textContent = s.groupName;
    $('heroTitle').textContent = s.heroTitle; $('heroSubtitle').textContent = s.heroSubtitle;
    const logo = safeImage(s.logoImage, 'assets/ball-kho-gayi-circle.png'); const hero = safeImage(s.heroImage, 'assets/cric-time-front.jpg');
    ['headerLogo','heroLogo','teamSectionLogo','footerLogo'].forEach((id) => { if ($(id)) $(id).src = logo; }); $('heroImage').src = hero;
    document.title = `${s.groupName} — School Cricket`;
    ['chatWhatsappLink','thankWhatsappLink'].forEach((id)=>{if($(id))$(id).href=s.whatsappGroupUrl||'#';});
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

  function renderLeadership() {
    $('captainName').textContent = data.players.find((p) => p.id === data.settings.captainId)?.name || 'Not assigned';
    $('viceCaptainName').textContent = data.players.find((p) => p.id === data.settings.viceCaptainId)?.name || 'Not assigned';
  }

  function renderAccount() {
    const dashboard = $('my-dashboard');
    if (!session) { dashboard.classList.add('hidden'); $('loginBtn').classList.remove('hidden'); $('accountBtn').classList.add('hidden'); $('mobileAccountBtn').innerHTML = '◎<span>Account</span>'; return; }
    dashboard.classList.remove('hidden'); $('loginBtn').classList.add('hidden'); $('accountBtn').classList.remove('hidden'); $('mobileAccountBtn').innerHTML = '◎<span>My Room</span>';
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

  function renderMatches() {
    let matches=[...data.matches].sort((a,b)=>a.status!==b.status?(a.status==='Upcoming'?-1:1):new Date(b.date)-new Date(a.date)); if(matchFilter!=='all')matches=matches.filter((m)=>m.status===matchFilter);
    $('matchGrid').innerHTML=matches.map((match)=>{const completed=match.status==='Completed'; const opponentTeam=data.opponentTeams.find((t)=>t.id===match.opponentTeamId); return `<article class="match-card"><span class="match-status ${completed?'completed':''}">${escapeHtml(match.status)}</span><h3>${escapeHtml(data.settings.groupName)} vs ${escapeHtml(match.opponent)}</h3><p class="match-meta">${formatDate(match.date)}${match.time?` · ${escapeHtml(match.time)}`:''}<br>${escapeHtml(match.venue)} · ${match.overs} overs · ${escapeHtml(match.ballType||'Tennis')} ball${opponentTeam?`<br>${opponentTeam.players.length} opponent players listed`:''}</p><div class="score-strip"><div><small>Our team</small><strong>${completed?escapeHtml(match.ourScore):'—'}</strong></div><b>VS</b><div><small>${escapeHtml(match.opponent)}</small><strong>${completed?escapeHtml(match.opponentScore):'—'}</strong></div></div><p class="result-text">${completed?escapeHtml(match.resultSummary):escapeHtml(match.notes||'Fixture scheduled')}</p><div class="card-actions">${completed?`<button class="card-btn" data-scorecard="${match.id}">Scorecard</button>`:''}${!completed&&canScore()?`<button class="card-btn" data-live-match="${match.id}">Live score</button><button class="card-btn" data-complete-match="${match.id}">Add result</button>`:''}${isAdmin()?`<button class="card-btn danger-text" data-delete-match="${match.id}">Delete</button>`:''}</div></article>`;}).join(''); $('matchEmpty').classList.toggle('hidden',matches.length>0);
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
    const s=data.liveScoring; [s.striker,s.nonStriker]=[s.nonStriker,s.striker]; if(save){s.updatedAt=new Date().toISOString();saveData();renderLiveScoring();}
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
    saveData();renderLiveScoring();
  }
  function undoLiveBall(){if(!canScore())return;const s=data.liveScoring,previous=s.history.pop();if(!previous)return toast('Nothing to undo');const history=[...s.history];data.liveScoring={...defaultLiveScoring(),...JSON.parse(previous),history};saveData();renderLiveScoring();toast('Last ball undone');}
  function resetLiveScore(){if(!canScore())return;askConfirm('Reset live score?','All current ball-by-ball entries will be cleared.',()=>{data.liveScoring=defaultLiveScoring();saveData();renderLiveScoring();toast('Live score reset');});}
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
    return `<article class="player-card"><span class="jersey">${escapeHtml(player.jersey)}</span>${avatarHtml(player)}<h3>${escapeHtml(player.name)}</h3><p>${escapeHtml(leadershipLabel(player.id))}</p><p>${stat?.runs||0} runs · ${stat?.wickets||0} wickets</p><div class="player-card-footer"><button data-player-detail="${player.id}">Profile</button>${isAdmin()?`<button data-edit-player="${player.id}">Edit</button>`:''}</div></article>`;
  }

  function renderPractice() {
    const pt=data.practiceTeams; $('practiceNameA').textContent=pt.nameA; $('practiceNameB').textContent=pt.nameB;
    const renderList=(ids,side)=>ids.length?ids.map((id)=>{const p=data.players.find((x)=>x.id===id);if(!p)return'';return `<div class="practice-member">${avatarHtml(p)}<div><strong>${escapeHtml(p.name)}</strong><small>#${p.jersey} · ${escapeHtml(p.role)}</small></div>${canManage()?`<button data-move-practice="${p.id}" data-from="${side}">Move →</button>`:''}</div>`;}).join(''):'<p class="muted">Shuffle the squad to create this side.</p>';
    $('practiceTeamA').innerHTML=renderList(pt.teamA||[],'A'); $('practiceTeamB').innerHTML=renderList(pt.teamB||[],'B'); $('practiceUpdated').textContent=pt.updatedAt?`Last distributed ${formatTime(pt.updatedAt)} · ${formatDate(pt.updatedAt.slice(0,10))}`:'Teams have not been distributed yet.';
  }

  function renderChat() {
    const list=$('chatMessages'); const messages=[...data.chat].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).slice(-100);
    if(!messages.length){list.innerHTML='<div class="chat-empty">No messages yet. Start the cricket conversation.</div>';} else list.innerHTML=messages.map((m)=>{const player=data.players.find((p)=>p.id===m.senderId); const mine=session&&(session.type==='admin'?m.senderRole==='Administrator':m.senderId===session.playerId); return `<div class="message ${mine?'mine':''}">${avatarHtml(player||{name:m.senderName})}<div><div class="message-bubble"><div class="message-head"><strong>${escapeHtml(m.senderName)}</strong><span>${escapeHtml(m.senderRole||'Player')} · ${formatTime(m.createdAt)}</span></div><p>${escapeHtml(m.text)}</p></div>${isAdmin()||mine?`<button class="message-delete" data-delete-message="${m.id}">Delete</button>`:''}</div></div>`;}).join('');
    $('chatInput').disabled=!session; $('chatInput').placeholder=session?'Write a message…':'Log in to send a message'; $('chatStatus').textContent=session?'Messages sync through MongoDB.':'Player login required to post.'; requestAnimationFrame(()=>{list.scrollTop=list.scrollHeight;});
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
    const current=$('loginAccount').value; $('loginAccount').innerHTML=`<option value="admin">${escapeHtml(data.settings.adminName)} — Administrator</option>${activePlayers().map((p)=>`<option value="player:${p.id}">${escapeHtml(p.name)} — ${escapeHtml(leadershipLabel(p.id))}</option>`).join('')}`; if([...$('loginAccount').options].some((o)=>o.value===current))$('loginAccount').value=current;
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

  async function readCompressedImage(file,maxWidth=420,maxHeight=420,quality=.78){
    if(!file)return''; if(!file.type.startsWith('image/'))throw new Error('Please choose an image file.');
    const source=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
    const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=source;});
    const scale=Math.min(1,maxWidth/image.width,maxHeight/image.height); const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(image.width*scale)); canvas.height=Math.max(1,Math.round(image.height*scale)); canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height); return canvas.toDataURL('image/jpeg',quality);
  }

  function openPlayerModal(id='') {
    if(!isAdmin())return requireLogin('Administrator login required.'); const p=data.players.find((x)=>x.id===id); $('editingPlayerId').value=id; $('playerModalTitle').textContent=p?'Edit player':'Add player'; $('playerName').value=p?.name||''; $('playerPhone').value=p?.phone||''; $('playerJersey').value=p?.jersey??''; $('playerRole').value=p?.role||'Batter'; $('playerClass').value=p?.className||''; $('playerPin').value=''; $('playerBatting').value=p?.battingStyle||'Right-hand bat'; $('playerBowling').value=p?.bowlingStyle||'Does not bowl'; $('playerNote').value=p?.note||''; $('playerPhoto').value=''; openModal('playerModal');
  }

  function openProfileModal() {
    const p=getSessionPlayer(); if(!p)return requireLogin(); $('profileName').value=p.name; $('profilePhone').value=p.phone||''; $('profileJersey').value=p.jersey; $('profileRole').value=p.role||'Batter'; $('profileClass').value=p.className||''; $('profileNote').value=p.note||''; $('profilePhoto').value=''; openModal('profileModal');
  }

  function openOpponentTeamModal(id='') { if(!isAdmin())return requireLogin(); const t=data.opponentTeams.find((x)=>x.id===id); $('editingOpponentTeamId').value=id; $('opponentTeamModalTitle').textContent=t?'Edit team':'Add team'; $('opponentTeamName').value=t?.name||''; $('opponentTeamColor').value=t?.color||'#d6a928'; $('opponentTeamGround').value=t?.ground||''; openModal('opponentTeamModal'); }
  function openOpponentPlayerModal(teamId,playerId=''){if(!isAdmin())return requireLogin();const t=data.opponentTeams.find((x)=>x.id===teamId);const p=t?.players.find((x)=>x.id===playerId);$('opponentPlayerTeamId').value=teamId;$('editingOpponentPlayerId').value=playerId;$('opponentPlayerName').value=p?.name||'';$('opponentPlayerJersey').value=p?.jersey??'';$('opponentPlayerRole').value=p?.role||'Batter';$('opponentPlayerNote').value=p?.note||'';openModal('opponentPlayerModal');}

  function openResultModal(matchId='') { if(!canManage())return requireLogin('Admin, captain or vice-captain login required.'); $('resultForm').reset(); $('resultForm').dataset.matchId=matchId; $('resultDate').value=toDateInput(new Date()); $('resultOvers').value=10; renderPerformanceRows(); if(matchId){const m=data.matches.find((x)=>x.id===matchId);if(m){$('resultOpponent').value=m.opponent;$('resultDate').value=m.date;$('resultVenue').value=m.venue;$('resultOvers').value=m.overs;}} openModal('resultModal'); }
  function collectPerformances(){return $$('[data-performance-player]').map((row)=>{const r={playerId:row.dataset.performancePlayer};$$('[data-field]',row).forEach((input)=>r[input.dataset.field]=Number(input.value||0));return r;}).filter((p)=>['runs','balls','wickets','oversBowled','runsConceded','catches'].some((key)=>Number(p[key])>0));}

  function openScorecard(matchId){const match=data.matches.find((m)=>m.id===matchId);if(!match)return;const performances=(match.performances||[]).map((p)=>({...p,player:data.players.find((x)=>x.id===p.playerId)})).filter((p)=>p.player);$('scorecardContent').innerHTML=`<div class="scorecard-hero"><p class="eyebrow">Match Scorecard</p><h2>${escapeHtml(data.settings.groupName)} vs ${escapeHtml(match.opponent)}</h2><p>${formatDate(match.date)} · ${escapeHtml(match.venue)} · ${match.overs} overs</p><div class="scorecard-score"><div><small>${escapeHtml(data.settings.groupName)}</small><strong>${escapeHtml(match.ourScore)}</strong></div><div><small>${escapeHtml(match.opponent)}</small><strong>${escapeHtml(match.opponentScore)}</strong></div></div><p><strong>${escapeHtml(match.resultSummary)}</strong></p></div><div class="table-wrap"><table><thead><tr><th>Player</th><th>Runs</th><th>Balls</th><th>Wickets</th><th>Overs</th><th>Catches</th></tr></thead><tbody>${performances.length?performances.map((p)=>`<tr><td>${escapeHtml(p.player.name)}</td><td>${p.runs||0}</td><td>${p.balls||0}</td><td>${p.wickets||0}</td><td>${p.oversBowled||0}</td><td>${p.catches||0}</td></tr>`).join(''):'<tr><td colspan="6">No player data entered.</td></tr>'}</tbody></table></div>`;openModal('scorecardModal');}

  function openPlayerDetail(id){const p=data.players.find((x)=>x.id===id);if(!p)return;const stat=calculatePlayerStats().find((s)=>s.player.id===id)||{matches:0,runs:0,wickets:0,catches:0,strikeRate:0,economy:0,ballsBowled:0};$('scorecardContent').innerHTML=`<div class="detail-layout">${avatarHtml(p,'large')}<div><p class="eyebrow">${escapeHtml(leadershipLabel(p.id))}</p><h2>${escapeHtml(p.name)}</h2><p class="muted">Jersey ${p.jersey} · ${escapeHtml(p.role)} · ${escapeHtml(p.className||'School Squad')}</p><p>${escapeHtml(p.note||'No note added.')}</p><p><strong>Phone:</strong> ${escapeHtml(displayPhone(p)||'Not added')}</p></div></div><div class="detail-stats"><div><b>${stat.matches}</b><span>Matches</span></div><div><b>${stat.runs}</b><span>Runs</span></div><div><b>${stat.wickets}</b><span>Wickets</span></div><div><b>${stat.catches}</b><span>Catches</span></div><div><b>${stat.strikeRate.toFixed(1)}</b><span>Strike rate</span></div><div><b>${stat.ballsBowled?stat.economy.toFixed(2):'—'}</b><span>Economy</span></div></div>`;openModal('scorecardModal');}

  function shufflePracticeTeams(){if(!canManage())return requireLogin();const players=[...activePlayers()].sort(()=>Math.random()-.5);const a=[],b=[];players.forEach((p,i)=>(i%2?a:b).push(p.id));data.practiceTeams={...data.practiceTeams,teamA:a,teamB:b,updatedAt:new Date().toISOString()};saveData();renderPractice();toast('Practice teams distributed');}

  function bindEvents() {
    $('loginBtn').addEventListener('click',()=>openModal('loginModal')); $('heroLoginBtn').addEventListener('click',()=>session?document.querySelector('#my-dashboard').scrollIntoView():openModal('loginModal')); $('mobileAccountBtn').addEventListener('click',()=>session?document.querySelector('#my-dashboard').scrollIntoView():openModal('loginModal')); $('accountBtn').addEventListener('click',()=>document.querySelector('#my-dashboard').scrollIntoView());
    $('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('ballKhoTheme',document.body.classList.contains('dark')?'dark':'light');});
    $$('[data-close]').forEach((b)=>b.addEventListener('click',()=>closeModal(b.dataset.close))); $$('.modal').forEach((m)=>m.addEventListener('click',(e)=>{if(e.target===m)closeModal(m.id);}));
    $('openJoinBtn').addEventListener('click',()=>{closeModal('loginModal');openModal('joinModal');});

    $('loginForm').addEventListener('submit',async(e)=>{e.preventDefault();const account=$('loginAccount').value;const pin=$('loginPin').value.trim();if(!validPin(pin))return toast('Enter your 4–6 digit PIN');const pinHash=await hashPin(pin);if(account==='admin'){if(pinHash!==data.settings.adminPinHash)return toast('Incorrect PIN');session={type:'admin'};}else{const id=account.split(':')[1];const p=data.players.find((x)=>x.id===id&&x.status==='active');if(!p||pinHash!==p.pinHash)return toast('Incorrect PIN');session={type:'player',playerId:p.id};}saveSession();$('loginPin').value='';closeModal('loginModal');renderAll();toast('Welcome to the dressing room');});
    $('logoutBtn').addEventListener('click',()=>{session=null;saveSession();renderAll();toast('Logged out');});

    $('joinForm').addEventListener('submit',async(e)=>{e.preventDefault();const name=$('joinName').value.trim(),phone=$('joinPhone').value.trim(),jersey=Number($('joinJersey').value),pin=$('joinPin').value.trim();if(!validPhone(phone))return toast('Enter a valid phone number');if(!validPin(pin))return toast('PIN must contain 4–6 numbers');if(!jerseyAvailable(jersey))return toast('That jersey number is already used');if(data.joinRequests.some((r)=>r.phone.replace(/\D/g,'')===phone.replace(/\D/g,'')))return toast('A request already exists for this phone');let photo='';try{photo=await readCompressedImage($('joinPhoto').files[0]);}catch(err){return toast(err.message);}data.joinRequests.push({id:uid('request'),name,phone,jersey,role:$('joinRole').value,className:$('joinClass').value.trim()||'School Squad',note:$('joinNote').value.trim(),photo,pinHash:await hashPin(pin),createdAt:new Date().toISOString()});saveData();e.target.reset();closeModal('joinModal');toast('Join request sent to Swastik admin');renderAdmin();});

    $('editProfileBtn').addEventListener('click',openProfileModal); $('profileForm').addEventListener('submit',async(e)=>{e.preventDefault();const p=getSessionPlayer();if(!p)return;const jersey=Number($('profileJersey').value);if(!jerseyAvailable(jersey,p.id))return toast('That jersey number is already used');const phone=$('profilePhone').value.trim();if(phone&&!validPhone(phone))return toast('Enter a valid phone number');let photo=p.photo||'';try{if($('profilePhoto').files[0])photo=await readCompressedImage($('profilePhoto').files[0]);}catch(err){return toast(err.message);}Object.assign(p,{name:$('profileName').value.trim(),phone,jersey,role:$('profileRole').value,className:$('profileClass').value.trim()||'School Squad',note:$('profileNote').value.trim(),photo});saveData();closeModal('profileModal');renderAll();toast('Profile updated on all devices');});
    $('changePinBtn').addEventListener('click',()=>openModal('pinModal')); $('pinForm').addEventListener('submit',async(e)=>{e.preventDefault();const current=$('currentPin').value.trim(),next=$('newPin').value.trim(),confirm=$('confirmPin').value.trim();if(!validPin(next)||next!==confirm)return toast('New PINs must match and contain 4–6 numbers');const currentHash=await hashPin(current);if(isAdmin()){if(currentHash!==data.settings.adminPinHash)return toast('Current PIN is incorrect');data.settings.adminPinHash=await hashPin(next);}else{const p=getSessionPlayer();if(!p||currentHash!==p.pinHash)return toast('Current PIN is incorrect');p.pinHash=await hashPin(next);}saveData();e.target.reset();closeModal('pinModal');toast('PIN updated');});

    $$('[data-availability]').forEach((b)=>b.addEventListener('click',()=>{const p=getSessionPlayer(),m=getUpcomingMatch();if(!p||!m)return;data.availability[m.id]=data.availability[m.id]||{};data.availability[m.id][p.id]=b.dataset.availability;saveData();renderAccount();toast(`Availability: ${b.dataset.availability}`);})); $('saveGoalBtn').addEventListener('click',()=>{const p=getSessionPlayer();if(!p)return requireLogin();data.goals[p.id]=$('personalGoalInput').value.trim();saveData();toast('Goal saved');});

    $('scheduleBtn').addEventListener('click',()=>canManage()?openModal('scheduleModal'):requireLogin()); $('captainScheduleBtn').addEventListener('click',()=>openModal('scheduleModal')); $('quickResultBtn').addEventListener('click',()=>openResultModal()); $('captainResultBtn').addEventListener('click',()=>openResultModal());
    $('startLiveBtn').addEventListener('click',()=>openLiveSetup()); $('liveSetupBtn').addEventListener('click',()=>openLiveSetup()); $('liveUndoBtn').addEventListener('click',undoLiveBall); $('liveResetBtn').addEventListener('click',resetLiveScore); $('liveSwapBtn').addEventListener('click',()=>swapLiveStrike()); $('liveChangePlayersBtn').addEventListener('click',()=>openLiveSetup(data.liveScoring.matchId)); $('liveUseResultBtn').addEventListener('click',useLiveInResult); $('liveShareBtn').addEventListener('click',shareLiveScore); $('liveEndBtn').addEventListener('click',()=>askConfirm('End this innings?','The score will remain saved and can be copied into the Result Desk.',()=>{data.liveScoring.active=false;data.liveScoring.completed=true;data.liveScoring.updatedAt=new Date().toISOString();saveData();renderLiveScoring();toast('Innings ended');}));
    $('liveMatchSelect').addEventListener('change',()=>{const m=data.matches.find((x)=>x.id===$('liveMatchSelect').value);if(m){$('liveOpponentInput').value=m.opponent;$('liveOversInput').value=m.overs;}});
    $('liveSetupForm').addEventListener('submit',(e)=>{e.preventDefault();if(!canScore())return requireLogin();const previous=data.liveScoring,matchId=$('liveMatchSelect').value,opponent=$('liveOpponentInput').value.trim(),sameMatch=!previous.completed&&previous.opponent===opponent&&previous.matchId===matchId,base=sameMatch?previous:defaultLiveScoring();data.liveScoring={...base,active:true,completed:false,matchId,opponent,battingSide:$('liveBattingSide').value,oversLimit:Number($('liveOversInput').value||10),target:Number($('liveTargetInput').value||0),striker:$('liveStrikerInput').value.trim(),nonStriker:$('liveNonStrikerInput').value.trim(),bowler:$('liveBowlerInput').value.trim(),startedAt:base.startedAt||new Date().toISOString(),updatedAt:new Date().toISOString(),updatedBy:isAdmin()?data.settings.adminName:(getSessionPlayer()?.name||'Scorer')};liveBatter(data.liveScoring.striker);liveBatter(data.liveScoring.nonStriker);saveData();closeModal('liveSetupModal');renderLiveScoring();document.querySelector('#live-scoring').scrollIntoView({behavior:'smooth'});toast('Live scoreboard ready');});
    $$('[data-live-ball]').forEach((b)=>b.addEventListener('click',()=>recordLiveBall(b.dataset.liveBall,b.dataset.value)));
    $('scheduleForm').addEventListener('submit',(e)=>{e.preventDefault();if(!canManage())return requireLogin();const teamId=$('scheduleOpponentTeam').value;const team=data.opponentTeams.find((t)=>t.id===teamId);const opponent=team?.name||$('scheduleOpponent').value.trim();if(!opponent)return toast('Choose or enter an opponent');data.matches.push({id:uid('match'),status:'Upcoming',opponent,opponentTeamId:teamId,venue:$('scheduleVenue').value.trim(),date:$('scheduleDate').value,time:$('scheduleTime').value,overs:Number($('scheduleOvers').value),ballType:$('scheduleBall').value,notes:$('scheduleNotes').value.trim(),createdAt:Date.now()});saveData();e.target.reset();closeModal('scheduleModal');renderAll();toast('Fixture scheduled');});
    $('resultForm').addEventListener('submit',(e)=>{e.preventDefault();if(!canManage())return requireLogin();const existingId=e.target.dataset.matchId;const old=data.matches.find((m)=>m.id===existingId);const match={id:existingId||uid('match'),status:'Completed',opponent:$('resultOpponent').value.trim(),opponentTeamId:old?.opponentTeamId||'',date:$('resultDate').value,venue:$('resultVenue').value.trim(),time:old?.time||'',overs:Number($('resultOvers').value),ballType:old?.ballType||'Tennis',ourScore:$('ourScore').value.trim(),opponentScore:$('opponentScore').value.trim(),tossWinner:$('resultTossWinner').value,tossDecision:$('resultTossDecision').value,outcome:$('resultOutcome').value,resultSummary:$('resultSummary').value.trim(),notes:$('resultNotes').value.trim(),performances:collectPerformances(),createdAt:Date.now()};data.matches=existingId?data.matches.map((m)=>m.id===existingId?match:m):[...data.matches,match];saveData();closeModal('resultModal');renderAll();toast('Match saved and stats updated');});
    $$('[data-match-filter]').forEach((b)=>b.addEventListener('click',()=>{matchFilter=b.dataset.matchFilter;$$('[data-match-filter]').forEach((x)=>x.classList.toggle('active',x===b));renderMatches();}));

    $('addPlayerBtn').addEventListener('click',()=>openPlayerModal()); $('playerForm').addEventListener('submit',async(e)=>{e.preventDefault();if(!isAdmin())return requireLogin();const id=$('editingPlayerId').value,existing=data.players.find((p)=>p.id===id),jersey=Number($('playerJersey').value),phone=$('playerPhone').value.trim(),newPin=$('playerPin').value.trim();if(!jerseyAvailable(jersey,id))return toast('That jersey number is already used');if(phone&&!validPhone(phone))return toast('Enter a valid phone number');if(newPin&&!validPin(newPin))return toast('PIN must contain 4–6 numbers');let photo=existing?.photo||'';try{if($('playerPhoto').files[0])photo=await readCompressedImage($('playerPhoto').files[0]);}catch(err){return toast(err.message);}const p={id:id||uid('player'),name:$('playerName').value.trim(),phone,jersey,role:$('playerRole').value,className:$('playerClass').value.trim()||'School Squad',pinHash:newPin?await hashPin(newPin):(existing?.pinHash||DEFAULT_PLAYER_PIN_HASH),battingStyle:$('playerBatting').value.trim()||'Right-hand bat',bowlingStyle:$('playerBowling').value.trim()||'Does not bowl',note:$('playerNote').value.trim(),photo,status:'active'};data.players=id?data.players.map((x)=>x.id===id?p:x):[...data.players,p];saveData();closeModal('playerModal');renderAll();toast(id?'Player updated':'Player added');});

    $('addOpponentTeamBtn').addEventListener('click',()=>openOpponentTeamModal()); $('opponentTeamForm').addEventListener('submit',(e)=>{e.preventDefault();if(!isAdmin())return;const id=$('editingOpponentTeamId').value,existing=data.opponentTeams.find((t)=>t.id===id);const t={id:id||uid('opponent'),name:$('opponentTeamName').value.trim(),color:$('opponentTeamColor').value,ground:$('opponentTeamGround').value.trim(),players:existing?.players||[]};data.opponentTeams=id?data.opponentTeams.map((x)=>x.id===id?t:x):[...data.opponentTeams,t];saveData();closeModal('opponentTeamModal');renderAll();toast('Opponent team saved');});
    $('opponentPlayerForm').addEventListener('submit',(e)=>{e.preventDefault();if(!isAdmin())return;const team=data.opponentTeams.find((t)=>t.id===$('opponentPlayerTeamId').value);if(!team)return;const id=$('editingOpponentPlayerId').value;const p={id:id||uid('opp-player'),name:$('opponentPlayerName').value.trim(),jersey:Number($('opponentPlayerJersey').value||0),role:$('opponentPlayerRole').value,note:$('opponentPlayerNote').value.trim()};team.players=id?team.players.map((x)=>x.id===id?p:x):[...team.players,p];saveData();closeModal('opponentPlayerModal');renderAll();toast('Opponent player saved');});

    $('shuffleTeamsBtn').addEventListener('click',shufflePracticeTeams); $('renamePracticeBtn').addEventListener('click',()=>{$('practiceNameInputA').value=data.practiceTeams.nameA;$('practiceNameInputB').value=data.practiceTeams.nameB;openModal('practiceNameModal');}); $('practiceNameForm').addEventListener('submit',(e)=>{e.preventDefault();data.practiceTeams.nameA=$('practiceNameInputA').value.trim();data.practiceTeams.nameB=$('practiceNameInputB').value.trim();saveData();closeModal('practiceNameModal');renderPractice();toast('Practice teams renamed');});

    $('chatForm').addEventListener('submit',(e)=>{e.preventDefault();if(!session)return requireLogin();const text=$('chatInput').value.trim();if(!text)return;const p=getSessionPlayer();data.chat.push({id:uid('message'),senderId:p?.id||'admin',senderName:isAdmin()?data.settings.adminName:p.name,senderRole:isAdmin()?'Administrator':leadershipLabel(p.id),text,createdAt:new Date().toISOString()});data.chat=data.chat.slice(-100);$('chatInput').value='';saveData();renderChat();});

    $('flipCoinBtn').addEventListener('click',()=>{const opponent=$('tossOpponent').value||'Opponent',call=$('tossCall').value,result=Math.random()<.5?'Heads':'Tails',won=call===result;tossState={result,winner:won?data.settings.groupName:opponent,opponent};$('coin').classList.remove('flip-heads','flip-tails');void $('coin').offsetWidth;$('coin').classList.add(result==='Heads'?'flip-heads':'flip-tails');$('coinLabel').textContent='Coin in the air…';$('decisionButtons').classList.add('hidden');setTimeout(()=>{$('coinLabel').textContent=`${result}! ${tossState.winner} won.`;$('tossWinnerText').textContent='Choose bat or bowl:';$('decisionButtons').classList.remove('hidden');},1300);});
    $$('[data-decision]').forEach((b)=>b.addEventListener('click',()=>{if(!tossState.winner)return toast('Flip the coin first');data.settings.savedToss={winner:tossState.winner,decision:b.dataset.decision,opponent:tossState.opponent,result:tossState.result,savedAt:new Date().toISOString()};saveData();renderToss();toast('Toss saved');}));

    $$('[data-stat]').forEach((b)=>b.addEventListener('click',()=>{statMode=b.dataset.stat;$$('[data-stat]').forEach((x)=>x.classList.toggle('active',x===b));renderStats();}));
    $('editNoticeBtn').addEventListener('click',()=>{if(!canManage())return requireLogin();$('noticeTitleInput').value=data.settings.announcementTitle;$('noticeTextInput').value=data.settings.announcementText;openModal('noticeModal');}); $('noticeForm').addEventListener('submit',(e)=>{e.preventDefault();data.settings.announcementTitle=$('noticeTitleInput').value.trim();data.settings.announcementText=$('noticeTextInput').value.trim();saveData();closeModal('noticeModal');renderSummary();toast('Notice published');});

    $('saveSettingsBtn').addEventListener('click',async()=>{if(!isAdmin())return;const captain=$('captainSelect').value,vice=$('viceCaptainSelect').value,newPin=$('adminPinInput').value.trim();if(captain&&vice&&captain===vice)return toast('Captain and vice-captain must be different');if(newPin&&!validPin(newPin))return toast('Admin PIN must contain 4–6 numbers');let hero=data.settings.heroImage,logo=data.settings.logoImage;try{if($('heroImageInput').files[0])hero=await readCompressedImage($('heroImageInput').files[0],1600,1200,.82);if($('logoImageInput').files[0])logo=await readCompressedImage($('logoImageInput').files[0],512,512,.82);}catch(err){return toast(err.message);}Object.assign(data.settings,{groupName:$('groupNameInput').value.trim()||'Ball Kho Gayi XI',tagline:$('taglineInput').value.trim()||'Bat · Ball · Repeat',heroTitle:$('heroTitleInput').value.trim(),heroSubtitle:$('heroSubtitleInput').value.trim(),homeGround:$('homeGroundInput').value.trim(),whatsappGroupUrl:$('whatsappGroupInput').value.trim(),captainId:captain,viceCaptainId:vice,heroImage:hero,logoImage:logo});if(newPin)data.settings.adminPinHash=await hashPin(newPin);$('adminPinInput').value='';saveData();renderAll();toast('Website settings saved');});
    $('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ball-kho-gayi-xi-backup.json';a.click();URL.revokeObjectURL(url);}); $('importInput').addEventListener('change',async(e)=>{const file=e.target.files[0];if(!file)return;try{data=migrateData(JSON.parse(await file.text()));saveData();renderAll();toast('Backup imported');}catch{toast('Invalid backup file');}e.target.value='';}); $('resetBtn').addEventListener('click',()=>askConfirm('Reset all website data?','This restores the original squad, matches and settings.',()=>{data=migrateData(deepClone(seedData));session=null;saveSession();saveData();renderAll();toast('Website reset');}));

    $('confirmCancel').addEventListener('click',closeConfirm); $('confirmOk').addEventListener('click',()=>{const action=confirmAction;closeConfirm();if(action)action();});

    document.addEventListener('click',(e)=>{
      const target=e.target.closest('button,[data-player-detail]');if(!target)return;
      if(target.dataset.scorecard)return openScorecard(target.dataset.scorecard);
      if(target.dataset.liveMatch)return openLiveSetup(target.dataset.liveMatch);
      if(target.dataset.completeMatch)return openResultModal(target.dataset.completeMatch);
      if(target.dataset.deleteMatch)return askConfirm('Delete this match?','The scorecard and its stats will be removed.',()=>{data.matches=data.matches.filter((m)=>m.id!==target.dataset.deleteMatch);saveData();renderAll();toast('Match deleted');});
      if(target.dataset.playerDetail)return openPlayerDetail(target.dataset.playerDetail);
      if(target.dataset.editPlayer)return openPlayerModal(target.dataset.editPlayer);
      if(target.dataset.deletePlayer)return askConfirm('Remove this player?','Past scorecards remain, but the player leaves the active squad.',()=>{const p=data.players.find((x)=>x.id===target.dataset.deletePlayer);if(p)p.status='removed';saveData();renderAll();toast('Player removed');});
      if(target.dataset.editOpponentTeam)return openOpponentTeamModal(target.dataset.editOpponentTeam);
      if(target.dataset.deleteOpponentTeam)return askConfirm('Delete opponent team?','Its directory and players will be removed. Existing match names stay.',()=>{data.opponentTeams=data.opponentTeams.filter((t)=>t.id!==target.dataset.deleteOpponentTeam);saveData();renderAll();});
      if(target.dataset.addOpponentPlayer)return openOpponentPlayerModal(target.dataset.addOpponentPlayer);
      if(target.dataset.editOpponentPlayer)return openOpponentPlayerModal(target.dataset.teamId,target.dataset.editOpponentPlayer);
      if(target.dataset.deleteOpponentPlayer){const t=data.opponentTeams.find((x)=>x.id===target.dataset.teamId);if(t)t.players=t.players.filter((p)=>p.id!==target.dataset.deleteOpponentPlayer);saveData();renderAll();}
      if(target.dataset.approveRequest){const r=data.joinRequests.find((x)=>x.id===target.dataset.approveRequest);if(!r)return;if(!jerseyAvailable(r.jersey))return toast('That jersey is already taken. Edit the request after approval.');data.players.push({id:uid('player'),name:r.name,phone:r.phone,jersey:r.jersey,role:r.role,className:r.className,note:r.note,photo:r.photo,pinHash:r.pinHash,battingStyle:'Right-hand bat',bowlingStyle:'Does not bowl',status:'active'});data.joinRequests=data.joinRequests.filter((x)=>x.id!==r.id);saveData();renderAll();toast('Player approved');}
      if(target.dataset.rejectRequest){data.joinRequests=data.joinRequests.filter((x)=>x.id!==target.dataset.rejectRequest);saveData();renderAll();toast('Request rejected');}
      if(target.dataset.movePractice){const p=target.dataset.movePractice,from=target.dataset.from;if(from==='A'){data.practiceTeams.teamA=data.practiceTeams.teamA.filter((id)=>id!==p);data.practiceTeams.teamB.push(p);}else{data.practiceTeams.teamB=data.practiceTeams.teamB.filter((id)=>id!==p);data.practiceTeams.teamA.push(p);}data.practiceTeams.updatedAt=new Date().toISOString();saveData();renderPractice();}
      if(target.dataset.deleteMessage){data.chat=data.chat.filter((m)=>m.id!==target.dataset.deleteMessage);saveData();renderChat();}
    });

    document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){$$('.modal.show').forEach((m)=>closeModal(m.id));closeConfirm();}});
  }

  function registerServiceWorker(){if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});}

  registerServiceWorker();

  async function startApp(){
    if(localStorage.getItem('ballKhoTheme')==='dark')document.body.classList.add('dark');
    await loadDataFromServer(); session=loadSession(); bindEvents(); renderAll(); setInterval(refreshFromServer,30000);
  }

  startApp().catch((error)=>{console.error('Application startup failed:',error);toast('Could not start the app. Refresh the page.');});
})();
