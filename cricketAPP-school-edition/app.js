(() => {
  'use strict';

  const STORAGE_KEY = 'cricketCircleSchoolEditionV2';

  const seedData = {
    settings: {
      groupName: 'Cricket Circle',
      adminName: 'Swastik Shukla',
      captainId: '',
      viceCaptainId: '',
      announcementTitle: 'Carry the score notebook.',
      announcementText: 'Record runs, balls, wickets, overs and catches so the match can be uploaded accurately later.',
      savedToss: null
    },
    players: [
      { id: 'p1', name: 'Aryan Verma', jersey: 18, role: 'All-rounder', className: 'Class 10-A', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', note: 'Reliable in pressure chases.' },
      { id: 'p2', name: 'Rohan Singh', jersey: 7, role: 'Batter', className: 'Class 10-B', battingStyle: 'Right-hand bat', bowlingStyle: 'Does not bowl', note: 'Aggressive opener.' },
      { id: 'p3', name: 'Kabir Khan', jersey: 93, role: 'Bowler', className: 'Class 9-A', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast', note: 'New-ball specialist.' },
      { id: 'p4', name: 'Aman Raj', jersey: 1, role: 'Wicketkeeper', className: 'Class 10-A', battingStyle: 'Right-hand bat', bowlingStyle: 'Does not bowl', note: 'Keeps wickets and bats in the middle order.' },
      { id: 'p5', name: 'Dev Mishra', jersey: 45, role: 'Batter', className: 'Class 9-B', battingStyle: 'Left-hand bat', bowlingStyle: 'Does not bowl', note: 'Calm anchor.' },
      { id: 'p6', name: 'Nikhil Yadav', jersey: 12, role: 'Bowler', className: 'Class 10-C', battingStyle: 'Right-hand bat', bowlingStyle: 'Leg spin', note: 'Attacking spinner.' },
      { id: 'p7', name: 'Shivam Tiwari', jersey: 33, role: 'All-rounder', className: 'Class 9-A', battingStyle: 'Left-hand bat', bowlingStyle: 'Left-arm orthodox', note: 'Useful in every department.' },
      { id: 'p8', name: 'Harsh Patel', jersey: 22, role: 'Batter', className: 'Class 10-B', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', note: 'Strong square of the wicket.' },
      { id: 'p9', name: 'Yash Gupta', jersey: 8, role: 'Bowler', className: 'Class 9-C', battingStyle: 'Right-hand bat', bowlingStyle: 'Off spin', note: 'Controls the middle overs.' }
    ],
    matches: [
      {
        id: 'm-upcoming-1', status: 'Upcoming', opponent: 'Blue House XI', venue: 'School Ground', date: futureDate(6), time: '07:30', overs: 10, ballType: 'Tennis', notes: 'Report 20 minutes early.', createdAt: Date.now() - 1000
      },
      {
        id: 'm1', status: 'Completed', opponent: 'Red House XI', venue: 'School Ground', date: pastDate(7), overs: 10, ballType: 'Tennis', ourScore: '92/6', opponentScore: '84/8', tossWinner: 'Our team', tossDecision: 'Bat first', outcome: 'win', resultSummary: 'Won by 8 runs', notes: 'Kabir defended 11 in the final over.', createdAt: Date.now() - 700000,
        performances: [
          perf('p1', 28, 20, 2, 2, 17, 1), perf('p2', 31, 19, 0, 0, 0, 0), perf('p3', 5, 4, 3, 2, 14, 0), perf('p4', 12, 10, 0, 0, 0, 2), perf('p5', 8, 7, 0, 0, 0, 0), perf('p6', 0, 1, 1, 2, 19, 1), perf('p7', 4, 3, 1, 2, 18, 0), perf('p8', 0, 0, 0, 1, 8, 1), perf('p9', 0, 0, 0, 1, 6, 0)
        ]
      },
      {
        id: 'm2', status: 'Completed', opponent: 'Green House XI', venue: 'Practice Field', date: pastDate(14), overs: 8, ballType: 'Tennis', ourScore: '76/4', opponentScore: '77/5', tossWinner: 'Opponent', tossDecision: 'Bowl first', outcome: 'loss', resultSummary: 'Lost by 5 wickets', notes: 'Close finish with two balls remaining.', createdAt: Date.now() - 1400000,
        performances: [
          perf('p1', 17, 13, 1, 2, 18, 0), perf('p2', 26, 17, 0, 0, 0, 0), perf('p3', 3, 5, 2, 2, 21, 0), perf('p4', 18, 12, 0, 0, 0, 1), perf('p5', 9, 8, 0, 0, 0, 0), perf('p6', 0, 0, 1, 1, 12, 0), perf('p7', 1, 2, 0, 2, 20, 1), perf('p8', 2, 3, 1, 1, 6, 0), perf('p9', 0, 0, 0, 0, 0, 0)
        ]
      },
      {
        id: 'm3', status: 'Completed', opponent: 'Senior XI', venue: 'Main Ground', date: pastDate(22), overs: 12, ballType: 'Tennis', ourScore: '118/7', opponentScore: '105/9', tossWinner: 'Opponent', tossDecision: 'Bat first', outcome: 'win', resultSummary: 'Won by 13 runs', notes: 'Aryan changed the game with bat and ball.', createdAt: Date.now() - 2200000,
        performances: [
          perf('p1', 42, 29, 3, 3, 21, 2), perf('p2', 24, 18, 0, 0, 0, 1), perf('p3', 2, 3, 2, 3, 25, 0), perf('p4', 16, 13, 0, 0, 0, 1), perf('p5', 11, 10, 0, 0, 0, 0), perf('p6', 1, 2, 1, 2, 18, 0), perf('p7', 13, 9, 1, 2, 20, 1), perf('p8', 6, 5, 1, 1, 9, 0), perf('p9', 0, 0, 0, 1, 7, 1)
        ]
      }
    ]
  };

  let data = loadData();
  let matchFilter = 'all';
  let roleFilter = 'all';
  let playerSearch = '';
  let statMode = 'runs';
  let confirmAction = null;
  let tossState = { winner: '', result: '' };

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function pastDate(days) {
    const d = new Date(); d.setDate(d.getDate() - days); return toDateInput(d);
  }
  function futureDate(days) {
    const d = new Date(); d.setDate(d.getDate() + days); return toDateInput(d);
  }
  function toDateInput(d) {
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
  }
  function perf(playerId, runs, balls, wickets, oversBowled, runsConceded, catches) {
    return { playerId, runs, balls, wickets, oversBowled, runsConceded, catches };
  }
  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  function deepClone(value) { return JSON.parse(JSON.stringify(value)); }
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return deepClone(seedData);
      const parsed = JSON.parse(stored);
      if (!parsed || !Array.isArray(parsed.players) || !Array.isArray(parsed.matches)) throw new Error('Invalid data');
      return parsed;
    } catch (error) {
      console.warn('Using fresh demo data:', error);
      return deepClone(seedData);
    }
  }
  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
  function formatDate(value) {
    if (!value) return 'Date not set';
    const d = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  }
  function oversToBalls(overs) {
    const value = Number(overs || 0);
    if (!Number.isFinite(value)) return 0;
    const whole = Math.floor(value);
    const balls = Math.round((value - whole) * 10);
    return whole * 6 + Math.min(5, Math.max(0, balls));
  }
  function calculatePlayerStats() {
    const stats = {};
    data.players.forEach((player) => {
      stats[player.id] = { player, matches: 0, runs: 0, balls: 0, wickets: 0, ballsBowled: 0, runsConceded: 0, catches: 0, highScore: 0, bestWickets: 0 };
    });
    data.matches.filter((match) => match.status === 'Completed').forEach((match) => {
      (match.performances || []).forEach((performance) => {
        const row = stats[performance.playerId];
        if (!row) return;
        const appeared = [performance.runs, performance.balls, performance.wickets, performance.oversBowled, performance.runsConceded, performance.catches].some((value) => Number(value) > 0);
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
    return Object.values(stats).map((row) => ({
      ...row,
      strikeRate: row.balls ? (row.runs / row.balls) * 100 : 0,
      economy: row.ballsBowled ? row.runsConceded / (row.ballsBowled / 6) : 0
    }));
  }

  function renderAll() {
    renderBrand();
    renderLeadership();
    renderDashboard();
    renderMatches();
    renderPlayers();
    renderStats();
    renderAdmin();
    renderToss();
    renderPerformanceRows();
  }

  function renderBrand() {
    const name = data.settings.groupName || 'Cricket Circle';
    $('brandName').textContent = name;
    $('footerBrand').textContent = name;
    document.title = `${name} — School Cricket HQ`;
    const completed = data.matches.filter((m) => m.status === 'Completed');
    const activePlayers = data.players.length;
    const teamRuns = completed.reduce((sum, match) => sum + parseScore(match.ourScore), 0);
    $('heroPlayers').textContent = activePlayers;
    $('heroMatches').textContent = completed.length;
    $('heroRuns').textContent = teamRuns;
    const upcoming = data.matches.filter((m) => m.status === 'Upcoming').sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    if (upcoming) {
      $('nextMatchTitle').textContent = `${name} vs ${upcoming.opponent}`;
      $('nextMatchMeta').textContent = `${formatDate(upcoming.date)} · ${upcoming.time || 'Time TBA'} · ${upcoming.venue}`;
    } else {
      $('nextMatchTitle').textContent = 'No fixture scheduled';
      $('nextMatchMeta').textContent = 'Use the Match Center to add one';
    }
  }

  function renderLeadership() {
    const captain = data.players.find((p) => p.id === data.settings.captainId);
    const vice = data.players.find((p) => p.id === data.settings.viceCaptainId);
    $('captainName').textContent = captain ? captain.name : 'Not assigned';
    $('viceCaptainName').textContent = vice ? vice.name : 'Not assigned';
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
    $('topBatter').textContent = batter?.player.name || '—';
    $('topBatterStat').textContent = `${batter?.runs || 0} runs`;
    $('topBowler').textContent = bowler?.player.name || '—';
    $('topBowlerStat').textContent = `${bowler?.wickets || 0} wickets`;
    $('topFielder').textContent = fielder?.player.name || '—';
    $('topFielderStat').textContent = `${fielder?.catches || 0} catches`;
    $('announcementTitle').textContent = data.settings.announcementTitle;
    $('announcementText').textContent = data.settings.announcementText;
  }

  function renderMatches() {
    let matches = [...data.matches].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'Upcoming' ? -1 : 1;
      return new Date(b.date) - new Date(a.date);
    });
    if (matchFilter !== 'all') matches = matches.filter((m) => m.status === matchFilter);
    $('matchGrid').innerHTML = matches.map((match) => {
      const completed = match.status === 'Completed';
      return `<article class="match-card">
        <span class="match-status ${completed ? 'completed' : ''}">${escapeHtml(match.status)}</span>
        <h3>${escapeHtml(data.settings.groupName)} vs ${escapeHtml(match.opponent)}</h3>
        <p class="match-meta">${formatDate(match.date)}${match.time ? ` · ${escapeHtml(match.time)}` : ''}<br>${escapeHtml(match.venue)} · ${escapeHtml(String(match.overs))} overs · ${escapeHtml(match.ballType || 'Tennis')} ball</p>
        <div class="score-strip">
          <div><small>Our team</small><strong>${completed ? escapeHtml(match.ourScore) : '—'}</strong></div>
          <b>VS</b>
          <div><small>${escapeHtml(match.opponent)}</small><strong>${completed ? escapeHtml(match.opponentScore) : '—'}</strong></div>
        </div>
        <p class="result-text">${completed ? escapeHtml(match.resultSummary) : escapeHtml(match.notes || 'Fixture scheduled')}</p>
        <div class="card-actions">
          ${completed ? `<button class="card-btn" data-scorecard="${match.id}" type="button">View Scorecard</button>` : `<button class="card-btn" data-complete-match="${match.id}" type="button">Add Result</button>`}
          <button class="card-btn danger-text" data-delete-match="${match.id}" type="button">Delete</button>
        </div>
      </article>`;
    }).join('');
    $('matchEmpty').classList.toggle('hidden', matches.length > 0);
    bindMatchCardActions();
  }

  function bindMatchCardActions() {
    $$('[data-scorecard]').forEach((button) => button.addEventListener('click', () => openScorecard(button.dataset.scorecard)));
    $$('[data-complete-match]').forEach((button) => button.addEventListener('click', () => openResultModal(button.dataset.completeMatch)));
    $$('[data-delete-match]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.deleteMatch;
      askConfirm('Delete this match?', 'The fixture or scorecard will be removed. Player statistics will be recalculated automatically.', () => {
        data.matches = data.matches.filter((match) => match.id !== id);
        saveData(); renderAll(); toast('Match deleted');
      });
    }));
  }

  function renderPlayers() {
    const statsMap = new Map(calculatePlayerStats().map((row) => [row.player.id, row]));
    let players = [...data.players];
    if (roleFilter !== 'all') players = players.filter((p) => p.role === roleFilter);
    if (playerSearch) players = players.filter((p) => `${p.name} ${p.role} ${p.className}`.toLowerCase().includes(playerSearch.toLowerCase()));
    players.sort((a, b) => a.name.localeCompare(b.name));
    $('playerGrid').innerHTML = players.map((player) => {
      const stat = statsMap.get(player.id);
      const leadership = player.id === data.settings.captainId ? 'Captain' : player.id === data.settings.viceCaptainId ? 'Vice-Captain' : player.role;
      return `<article class="player-card">
        <span class="jersey">${escapeHtml(player.jersey)}</span>
        <div class="player-top"><div class="avatar">${initials(player.name)}</div><div><h3>${escapeHtml(player.name)}</h3><span class="player-role">${escapeHtml(player.className || 'Class not set')}</span></div></div>
        <span class="role-badge">${escapeHtml(leadership)}</span>
        <div class="player-stats"><span><b>${stat?.runs || 0}</b>Runs</span><span><b>${stat?.wickets || 0}</b>Wickets</span><span><b>${stat?.catches || 0}</b>Catches</span></div>
        <div class="player-footer"><small>${escapeHtml(player.battingStyle)}</small><button class="card-btn" data-player-detail="${player.id}" type="button">Profile</button></div>
      </article>`;
    }).join('');
    $('playerEmpty').classList.toggle('hidden', players.length > 0);
    $$('[data-player-detail]').forEach((button) => button.addEventListener('click', () => openPlayerDetail(button.dataset.playerDetail)));
  }

  function renderStats() {
    let stats = calculatePlayerStats();
    const configs = {
      runs: { label: 'Runs', value: (s) => s.runs, secondary: (s) => `${s.matches} matches · HS ${s.highScore}`, sort: (a, b) => b.runs - a.runs, display: (v) => Math.round(v) },
      wickets: { label: 'Wickets', value: (s) => s.wickets, secondary: (s) => `${s.matches} matches · Best ${s.bestWickets}`, sort: (a, b) => b.wickets - a.wickets, display: (v) => Math.round(v) },
      catches: { label: 'Catches', value: (s) => s.catches, secondary: (s) => `${s.matches} matches`, sort: (a, b) => b.catches - a.catches, display: (v) => Math.round(v) },
      strikeRate: { label: 'Strike Rate', value: (s) => s.strikeRate, secondary: (s) => `${s.runs} runs from ${s.balls} balls`, sort: (a, b) => b.strikeRate - a.strikeRate, display: (v) => v.toFixed(1) },
      economy: { label: 'Economy', value: (s) => s.economy || 999, secondary: (s) => `${s.wickets} wickets · ${Math.floor(s.ballsBowled / 6)}.${s.ballsBowled % 6} overs`, sort: (a, b) => (a.economy || 999) - (b.economy || 999), display: (v) => v === 999 ? '—' : v.toFixed(2) }
    };
    const config = configs[statMode];
    stats = stats.sort(config.sort);
    const top = stats[0];
    $('podium').innerHTML = top ? `<div class="podium-crown">♛</div><div class="podium-avatar">${initials(top.player.name)}</div><h3>${escapeHtml(top.player.name)}</h3><div class="podium-value">${config.display(config.value(top))}</div><span class="podium-label">${config.label} leader</span>` : '<p>No statistics yet.</p>';
    $('leaderHead').innerHTML = `<tr><th>Rank</th><th>Player</th><th>${config.label}</th><th>Details</th></tr>`;
    $('leaderRows').innerHTML = stats.map((stat, index) => `<tr><td><span class="rank-dot">${index + 1}</span></td><td><div class="table-player"><span class="tiny-avatar">${initials(stat.player.name)}</span><div><strong>${escapeHtml(stat.player.name)}</strong><small>${escapeHtml(stat.player.role)}</small></div></div></td><td><strong>${config.display(config.value(stat))}</strong></td><td class="muted">${escapeHtml(config.secondary(stat))}</td></tr>`).join('');
  }

  function renderAdmin() {
    $('groupNameInput').value = data.settings.groupName || '';
    const options = `<option value="">Not assigned</option>${data.players.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}`;
    $('captainSelect').innerHTML = options;
    $('viceCaptainSelect').innerHTML = options;
    $('captainSelect').value = data.settings.captainId || '';
    $('viceCaptainSelect').value = data.settings.viceCaptainId || '';
  }

  function renderToss() {
    const saved = data.settings.savedToss;
    $('savedToss').textContent = saved ? `${saved.winner} chose to ${saved.decision.toLowerCase()} first vs ${saved.opponent}` : 'No toss saved yet';
  }

  function renderPerformanceRows() {
    $('performanceRows').innerHTML = data.players.map((player) => `<tr data-performance-player="${player.id}"><td><strong>${escapeHtml(player.name)}</strong><br><small class="muted">${escapeHtml(player.role)}</small></td><td><input type="number" min="0" data-field="runs" aria-label="${escapeHtml(player.name)} runs" /></td><td><input type="number" min="0" data-field="balls" aria-label="${escapeHtml(player.name)} balls" /></td><td><input type="number" min="0" max="10" data-field="wickets" aria-label="${escapeHtml(player.name)} wickets" /></td><td><input type="number" min="0" step="0.1" data-field="oversBowled" aria-label="${escapeHtml(player.name)} overs" /></td><td><input type="number" min="0" data-field="runsConceded" aria-label="${escapeHtml(player.name)} runs conceded" /></td><td><input type="number" min="0" data-field="catches" aria-label="${escapeHtml(player.name)} catches" /></td></tr>`).join('');
  }

  function openResultModal(matchId = '') {
    resetResultForm();
    if (matchId) {
      const match = data.matches.find((m) => m.id === matchId);
      if (match) {
        $('resultForm').dataset.matchId = matchId;
        $('resultOpponent').value = match.opponent;
        $('resultDate').value = match.date;
        $('resultVenue').value = match.venue;
        $('resultOvers').value = match.overs;
      }
    }
    openModal('resultModal');
  }

  function resetResultForm() {
    $('resultForm').reset();
    $('resultForm').dataset.matchId = '';
    $('resultDate').value = toDateInput(new Date());
    $('resultOvers').value = 10;
    renderPerformanceRows();
  }

  function collectPerformances() {
    return $$('[data-performance-player]').map((row) => {
      const result = { playerId: row.dataset.performancePlayer };
      $$('[data-field]', row).forEach((input) => { result[input.dataset.field] = Number(input.value || 0); });
      return result;
    }).filter((p) => [p.runs, p.balls, p.wickets, p.oversBowled, p.runsConceded, p.catches].some((value) => value > 0));
  }

  function openScorecard(matchId) {
    const match = data.matches.find((m) => m.id === matchId);
    if (!match) return;
    const performances = (match.performances || []).map((p) => ({ ...p, player: data.players.find((player) => player.id === p.playerId) })).filter((p) => p.player);
    const batting = [...performances].filter((p) => p.runs || p.balls).sort((a, b) => b.runs - a.runs);
    const bowling = [...performances].filter((p) => p.oversBowled || p.wickets).sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded);
    $('scorecardContent').innerHTML = `<div class="scorecard-hero"><p class="eyebrow">Match Scorecard</p><h2>${escapeHtml(data.settings.groupName)} vs ${escapeHtml(match.opponent)}</h2><p class="muted">${formatDate(match.date)} · ${escapeHtml(match.venue)} · ${escapeHtml(String(match.overs))} overs</p><div class="scorecard-score"><div><small>${escapeHtml(data.settings.groupName)}</small><strong>${escapeHtml(match.ourScore)}</strong></div><div><small>${escapeHtml(match.opponent)}</small><strong>${escapeHtml(match.opponentScore)}</strong></div></div><div class="scorecard-meta"><span>Toss: ${escapeHtml(match.tossWinner)} · ${escapeHtml(match.tossDecision)}</span><span>${escapeHtml(match.resultSummary)}</span></div></div>
      <h3>Batting</h3><div class="table-wrap scorecard-table"><table><thead><tr><th>Batter</th><th>Runs</th><th>Balls</th><th>SR</th><th>Catches</th></tr></thead><tbody>${batting.length ? batting.map((p) => `<tr><td>${escapeHtml(p.player.name)}</td><td>${p.runs}</td><td>${p.balls}</td><td>${p.balls ? ((p.runs / p.balls) * 100).toFixed(1) : '—'}</td><td>${p.catches}</td></tr>`).join('') : '<tr><td colspan="5">No batting data entered.</td></tr>'}</tbody></table></div>
      <h3>Bowling</h3><div class="table-wrap scorecard-table"><table><thead><tr><th>Bowler</th><th>Overs</th><th>Runs</th><th>Wickets</th><th>Economy</th></tr></thead><tbody>${bowling.length ? bowling.map((p) => `<tr><td>${escapeHtml(p.player.name)}</td><td>${p.oversBowled}</td><td>${p.runsConceded}</td><td>${p.wickets}</td><td>${p.oversBowled ? (p.runsConceded / (oversToBalls(p.oversBowled) / 6)).toFixed(2) : '—'}</td></tr>`).join('') : '<tr><td colspan="5">No bowling data entered.</td></tr>'}</tbody></table></div>
      ${match.notes ? `<h3>Match Notes</h3><p class="muted">${escapeHtml(match.notes)}</p>` : ''}`;
    openModal('scorecardModal');
  }

  function openPlayerDetail(playerId) {
    const player = data.players.find((p) => p.id === playerId);
    const stat = calculatePlayerStats().find((s) => s.player.id === playerId);
    if (!player || !stat) return;
    const leadership = playerId === data.settings.captainId ? 'Captain' : playerId === data.settings.viceCaptainId ? 'Vice-Captain' : player.role;
    $('playerDetailContent').innerHTML = `<div class="detail-header"><div class="avatar">${initials(player.name)}</div><div><p class="eyebrow">${escapeHtml(leadership)}</p><h2>${escapeHtml(player.name)}</h2><span class="muted">Jersey ${escapeHtml(player.jersey)} · ${escapeHtml(player.className || 'Class not set')}</span></div></div><div class="detail-info"><div><small>Batting</small><strong>${escapeHtml(player.battingStyle)}</strong></div><div><small>Bowling</small><strong>${escapeHtml(player.bowlingStyle)}</strong></div></div><div class="detail-stat-grid"><div><b>${stat.matches}</b><span>Matches</span></div><div><b>${stat.runs}</b><span>Runs</span></div><div><b>${stat.highScore}</b><span>High Score</span></div><div><b>${stat.wickets}</b><span>Wickets</span></div><div><b>${stat.catches}</b><span>Catches</span></div><div><b>${stat.strikeRate.toFixed(1)}</b><span>Strike Rate</span></div></div>${player.note ? `<p class="muted">${escapeHtml(player.note)}</p>` : ''}<div class="detail-actions"><button class="secondary-btn small" data-edit-player="${player.id}" type="button">Edit Player</button><button class="danger-btn small" data-remove-player="${player.id}" type="button">Remove</button></div>`;
    openModal('playerDetailModal');
    $('[data-edit-player]').addEventListener('click', () => { closeModal('playerDetailModal'); openPlayerModal(playerId); });
    $('[data-remove-player]').addEventListener('click', () => {
      closeModal('playerDetailModal');
      askConfirm('Remove this player?', 'The player will disappear from the roster. Historical scorecard entries will remain in old match data but will no longer have a linked profile.', () => {
        data.players = data.players.filter((p) => p.id !== playerId);
        if (data.settings.captainId === playerId) data.settings.captainId = '';
        if (data.settings.viceCaptainId === playerId) data.settings.viceCaptainId = '';
        saveData(); renderAll(); toast('Player removed');
      });
    });
  }

  function openPlayerModal(playerId = '') {
    $('playerForm').reset();
    $('editingPlayerId').value = '';
    $('playerModalTitle').textContent = playerId ? 'Edit player' : 'Add player';
    if (playerId) {
      const player = data.players.find((p) => p.id === playerId);
      if (!player) return;
      $('editingPlayerId').value = player.id;
      $('playerName').value = player.name;
      $('playerJersey').value = player.jersey;
      $('playerRole').value = player.role;
      $('playerClass').value = player.className;
      $('playerBatting').value = player.battingStyle;
      $('playerBowling').value = player.bowlingStyle;
      $('playerNote').value = player.note || '';
    }
    openModal('playerModal');
  }

  function openModal(id) {
    const modal = $(id);
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const modal = $(id);
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal.show')) document.body.style.overflow = '';
  }
  function parseScore(score = '') {
    const match = String(score).match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
  function toast(message) {
    const node = $('toast');
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('show'), 2200);
  }
  function askConfirm(title, text, action) {
    $('confirmTitle').textContent = title;
    $('confirmText').textContent = text;
    confirmAction = action;
    $('confirmDialog').classList.add('show');
    $('confirmDialog').setAttribute('aria-hidden', 'false');
  }
  function closeConfirm() {
    $('confirmDialog').classList.remove('show');
    $('confirmDialog').setAttribute('aria-hidden', 'true');
    confirmAction = null;
  }

  function bindEvents() {
    $('themeBtn').addEventListener('click', () => {
      document.body.classList.toggle('light');
      $('themeBtn').textContent = document.body.classList.contains('light') ? '☀' : '☾';
    });
    $('scheduleBtn').addEventListener('click', () => openModal('scheduleModal'));
    $('quickResultBtn').addEventListener('click', () => openResultModal());
    $('openResultDeskBtn').addEventListener('click', () => openResultModal());
    $('addPlayerBtn').addEventListener('click', () => openPlayerModal());
    $('editNoticeBtn').addEventListener('click', () => {
      $('noticeTitleInput').value = data.settings.announcementTitle;
      $('noticeTextInput').value = data.settings.announcementText;
      openModal('noticeModal');
    });

    $$('[data-close]').forEach((button) => button.addEventListener('click', () => closeModal(button.dataset.close)));
    $$('.modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal.id); }));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') $$('.modal.show').forEach((modal) => closeModal(modal.id)); });

    $$('[data-match-filter]').forEach((button) => button.addEventListener('click', () => {
      matchFilter = button.dataset.matchFilter;
      $$('[data-match-filter]').forEach((b) => b.classList.toggle('active', b === button));
      renderMatches();
    }));
    $$('[data-role-filter]').forEach((button) => button.addEventListener('click', () => {
      roleFilter = button.dataset.roleFilter;
      $$('[data-role-filter]').forEach((b) => b.classList.toggle('active', b === button));
      renderPlayers();
    }));
    $('playerSearch').addEventListener('input', (event) => { playerSearch = event.target.value.trim(); renderPlayers(); });
    $$('[data-stat]').forEach((button) => button.addEventListener('click', () => {
      statMode = button.dataset.stat;
      $$('[data-stat]').forEach((b) => b.classList.toggle('active', b === button));
      renderStats();
    }));

    $('scheduleForm').addEventListener('submit', (event) => {
      event.preventDefault();
      data.matches.push({ id: uid('match'), status: 'Upcoming', opponent: $('scheduleOpponent').value.trim(), venue: $('scheduleVenue').value.trim(), date: $('scheduleDate').value, time: $('scheduleTime').value, overs: Number($('scheduleOvers').value), ballType: $('scheduleBall').value, notes: $('scheduleNotes').value.trim(), createdAt: Date.now() });
      saveData(); event.target.reset(); closeModal('scheduleModal'); renderAll(); toast('Fixture scheduled');
    });

    $('playerForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const id = $('editingPlayerId').value;
      const player = { id: id || uid('player'), name: $('playerName').value.trim(), jersey: Number($('playerJersey').value), role: $('playerRole').value, className: $('playerClass').value.trim(), battingStyle: $('playerBatting').value, bowlingStyle: $('playerBowling').value, note: $('playerNote').value.trim() };
      if (id) data.players = data.players.map((p) => p.id === id ? player : p); else data.players.push(player);
      saveData(); closeModal('playerModal'); renderAll(); toast(id ? 'Player updated' : 'Player added');
    });

    $('resultForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const existingId = event.target.dataset.matchId;
      const match = { id: existingId || uid('match'), status: 'Completed', opponent: $('resultOpponent').value.trim(), date: $('resultDate').value, venue: $('resultVenue').value.trim(), overs: Number($('resultOvers').value), ballType: 'Tennis', ourScore: $('ourScore').value.trim(), opponentScore: $('opponentScore').value.trim(), tossWinner: $('resultTossWinner').value, tossDecision: $('resultTossDecision').value, outcome: $('resultOutcome').value, resultSummary: $('resultSummary').value.trim(), notes: $('resultNotes').value.trim(), performances: collectPerformances(), createdAt: Date.now() };
      if (existingId) data.matches = data.matches.map((m) => m.id === existingId ? { ...m, ...match } : m); else data.matches.push(match);
      saveData(); closeModal('resultModal'); renderAll(); toast('Match saved and statistics updated');
    });

    $('noticeForm').addEventListener('submit', (event) => {
      event.preventDefault();
      data.settings.announcementTitle = $('noticeTitleInput').value.trim();
      data.settings.announcementText = $('noticeTextInput').value.trim();
      saveData(); closeModal('noticeModal'); renderDashboard(); toast('Notice updated');
    });

    $('saveSettingsBtn').addEventListener('click', () => {
      const captainId = $('captainSelect').value;
      const viceId = $('viceCaptainSelect').value;
      if (captainId && viceId && captainId === viceId) return toast('Captain and vice-captain must be different players');
      data.settings.groupName = $('groupNameInput').value.trim() || 'Cricket Circle';
      data.settings.captainId = captainId;
      data.settings.viceCaptainId = viceId;
      saveData(); renderAll(); toast('Team settings saved');
    });

    $('flipCoinBtn').addEventListener('click', () => {
      const opponent = $('tossOpponent').value.trim() || 'Opponent';
      const call = $('tossCall').value;
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const weWon = call === result;
      tossState = { result, winner: weWon ? data.settings.groupName : opponent, opponent };
      const coin = $('coin');
      coin.classList.remove('flip-heads', 'flip-tails');
      void coin.offsetWidth;
      coin.classList.add(result === 'Heads' ? 'flip-heads' : 'flip-tails');
      $('coinLabel').textContent = 'Coin in the air…';
      $('decisionButtons').classList.add('hidden');
      setTimeout(() => {
        $('coinLabel').textContent = `${result}! ${tossState.winner} won the toss.`;
        $('tossWinnerText').textContent = `${tossState.winner} won. Choose the decision:`;
        $('decisionButtons').classList.remove('hidden');
      }, 1300);
    });
    $$('[data-decision]').forEach((button) => button.addEventListener('click', () => {
      if (!tossState.winner) return toast('Flip the coin first');
      data.settings.savedToss = { winner: tossState.winner, decision: button.dataset.decision, opponent: tossState.opponent, result: tossState.result, savedAt: new Date().toISOString() };
      saveData(); renderToss(); toast(`Toss saved: ${tossState.winner} chose to ${button.dataset.decision.toLowerCase()}`);
    }));

    $('exportBtn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(data.settings.groupName || 'cricket-circle').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-backup.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast('Backup downloaded');
    });
    $('importInput').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        if (!parsed || !Array.isArray(parsed.players) || !Array.isArray(parsed.matches) || !parsed.settings) throw new Error('Invalid backup');
        data = parsed; saveData(); renderAll(); toast('Backup restored');
      } catch (error) {
        toast('Could not import this backup');
      } finally { event.target.value = ''; }
    });
    $('resetBtn').addEventListener('click', () => askConfirm('Reset all website data?', 'This will remove your local roster, matches and settings and restore the original demo.', () => {
      data = deepClone(seedData); saveData(); renderAll(); toast('Demo data restored');
    }));

    $('confirmCancel').addEventListener('click', closeConfirm);
    $('confirmOk').addEventListener('click', () => { const action = confirmAction; closeConfirm(); if (action) action(); });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch((error) => console.warn('Service worker not registered:', error));
    }
  }

  bindEvents();
  renderAll();
  registerServiceWorker();
})();
