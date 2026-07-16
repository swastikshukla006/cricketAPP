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
          ${!completed ? `<button class="secondary-btn" type="button" data-match-action="toss" data-match-id="${esc(match.id)}">Toss room</button>` : ''}
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
  const game = {
    canvas:null, ctx:null, running:false, animation:0, lastTime:0, score:0, lives:3, batX:295,
    batWidth:130, batHeight:24, batY:735, left:false, right:false, ball:null, particles:[], message:'', messageLife:0
  };

  function resetBall(speedBoost = 0) {
    game.ball = { x:75 + Math.random()*570, y:-30, r:16, vy:245 + Math.min(250, game.score*3.1) + speedBoost, spin:(Math.random()-.5)*7 };
  }

  function resizeGameGeometry() {
    if (!game.canvas) return;
    game.batY = game.canvas.height - 78;
    game.batX = Math.min(game.canvas.width - game.batWidth, Math.max(0, game.batX));
  }

  function drawRoundedRect(ctx,x,y,w,h,r,fill,stroke) {
    ctx.beginPath(); ctx.roundRect(x,y,w,h,r); if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
  }

  function drawGame() {
    const canvas=game.canvas, ctx=game.ctx; if(!canvas||!ctx)return;
    const w=canvas.width,h=canvas.height;
    const dark=document.body.classList.contains('dark');
    const sky=ctx.createLinearGradient(0,0,0,h*.38);sky.addColorStop(0,dark?'#13283b':'#8ed4ff');sky.addColorStop(1,dark?'#254759':'#d7f1ff');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.38);
    const grass=ctx.createLinearGradient(0,h*.38,0,h);grass.addColorStop(0,dark?'#24482d':'#73b85e');grass.addColorStop(1,dark?'#132b1c':'#3e8d43');ctx.fillStyle=grass;ctx.fillRect(0,h*.38,w,h*.62);
    // crowd and boundary
    ctx.fillStyle=dark?'#101923':'#30475b';ctx.fillRect(0,h*.29,w,38);
    for(let x=8;x<w;x+=18){ctx.fillStyle=`hsl(${(x*3)%360} 55% ${dark?45:62}%)`;ctx.beginPath();ctx.arc(x,h*.31,5,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='rgba(255,255,255,.72)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(w/2,h*.68,w*.46,h*.25,0,0,Math.PI*2);ctx.stroke();
    // pitch
    ctx.fillStyle=dark?'#8b754f':'#d9bc82';ctx.fillRect(w*.39,h*.38,w*.22,h*.55);
    for(let y=h*.4;y<h*.9;y+=26){ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(w*.39,y,w*.22,10);}
    // wickets
    ctx.strokeStyle=dark?'#eee2be':'#fff4d6';ctx.lineWidth=7;ctx.lineCap='round';
    for(const x of [w/2-20,w/2,w/2+20]){ctx.beginPath();ctx.moveTo(x,h*.42);ctx.lineTo(x,h*.50);ctx.stroke();}
    ctx.beginPath();ctx.moveTo(w/2-26,h*.43);ctx.lineTo(w/2+26,h*.43);ctx.stroke();
    // bat
    const batGradient=ctx.createLinearGradient(game.batX,0,game.batX+game.batWidth,0);batGradient.addColorStop(0,'#d9a95c');batGradient.addColorStop(.5,'#fff0b9');batGradient.addColorStop(1,'#c98b3c');
    drawRoundedRect(ctx,game.batX,game.batY,game.batWidth,game.batHeight,10,batGradient,'rgba(60,35,8,.4)');
    ctx.fillStyle='#2c5b38';ctx.fillRect(game.batX+game.batWidth*.38,game.batY-25,game.batWidth*.24,28);
    // ball
    if(game.ball){ctx.save();ctx.translate(game.ball.x,game.ball.y);ctx.rotate(game.ball.spin);ctx.fillStyle='#e6433d';ctx.beginPath();ctx.arc(0,0,game.ball.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,game.ball.r*.68,-1.15,1.15);ctx.stroke();ctx.beginPath();ctx.arc(0,0,game.ball.r*.68,Math.PI-1.15,Math.PI+1.15);ctx.stroke();ctx.restore();}
    // particles
    game.particles.forEach((p)=>{ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    if(!game.running){ctx.fillStyle='rgba(5,18,10,.48)';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='800 36px DM Sans';ctx.fillText(game.score?'Innings Over':'Boundary Blitz',w/2,h/2-16);ctx.font='600 18px DM Sans';ctx.fillText(game.score?`Final score: ${game.score}`:'Move the bat and time the ball',w/2,h/2+22);}
    if(game.messageLife>0){ctx.globalAlpha=Math.min(1,game.messageLife*2);ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=5;ctx.textAlign='center';ctx.font='900 46px DM Sans';ctx.strokeText(game.message,w/2,h*.24);ctx.fillText(game.message,w/2,h*.24);ctx.globalAlpha=1;}
  }

  function spawnParticles(x,y,points){
    const colors=points===6?['#ffd95a','#ff9e4b','#fff4b7']:['#ffffff','#d6ffae','#ffe891'];
    for(let i=0;i<18;i++)game.particles.push({x,y,vx:(Math.random()-.5)*280,vy:-80-Math.random()*240,r:3+Math.random()*5,life:1,color:colors[i%colors.length]});
  }

  function updateGame(dt) {
    if (!game.running || !game.ball) return;
    const moveSpeed=430;
    if(game.left)game.batX-=moveSpeed*dt;if(game.right)game.batX+=moveSpeed*dt;
    game.batX=Math.max(8,Math.min(game.canvas.width-game.batWidth-8,game.batX));
    game.ball.y+=game.ball.vy*dt;game.ball.spin+=dt*3;
    const hitY=game.batY-game.ball.r;
    if(game.ball.y>=hitY&&game.ball.y<=game.batY+game.batHeight&&game.ball.x>=game.batX-game.ball.r&&game.ball.x<=game.batX+game.batWidth+game.ball.r){
      const centre=game.batX+game.batWidth/2;const offset=Math.abs(game.ball.x-centre)/(game.batWidth/2);const points=offset<.25?6:offset<.62?4:2;
      game.score+=points;game.message=`+${points}`;game.messageLife=.75;spawnParticles(game.ball.x,game.batY,points);resetBall(18);
      updateGameHud();
    } else if(game.ball.y>game.canvas.height+game.ball.r){
      game.lives-=1;game.message='Miss';game.messageLife=.75;updateGameHud();
      if(game.lives<=0)endGame();else resetBall();
    }
    game.particles.forEach((p)=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=360*dt;p.life-=dt*1.5;});game.particles=game.particles.filter((p)=>p.life>0);
    game.messageLife=Math.max(0,game.messageLife-dt);
  }

  function gameLoop(time){
    const dt=Math.min(.034,(time-game.lastTime)/1000||0);game.lastTime=time;updateGame(dt);drawGame();if(game.running)game.animation=requestAnimationFrame(gameLoop);
  }

  function updateGameHud(){
    if($('gameScore'))$('gameScore').textContent=game.score;if($('gameLives'))$('gameLives').textContent=game.lives;
    const localBest=Number(localStorage.getItem('bkgxiBoundaryBlitzBest')||0);if($('gamePersonalBest'))$('gamePersonalBest').textContent=Math.max(localBest,game.score);
  }

  function startGame(){
    if(!game.canvas)return;cancelAnimationFrame(game.animation);game.running=true;game.score=0;game.lives=3;game.batX=(game.canvas.width-game.batWidth)/2;game.particles=[];game.message='';game.messageLife=0;resetBall();updateGameHud();$('gameStatus').textContent='Use the arrows, keyboard or drag the bat. Sweet-spot hits score six.';$('gameStartBtn').textContent='Restart';game.lastTime=performance.now();game.animation=requestAnimationFrame(gameLoop);
  }

  async function endGame(){
    game.running=false;cancelAnimationFrame(game.animation);drawGame();const previous=Number(localStorage.getItem('bkgxiBoundaryBlitzBest')||0);if(game.score>previous)localStorage.setItem('bkgxiBoundaryBlitzBest',String(game.score));updateGameHud();
    const player=currentPlayer();
    if(player&&game.score>0){const state=data();state.gameScores=Array.isArray(state.gameScores)?state.gameScores:[];state.gameScores.push({id:app.uid('game'),playerId:player.id,playerName:player.name,score:game.score,createdAt:new Date().toISOString()});state.gameScores=state.gameScores.sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,50);try{await app.saveData();}catch{/* saveData already reports failures */}}
    renderGameLeaderboard();$('gameStatus').textContent=player?`Score saved: ${game.score}. Press Restart for another innings.`:`Final score: ${game.score}. Log in to join the team leaderboard.`;
  }

  function renderGameLeaderboard(){
    const state=data();const scores=Array.isArray(state.gameScores)?state.gameScores:[];const bestByPlayer=new Map();scores.forEach((item)=>{const key=item.playerId||item.playerName;if(!bestByPlayer.has(key)||Number(item.score)>Number(bestByPlayer.get(key).score))bestByPlayer.set(key,item);});const leaders=[...bestByPlayer.values()].sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,10);
    $('gameLeaderboard').innerHTML=leaders.length?leaders.map((entry,index)=>`<div class="game-rank"><b>${index+1}</b><div><strong>${esc(entry.playerName||'Player')}</strong><small>${entry.createdAt?esc(app.formatDate(entry.createdAt.slice(0,10))):'Team score'}</small></div><span>${Number(entry.score||0)}</span></div>`).join(''):'<div class="premium-empty" style="padding:24px 12px"><img src="assets/ui-icons/trophy.png" alt=""><h2>No high scores yet</h2><p>Be the first player on the board.</p></div>';
    updateGameHud();
  }

  function initGame(){
    game.canvas=$('gameCanvas');if(!game.canvas)return;game.ctx=game.canvas.getContext('2d');resizeGameGeometry();resetBall();drawGame();renderGameLeaderboard();
    const move=(direction,active)=>{game[direction]=active;};
    [['gameLeftBtn','left'],['gameRightBtn','right']].forEach(([id,direction])=>{const button=$(id);button.addEventListener('pointerdown',(e)=>{e.preventDefault();move(direction,true);button.setPointerCapture?.(e.pointerId);});['pointerup','pointercancel','pointerleave'].forEach((event)=>button.addEventListener(event,()=>move(direction,false)));});
    $('gameStartBtn').addEventListener('click',startGame);
    game.canvas.addEventListener('pointermove',(event)=>{if(!game.running||event.buttons===0)return;const rect=game.canvas.getBoundingClientRect();const x=(event.clientX-rect.left)*(game.canvas.width/rect.width);game.batX=Math.max(8,Math.min(game.canvas.width-game.batWidth-8,x-game.batWidth/2));});
    game.canvas.addEventListener('pointerdown',(event)=>{if(!game.running)return;const rect=game.canvas.getBoundingClientRect();const x=(event.clientX-rect.left)*(game.canvas.width/rect.width);game.batX=Math.max(8,Math.min(game.canvas.width-game.batWidth-8,x-game.batWidth/2));game.canvas.setPointerCapture?.(event.pointerId);});
    window.addEventListener('keydown',(event)=>{if(router.current()!=='game')return;if(event.key==='ArrowLeft'){game.left=true;event.preventDefault();}if(event.key==='ArrowRight'){game.right=true;event.preventDefault();}if(event.key===' '&&!game.running){startGame();event.preventDefault();}});
    window.addEventListener('keyup',(event)=>{if(event.key==='ArrowLeft')game.left=false;if(event.key==='ArrowRight')game.right=false;});
  }

  function shareMatch(match) {
    const state=data();const text=match.status==='Completed'?`${state.settings.groupName} vs ${match.opponent}: ${match.ourScore || '—'} / ${match.opponentScore || '—'} — ${match.resultSummary || 'Match completed'}`:`${state.settings.groupName} vs ${match.opponent} on ${formatDateTime(match)} at ${match.venue || 'venue TBA'} (${match.overs || 0} overs).`;
    if(navigator.share)return navigator.share({title:`${state.settings.groupName} match`,text}).catch(()=>undefined);
    if(navigator.clipboard)return navigator.clipboard.writeText(text).then(()=>app.toast('Match details copied'));
    window.prompt('Copy match details',text);
  }

  function renderExtras(){
    renderSquadFilters();renderAdminOverview();renderUnreadBadge();renderGameLeaderboard();
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
      if(target.dataset.adminAction){const action=target.dataset.adminAction;if(action==='schedule')app.openModal('scheduleModal');else if(action==='live')app.openLiveSetup();else if(action==='result')app.openResultModal();else router.navigate(action);return;}
      if(target.id==='profileQuickEditBtn'||target.id==='profilePhotoShortcut'){app.openProfileModal();return;}
      if(target.dataset.profileAction){const action=target.dataset.profileAction;if(action==='game')router.navigate('game');else if(action==='theme')app.toggleTheme();else if(action==='notifications'){router.navigate('chat');setTimeout(()=>{$('chatToolsPanel')?.classList.add('open');},100);}else if(action==='admin'){router.navigate(app.isAdmin()?'admin':'live-scoring');}return;}
      if(target.id==='chatInfoToggle'){$('chatToolsPanel')?.classList.toggle('open');return;}
      if(target.dataset.matchAvailability){const player=currentPlayer();if(!player)return app.openModal('loginModal');const state=data();state.availability[target.dataset.matchId]=state.availability[target.dataset.matchId]||{};state.availability[target.dataset.matchId][player.id]=target.dataset.matchAvailability;app.saveData();app.renderAll();renderMatchDetails(target.dataset.matchId);app.toast(`Availability: ${target.dataset.matchAvailability}`);return;}
      if(target.dataset.matchAction){const state=data(),match=state.matches.find((item)=>item.id===target.dataset.matchId);if(!match)return;const action=target.dataset.matchAction;if(action==='live')app.openLiveSetup(match.id);else if(action==='result')app.openResultModal(match.id);else if(action==='toss')router.navigate('toss');else if(action==='share')shareMatch(match);else if(action==='delete')app.askConfirm('Delete this match?','The fixture and its scorecard will be removed.',()=>{state.matches=state.matches.filter((item)=>item.id!==match.id);app.saveData();app.renderAll();router.navigate('matches');app.toast('Match deleted');});return;}
      if(target.dataset.playerAction==='edit'){const player=currentPlayer();if(app.isAdmin())app.openPlayerModal(target.dataset.playerId);else if(player?.id===target.dataset.playerId)app.openProfileModal();return;}
    });

    window.addEventListener('bkgxi:routechange',(event)=>{
      const {route,param}=event.detail||{};
      if(route==='match')renderMatchDetails(param);if(route==='player')renderPlayerDetails(param);if(route.startsWith('admin'))activateAdminPanel(panelFromRoute(route));
      if(route==='chat'){const latest=data().chat.at(-1)?.createdAt||'';if(latest)localStorage.setItem('bkgxiChatLastSeen',latest);$('chatToolsPanel')?.classList.remove('open');}
      if(route!=='game'&&game.running){game.running=false;cancelAnimationFrame(game.animation);drawGame();$('gameStatus').textContent='Game paused. Press Restart to play again.';}
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
  initGame();
  setupUpdatePrompt();
  setTimeout(renderExtras,0);
})();
