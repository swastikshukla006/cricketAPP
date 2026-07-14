(() => {
  'use strict';

  const STORAGE_KEY = 'ballKhoGayiXISchoolEditionV1';
  const SESSION_KEY = 'ballKhoGayiXISessionV1';

  const seedData = {
    settings: {
      groupName: 'Ball Kho Gayi XI',
      adminName: 'Swastik Shukla',
      adminPin: '8470',
      captainId: 'p6',
      viceCaptainId: 'p1',
      announcementTitle: 'Score likhna mat bhoolna.',
      announcementText: 'Ball kho jaaye to bhi theek hai — bas notebook mein runs, wickets, overs aur catches likh lena, taaki ghar aake sahi score upload ho sake.',
      savedToss: null
    },
    players: [
      player('p1', 'Priyanshu', 7, 'Batter', 'Right-hand bat', 'Part-time off spin', 'Top-order stroke player and current vice-captain.', '1234'),
      player('p2', 'Abhinav', 18, 'All-rounder', 'Right-hand bat', 'Right-arm medium', 'Balances the side with both bat and ball.', '1234'),
      player('p3', 'Adarsh', 11, 'Bowler', 'Right-hand bat', 'Right-arm fast', 'New-ball bowler who attacks the stumps.', '1234'),
      player('p4', 'Abhishek', 1, 'Wicketkeeper', 'Right-hand bat', 'Does not bowl', 'Wicketkeeper and middle-order finisher.', '1234'),
      player('p5', 'Ananya', 9, 'All-rounder', 'Left-hand bat', 'Left-arm spin', 'Energetic all-rounder and sharp fielder.', '1234'),
      player('p6', 'Swastik', 10, 'All-rounder', 'Right-hand bat', 'Right-arm medium', 'Captain and administrator of the team website.', '1234'),
      player('p7', 'Ramest', 23, 'Bowler', 'Right-hand bat', 'Leg spin', 'Uses spin to break partnerships.', '1234'),
      player('p8', 'Amol', 45, 'Batter', 'Right-hand bat', 'Does not bowl', 'Attacking batter who likes pace on the ball.', '1234'),
      player('p9', 'Aman I', 27, 'Bowler', 'Right-hand bat', 'Right-arm medium-fast', 'Hits the deck hard in the middle overs.', '1234'),
      player('p10', 'Aman II', 99, 'Batter', 'Left-hand bat', 'Part-time spin', 'Flexible batter who can finish an innings.', '1234')
    ],
    matches: [
      {
        id: 'm-upcoming-1', status: 'Upcoming', opponent: 'School Strikers', venue: 'School Ground', date: futureDate(5), time: '07:30', overs: 10, ballType: 'Tennis', notes: 'Bring notebook, water and fielding energy.', createdAt: Date.now() - 1000
      },
      completedMatch('m1', 'Green Park XI', pastDate(5), '96/5', '88/7', 'win', 'Won by 8 runs', 'Late boundaries from Swastik changed the match.', [
        perf('p1', 22, 16, 0, 0, 0, 1), perf('p2', 14, 11, 1, 2, 14, 0), perf('p3', 3, 4, 2, 2, 13, 0), perf('p4', 11, 9, 0, 0, 0, 2), perf('p5', 8, 7, 1, 1, 9, 1), perf('p6', 24, 14, 1, 2, 16, 0), perf('p7', 2, 3, 1, 1, 7, 0), perf('p8', 7, 5, 0, 0, 0, 0), perf('p9', 1, 2, 1, 1, 10, 0), perf('p10', 4, 3, 0, 0, 0, 0)
      ]),
      completedMatch('m2', 'Boundary Breakers', pastDate(12), '74/6', '75/4', 'loss', 'Lost by 6 wickets', 'Priyanshu and Ananya fought hard in the middle overs.', [
        perf('p1', 19, 14, 0, 0, 0, 0), perf('p2', 6, 7, 0, 1, 11, 0), perf('p3', 1, 2, 1, 2, 18, 0), perf('p4', 9, 8, 0, 0, 0, 1), perf('p5', 17, 12, 1, 2, 14, 1), perf('p6', 10, 8, 0, 1, 9, 0), perf('p7', 2, 3, 0, 1, 12, 0), perf('p8', 5, 4, 0, 0, 0, 0), perf('p9', 0, 0, 1, 1, 7, 0), perf('p10', 3, 2, 0, 0, 0, 0)
      ]),
      completedMatch('m3', 'Out of Ground Club', pastDate(20), '109/4', '97/8', 'win', 'Won by 12 runs', 'Classic Ball Kho Gayi XI comeback after losing the early momentum.', [
        perf('p1', 27, 18, 0, 0, 0, 1), perf('p2', 16, 12, 1, 2, 15, 0), perf('p3', 4, 4, 2, 2, 12, 0), perf('p4', 13, 10, 0, 0, 0, 1), perf('p5', 12, 8, 2, 2, 17, 1), perf('p6', 29, 17, 1, 2, 13, 1), perf('p7', 3, 2, 1, 1, 8, 0), perf('p8', 14, 10, 0, 0, 0, 0), perf('p9', 0, 0, 1, 1, 11, 0), perf('p10', 6, 5, 0, 0, 0, 0)
      ])
    ],
    availability: {},
    goals: {}
  };

  let data = migrateData(deepClone(seedData));
  let session = null;
  let saveQueue = Promise.resolve();
  let matchFilter = 'all';
  let roleFilter = 'all';
  let playerSearch = '';
  let statMode = 'runs';
  let confirmAction = null;
  let tossState = { winner: '', result: '' };

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function player(id, name, jersey, role, battingStyle, bowlingStyle, note, pin) {
    return { id, name, jersey, role, className: 'School Squad', battingStyle, bowlingStyle, note, pin };
  }
  function completedMatch(id, opponent, date, ourScore, opponentScore, outcome, resultSummary, notes, performances) {
    return { id, status: 'Completed', opponent, venue: 'School Ground', date, overs: 10, ballType: 'Tennis', ourScore, opponentScore, tossWinner: outcome === 'win' ? 'Our team' : 'Opponent', tossDecision: 'Bat first', outcome, resultSummary, notes, performances, createdAt: Date.now() - Number(id.replace(/\D/g, '') || 1) * 500000 };
  }
  function perf(playerId, runs, balls, wickets, oversBowled, runsConceded, catches) {
    return { playerId, runs, balls, wickets, oversBowled, runsConceded, catches };
  }
  function pastDate(days) { const d = new Date(); d.setDate(d.getDate() - days); return toDateInput(d); }
  function futureDate(days) { const d = new Date(); d.setDate(d.getDate() + days); return toDateInput(d); }
  function toDateInput(date) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  function deepClone(value) { return JSON.parse(JSON.stringify(value)); }

  function migrateData(value) {
    const migrated = value && typeof value === 'object' ? value : deepClone(seedData);
    migrated.settings = { ...deepClone(seedData.settings), ...(migrated.settings || {}) };
    migrated.players = Array.isArray(migrated.players) ? migrated.players.map((p) => ({ pin: '1234', className: 'School Squad', note: '', ...p })) : deepClone(seedData.players);
    migrated.matches = Array.isArray(migrated.matches) ? migrated.matches : deepClone(seedData.matches);
    migrated.availability = migrated.availability && typeof migrated.availability === 'object' ? migrated.availability : {};
    migrated.goals = migrated.goals && typeof migrated.goals === 'object' ? migrated.goals : {};
    return migrated;
  }
  async function loadDataFromServer() {
    try {
      const response = await fetch('/api/state', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Database request failed with status ${response.status}`);
      }

      const payload = await response.json();
      data = migrateData(payload.state || deepClone(seedData));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('MongoDB is unavailable; using the local backup instead:', error);

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        data = migrateData(stored ? JSON.parse(stored) : deepClone(seedData));
      } catch {
        data = migrateData(deepClone(seedData));
      }
    }
  }

  function makeDatabasePayload() {
    const payload = deepClone(data);

    // Prototype login PINs stay in the browser. They are deliberately not
    // written to the shared MongoDB team document.
    delete payload.settings.adminPin;
    payload.players = payload.players.map(({ pin, ...playerData }) => playerData);

    return payload;
  }

  function saveData() {
    // Keep an offline copy so the app still works when the network is down.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    const snapshot = makeDatabasePayload();

    // Queue writes so rapid edits cannot arrive at MongoDB out of order.
    saveQueue = saveQueue
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch('/api/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: snapshot })
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Database save failed with status ${response.status}`);
        }
      })
      .catch((error) => {
        console.warn('MongoDB save failed; data remains in the local backup:', error);
      });

    return saveQueue;
  }
  function loadSession() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!parsed) return null;
      if (parsed.type === 'admin') return parsed;
      if (parsed.type === 'player' && data.players.some((p) => p.id === parsed.playerId)) return parsed;
      return null;
    } catch { return null; }
  }
  function saveSession() {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'XI'; }
  function formatDate(value) {
    if (!value) return 'Date not set';
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  }
  function parseScore(score = '') { const match = String(score).match(/\d+/); return match ? Number(match[0]) : 0; }
  function oversToBalls(overs) {
    const value = Number(overs || 0);
    if (!Number.isFinite(value)) return 0;
    return Math.floor(value) * 6 + Math.min(5, Math.max(0, Math.round((value - Math.floor(value)) * 10)));
  }
  function getUpcomingMatch() { return data.matches.filter((m) => m.status === 'Upcoming').sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))[0] || null; }
  function getSessionPlayer() {
    if (!session) return null;
    if (session.type === 'player') return data.players.find((p) => p.id === session.playerId) || null;
    return data.players.find((p) => p.name.toLowerCase().includes('swastik')) || data.players.find((p) => p.id === data.settings.captainId) || null;
  }
  function isAdmin() { return session?.type === 'admin'; }
  function isCaptain() { const p = getSessionPlayer(); return Boolean(p && p.id === data.settings.captainId); }
  function canManage() { return isAdmin() || isCaptain(); }
  function leadershipLabel(playerId) {
    if (playerId === data.settings.captainId) return 'Captain';
    if (playerId === data.settings.viceCaptainId) return 'Vice-Captain';
    return data.players.find((p) => p.id === playerId)?.role || 'Player';
  }

  function calculatePlayerStats() {
    const map = {};
    data.players.forEach((p) => { map[p.id] = { player: p, matches: 0, runs: 0, balls: 0, wickets: 0, ballsBowled: 0, runsConceded: 0, catches: 0, highScore: 0, bestWickets: 0 }; });
    data.matches.filter((m) => m.status === 'Completed').forEach((match) => {
      (match.performances || []).forEach((performance) => {
        const row = map[performance.playerId];
        if (!row) return;
        const appeared = ['runs', 'balls', 'wickets', 'oversBowled', 'runsConceded', 'catches'].some((key) => Number(performance[key] || 0) > 0);
        if (appeared) row.matches += 1;
        row.runs += Number(performance.runs || 0);
        row.balls += Number(performance.balls || 0);
        row.wickets += Number(performance.wickets || 0);
        row.ballsBowled += oversToBalls(performance.oversBowled);
        row.runsConceded += Number(performance.runsConceded || 0);
        row.catches += Number(performance.catches || 0);
        row.highScore = Math.max(row.highScore, Number(performance.runs || 0));
        row.bestWickets = Math.max(row.bestWickets, Number(performance.wickets || 0));
      });
    });
    return Object.values(map).map((row) => ({ ...row, strikeRate: row.balls ? row.runs / row.balls * 100 : 0, economy: row.ballsBowled ? row.runsConceded / (row.ballsBowled / 6) : 0 }));
  }

  function renderAll() {
    renderBrand();
    renderLeadership();
    renderDashboard();
    renderAccount();
    applyPermissions();
    renderMatches();
    renderPlayers();
    renderStats();
    renderAdmin();
    renderToss();
    renderPerformanceRows();
    renderLoginOptions();
  }

  function renderBrand() {
    const name = data.settings.groupName || 'Ball Kho Gayi XI';
    $('brandName').textContent = name;
    $('footerBrand').textContent = name;
    document.title = `${name} — School Cricket HQ`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', `${name} school cricket logins, matches, tosses and player statistics.`);
    const completed = data.matches.filter((m) => m.status === 'Completed');
    $('heroPlayers').textContent = data.players.length;
    $('heroMatches').textContent = completed.length;
    $('heroRuns').textContent = completed.reduce((sum, match) => sum + parseScore(match.ourScore), 0);
    const upcoming = getUpcomingMatch();
    $('nextMatchTitle').textContent = upcoming ? `${name} vs ${upcoming.opponent}` : 'No fixture scheduled';
    $('nextMatchMeta').textContent = upcoming ? `${formatDate(upcoming.date)} · ${upcoming.time || 'Time TBA'} · ${upcoming.venue}` : 'The captain can add one from Match Center';
  }

  function renderLeadership() {
    $('captainName').textContent = data.players.find((p) => p.id === data.settings.captainId)?.name || 'Not assigned';
    $('viceCaptainName').textContent = data.players.find((p) => p.id === data.settings.viceCaptainId)?.name || 'Not assigned';
  }

  function renderDashboard() {
    const completed = data.matches.filter((m) => m.status === 'Completed');
    const wins = completed.filter((m) => m.outcome === 'win').length;
    const losses = completed.filter((m) => m.outcome === 'loss').length;
    const ties = completed.filter((m) => m.outcome === 'tie').length;
    $('seasonRecord').textContent = `${wins}W · ${losses}L${ties ? ` · ${ties}T` : ''}`;
    const stats = calculatePlayerStats();
    const batter = [...stats].sort((a, b) => b.runs - a.runs)[0];
    const bowler = [...stats].sort((a, b) => b.wickets - a.wickets)[0];
    const fielder = [...stats].sort((a, b) => b.catches - a.catches)[0];
    $('topBatter').textContent = batter?.player.name || '—'; $('topBatterStat').textContent = `${batter?.runs || 0} runs`;
    $('topBowler').textContent = bowler?.player.name || '—'; $('topBowlerStat').textContent = `${bowler?.wickets || 0} wickets`;
    $('topFielder').textContent = fielder?.player.name || '—'; $('topFielderStat').textContent = `${fielder?.catches || 0} catches`;
    $('announcementTitle').textContent = data.settings.announcementTitle;
    $('announcementText').textContent = data.settings.announcementText;
  }

  function renderAccount() {
    const dashboard = $('my-dashboard');
    const loginBtn = $('loginBtn');
    const accountBtn = $('accountBtn');
    if (!session) {
      dashboard.classList.add('hidden');
      loginBtn.classList.remove('hidden');
      accountBtn.classList.add('hidden');
      return;
    }

    const player = getSessionPlayer();
    dashboard.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    accountBtn.classList.remove('hidden');
    const displayName = isAdmin() ? data.settings.adminName : player?.name || 'Player';
    const role = isAdmin() ? 'Administrator' : leadershipLabel(player?.id);
    $('accountAvatar').textContent = initials(displayName);
    $('accountName').textContent = displayName;
    $('accountRole').textContent = role;
    $('dashboardAvatar').textContent = initials(displayName);
    $('dashboardName').textContent = displayName;
    $('dashboardRole').textContent = role;
    $('dashboardGreeting').textContent = `Welcome back, ${displayName.split(' ')[0]}`;
    $('dashboardEyebrow').textContent = isAdmin() ? 'Administrator Dashboard' : isCaptain() ? 'Captain Dashboard' : 'My Dressing Room';
    $('dashboardSubtitle').textContent = isCaptain() || isAdmin() ? 'Your own form plus the team view needed to lead Ball Kho Gayi XI.' : 'Your upcoming match, availability and personal cricket statistics.';

    if (!player) {
      $('dashboardPlayerMeta').textContent = 'Website administration account';
      ['myMatches', 'myRuns', 'myWickets', 'myCatches'].forEach((id) => $(id).textContent = '—');
      $('myStrikeRate').textContent = '—'; $('myEconomy').textContent = '—';
      $('myBatRank').textContent = 'Admin account'; $('myBowlRank').textContent = 'Full access';
      $('recentForm').innerHTML = '<p class="muted">No linked player profile.</p>';
      $('bestPerformance').textContent = 'Assign a captain profile to connect personal stats.';
      $('personalGoalInput').value = '';
      renderCaptainDashboard();
      return;
    }

    const stats = calculatePlayerStats();
    const stat = stats.find((s) => s.player.id === player.id);
    $('dashboardPlayerMeta').textContent = `Jersey ${player.jersey} · ${player.role} · ${player.className || 'School Squad'}`;
    $('myMatches').textContent = stat.matches;
    $('myRuns').textContent = stat.runs;
    $('myWickets').textContent = stat.wickets;
    $('myCatches').textContent = stat.catches;
    $('myStrikeRate').textContent = stat.strikeRate.toFixed(1);
    $('myEconomy').textContent = stat.ballsBowled ? stat.economy.toFixed(2) : '—';
    const runRank = [...stats].sort((a, b) => b.runs - a.runs).findIndex((s) => s.player.id === player.id) + 1;
    const wicketRank = [...stats].sort((a, b) => b.wickets - a.wickets).findIndex((s) => s.player.id === player.id) + 1;
    $('myBatRank').textContent = `Batting rank #${runRank}`;
    $('myBowlRank').textContent = `Bowling rank #${wicketRank}`;
    $('personalGoalInput').value = data.goals[player.id] || '';
    renderPersonalMatch(player);
    renderRecentForm(player);
    renderCaptainDashboard();
  }

  function renderPersonalMatch(player) {
    const match = getUpcomingMatch();
    const buttons = $$('[data-availability]', $('availabilityButtons'));
    if (!match) {
      $('myNextMatch').textContent = 'No match scheduled';
      $('myNextMatchMeta').textContent = 'The captain can add a fixture from Match Center.';
      $('matchCountdown').textContent = 'No countdown';
      $('availabilitySaved').textContent = 'Availability opens when a fixture is added.';
      buttons.forEach((b) => { b.disabled = true; b.classList.remove('active'); });
      return;
    }
    $('myNextMatch').textContent = `${data.settings.groupName} vs ${match.opponent}`;
    $('myNextMatchMeta').textContent = `${formatDate(match.date)} · ${match.time || 'Time TBA'} · ${match.venue} · ${match.overs} overs`;
    const matchTime = new Date(`${match.date}T${match.time || '00:00'}`);
    const days = Math.ceil((matchTime - new Date()) / 86400000);
    $('matchCountdown').textContent = days > 1 ? `${days} days to go` : days === 1 ? 'Tomorrow' : days === 0 ? 'Match day' : 'Fixture date passed';
    const status = data.availability[match.id]?.[player.id] || '';
    buttons.forEach((b) => { b.disabled = false; b.classList.toggle('active', b.dataset.availability === status); });
    $('availabilitySaved').textContent = status ? `Saved: ${status}` : 'Not answered yet';
  }

  function renderRecentForm(player) {
    const recent = data.matches.filter((m) => m.status === 'Completed' && (m.performances || []).some((p) => p.playerId === player.id)).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((match) => ({ match, performance: match.performances.find((p) => p.playerId === player.id) }));
    if (!recent.length) {
      $('recentForm').innerHTML = '<p class="muted">No performance has been uploaded for this player yet.</p>';
      $('bestPerformance').textContent = 'Play a match and ask the captain to upload the scorecard.';
      return;
    }
    const maxRuns = Math.max(20, ...recent.map((r) => Number(r.performance.runs || 0)));
    $('recentForm').innerHTML = recent.reverse().map(({ match, performance }) => {
      const height = Math.max(10, Math.round(Number(performance.runs || 0) / maxRuns * 100));
      return `<div class="form-bar-item" title="${escapeHtml(match.opponent)}: ${performance.runs || 0} runs, ${performance.wickets || 0} wickets"><div class="form-bar" style="height:${height}%"><span>${performance.runs || 0}</span></div><small>${escapeHtml(match.opponent.slice(0, 5))}</small><b>${performance.wickets || 0}W</b></div>`;
    }).join('');
    const best = [...recent].sort((a, b) => (b.performance.runs + b.performance.wickets * 18 + b.performance.catches * 8) - (a.performance.runs + a.performance.wickets * 18 + a.performance.catches * 8))[0];
    $('bestPerformance').innerHTML = `<strong>Best recent impact</strong><span>${escapeHtml(best.match.opponent)} · ${best.performance.runs || 0} runs · ${best.performance.wickets || 0} wickets · ${best.performance.catches || 0} catches</span>`;
  }

  function renderCaptainDashboard() {
    const node = $('captainDashboard');
    if (!canManage()) { node.classList.add('hidden'); return; }
    node.classList.remove('hidden');
    const completed = data.matches.filter((m) => m.status === 'Completed').sort((a, b) => new Date(b.date) - new Date(a.date));
    const wins = completed.filter((m) => m.outcome === 'win').length;
    $('captainWins').textContent = wins;
    $('captainRecord').textContent = `${completed.length} completed matches`;
    $('captainWinRate').textContent = completed.length ? `${Math.round(wins / completed.length * 100)}%` : '0%';
    $('captainTeamRuns').textContent = completed.reduce((sum, m) => sum + parseScore(m.ourScore), 0);
    $('captainStreak').textContent = completed.slice(0, 5).map((m) => m.outcome === 'win' ? 'W' : m.outcome === 'loss' ? 'L' : 'T').join(' · ') || '—';

    const upcoming = getUpcomingMatch();
    $('availabilityMatchTitle').textContent = upcoming ? `vs ${upcoming.opponent}` : 'No upcoming fixture';
    if (!upcoming) {
      $('captainAvailability').innerHTML = '<p class="muted">Schedule a match to collect player availability.</p>';
    } else {
      const map = data.availability[upcoming.id] || {};
      $('captainAvailability').innerHTML = data.players.map((p) => {
        const status = map[p.id] || 'No reply';
        const cls = status.toLowerCase().replace(/\s+/g, '-');
        return `<div class="availability-person"><span class="tiny-avatar">${initials(p.name)}</span><div><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(leadershipLabel(p.id))}</small></div><b class="availability-status ${cls}">${escapeHtml(status)}</b></div>`;
      }).join('');
    }
    const stats = calculatePlayerStats();
    const leaders = [
      { label: 'Top runs', stat: [...stats].sort((a, b) => b.runs - a.runs)[0], value: (s) => `${s.runs} runs` },
      { label: 'Top wickets', stat: [...stats].sort((a, b) => b.wickets - a.wickets)[0], value: (s) => `${s.wickets} wickets` },
      { label: 'Top catches', stat: [...stats].sort((a, b) => b.catches - a.catches)[0], value: (s) => `${s.catches} catches` }
    ];
    $('captainLeaders').innerHTML = leaders.map((item) => `<div><span class="tiny-avatar">${initials(item.stat?.player.name || '—')}</span><div><small>${item.label}</small><strong>${escapeHtml(item.stat?.player.name || '—')}</strong></div><b>${item.stat ? item.value(item.stat) : '—'}</b></div>`).join('');
  }

  function applyPermissions() {
    $$('[data-manager-only]').forEach((el) => el.classList.toggle('permission-hidden', !canManage()));
    $$('[data-admin-only]').forEach((el) => el.classList.toggle('permission-hidden', !isAdmin()));
    const mobileAdd = document.querySelector('.mobile-primary');
    if (mobileAdd) {
      if (canManage()) { mobileAdd.onclick = null; mobileAdd.href = '#post-match'; mobileAdd.innerHTML = '<span>＋</span>Add'; }
      else if (session) { mobileAdd.onclick = null; mobileAdd.href = '#my-dashboard'; mobileAdd.innerHTML = '<span>◎</span>My'; }
      else { mobileAdd.href = '#home'; mobileAdd.innerHTML = '<span>⇥</span>Login'; mobileAdd.onclick = (event) => { event.preventDefault(); openModal('loginModal'); }; }
    }
  }

  function renderMatches() {
    let matches = [...data.matches].sort((a, b) => a.status !== b.status ? (a.status === 'Upcoming' ? -1 : 1) : new Date(b.date) - new Date(a.date));
    if (matchFilter !== 'all') matches = matches.filter((m) => m.status === matchFilter);
    $('matchGrid').innerHTML = matches.map((match) => {
      const completed = match.status === 'Completed';
      const manageButton = !completed && canManage() ? `<button class="card-btn" data-complete-match="${match.id}" type="button">Add Result</button>` : '';
      const deleteButton = isAdmin() ? `<button class="card-btn danger-text" data-delete-match="${match.id}" type="button">Delete</button>` : '';
      return `<article class="match-card"><span class="match-status ${completed ? 'completed' : ''}">${escapeHtml(match.status)}</span><h3>${escapeHtml(data.settings.groupName)} vs ${escapeHtml(match.opponent)}</h3><p class="match-meta">${formatDate(match.date)}${match.time ? ` · ${escapeHtml(match.time)}` : ''}<br>${escapeHtml(match.venue)} · ${escapeHtml(String(match.overs))} overs · ${escapeHtml(match.ballType || 'Tennis')} ball</p><div class="score-strip"><div><small>Our team</small><strong>${completed ? escapeHtml(match.ourScore) : '—'}</strong></div><b>VS</b><div><small>${escapeHtml(match.opponent)}</small><strong>${completed ? escapeHtml(match.opponentScore) : '—'}</strong></div></div><p class="result-text">${completed ? escapeHtml(match.resultSummary) : escapeHtml(match.notes || 'Fixture scheduled')}</p><div class="card-actions">${completed ? `<button class="card-btn" data-scorecard="${match.id}" type="button">View Scorecard</button>` : ''}${manageButton}${deleteButton}</div></article>`;
    }).join('');
    $('matchEmpty').classList.toggle('hidden', matches.length > 0);
    $$('[data-scorecard]').forEach((b) => b.addEventListener('click', () => openScorecard(b.dataset.scorecard)));
    $$('[data-complete-match]').forEach((b) => b.addEventListener('click', () => openResultModal(b.dataset.completeMatch)));
    $$('[data-delete-match]').forEach((b) => b.addEventListener('click', () => askConfirm('Delete this match?', 'The scorecard or fixture will be removed and all player totals will recalculate.', () => { data.matches = data.matches.filter((m) => m.id !== b.dataset.deleteMatch); saveData(); renderAll(); toast('Match deleted'); })));
  }

  function renderPlayers() {
    const statsMap = new Map(calculatePlayerStats().map((row) => [row.player.id, row]));
    let players = [...data.players];
    if (roleFilter !== 'all') players = players.filter((p) => p.role === roleFilter);
    if (playerSearch) players = players.filter((p) => `${p.name} ${p.role} ${p.className}`.toLowerCase().includes(playerSearch.toLowerCase()));
    players.sort((a, b) => a.name.localeCompare(b.name));
    $('playerGrid').innerHTML = players.map((p) => { const stat = statsMap.get(p.id); return `<article class="player-card"><span class="jersey">${escapeHtml(p.jersey)}</span><div class="player-top"><div class="avatar">${initials(p.name)}</div><div><h3>${escapeHtml(p.name)}</h3><span class="player-role">${escapeHtml(p.className || 'School Squad')}</span></div></div><span class="role-badge">${escapeHtml(leadershipLabel(p.id))}</span><div class="player-stats"><span><b>${stat?.runs || 0}</b>Runs</span><span><b>${stat?.wickets || 0}</b>Wickets</span><span><b>${stat?.catches || 0}</b>Catches</span></div><div class="player-footer"><small>${escapeHtml(p.battingStyle)}</small><button class="card-btn" data-player-detail="${p.id}" type="button">Profile</button></div></article>`; }).join('');
    $('playerEmpty').classList.toggle('hidden', players.length > 0);
    $$('[data-player-detail]').forEach((b) => b.addEventListener('click', () => openPlayerDetail(b.dataset.playerDetail)));
  }

  function renderStats() {
    let stats = calculatePlayerStats();
    const configs = {
      runs: { label: 'Runs', value: (s) => s.runs, secondary: (s) => `${s.matches} matches · HS ${s.highScore}`, sort: (a, b) => b.runs - a.runs, display: (v) => Math.round(v) },
      wickets: { label: 'Wickets', value: (s) => s.wickets, secondary: (s) => `${s.matches} matches · Best ${s.bestWickets}`, sort: (a, b) => b.wickets - a.wickets, display: (v) => Math.round(v) },
      catches: { label: 'Catches', value: (s) => s.catches, secondary: (s) => `${s.matches} matches`, sort: (a, b) => b.catches - a.catches, display: (v) => Math.round(v) },
      strikeRate: { label: 'Strike Rate', value: (s) => s.strikeRate, secondary: (s) => `${s.runs} runs from ${s.balls} balls`, sort: (a, b) => b.strikeRate - a.strikeRate, display: (v) => v.toFixed(1) },
      economy: { label: 'Economy', value: (s) => s.ballsBowled ? s.economy : 999, secondary: (s) => `${s.wickets} wickets · ${Math.floor(s.ballsBowled / 6)}.${s.ballsBowled % 6} overs`, sort: (a, b) => (a.ballsBowled ? a.economy : 999) - (b.ballsBowled ? b.economy : 999), display: (v) => v === 999 ? '—' : v.toFixed(2) }
    };
    const config = configs[statMode];
    stats.sort(config.sort);
    const top = stats[0];
    $('podium').innerHTML = top ? `<div class="podium-crown">♛</div><div class="podium-avatar">${initials(top.player.name)}</div><h3>${escapeHtml(top.player.name)}</h3><div class="podium-value">${config.display(config.value(top))}</div><span class="podium-label">${config.label} leader</span>` : '<p>No statistics yet.</p>';
    $('leaderHead').innerHTML = `<tr><th>Rank</th><th>Player</th><th>${config.label}</th><th>Details</th></tr>`;
    $('leaderRows').innerHTML = stats.map((stat, i) => `<tr><td><span class="rank-dot">${i + 1}</span></td><td><div class="table-player"><span class="tiny-avatar">${initials(stat.player.name)}</span><div><strong>${escapeHtml(stat.player.name)}</strong><small>${escapeHtml(leadershipLabel(stat.player.id))}</small></div></div></td><td><strong>${config.display(config.value(stat))}</strong></td><td class="muted">${escapeHtml(config.secondary(stat))}</td></tr>`).join('');
  }

  function renderAdmin() {
    $('groupNameInput').value = data.settings.groupName || '';
    const options = `<option value="">Not assigned</option>${data.players.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}`;
    $('captainSelect').innerHTML = options; $('viceCaptainSelect').innerHTML = options;
    $('captainSelect').value = data.settings.captainId || ''; $('viceCaptainSelect').value = data.settings.viceCaptainId || '';
    $('adminPinInput').value = data.settings.adminPin || '8470';
  }

  function renderToss() {
    const saved = data.settings.savedToss;
    $('savedToss').textContent = saved ? `${saved.winner} chose to ${saved.decision.toLowerCase()} first vs ${saved.opponent}` : 'No toss saved yet';
  }

  function renderLoginOptions() {
    const current = $('loginAccount').value;
    $('loginAccount').innerHTML = `<option value="admin">Swastik Shukla — Administrator</option>${data.players.map((p) => `<option value="player:${p.id}">${escapeHtml(p.name)} — ${escapeHtml(leadershipLabel(p.id))}</option>`).join('')}`;
    if ([...$('loginAccount').options].some((o) => o.value === current)) $('loginAccount').value = current;
  }

  function renderPerformanceRows() {
    $('performanceRows').innerHTML = data.players.map((p) => `<tr data-performance-player="${p.id}"><td><strong>${escapeHtml(p.name)}</strong><br><small class="muted">${escapeHtml(p.role)}</small></td>${['runs', 'balls', 'wickets', 'oversBowled', 'runsConceded', 'catches'].map((field) => `<td><input type="number" min="0" ${field === 'oversBowled' ? 'step="0.1"' : ''} data-field="${field}" aria-label="${escapeHtml(p.name)} ${field}" /></td>`).join('')}</tr>`).join('');
  }

  function openResultModal(matchId = '') {
    if (!canManage()) return requireLogin('Only the captain or admin can upload match results.');
    resetResultForm();
    if (matchId) {
      const match = data.matches.find((m) => m.id === matchId);
      if (match) { $('resultForm').dataset.matchId = matchId; $('resultOpponent').value = match.opponent; $('resultDate').value = match.date; $('resultVenue').value = match.venue; $('resultOvers').value = match.overs; }
    }
    openModal('resultModal');
  }
  function resetResultForm() { $('resultForm').reset(); $('resultForm').dataset.matchId = ''; $('resultDate').value = toDateInput(new Date()); $('resultOvers').value = 10; renderPerformanceRows(); }
  function collectPerformances() { return $$('[data-performance-player]').map((row) => { const result = { playerId: row.dataset.performancePlayer }; $$('[data-field]', row).forEach((input) => result[input.dataset.field] = Number(input.value || 0)); return result; }).filter((p) => ['runs', 'balls', 'wickets', 'oversBowled', 'runsConceded', 'catches'].some((key) => Number(p[key]) > 0)); }

  function openScorecard(matchId) {
    const match = data.matches.find((m) => m.id === matchId); if (!match) return;
    const performances = (match.performances || []).map((p) => ({ ...p, player: data.players.find((playerItem) => playerItem.id === p.playerId) })).filter((p) => p.player);
    const batting = performances.filter((p) => p.runs || p.balls).sort((a, b) => b.runs - a.runs);
    const bowling = performances.filter((p) => p.oversBowled || p.wickets).sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded);
    $('scorecardContent').innerHTML = `<div class="scorecard-hero"><p class="eyebrow">Match Scorecard</p><h2>${escapeHtml(data.settings.groupName)} vs ${escapeHtml(match.opponent)}</h2><p class="muted">${formatDate(match.date)} · ${escapeHtml(match.venue)} · ${escapeHtml(String(match.overs))} overs</p><div class="scorecard-score"><div><small>${escapeHtml(data.settings.groupName)}</small><strong>${escapeHtml(match.ourScore)}</strong></div><div><small>${escapeHtml(match.opponent)}</small><strong>${escapeHtml(match.opponentScore)}</strong></div></div><div class="scorecard-meta"><span>Toss: ${escapeHtml(match.tossWinner || 'Not entered')} · ${escapeHtml(match.tossDecision || '')}</span><span>${escapeHtml(match.resultSummary)}</span></div></div><h3>Batting</h3><div class="table-wrap scorecard-table"><table><thead><tr><th>Batter</th><th>Runs</th><th>Balls</th><th>SR</th><th>Catches</th></tr></thead><tbody>${batting.length ? batting.map((p) => `<tr><td>${escapeHtml(p.player.name)}</td><td>${p.runs}</td><td>${p.balls}</td><td>${p.balls ? (p.runs / p.balls * 100).toFixed(1) : '—'}</td><td>${p.catches}</td></tr>`).join('') : '<tr><td colspan="5">No batting data entered.</td></tr>'}</tbody></table></div><h3>Bowling</h3><div class="table-wrap scorecard-table"><table><thead><tr><th>Bowler</th><th>Overs</th><th>Runs</th><th>Wickets</th><th>Economy</th></tr></thead><tbody>${bowling.length ? bowling.map((p) => `<tr><td>${escapeHtml(p.player.name)}</td><td>${p.oversBowled}</td><td>${p.runsConceded}</td><td>${p.wickets}</td><td>${p.oversBowled ? (p.runsConceded / (oversToBalls(p.oversBowled) / 6)).toFixed(2) : '—'}</td></tr>`).join('') : '<tr><td colspan="5">No bowling data entered.</td></tr>'}</tbody></table></div>${match.notes ? `<h3>Match Notes</h3><p class="muted">${escapeHtml(match.notes)}</p>` : ''}`;
    openModal('scorecardModal');
  }

  function openPlayerDetail(playerId) {
    const playerItem = data.players.find((p) => p.id === playerId);
    const stat = calculatePlayerStats().find((s) => s.player.id === playerId);
    if (!playerItem || !stat) return;
    const actions = isAdmin() ? `<div class="detail-actions"><button class="secondary-btn small" data-edit-player="${playerItem.id}" type="button">Edit Player</button><button class="danger-btn small" data-remove-player="${playerItem.id}" type="button">Remove</button></div>` : '';
    $('playerDetailContent').innerHTML = `<div class="detail-header"><div class="avatar">${initials(playerItem.name)}</div><div><p class="eyebrow">${escapeHtml(leadershipLabel(playerId))}</p><h2>${escapeHtml(playerItem.name)}</h2><span class="muted">Jersey ${escapeHtml(playerItem.jersey)} · ${escapeHtml(playerItem.className || 'School Squad')}</span></div></div><div class="detail-info"><div><small>Batting</small><strong>${escapeHtml(playerItem.battingStyle)}</strong></div><div><small>Bowling</small><strong>${escapeHtml(playerItem.bowlingStyle)}</strong></div></div><div class="detail-stat-grid"><div><b>${stat.matches}</b><span>Matches</span></div><div><b>${stat.runs}</b><span>Runs</span></div><div><b>${stat.highScore}</b><span>High Score</span></div><div><b>${stat.wickets}</b><span>Wickets</span></div><div><b>${stat.catches}</b><span>Catches</span></div><div><b>${stat.strikeRate.toFixed(1)}</b><span>Strike Rate</span></div></div>${playerItem.note ? `<p class="muted">${escapeHtml(playerItem.note)}</p>` : ''}${actions}`;
    openModal('playerDetailModal');
    const edit = $('[data-edit-player]'); const remove = $('[data-remove-player]');
    if (edit) edit.addEventListener('click', () => { closeModal('playerDetailModal'); openPlayerModal(playerId); });
    if (remove) remove.addEventListener('click', () => { closeModal('playerDetailModal'); askConfirm('Remove this player?', 'Their profile and login will be removed. Old match entries remain in historical data.', () => { data.players = data.players.filter((p) => p.id !== playerId); if (data.settings.captainId === playerId) data.settings.captainId = ''; if (data.settings.viceCaptainId === playerId) data.settings.viceCaptainId = ''; saveData(); renderAll(); toast('Player removed'); }); });
  }

  function openPlayerModal(playerId = '') {
    if (!isAdmin()) return requireLogin('Only the administrator can manage player accounts.');
    $('playerForm').reset(); $('editingPlayerId').value = ''; $('playerModalTitle').textContent = playerId ? 'Edit player' : 'Add player';
    if (playerId) {
      const p = data.players.find((item) => item.id === playerId); if (!p) return;
      $('editingPlayerId').value = p.id; $('playerName').value = p.name; $('playerJersey').value = p.jersey; $('playerRole').value = p.role; $('playerClass').value = p.className; $('playerPin').value = p.pin || '1234'; $('playerBatting').value = p.battingStyle; $('playerBowling').value = p.bowlingStyle; $('playerNote').value = p.note || '';
    }
    openModal('playerModal');
  }

  function openModal(id) { const modal = $(id); if (!modal) return; modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeModal(id) { const modal = $(id); if (!modal) return; modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); if (!document.querySelector('.modal.show')) document.body.style.overflow = ''; }
  function toast(message) { const node = $('toast'); node.textContent = message; node.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('show'), 2400); }
  function askConfirm(title, text, action) { $('confirmTitle').textContent = title; $('confirmText').textContent = text; confirmAction = action; $('confirmDialog').classList.add('show'); $('confirmDialog').setAttribute('aria-hidden', 'false'); }
  function closeConfirm() { $('confirmDialog').classList.remove('show'); $('confirmDialog').setAttribute('aria-hidden', 'true'); confirmAction = null; }
  function requireLogin(message = 'Please log in to continue.') { toast(message); openModal('loginModal'); }

  function login(account, pin) {
    if (account === 'admin') {
      if (pin !== String(data.settings.adminPin || '8470')) return false;
      session = { type: 'admin' };
    } else {
      const playerId = account.split(':')[1];
      const p = data.players.find((item) => item.id === playerId);
      if (!p || pin !== String(p.pin || '1234')) return false;
      session = { type: 'player', playerId };
    }
    saveSession(); renderAll(); closeModal('loginModal'); setTimeout(() => $('my-dashboard').scrollIntoView({ behavior: 'smooth' }), 80); return true;
  }

  function bindEvents() {
    $('themeBtn').addEventListener('click', () => { document.body.classList.toggle('light'); $('themeBtn').textContent = document.body.classList.contains('light') ? '☀' : '☾'; });
    $('loginBtn').addEventListener('click', () => openModal('loginModal'));
    $('accountBtn').addEventListener('click', () => $('my-dashboard').scrollIntoView({ behavior: 'smooth' }));
    $('logoutBtn').addEventListener('click', () => { session = null; saveSession(); renderAll(); toast('Logged out'); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    $('changePinBtn').addEventListener('click', () => { $('pinForm').reset(); openModal('pinModal'); });
    $('captainScheduleBtn').addEventListener('click', () => openModal('scheduleModal'));
    $('captainResultBtn').addEventListener('click', () => openResultModal());

    $('loginForm').addEventListener('submit', (event) => { event.preventDefault(); if (!login($('loginAccount').value, $('loginPin').value)) { $('loginPin').value = ''; toast('Incorrect account or PIN'); } });
    $('pinForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const current = $('currentPin').value; const next = $('newPin').value; const confirm = $('confirmPin').value;
      if (!/^\d{4,6}$/.test(next)) return toast('New PIN must contain 4–6 numbers');
      if (next !== confirm) return toast('New PIN confirmation does not match');
      if (isAdmin()) {
        if (current !== String(data.settings.adminPin)) return toast('Current PIN is incorrect');
        data.settings.adminPin = next;
      } else {
        const p = getSessionPlayer(); if (!p || current !== String(p.pin || '1234')) return toast('Current PIN is incorrect'); p.pin = next;
      }
      saveData(); closeModal('pinModal'); toast('Login PIN updated');
    });

    $$('[data-close]').forEach((button) => button.addEventListener('click', () => closeModal(button.dataset.close)));
    $$('.modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal.id); }));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') $$('.modal.show').forEach((modal) => closeModal(modal.id)); });

    $('scheduleBtn').addEventListener('click', () => canManage() ? openModal('scheduleModal') : requireLogin());
    $('quickResultBtn').addEventListener('click', () => openResultModal());
    $('openResultDeskBtn').addEventListener('click', () => openResultModal());
    $('addPlayerBtn').addEventListener('click', () => openPlayerModal());
    $('editNoticeBtn').addEventListener('click', () => { if (!canManage()) return requireLogin(); $('noticeTitleInput').value = data.settings.announcementTitle; $('noticeTextInput').value = data.settings.announcementText; openModal('noticeModal'); });

    $$('[data-match-filter]').forEach((button) => button.addEventListener('click', () => { matchFilter = button.dataset.matchFilter; $$('[data-match-filter]').forEach((b) => b.classList.toggle('active', b === button)); renderMatches(); }));
    $$('[data-role-filter]').forEach((button) => button.addEventListener('click', () => { roleFilter = button.dataset.roleFilter; $$('[data-role-filter]').forEach((b) => b.classList.toggle('active', b === button)); renderPlayers(); }));
    $('playerSearch').addEventListener('input', (event) => { playerSearch = event.target.value.trim(); renderPlayers(); });
    $$('[data-stat]').forEach((button) => button.addEventListener('click', () => { statMode = button.dataset.stat; $$('[data-stat]').forEach((b) => b.classList.toggle('active', b === button)); renderStats(); }));

    $$('[data-availability]').forEach((button) => button.addEventListener('click', () => {
      const p = getSessionPlayer(); const match = getUpcomingMatch(); if (!p || !match) return;
      data.availability[match.id] = data.availability[match.id] || {}; data.availability[match.id][p.id] = button.dataset.availability; saveData(); renderAccount(); toast(`Availability saved: ${button.dataset.availability}`);
    }));
    $('saveGoalBtn').addEventListener('click', () => { const p = getSessionPlayer(); if (!p) return requireLogin(); data.goals[p.id] = $('personalGoalInput').value.trim(); saveData(); toast('Personal target saved'); });

    $('scheduleForm').addEventListener('submit', (event) => {
      event.preventDefault(); if (!canManage()) return requireLogin();
      data.matches.push({ id: uid('match'), status: 'Upcoming', opponent: $('scheduleOpponent').value.trim(), venue: $('scheduleVenue').value.trim(), date: $('scheduleDate').value, time: $('scheduleTime').value, overs: Number($('scheduleOvers').value), ballType: $('scheduleBall').value, notes: $('scheduleNotes').value.trim(), createdAt: Date.now() });
      saveData(); event.target.reset(); closeModal('scheduleModal'); renderAll(); toast('Fixture scheduled');
    });
    $('playerForm').addEventListener('submit', (event) => {
      event.preventDefault(); if (!isAdmin()) return requireLogin();
      const id = $('editingPlayerId').value; const existing = data.players.find((p) => p.id === id);
      const pin = $('playerPin').value.trim() || existing?.pin || '1234';
      if (!/^\d{4,6}$/.test(pin)) return toast('Player PIN must contain 4–6 numbers');
      const p = { id: id || uid('player'), name: $('playerName').value.trim(), jersey: Number($('playerJersey').value), role: $('playerRole').value, className: $('playerClass').value.trim() || 'School Squad', pin, battingStyle: $('playerBatting').value, bowlingStyle: $('playerBowling').value, note: $('playerNote').value.trim() };
      if (id) data.players = data.players.map((item) => item.id === id ? p : item); else data.players.push(p);
      saveData(); closeModal('playerModal'); renderAll(); toast(id ? 'Player and login updated' : 'Player account created');
    });
    $('resultForm').addEventListener('submit', (event) => {
      event.preventDefault(); if (!canManage()) return requireLogin();
      const existingId = event.target.dataset.matchId;
      const match = { id: existingId || uid('match'), status: 'Completed', opponent: $('resultOpponent').value.trim(), date: $('resultDate').value, venue: $('resultVenue').value.trim(), overs: Number($('resultOvers').value), ballType: 'Tennis', ourScore: $('ourScore').value.trim(), opponentScore: $('opponentScore').value.trim(), tossWinner: $('resultTossWinner').value, tossDecision: $('resultTossDecision').value, outcome: $('resultOutcome').value, resultSummary: $('resultSummary').value.trim(), notes: $('resultNotes').value.trim(), performances: collectPerformances(), createdAt: Date.now() };
      if (existingId) data.matches = data.matches.map((m) => m.id === existingId ? { ...m, ...match } : m); else data.matches.push(match);
      saveData(); closeModal('resultModal'); renderAll(); toast('Match saved and player dashboards updated');
    });
    $('noticeForm').addEventListener('submit', (event) => { event.preventDefault(); if (!canManage()) return requireLogin(); data.settings.announcementTitle = $('noticeTitleInput').value.trim(); data.settings.announcementText = $('noticeTextInput').value.trim(); saveData(); closeModal('noticeModal'); renderAll(); toast('Captain’s notice updated'); });
    $('saveSettingsBtn').addEventListener('click', () => {
      if (!isAdmin()) return requireLogin('Administrator login required.');
      const captainId = $('captainSelect').value; const viceId = $('viceCaptainSelect').value; const adminPin = $('adminPinInput').value.trim();
      if (captainId && viceId && captainId === viceId) return toast('Captain and vice-captain must be different');
      if (!/^\d{4,6}$/.test(adminPin)) return toast('Admin PIN must contain 4–6 numbers');
      data.settings.groupName = $('groupNameInput').value.trim() || 'Ball Kho Gayi XI'; data.settings.captainId = captainId; data.settings.viceCaptainId = viceId; data.settings.adminPin = adminPin; saveData(); renderAll(); toast('Team and login settings saved');
    });

    $('flipCoinBtn').addEventListener('click', () => {
      const opponent = $('tossOpponent').value.trim() || 'Opponent'; const call = $('tossCall').value; const result = Math.random() < .5 ? 'Heads' : 'Tails'; const weWon = call === result;
      tossState = { result, winner: weWon ? data.settings.groupName : opponent, opponent };
      const coin = $('coin'); coin.classList.remove('flip-heads', 'flip-tails'); void coin.offsetWidth; coin.classList.add(result === 'Heads' ? 'flip-heads' : 'flip-tails'); $('coinLabel').textContent = 'Coin in the air…'; $('decisionButtons').classList.add('hidden');
      setTimeout(() => { $('coinLabel').textContent = `${result}! ${tossState.winner} won the toss.`; $('tossWinnerText').textContent = `${tossState.winner} won. Choose the decision:`; $('decisionButtons').classList.remove('hidden'); }, 1300);
    });
    $$('[data-decision]').forEach((button) => button.addEventListener('click', () => { if (!tossState.winner) return toast('Flip the coin first'); data.settings.savedToss = { winner: tossState.winner, decision: button.dataset.decision, opponent: tossState.opponent, result: tossState.result, savedAt: new Date().toISOString() }; saveData(); renderToss(); toast(`Toss saved: ${tossState.winner} chose to ${button.dataset.decision.toLowerCase()}`); }));

    $('exportBtn').addEventListener('click', () => { if (!isAdmin()) return requireLogin(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${(data.settings.groupName || 'ball-kho-gayi-xi').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-backup.json`; link.click(); URL.revokeObjectURL(url); toast('Backup downloaded'); });
    $('importInput').addEventListener('change', async (event) => { if (!isAdmin()) return requireLogin(); const file = event.target.files[0]; if (!file) return; try { const parsed = migrateData(JSON.parse(await file.text())); data = parsed; saveData(); renderAll(); toast('Backup restored'); } catch { toast('Could not import this backup'); } finally { event.target.value = ''; } });
    $('resetBtn').addEventListener('click', () => { if (!isAdmin()) return requireLogin(); askConfirm('Reset all website data?', 'This restores the original Ball Kho Gayi XI roster, login PINs and demo matches.', () => { data = migrateData(deepClone(seedData)); session = null; saveData(); saveSession(); renderAll(); toast('Original team data restored'); }); });
    $('confirmCancel').addEventListener('click', closeConfirm);
    $('confirmOk').addEventListener('click', () => { const action = confirmAction; closeConfirm(); if (action) action(); });
  }

  function registerServiceWorker() { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch((error) => console.warn('Service worker not registered:', error)); }

  async function startApp() {
    await loadDataFromServer();
    session = loadSession();
    bindEvents();
    renderAll();
    registerServiceWorker();

    if (!session && !sessionStorage.getItem('ballKhoGayiLoginPromptSeen')) {
      sessionStorage.setItem('ballKhoGayiLoginPromptSeen', '1');
      setTimeout(() => openModal('loginModal'), 650);
    }
  }

  startApp().catch((error) => {
    console.error('Application startup failed:', error);
  });
})();
