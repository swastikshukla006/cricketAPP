const STORAGE_KEY = "cricketCircleDataV1";

function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seedData = {
  settings: {
    groupName: "Cricket Circle",
    tagline: "Play. Track. Improve.",
    groupCode: "CIRCLE11",
    defaultBall: "Tennis",
    homeGround: "City Sports Ground"
  },
  players: [
    { id: uid(), name: "Arjun Singh", jersey: 18, role: "All-rounder", batting: "Right hand", bowling: "Right-arm medium", matches: 18, runs: 642, wickets: 21, catches: 12, sixes: 39 },
    { id: uid(), name: "Rohan Verma", jersey: 7, role: "Wicketkeeper", batting: "Right hand", bowling: "—", matches: 20, runs: 588, wickets: 0, catches: 19, sixes: 21 },
    { id: uid(), name: "Vikram Yadav", jersey: 33, role: "Bowler", batting: "Right hand", bowling: "Right-arm fast", matches: 16, runs: 108, wickets: 28, catches: 7, sixes: 4 },
    { id: uid(), name: "Dev Sharma", jersey: 11, role: "Batter", batting: "Left hand", bowling: "Leg spin", matches: 17, runs: 701, wickets: 8, catches: 9, sixes: 46 },
    { id: uid(), name: "Kabir Khan", jersey: 23, role: "All-rounder", batting: "Right hand", bowling: "Off spin", matches: 15, runs: 412, wickets: 17, catches: 13, sixes: 19 },
    { id: uid(), name: "Aman Patel", jersey: 45, role: "Bowler", batting: "Right hand", bowling: "Left-arm medium", matches: 14, runs: 92, wickets: 24, catches: 6, sixes: 2 },
    { id: uid(), name: "Neeraj Gupta", jersey: 10, role: "Batter", batting: "Right hand", bowling: "—", matches: 19, runs: 536, wickets: 0, catches: 8, sixes: 31 },
    { id: uid(), name: "Yash Tiwari", jersey: 4, role: "All-rounder", batting: "Left hand", bowling: "Left-arm spin", matches: 13, runs: 364, wickets: 16, catches: 11, sixes: 18 },
    { id: uid(), name: "Aditya Mishra", jersey: 9, role: "Batter", batting: "Right hand", bowling: "—", matches: 12, runs: 338, wickets: 0, catches: 5, sixes: 16 },
    { id: uid(), name: "Kunal Joshi", jersey: 27, role: "Bowler", batting: "Right hand", bowling: "Off spin", matches: 15, runs: 74, wickets: 20, catches: 9, sixes: 1 },
    { id: uid(), name: "Harsh Rai", jersey: 55, role: "All-rounder", batting: "Right hand", bowling: "Right-arm medium", matches: 11, runs: 284, wickets: 13, catches: 10, sixes: 12 },
    { id: uid(), name: "Samar Ali", jersey: 6, role: "Wicketkeeper", batting: "Left hand", bowling: "—", matches: 10, runs: 251, wickets: 0, catches: 15, sixes: 9 }
  ],
  matches: [
    { id: uid(), opponent: "Thunder XI", date: futureDate(3, 7, 0), venue: "City Sports Ground", overs: 12, ball: "Tennis", status: "Upcoming", notes: "Arrive 30 minutes early." },
    { id: uid(), opponent: "Royal Strikers", date: futureDate(9, 6, 30), venue: "Riverfront Turf", overs: 15, ball: "Tennis", status: "Upcoming", notes: "White jersey match." },
    { id: uid(), opponent: "Weekend Warriors", date: futureDate(-5, 7, 30), venue: "City Sports Ground", overs: 10, ball: "Tennis", status: "Completed", result: "Won by 18 runs" },
    { id: uid(), opponent: "Greenfield Club", date: futureDate(-12, 6, 0), venue: "Greenfield Arena", overs: 12, ball: "Leather", status: "Completed", result: "Lost by 4 wickets" }
  ],
  expenses: [
    { id: uid(), title: "Ground booking", category: "Ground", amount: 2200, paid: 1600, date: futureDate(-2, 0, 0).slice(0,10) },
    { id: uid(), title: "Tennis balls", category: "Equipment", amount: 720, paid: 720, date: futureDate(-7, 0, 0).slice(0,10) },
    { id: uid(), title: "Team refreshments", category: "Refreshments", amount: 1050, paid: 650, date: futureDate(-11, 0, 0).slice(0,10) }
  ],
  announcements: [
    { id: uid(), title: "New season begins", body: "Confirm your availability for the Thunder XI match before Friday evening.", pinned: true },
    { id: uid(), title: "Jersey reminder", body: "Players who have not submitted their jersey number should update it in the players section.", pinned: false }
  ],
  scoring: createDefaultScoring()
};

