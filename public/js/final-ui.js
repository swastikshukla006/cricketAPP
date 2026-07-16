(() => {
  'use strict';

  const app = window.BKGXIApp;
  const router = window.BKGXIRouter;
  if (!app || !router) {
    console.error('Final UI could not start: application bridge is unavailable.');
    return;
  }

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = '') => app.escapeHtml(value);
  let squadFilter = 'all';
  let squadSearch = '';
  let bound = false;

  function data() { return app.getData(); }
  function session() { return app.getSession(); }
  function currentPlayer() { return app.getSessionPlayer(); }

  function renderSquadFilters() {
    const cards = $$('.premium-player-card', $('ourPlayerGrid'));
    let visible = 0;
    cards.forEach((card) => {
      const roleMatches = squadFilter === 'all' || card.dataset.playerRole === squadFilter;
      const searchMatches = !squadSearch || (card.dataset.playerName || '').includes(squadSearch);
      const show = roleMatches && searchMatches;
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    if ($('squadCount')) $('squadCount').textContent = `${visible} of ${cards.length} active player${cards.length === 1 ? '' : 's'}`;
    if ($('squadEmpty')) $('squadEmpty').classList.toggle('hidden', visible !== 0);
    $$('[data-squad-filter]').forEach((button) => button.classList.toggle('active', button.dataset.squadFilter === squadFilter));
  }

  function formatDateTime(match) {
    const date = app.formatDate(match.date);
    let time = match.time || 'Time TBA';
    if (match.time) {
      try { time = new Intl.DateTimeFormat('en-IN', { hour:'numeric', minute:'2-digit' }).format(new Date(`${match.date}T${match.time}`)); }
      catch { /* keep source value */ }
    }
    return `${date} · ${time}`;
  }

  function outcomeLabel(match) {
    if (match.status !== 'Completed') return 'Upcoming';
    return match.outcome === 'win' ? 'Win' : match.outcome === 'loss' ? 'Loss' : match.outcome === 'tie' ? 'Tie' : 'No result';
  }

  function renderMatchDetails(matchId = router.param()) {
    const root = $('matchDetailsContent');
    if (!root) return;
    const state = data();
    const match = state.matches.find((item) => item.id === matchId);
    if (!match) {
      root.innerHTML = `<div class="premium-empty"><img src="assets/ui-icons/matches.png" alt=""><h2>Match not found</h2><p>This fixture may have been removed.</p><button class="primary-btn" type="button" data-detail-back="matches">Return to matches</button></div>`;
      return;
    }

    const completed = match.status === 'Completed';
    const live = state.liveScoring?.matchId === match.id && state.liveScoring?.active;
    const status = live ? 'Live now' : outcomeLabel(match);
    const performances = (match.performances || []).map((performance) => ({
      ...performance,
      player: state.players.find((player) => player.id === performance.playerId)
    })).filter((row) => row.player);
    const player = currentPlayer();
    const availability = state.availability?.[match.id] || {};
    const myAvailability = player ? availability[player.id] || '' : '';
    const replies = Object.values(availability);
    const availableCount = replies.filter((value) => value === 'Available').length;
    const maybeCount = replies.filter((value) => value === 'Maybe').length;
    const unavailableCount = replies.filter((value) => value === 'Unavailable').length;
    const liveState = state.liveScoring || {};

    const scoreHtml = completed ? `
      <div class="detail-score">
        <div><small>${esc(state.settings.groupName)}</small><strong>${esc(match.ourScore || '—')}</strong></div><b>FINAL</b>
        <div><small>${esc(match.opponent)}</small><strong>${esc(match.opponentScore || '—')}</strong></div>
      </div>` : live ? `
      <div class="detail-score">
        <div><small>${esc(liveState.battingSide === 'our' ? state.settings.groupName : match.opponent)}</small><strong>${Number(liveState.runs || 0)}/${Number(liveState.wickets || 0)}</strong></div><b>LIVE</b>
        <div><small>Overs</small><strong>${Math.floor(Number(liveState.legalBalls || 0) / 6)}.${Number(liveState.legalBalls || 0) % 6}</strong></div>
      </div>` : '';

    const performanceHtml = completed ? `
      <article class="premium-surface detail-card" style="grid-column:1/-1">
        <div class="card-title-row"><div><p class="screen-kicker">Scorecard</p><h2>Player performances</h2></div><img class="feature-icon" src="assets/ui-icons/stats.png" alt=""></div>
        <div class="performance-list">
          <div class="performance-row header"><strong>Player</strong><span>Runs</span><span>Balls</span><span>Wkts</span><span>Overs</span><span>Catches</span></div>
          ${performances.length ? performances.map((row) => `<button class="performance-row" type="button" data-player-detail="${esc(row.player.id)}"><strong>${esc(row.player.name)}</strong><span>${Number(row.runs || 0)}</span><span>${Number(row.balls || 0)}</span><span>${Number(row.wickets || 0)}</span><span>${Number(row.oversBowled || 0)}</span><span>${Number(row.catches || 0)}</span></button>`).join('') : '<p class="muted">No player performances were entered for this match.</p>'}
        </div>
      </article>` : '';

    const availabilityHtml = !completed ? `
      <article class="premium-surface detail-card">
        <div class="card-title-row"><div><p class="screen-kicker">Availability</p><h2>Squad readiness</h2></div><img class="feature-icon" src="assets/ui-icons/players.png" alt=""></div>
        <div class="detail-meta-list"><div><span>Available</span><strong>${availableCount}</strong></div><div><span>Maybe</span><strong>${maybeCount}</strong></div><div><span>Unavailable</span><strong>${unavailableCount}</strong></div><div><span>Awaiting reply</span><strong>${Math.max(0, app.activePlayers().length - replies.length)}</strong></div></div>
        ${player ? `<p class="field-label">Your response</p><div class="availability-buttons"><button class="${myAvailability === 'Available' ? 'active' : ''}" data-match-availability="Available" data-match-id="${esc(match.id)}">✓ Available</button><button class="${myAvailability === 'Maybe' ? 'active' : ''}" data-match-availability="Maybe" data-match-id="${esc(match.id)}">? Maybe</button><button class="${myAvailability === 'Unavailable' ? 'active' : ''}" data-match-availability="Unavailable" data-match-id="${esc(match.id)}">× Unavailable</button></div>` : '<p class="muted">Log in to set your availability.</p>'}
      </article>` : '';

    root.innerHTML = `
      <article class="premium-surface detail-hero">
        <div class="detail-hero-head"><div><span class="detail-status ${live ? 'live' : ''}">${esc(status)}</span><h1 id="matchDetailsHeading">${esc(state.settings.groupName)} vs ${esc(match.opponent)}</h1><p>${esc(formatDateTime(match))} · ${esc(match.venue || 'Venue TBA')}</p></div><img class="heading-art" src="assets/ui-icons/${completed ? 'trophy' : live ? 'live' : 'matches'}.png" alt=""></div>
        ${scoreHtml}
        ${completed && match.resultSummary ? `<p><strong>${esc(match.resultSummary)}</strong></p>` : ''}
        <div class="detail-actions">
          ${!completed && app.canScore() ? `<button class="primary-btn" type="button" data-match-action="live" data-match-id="${esc(match.id)}">${live ? 'Open live scorer' : 'Start live scoring'}</button>` : ''}
          ${!completed && app.canManage() ? `<button class="secondary-btn" type="button" data-match-action="result" data-match-id="${esc(match.id)}">Add result</button>` : ''}
          <button class="secondary-btn" type="button" data-match-action="share" data-match-id="${esc(match.id)}">Share match</button>
          ${!completed && app.canManage() ? `<button class="secondary-btn" type="button" data-match-action="toss" data-match-id="${esc(match.id)}">Toss room</button>` : ''}
          ${app.isAdmin() ? `<button class="danger-btn" type="button" data-match-action="delete" data-match-id="${esc(match.id)}">Delete match</button>` : ''}
        </div>
      </article>
      <div class="detail-grid">
        <article class="premium-surface detail-card"><div class="card-title-row"><div><p class="screen-kicker">Match information</p><h2>Fixture details</h2></div><img class="feature-icon" src="assets/ui-icons/schedule.png" alt=""></div><div class="detail-meta-list"><div><span>Date & time</span><strong>${esc(formatDateTime(match))}</strong></div><div><span>Venue</span><strong>${esc(match.venue || 'TBA')}</strong></div><div><span>Format</span><strong>${Number(match.overs || 0)} overs</strong></div><div><span>Ball</span><strong>${esc(match.ballType || 'Tennis')}</strong></div><div><span>Toss</span><strong>${esc(match.tossWinner ? `${match.tossWinner} · ${match.tossDecision || ''}` : 'Not recorded')}</strong></div></div></article>
        <article class="premium-surface detail-card"><div class="card-title-row"><div><p class="screen-kicker">Match note</p><h2>Team briefing</h2></div><img class="feature-icon" src="assets/ui-icons/web.png" alt=""></div><p>${esc(match.notes || (completed ? 'No additional match notes were saved.' : 'No special instructions have been added.'))}</p>${completed ? `<div class="detail-meta-list"><div><span>Result</span><strong>${esc(outcomeLabel(match))}</strong></div><div><span>Summary</span><strong>${esc(match.resultSummary || 'Completed')}</strong></div></div>` : ''}</article>
        ${availabilityHtml}
        ${performanceHtml}
      </div>`;
  }

  function renderPlayerDetails(playerId = router.param()) {
    const root = $('playerDetailsContent');
    if (!root) return;
    const state = data();
    const player = state.players.find((item) => item.id === playerId && item.status !== 'removed');
    if (!player) {
      root.innerHTML = `<div class="premium-empty"><img src="assets/ui-icons/profile.png" alt=""><h2>Player not found</h2><p>This player may no longer be active.</p><button class="primary-btn" type="button" data-detail-back="squad">Return to squad</button></div>`;
      return;
    }
    const stat = app.calculatePlayerStats().find((row) => row.player.id === player.id) || { matches:0, runs:0, wickets:0, catches:0, strikeRate:0, economy:0, ballsBowled:0, highScore:0, bestWickets:0 };
    const recent = state.matches.filter((match) => match.status === 'Completed' && (match.performances || []).some((item) => item.playerId === player.id)).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    const canEdit = app.isAdmin() || currentPlayer()?.id === player.id;
    const avatar = player.photo ? `<div class="profile-photo"><img src="${app.safeImage(player.photo)}" alt="${esc(player.name)}"></div>` : `<div class="profile-photo"><span>${esc(app.initials(player.name))}</span></div>`;
    root.innerHTML = `
      <article class="premium-surface player-detail-hero">
        ${avatar}<div><span class="role-chip">${esc(app.leadershipLabel(player.id))}</span><h1 id="playerDetailsHeading">${esc(player.name)}</h1><p>${esc(player.role)} · ${esc(player.className || 'School Squad')}</p><p>${esc(player.note || 'No player note has been added.')}</p>${canEdit ? `<button class="secondary-btn" type="button" data-player-action="edit" data-player-id="${esc(player.id)}">Edit profile</button>` : ''}</div><strong class="player-detail-number">#${esc(player.jersey)}</strong>
      </article>
      <section class="player-detail-stats" aria-label="Player statistics"><article><span>Matches</span><strong>${stat.matches}</strong></article><article><span>Runs</span><strong>${stat.runs}</strong></article><article><span>Wickets</span><strong>${stat.wickets}</strong></article><article><span>Catches</span><strong>${stat.catches}</strong></article><article><span>Strike rate</span><strong>${Number(stat.strikeRate || 0).toFixed(1)}</strong></article><article><span>Economy</span><strong>${stat.ballsBowled ? Number(stat.economy).toFixed(2) : '—'}</strong></article></section>
      <div class="detail-grid">
        <article class="premium-surface detail-card"><div class="card-title-row"><div><p class="screen-kicker">Playing profile</p><h2>Cricket details</h2></div><img class="feature-icon" src="assets/ui-icons/profile.png" alt=""></div><div class="detail-meta-list"><div><span>Jersey</span><strong>#${esc(player.jersey)}</strong></div><div><span>Batting</span><strong>${esc(player.battingStyle || 'Not added')}</strong></div><div><span>Bowling</span><strong>${esc(player.bowlingStyle || 'Not added')}</strong></div><div><span>Phone</span><strong>${esc(app.displayPhone(player) || 'Not added')}</strong></div><div><span>Best score</span><strong>${Number(stat.highScore || 0)}</strong></div><div><span>Best wickets</span><strong>${Number(stat.bestWickets || 0)}</strong></div></div></article>
        <article class="premium-surface detail-card"><div class="card-title-row"><div><p class="screen-kicker">Recent matches</p><h2>Latest performances</h2></div><img class="feature-icon" src="assets/ui-icons/replay.png" alt=""></div><div class="performance-list">${recent.length ? recent.map((match) => { const perf=(match.performances || []).find((item)=>item.playerId===player.id)||{}; return `<button type="button" class="performance-row" style="grid-template-columns:1fr repeat(3,.35fr)" data-scorecard="${esc(match.id)}"><strong>vs ${esc(match.opponent)}<small style="display:block;color:var(--app-muted)">${esc(app.formatDate(match.date))}</small></strong><span>${Number(perf.runs||0)} R</span><span>${Number(perf.wickets||0)} W</span><span>${Number(perf.catches||0)} C</span></button>`; }).join('') : '<p class="muted">No uploaded performances yet.</p>'}</div></article>
      </div>`;
  }

  function renderAdminOverview() {
    if (!app.isAdmin()) return;
    const state = data();
    if ($('adminPlayerCount')) $('adminPlayerCount').textContent = app.activePlayers().length;
    if ($('adminUpcomingCount')) $('adminUpcomingCount').textContent = state.matches.filter((match) => match.status === 'Upcoming').length;
    if ($('adminPendingCount')) $('adminPendingCount').textContent = state.joinRequests.length;
    if ($('adminCompletedCount')) $('adminCompletedCount').textContent = state.matches.filter((match) => match.status === 'Completed').length;
  }

  function activateAdminPanel(panel = 'overview') {
    const allowed = ['overview','teams','players','settings'];
    const target = allowed.includes(panel) ? panel : 'overview';
    $$('[data-admin-panel]').forEach((section) => section.classList.toggle('active', section.dataset.adminPanel === target));
    $$('[data-admin-panel-target]').forEach((button) => button.classList.toggle('active', button.dataset.adminPanelTarget === target));
  }

  function panelFromRoute(route) {
    if (route === 'admin-teams') return 'teams';
    if (route === 'admin-players') return 'players';
    if (route === 'admin-settings') return 'settings';
    return 'overview';
  }

  function renderUnreadBadge() {
    const state = data();
    const badge = $('chatNavBadge');
    if (!badge) return;
    const latest = state.chat[state.chat.length - 1]?.createdAt || '';
    const lastSeen = localStorage.getItem('bkgxiChatLastSeen') || '';
    if (router.current() === 'chat') {
      if (latest) localStorage.setItem('bkgxiChatLastSeen', latest);
      badge.classList.remove('show');
      return;
    }
    const unread = state.chat.filter((message) => !lastSeen || new Date(message.createdAt) > new Date(lastSeen)).length;
    badge.textContent = unread > 9 ? '9+' : String(unread);
    badge.classList.toggle('show', unread > 0);
  }

  /* Boundary Blitz */
  let leaderboardLoading = false;

  async function renderGameLeaderboardPreview() {
    const root = $('homeGameLeader');
    if (!root || leaderboardLoading) return;
    leaderboardLoading = true;
    try {
      const response = await fetch('/api/game-leaderboard?limit=5', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Leaderboard unavailable');
      const leaders = Array.isArray(payload.scores) ? payload.scores : [];
      root.innerHTML = leaders.length
        ? leaders.map((entry, index) => `<div class="mini-game-rank"><b>${index + 1}</b><span>${esc(entry.name || 'Player')}</span><strong>${Number(entry.score || 0)}</strong></div>`).join('')
        : '<p class="muted">No score yet. Be the first player on the board.</p>';
    } catch (error) {
      root.innerHTML = '<p class="muted">Leaderboard will appear when the connection is restored.</p>';
    } finally {
      leaderboardLoading = false;
    }
  }

  function shareMatch(match) {
    const state=data();const text=match.status==='Completed'?`${state.settings.groupName} vs ${match.opponent}: ${match.ourScore || '—'} / ${match.opponentScore || '—'} — ${match.resultSummary || 'Match completed'}`:`${state.settings.groupName} vs ${match.opponent} on ${formatDateTime(match)} at ${match.venue || 'venue TBA'} (${match.overs || 0} overs).`;
    if(navigator.share)return navigator.share({title:`${state.settings.groupName} match`,text}).catch(()=>undefined);
    if(navigator.clipboard)return navigator.clipboard.writeText(text).then(()=>app.toast('Match details copied'));
    window.prompt('Copy match details',text);
  }

  function renderExtras(){
    renderSquadFilters();renderAdminOverview();renderUnreadBadge();renderGameLeaderboardPreview();
    const route=router.current();if(route==='match')renderMatchDetails();if(route==='player')renderPlayerDetails();if(route.startsWith('admin'))activateAdminPanel(panelFromRoute(route));
    const announcementIcon=document.querySelector('.home-announcement-icon');if(announcementIcon)announcementIcon.innerHTML='<img src="assets/ui-icons/web.png" alt="">';
  }

  function bindFinalEvents(){
    if(bound)return;bound=true;
    $('squadSearch')?.addEventListener('input',(event)=>{squadSearch=event.target.value.trim().toLowerCase();renderSquadFilters();});
    document.addEventListener('click',(event)=>{
      const matchCard=event.target.closest('[data-match-detail]');
      if(matchCard&&!event.target.closest('button,a')){router.navigate('match',matchCard.dataset.matchDetail);return;}
      const target=event.target.closest('button,a');if(!target)return;
      if(target.dataset.squadFilter){squadFilter=target.dataset.squadFilter;renderSquadFilters();return;}
      if(target.dataset.squadAction==='stats'){router.navigate('stats');return;}
      if(target.dataset.squadAction==='practice'){router.navigate('practice');return;}
      if(target.dataset.detailBack){router.navigate(target.dataset.detailBack);return;}
      if(target.dataset.adminPanelTarget){const panel=target.dataset.adminPanelTarget;const routes={overview:'admin',teams:'admin-teams',players:'admin-players',settings:'admin-settings'};router.navigate(routes[panel]);return;}
      if(target.dataset.adminAction){const action=target.dataset.adminAction;if(action==='schedule')app.openModal('scheduleModal');else if(action==='live')app.openLiveSetup();else if(action==='result')app.openResultModal();else if(action==='game')window.location.href='/game.html';else router.navigate(action);return;}
      if(target.id==='profileQuickEditBtn'){app.openProfileModal();return;}
      if(target.id==='profilePhotoShortcut'){app.openProfileModal();$('profilePhoto')?.click();return;}
      if(target.dataset.profileAction){const action=target.dataset.profileAction;if(action==='game')window.location.href='/game.html';else if(action==='theme')app.toggleTheme();else if(action==='notifications'){router.navigate('chat');setTimeout(()=>{$('chatToolsPanel')?.classList.add('open');},100);}else if(action==='admin'){router.navigate(app.isAdmin()?'admin':'live-scoring');}return;}
      if(target.id==='chatInfoToggle'){$('chatToolsPanel')?.classList.toggle('open');return;}
      if(target.dataset.matchAvailability){const player=currentPlayer();if(!player)return app.openModal('loginModal');const state=data();const match=state.matches.find((item)=>item.id===target.dataset.matchId);const value=target.dataset.matchAvailability;state.availability[target.dataset.matchId]=state.availability[target.dataset.matchId]||{};state.availability[target.dataset.matchId][player.id]=value;app.saveData();if(match)app.sendPushNotification?.({title:'Availability updated',body:`${player.name} is ${value.toLowerCase()} for ${state.settings.groupName} vs ${match.opponent}.`,url:`/#/match/${match.id}`,tag:`availability-${match.id}-${player.id}`,type:'availability',audience:'leadership'});app.renderAll();renderMatchDetails(target.dataset.matchId);app.toast(`Availability: ${value}`);return;}
      if(target.dataset.matchAction){const state=data(),match=state.matches.find((item)=>item.id===target.dataset.matchId);if(!match)return;const action=target.dataset.matchAction;if(action==='live')app.openLiveSetup(match.id);else if(action==='result')app.openResultModal(match.id);else if(action==='toss'){if(!app.canManage())return app.toast('Toss is available only to the captain and vice-captain.');router.navigate('toss');}else if(action==='share')shareMatch(match);else if(action==='delete')app.askConfirm('Delete this match?','The fixture and its scorecard will be removed.',()=>{state.matches=state.matches.filter((item)=>item.id!==match.id);app.saveData();app.sendPushNotification?.({title:match.status==='Upcoming'?'Match cancelled':'Match removed',body:`${state.settings.groupName} vs ${match.opponent} was removed from the app.`,url:'/#/matches',tag:`match-removed-${match.id}`,type:'match'});app.renderAll();router.navigate('matches');app.toast('Match deleted');});return;}
      if(target.dataset.playerAction==='edit'){const player=currentPlayer();if(app.isAdmin())app.openPlayerModal(target.dataset.playerId);else if(player?.id===target.dataset.playerId)app.openProfileModal();return;}
    });

    window.addEventListener('bkgxi:routechange',(event)=>{
      const {route,param}=event.detail||{};
      if(route==='match')renderMatchDetails(param);if(route==='player')renderPlayerDetails(param);if(route.startsWith('admin'))activateAdminPanel(panelFromRoute(route));
      if(route==='chat'){const latest=data().chat.at(-1)?.createdAt||'';if(latest)localStorage.setItem('bkgxiChatLastSeen',latest);$('chatToolsPanel')?.classList.remove('open');}
      renderUnreadBadge();
    });
    window.addEventListener('bkgxi:render',renderExtras);
  }

  function setupUpdatePrompt(){
    if(!('serviceWorker' in navigator))return;
    navigator.serviceWorker.ready.then((registration)=>{
      const showUpdate=(worker)=>{
        if(!worker||!navigator.serviceWorker.controller)return;
        let bar=$('appUpdateBar');
        if(!bar){
          bar=document.createElement('div');bar.id='appUpdateBar';bar.className='app-update-bar';
          bar.innerHTML='<span>A fresh version is ready.</span><button type="button">Update now</button>';document.body.appendChild(bar);
          bar.querySelector('button').addEventListener('click',()=>{
            const waiting=registration.waiting||worker;
            let reloading=false;
            navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;window.location.reload();},{once:true});
            waiting?.postMessage?.({type:'SKIP_WAITING'});
            setTimeout(()=>window.location.reload(),1800);
          });
        }
        bar.classList.add('show');
      };
      if(registration.waiting)showUpdate(registration.waiting);
      registration.update().catch(()=>undefined);
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;if(!worker)return;
        worker.addEventListener('statechange',()=>{if(worker.state==='installed')showUpdate(worker);});
      });
    }).catch(()=>undefined);
  }

  bindFinalEvents();
  setupUpdatePrompt();
  setTimeout(renderExtras,0);
})();