function futureDate(days, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function createDefaultScoring() {
  return {
    team: "Cricket Circle",
    opponent: "Thunder XI",
    runs: 0,
    wickets: 0,
    legalBalls: 0,
    extras: 0,
    target: 121,
    striker: "Arjun Singh",
    nonStriker: "Dev Sharma",
    bowler: "Vikram Yadav",
    strikerRuns: 0,
    strikerBalls: 0,
    nonStrikerRuns: 0,
    nonStrikerBalls: 0,
    deliveries: [],
    history: []
  };
}

let state = loadData();
let route = location.hash.replace("#", "") || "dashboard";

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(seedData);
  } catch {
    return structuredClone(seedData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDate(iso, withTime = true) {
  const options = withTime
    ? { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", year: "numeric" };
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(iso));
}

function initials(name) {
  return name.split(" ").map(part => part[0]).join("").slice(0,2).toUpperCase();
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.getElementById("toastRegion").appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function setRoute(nextRoute) {
  route = nextRoute;
  location.hash = nextRoute;
  closeDrawer();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  document.getElementById("brandName").textContent = state.settings.groupName;
  document.title = `${state.settings.groupName} — Cricket Group`;
  document.querySelectorAll("[data-route]").forEach(btn => btn.classList.toggle("active", btn.dataset.route === route));
  const app = document.getElementById("app");
  const routes = {
    dashboard: renderDashboard,
    matches: renderMatches,
    scoring: renderScoring,
    players: renderPlayers,
    leaderboard: renderLeaderboard,
    expenses: renderExpenses,
    admin: renderAdmin
  };
  app.innerHTML = (routes[route] || routes.dashboard)();
  bindPageEvents();
  app.focus({ preventScroll: true });
}

function renderDashboard() {
  const nextMatch = [...state.matches].filter(m => m.status === "Upcoming").sort((a,b) => new Date(a.date) - new Date(b.date))[0];
  const completed = state.matches.filter(m => m.status === "Completed");
  const wins = completed.filter(m => (m.result || "").toLowerCase().includes("won")).length;
  const totalRuns = state.players.reduce((sum,p) => sum + p.runs, 0);
  const topPlayers = [...state.players].sort((a,b) => b.runs - a.runs).slice(0,3);
  const countdown = getCountdown(nextMatch?.date);

  return `
    <section class="page">
      <div class="hero">
        <article class="hero-main">
          <div>
            <p class="eyebrow">Private cricket group</p>
            <h1 class="display-title">Your team.<br><span>Your numbers.</span></h1>
            <p class="hero-copy">Plan matches, confirm availability, keep player statistics, track group expenses and score every ball from one clean mobile-first website.</p>
            <div class="action-row">
              <button class="button button-primary" data-route="scoring">Start live scoring</button>
              <button class="button button-secondary" data-route="matches">View matches</button>
            </div>
          </div>
          <div class="season-strip">
            <div class="mini-stat"><strong>${state.matches.length}</strong><small>Matches</small></div>
            <div class="mini-stat"><strong>${wins}</strong><small>Wins</small></div>
            <div class="mini-stat"><strong>${state.players.length}</strong><small>Players</small></div>
          </div>
        </article>

        <aside class="hero-side">
          <div class="next-match">
            <p class="eyebrow">Next match</p>
            <div class="match-versus">${escapeHtml(state.settings.groupName)} <span style="opacity:.45">vs</span> ${escapeHtml(nextMatch?.opponent || "TBD")}</div>
            <div class="match-meta">
              <span>◷ ${nextMatch ? formatDate(nextMatch.date) : "Date not decided"}</span>
              <span>⌖ ${escapeHtml(nextMatch?.venue || state.settings.homeGround)}</span>
              <span>● ${nextMatch?.overs || 0} overs · ${escapeHtml(nextMatch?.ball || state.settings.defaultBall)} ball</span>
            </div>
            <div class="countdown">
              <div><strong>${countdown.days}</strong><small>Days</small></div>
              <div><strong>${countdown.hours}</strong><small>Hours</small></div>
              <div><strong>${countdown.minutes}</strong><small>Mins</small></div>
            </div>
          </div>
          <div class="card">
            <div class="match-top"><div><p class="eyebrow">Season pulse</p><h3 class="card-title">${totalRuns.toLocaleString("en-IN")} group runs</h3></div><span class="status completed">Active</span></div>
            <p class="card-subtitle">Your current squad has taken ${state.players.reduce((s,p)=>s+p.wickets,0)} wickets and ${state.players.reduce((s,p)=>s+p.catches,0)} catches.</p>
          </div>
        </aside>
      </div>

      <section class="section">
        <div class="section-head"><div><p class="eyebrow">At a glance</p><h2>Team dashboard</h2></div></div>
        <div class="grid-4">
          ${metricCard("🏏", state.players.length, "Active players")}
          ${metricCard("📅", state.matches.filter(m=>m.status==="Upcoming").length, "Upcoming matches")}
          ${metricCard("🔥", topPlayers[0]?.runs || 0, "Top season runs")}
          ${metricCard("₹", state.expenses.reduce((s,e)=>s+(e.amount-e.paid),0).toLocaleString("en-IN"), "Pending amount")}
        </div>
      </section>

      <section class="section grid-2">
        <div>
          <div class="section-head"><div><p class="eyebrow">Form table</p><h2>Top performers</h2></div><button class="button button-secondary button-small" data-route="leaderboard">Full table</button></div>
          <div class="grid-3">
            ${topPlayers.map(renderPlayerCard).join("")}
          </div>
        </div>
        <div>
          <div class="section-head"><div><p class="eyebrow">Team noticeboard</p><h2>Announcements</h2></div></div>
          <div class="card" style="display:grid;gap:12px">
            ${state.announcements.map(a => `<div style="padding:14px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.025)"><div class="match-top"><strong>${escapeHtml(a.title)}</strong>${a.pinned?'<span class="status upcoming">Pinned</span>':''}</div><p class="card-subtitle" style="margin-top:8px">${escapeHtml(a.body)}</p></div>`).join("")}
          </div>
        </div>
      </section>
    </section>`;
}

function metricCard(icon, value, label) {
  return `<article class="card metric-card"><div class="metric-icon">${icon}</div><div><div class="metric-value">${value}</div><div class="metric-label">${label}</div></div></article>`;
}

function renderMatches() {
  const upcoming = state.matches.filter(m => m.status === "Upcoming").sort((a,b)=>new Date(a.date)-new Date(b.date));
  const completed = state.matches.filter(m => m.status === "Completed").sort((a,b)=>new Date(b.date)-new Date(a.date));
  return `<section class="page">
    ${pageHead("Matches", "Schedule games, review results and keep the group organised.", `<button class="button button-primary" data-action="add-match">+ New match</button>`)}
    <section class="section">
      <div class="section-head"><div><p class="eyebrow">Coming up</p><h2>Upcoming fixtures</h2></div></div>
      <div class="grid-3">${upcoming.length ? upcoming.map(renderMatchCard).join("") : emptyState("No upcoming matches", "Create the next fixture for your group.", "add-match", "Create match")}</div>
    </section>
    <section class="section">
      <div class="section-head"><div><p class="eyebrow">Archive</p><h2>Recent results</h2></div></div>
      <div class="grid-3">${completed.length ? completed.map(renderMatchCard).join("") : emptyState("No completed matches", "Finished games will appear here.")}</div>
    </section>
  </section>`;
}

function renderMatchCard(match) {
  return `<article class="card match-card">
    <div class="match-top"><span class="status ${match.status.toLowerCase()}">${escapeHtml(match.status)}</span><small style="color:var(--muted)">${match.overs} overs</small></div>
    <div class="match-title">${escapeHtml(state.settings.groupName)} <span style="color:var(--muted);font-size:.6em">vs</span> ${escapeHtml(match.opponent)}</div>
    <div class="meta-list"><span>◷ ${formatDate(match.date)}</span><span>⌖ ${escapeHtml(match.venue)}</span><span>● ${escapeHtml(match.ball)} ball</span>${match.result?`<span style="color:var(--green);font-weight:700">${escapeHtml(match.result)}</span>`:""}</div>
    <div class="inline-actions">
      ${match.status === "Upcoming" ? `<button class="button button-primary button-small" data-route="scoring">Score match</button>` : `<button class="button button-secondary button-small" data-route="leaderboard">View stats</button>`}
      <button class="button button-secondary button-small" data-action="delete-match" data-id="${match.id}">Delete</button>
    </div>
  </article>`;
}

function renderPlayers() {
  return `<section class="page">
    ${pageHead("Players", "Search the squad, compare roles and keep player profiles updated.", `<button class="button button-primary" data-action="add-player">+ Add player</button>`)}
    <div class="toolbar">
      <input id="playerSearch" class="input" type="search" placeholder="Search player by name..." />
      <select id="roleFilter" class="select">
        <option value="All">All roles</option><option>Batter</option><option>Bowler</option><option>All-rounder</option><option>Wicketkeeper</option>
      </select>
    </div>
    <div id="playerGrid" class="grid-3">${state.players.map(renderPlayerCard).join("")}</div>
  </section>`;
}

function renderPlayerCard(player) {
  return `<article class="card player-card" data-player-card data-name="${escapeHtml(player.name.toLowerCase())}" data-role="${escapeHtml(player.role)}">
    <div class="player-top"><div class="avatar">${initials(player.name)}</div><span class="jersey">#${player.jersey}</span></div>
    <div><h3 class="player-name">${escapeHtml(player.name)}</h3><div class="player-role">${escapeHtml(player.role)}</div></div>
    <div class="player-stats"><div><strong>${player.runs}</strong><small>Runs</small></div><div><strong>${player.wickets}</strong><small>Wickets</small></div><div><strong>${player.catches}</strong><small>Catches</small></div></div>
    <div class="inline-actions"><button class="button button-secondary button-small" data-action="edit-player" data-id="${player.id}">Edit</button><button class="button button-danger button-small" data-action="delete-player" data-id="${player.id}">Remove</button></div>
  </article>`;
}

function renderLeaderboard() {
  const sorted = [...state.players].sort((a,b)=>b.runs-a.runs);
  return `<section class="page">
    ${pageHead("Leaderboard", "Season rankings calculated from the player records in this website.", "")}
    <div class="grid-4" style="margin-bottom:18px">
      ${metricCard("🏏", sorted[0]?.name || "—", "Top run scorer")}
      ${metricCard("🎯", [...state.players].sort((a,b)=>b.wickets-a.wickets)[0]?.name || "—", "Top wicket taker")}
      ${metricCard("💥", [...state.players].sort((a,b)=>b.sixes-a.sixes)[0]?.sixes || 0, "Most sixes")}
      ${metricCard("🧤", [...state.players].sort((a,b)=>b.catches-a.catches)[0]?.catches || 0, "Most catches")}
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Rank</th><th>Player</th><th>Role</th><th>Matches</th><th>Runs</th><th>Wickets</th><th>Sixes</th><th>Catches</th></tr></thead>
        <tbody>${sorted.map((p,i)=>`<tr><td class="rank">${i+1}</td><td><strong>${escapeHtml(p.name)}</strong><br><small style="color:var(--muted)">#${p.jersey}</small></td><td>${escapeHtml(p.role)}</td><td>${p.matches}</td><td>${p.runs}</td><td>${p.wickets}</td><td>${p.sixes}</td><td>${p.catches}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  </section>`;
}

function renderScoring() {
  const s = state.scoring;
  const overs = `${Math.floor(s.legalBalls / 6)}.${s.legalBalls % 6}`;
  const currentRate = s.legalBalls ? (s.runs / (s.legalBalls / 6)).toFixed(2) : "0.00";
  const remaining = Math.max(0, s.target - s.runs);
  const recent = s.deliveries.slice(-12);
  return `<section class="page">
    ${pageHead("Live Scoring", "A phone-friendly scorer with undo support and automatic totals.", `<button class="button button-secondary" data-action="reset-score">Reset innings</button>`)}
    <div class="score-layout">
      <div>
        <div class="scoreboard">
          <div class="scoreboard-top">
            <div><p class="eyebrow" style="color:rgba(4,17,12,.52)">${escapeHtml(s.team)} batting</p><div class="score-main">${s.runs}<small>/${s.wickets}</small></div></div>
            <div class="over-display">${overs}<small>Overs</small></div>
          </div>
          <div class="score-meta-grid">
            <div><strong>${currentRate}</strong><small>Current rate</small></div>
            <div><strong>${remaining}</strong><small>Runs needed</small></div>
            <div><strong>${s.extras}</strong><small>Extras</small></div>
          </div>
          <div class="batter-list">
            <div class="batter-row"><div><strong>★ ${escapeHtml(s.striker)}</strong><br><small>Striker</small></div><strong>${s.strikerRuns}</strong><small>${s.strikerBalls} balls</small></div>
            <div class="batter-row"><div><strong>${escapeHtml(s.nonStriker)}</strong><br><small>Non-striker</small></div><strong>${s.nonStrikerRuns}</strong><small>${s.nonStrikerBalls} balls</small></div>
            <div class="batter-row"><div><strong>${escapeHtml(s.bowler)}</strong><br><small>Bowler</small></div><strong>Target ${s.target}</strong><small>${Math.max(0, 72-s.legalBalls)} balls left</small></div>
          </div>
        </div>

        <div class="card" style="margin-top:18px">
          <div class="match-top"><div><p class="eyebrow">This innings</p><h3 class="card-title">Recent deliveries</h3></div><button class="button button-secondary button-small" data-action="undo-ball">Undo last ball</button></div>
          <div class="delivery-strip" style="margin-top:14px">${recent.length ? recent.map(ball => `<span class="delivery-ball ${ball.type === "W" ? "wicket" : Number(ball.label) >= 4 ? "boundary" : ""}">${escapeHtml(ball.label)}</span>`).join("") : '<span class="card-subtitle">No deliveries recorded yet.</span>'}</div>
        </div>
      </div>

      <aside class="card controls-card">
        <p class="eyebrow">Ball result</p>
        <h2 style="margin:0">Record delivery</h2>
        <div class="run-grid">
          ${[0,1,2,3,4,6].map(n=>`<button class="run-button ${n>=4?'boundary':''}" data-ball="runs" data-value="${n}">${n}</button>`).join("")}
        </div>
        <button class="run-button wicket" style="width:100%;min-height:58px" data-ball="wicket" data-value="W">Wicket</button>
        <p class="eyebrow" style="margin-top:22px">Extras</p>
        <div class="extra-grid">
          <button class="button button-secondary" data-ball="wide" data-value="Wd">Wide</button>
          <button class="button button-secondary" data-ball="noball" data-value="Nb">No-ball</button>
          <button class="button button-secondary" data-ball="bye" data-value="B">Bye</button>
          <button class="button button-secondary" data-ball="legbye" data-value="Lb">Leg-bye</button>
        </div>
        <button class="button button-primary button-block" style="margin-top:16px" data-action="swap-strike">Swap strike</button>
      </aside>
    </div>
  </section>`;
}

function renderExpenses() {
  const total = state.expenses.reduce((s,e)=>s+e.amount,0);
  const paid = state.expenses.reduce((s,e)=>s+e.paid,0);
  return `<section class="page">
    ${pageHead("Expenses", "Track ground bookings, equipment and group collections.", `<button class="button button-primary" data-action="add-expense">+ Add expense</button>`)}
    <div class="grid-3" style="margin-bottom:18px">
      ${metricCard("₹", total.toLocaleString("en-IN"), "Total expenses")}
      ${metricCard("✓", paid.toLocaleString("en-IN"), "Collected")}
      ${metricCard("!", (total-paid).toLocaleString("en-IN"), "Pending")}
    </div>
    <div class="grid-3">
      ${state.expenses.map(e => {
        const pct = Math.min(100, Math.round((e.paid/e.amount)*100));
        return `<article class="card">
          <div class="expense-top"><span class="status ${pct===100?'completed':'pending'}">${pct===100?'Paid':'Pending'}</span><small style="color:var(--muted)">${formatDate(e.date,false)}</small></div>
          <h3 class="match-title" style="font-size:22px">${escapeHtml(e.title)}</h3>
          <p class="card-subtitle">${escapeHtml(e.category)}</p>
          <div class="expense-amount">₹${e.amount.toLocaleString("en-IN")}</div>
          <div class="progress-row" style="margin-top:14px"><div class="progress-label"><span>₹${e.paid.toLocaleString("en-IN")} collected</span><strong>${pct}%</strong></div><div class="progress"><span style="width:${pct}%"></span></div></div>
          <div class="inline-actions"><button class="button button-secondary button-small" data-action="collect-expense" data-id="${e.id}">Add payment</button><button class="button button-danger button-small" data-action="delete-expense" data-id="${e.id}">Delete</button></div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderAdmin() {
  return `<section class="page">
    ${pageHead("Admin", "Manage the group identity and reset demo data when needed.", "")}
    <div class="grid-2">
      <article class="card">
        <p class="eyebrow">Group settings</p><h2 style="margin-top:0">Identity and defaults</h2>
        <form id="settingsForm" style="display:grid;gap:14px;margin-top:18px">
          ${field("Group name", "groupName", state.settings.groupName)}
          ${field("Tagline", "tagline", state.settings.tagline)}
          ${field("Private group code", "groupCode", state.settings.groupCode)}
          ${field("Home ground", "homeGround", state.settings.homeGround)}
          <div class="field"><label for="defaultBall">Default ball type</label><select class="select" id="defaultBall" name="defaultBall"><option ${state.settings.defaultBall==='Tennis'?'selected':''}>Tennis</option><option ${state.settings.defaultBall==='Leather'?'selected':''}>Leather</option></select></div>
          <button class="button button-primary" type="submit">Save settings</button>
        </form>
      </article>
      <article class="card">
        <p class="eyebrow">Data tools</p><h2 style="margin-top:0">Browser storage</h2>
        <p class="card-subtitle">This first version stores data in your browser so it works without a backend. A later version can connect to Supabase or MongoDB for multi-device accounts.</p>
        <div class="grid-2" style="margin-top:18px">
          ${metricCard("◎", state.players.length, "Player records")}
          ${metricCard("▣", state.matches.length, "Match records")}
        </div>
        <div class="inline-actions" style="margin-top:20px">
          <button class="button button-secondary" data-action="export-data">Export JSON</button>
          <button class="button button-danger" data-action="reset-data">Reset demo data</button>
        </div>
      </article>
    </div>

    <section class="section">
      <div class="section-head"><div><p class="eyebrow">Admin shortcuts</p><h2>Manage content</h2></div></div>
      <div class="grid-3">
        <article class="card"><h3>Players</h3><p class="card-subtitle">Add, edit or remove player profiles and season statistics.</p><button class="button button-secondary button-small" data-route="players" style="margin-top:16px">Manage players</button></article>
        <article class="card"><h3>Matches</h3><p class="card-subtitle">Create fixtures and keep recent match results together.</p><button class="button button-secondary button-small" data-route="matches" style="margin-top:16px">Manage matches</button></article>
        <article class="card"><h3>Expenses</h3><p class="card-subtitle">Record ground fees and see how much money remains unpaid.</p><button class="button button-secondary button-small" data-route="expenses" style="margin-top:16px">Manage expenses</button></article>
      </div>
    </section>
  </section>`;
}

function pageHead(title, subtitle, actions) {
  return `<div class="page-head"><div><p class="eyebrow">${escapeHtml(state.settings.groupName)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div><div class="action-row" style="margin:0">${actions || ""}</div></div>`;
}

function field(label, name, value, type="text", extraClass="") {
  return `<div class="field ${extraClass}"><label for="${name}">${escapeHtml(label)}</label><input class="input" id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" required></div>`;
}

function emptyState(title, text, action, actionText) {
  return `<div class="empty-state" style="grid-column:1/-1"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p>${action?`<button class="button button-primary" data-action="${action}">${escapeHtml(actionText)}</button>`:""}</div>`;
}

function getCountdown(iso) {
  if (!iso) return { days: 0, hours: 0, minutes: 0 };
  const diff = Math.max(0, new Date(iso) - new Date());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000)
  };
}

function bindPageEvents() {
  const app = document.getElementById("app");
  app.querySelectorAll("[data-route]").forEach(btn => btn.addEventListener("click", () => setRoute(btn.dataset.route)));
  document.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", handleAction));
  document.querySelectorAll("[data-ball]").forEach(btn => btn.addEventListener("click", () => recordBall(btn.dataset.ball, btn.dataset.value)));

  const playerSearch = document.getElementById("playerSearch");
  const roleFilter = document.getElementById("roleFilter");
  if (playerSearch && roleFilter) {
    const filterPlayers = () => {
      const q = playerSearch.value.trim().toLowerCase();
      const roleValue = roleFilter.value;
      document.querySelectorAll("[data-player-card]").forEach(card => {
        const show = card.dataset.name.includes(q) && (roleValue === "All" || card.dataset.role === roleValue);
        card.style.display = show ? "flex" : "none";
      });
    };
    playerSearch.addEventListener("input", filterPlayers);
    roleFilter.addEventListener("change", filterPlayers);
  }

  document.getElementById("settingsForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    Object.assign(state.settings, Object.fromEntries(form.entries()));
    saveData(); render(); toast("Group settings saved");
  });
}

function handleAction(event) {
  const { action, id } = event.currentTarget.dataset;
  if (action === "add-player") return openPlayerDialog();
  if (action === "edit-player") return openPlayerDialog(state.players.find(p=>p.id===id));
  if (action === "delete-player") return deleteRecord("players", id, "Player removed");
  if (action === "add-match") return openMatchDialog();
  if (action === "delete-match") return deleteRecord("matches", id, "Match deleted");
  if (action === "add-expense") return openExpenseDialog();
  if (action === "delete-expense") return deleteRecord("expenses", id, "Expense deleted");
  if (action === "collect-expense") return collectExpense(id);
  if (action === "undo-ball") return undoBall();
  if (action === "swap-strike") return swapStrike();
  if (action === "reset-score") return resetScore();
  if (action === "reset-data") return resetAllData();
  if (action === "export-data") return exportData();
}

function deleteRecord(collection, id, message) {
  if (!confirm("Are you sure? This action cannot be undone.")) return;
  state[collection] = state[collection].filter(item => item.id !== id);
  saveData(); render(); toast(message);
}

function openDialog({ eyebrow, title, fields, submitText="Save", onSubmit }) {
  const dialog = document.getElementById("formDialog");
  const form = document.getElementById("dialogForm");
  document.getElementById("dialogEyebrow").textContent = eyebrow;
  document.getElementById("dialogTitle").textContent = title;
  document.getElementById("dialogFields").innerHTML = fields;
  document.getElementById("dialogSubmit").textContent = submitText;
  form.onsubmit = event => {
    event.preventDefault();
    const submitter = event.submitter?.value;
    if (submitter === "cancel") { dialog.close(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    onSubmit(data);
    dialog.close();
  };
  dialog.showModal();
}

function openPlayerDialog(player) {
  const p = player || { name:"", jersey:"", role:"Batter", batting:"Right hand", bowling:"—", matches:0, runs:0, wickets:0, catches:0, sixes:0 };
  openDialog({
    eyebrow: player ? "Edit player" : "New player",
    title: player ? p.name : "Add to squad",
    submitText: player ? "Update player" : "Add player",
    fields: `
      ${field("Full name", "name", p.name)}
      ${field("Jersey number", "jersey", p.jersey, "number")}
      <div class="field"><label for="role">Primary role</label><select class="select" name="role" id="role">${["Batter","Bowler","All-rounder","Wicketkeeper"].map(r=>`<option ${p.role===r?'selected':''}>${r}</option>`).join("")}</select></div>
      ${field("Batting style", "batting", p.batting)}
      ${field("Bowling style", "bowling", p.bowling)}
      ${field("Matches", "matches", p.matches, "number")}
      ${field("Runs", "runs", p.runs, "number")}
      ${field("Wickets", "wickets", p.wickets, "number")}
      ${field("Catches", "catches", p.catches, "number")}
      ${field("Sixes", "sixes", p.sixes, "number")}
    `,
    onSubmit: data => {
      const record = { ...p, ...data, id: player?.id || uid() };
      ["jersey","matches","runs","wickets","catches","sixes"].forEach(k => record[k] = Number(record[k] || 0));
      if (player) state.players = state.players.map(item => item.id === player.id ? record : item);
      else state.players.push(record);
      saveData(); render(); toast(player ? "Player updated" : "Player added");
    }
  });
}

function openMatchDialog() {
  openDialog({
    eyebrow: "Fixture",
    title: "Create match",
    submitText: "Create match",
    fields: `
      ${field("Opponent", "opponent", "")}
      ${field("Date and time", "date", new Date(Date.now()+86400000*3).toISOString().slice(0,16), "datetime-local")}
      ${field("Venue", "venue", state.settings.homeGround, "text", "full")}
      ${field("Overs", "overs", 12, "number")}
      <div class="field"><label for="ball">Ball type</label><select class="select" name="ball" id="ball"><option>Tennis</option><option>Leather</option></select></div>
      <div class="field full"><label for="notes">Notes</label><textarea class="textarea" rows="3" name="notes" id="notes" placeholder="Arrival time, dress code, or match notes..."></textarea></div>
    `,
    onSubmit: data => {
      state.matches.push({ id: uid(), ...data, date: new Date(data.date).toISOString(), overs: Number(data.overs), status: "Upcoming" });
      saveData(); render(); toast("Match created");
    }
  });
}

function openExpenseDialog() {
  openDialog({
    eyebrow: "Expense",
    title: "Add group expense",
    submitText: "Add expense",
    fields: `
      ${field("Title", "title", "")}
      <div class="field"><label for="category">Category</label><select class="select" name="category" id="category"><option>Ground</option><option>Equipment</option><option>Refreshments</option><option>Travel</option><option>Other</option></select></div>
      ${field("Total amount", "amount", "", "number")}
      ${field("Already collected", "paid", 0, "number")}
      ${field("Date", "date", new Date().toISOString().slice(0,10), "date", "full")}
    `,
    onSubmit: data => {
      state.expenses.push({ id: uid(), ...data, amount: Number(data.amount), paid: Number(data.paid) });
      saveData(); render(); toast("Expense added");
    }
  });
}

function collectExpense(id) {
  const expense = state.expenses.find(e => e.id === id);
  const pending = expense.amount - expense.paid;
  if (pending <= 0) return toast("This expense is already fully paid");
  const amount = Number(prompt(`Pending: ₹${pending}. Enter payment amount:`));
  if (!Number.isFinite(amount) || amount <= 0) return;
  expense.paid = Math.min(expense.amount, expense.paid + amount);
  saveData(); render(); toast("Payment recorded");
}

function recordBall(type, value) {
  const s = state.scoring;
  const { history, ...snapshot } = s;
  s.history.push(JSON.stringify(snapshot));
  let label = value;
  if (type === "runs") {
    const runs = Number(value);
    s.runs += runs;
    s.legalBalls += 1;
    s.strikerRuns += runs;
    s.strikerBalls += 1;
    if (runs % 2 === 1) swapStrike(false);
    if (s.legalBalls % 6 === 0) swapStrike(false);
  } else if (type === "wicket") {
    s.wickets += 1;
    s.legalBalls += 1;
    s.strikerBalls += 1;
  } else if (type === "wide") {
    s.runs += 1; s.extras += 1;
  } else if (type === "noball") {
    s.runs += 1; s.extras += 1;
  } else if (type === "bye" || type === "legbye") {
    s.runs += 1; s.extras += 1; s.legalBalls += 1; s.strikerBalls += 1; swapStrike(false);
  }
  s.deliveries.push({ type: type === "wicket" ? "W" : type, label });
  saveData(); render();
}

function swapStrike(shouldSave = true) {
  const s = state.scoring;
  [s.striker, s.nonStriker] = [s.nonStriker, s.striker];
  [s.strikerRuns, s.nonStrikerRuns] = [s.nonStrikerRuns, s.strikerRuns];
  [s.strikerBalls, s.nonStrikerBalls] = [s.nonStrikerBalls, s.strikerBalls];
  if (shouldSave) { saveData(); render(); toast("Strike swapped"); }
}

function undoBall() {
  const s = state.scoring;
  const previous = s.history.pop();
  if (!previous) return toast("Nothing to undo");
  const remainingHistory = [...s.history];
  state.scoring = { ...JSON.parse(previous), history: remainingHistory };
  saveData(); render(); toast("Last ball undone");
}

function resetScore() {
  if (!confirm("Reset the entire innings?")) return;
  state.scoring = createDefaultScoring();
  saveData(); render(); toast("Innings reset");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.settings.groupName.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-data.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Data exported");
}

function resetAllData() {
  if (!confirm("Reset all players, matches, expenses and settings to demo values?")) return;
  state = structuredClone(seedData);
  saveData(); render(); toast("Demo data restored");
}

function openDrawer() {
  document.getElementById("mobileDrawer").classList.add("open");
  document.getElementById("drawerBackdrop").classList.add("open");
  document.getElementById("mobileDrawer").setAttribute("aria-hidden", "false");
  document.getElementById("menuButton").setAttribute("aria-expanded", "true");
}
function closeDrawer() {
  document.getElementById("mobileDrawer").classList.remove("open");
  document.getElementById("drawerBackdrop").classList.remove("open");
  document.getElementById("mobileDrawer").setAttribute("aria-hidden", "true");
  document.getElementById("menuButton").setAttribute("aria-expanded", "false");
}

document.querySelectorAll("header [data-route], .mobile-drawer [data-route], .bottom-nav [data-route]").forEach(btn => btn.addEventListener("click", () => setRoute(btn.dataset.route)));
document.getElementById("menuButton").addEventListener("click", openDrawer);
document.getElementById("closeMenuButton").addEventListener("click", closeDrawer);
document.getElementById("drawerBackdrop").addEventListener("click", closeDrawer);
window.addEventListener("hashchange", () => { route = location.hash.replace("#", "") || "dashboard"; render(); });
render();
