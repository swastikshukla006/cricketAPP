(() => {
'use strict';
const $ = s => document.querySelector(s);
const screens = [...document.querySelectorAll('.screen')];
const canvas = $('#gameCanvas');
const ctx = canvas.getContext('2d');
const MAX_BALLS = 12, MAX_WICKETS = 3;
let state = null, raf = 0, lastTime = 0, soundOn = true, audioCtx = null;
let identity = { playerId: '', name: '' };
let badgeTimer = 0, boardReturnScreen = null;

const els = {
  menu: $('#menuScreen'), game: $('#gameScreen'), result: $('#resultScreen'), board: $('#leaderboardScreen'),
  playerName: $('#playerName'), personalBest: $('#personalBest'), menuMessage: $('#menuMessage'),
  score: $('#score'), balls: $('#balls'), wickets: $('#wickets'), multiplier: $('#multiplier'),
  marker: $('#timingMarker'), burst: $('#resultBurst'), countdown: $('#countdown'), feed: $('#inningsFeed'),
  pauseOverlay: $('#pauseOverlay'), finalScore: $('#finalScore'), finalBoundaries: $('#finalBoundaries'),
  finalCombo: $('#finalCombo'), finalPerfects: $('#finalPerfects'), resultTitle: $('#resultTitle'),
  saveStatus: $('#saveStatus'), boardList: $('#leaderboardList'),
  identityHint: $('#playerIdentityHint'), networkBadge: $('#networkBadge')
};

function show(screen) {
  screens.forEach(s => s.classList.toggle('active', s === screen));
  window.scrollTo({top:0, behavior:'smooth'});
}
function savedName(){ return identity.name || localStorage.getItem('bb_player_name') || ''; }
function readSession(){
  for(const key of ['ballKhoGayiXISessionV4','ballKhoGayiXISessionV3']){
    for(const store of [localStorage,sessionStorage]){
      try{const value=JSON.parse(store.getItem(key)||'null');if(value)return value}catch{}
    }
  }
  return null;
}
async function loadIdentity(){
  const session=readSession();
  if(!session)return;
  try{
    const response=await fetch('/api/state',{cache:'no-store'});if(!response.ok)throw 0;
    const payload=await response.json(),stateData=payload.state||{};
    if(session.type==='player'){const player=(stateData.players||[]).find(x=>x.id===session.playerId&&x.status!=='removed');if(player)identity={playerId:player.id,name:player.name};}
    else if(session.type==='admin')identity={playerId:'admin',name:stateData.settings?.adminName||'Administrator'};
    if(identity.name){els.playerName.value=identity.name;els.playerName.readOnly=true;els.identityHint.textContent=`Playing as ${identity.name}. Your best score will appear on the team leaderboard.`;}
  }catch{showBadge('Could not load player profile. You can still play as a guest.','offline')}
}
function showBadge(message,type=''){
  if(!els.networkBadge)return;clearTimeout(badgeTimer);els.networkBadge.textContent=message;els.networkBadge.className=`network-badge show ${type}`.trim();badgeTimer=setTimeout(()=>els.networkBadge.classList.remove('show'),2800);
}
function getLocalScores(){ try{return JSON.parse(localStorage.getItem('bb_scores')||'[]')}catch{return []} }
function setLocalScores(v){ localStorage.setItem('bb_scores', JSON.stringify(v.slice(0,50))); }
function updateBest(){
  const best = Math.max(0, ...getLocalScores().map(x=>Number(x.score)||0));
  els.personalBest.textContent = best;
}
function resizeCanvas(){
  const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio||1,2);
  canvas.width = Math.round(r.width*dpr); canvas.height = Math.round(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function beep(freq=440,duration=.08,type='sine',volume=.05){
  if(!soundOn) return;
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.frequency.value=freq;o.type=type;g.gain.value=volume;o.connect(g);g.connect(audioCtx.destination);
    o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);o.stop(audioCtx.currentTime+duration);
  }catch{}
}
function newState(name){
  return {name,score:0,balls:0,wickets:0,combo:0,bestCombo:1,multiplier:1,boundaries:0,perfects:0,
    phase:'countdown',countdown:3,delivery:null,feed:[],paused:false,ended:false,lastTs:performance.now()};
}
function startGame(){
  const name=els.playerName.value.trim().replace(/[<>]/g,'').slice(0,24);
  if(!name){els.menuMessage.textContent='Enter your player name first.';els.playerName.focus();return}
  localStorage.setItem('bb_player_name',name); els.menuMessage.textContent='';
  state=newState(name); show(els.game); resizeCanvas(); renderHud(); els.feed.innerHTML='';
  let n=3; els.countdown.textContent=n;
  const timer=setInterval(()=>{n--; if(n>0){els.countdown.textContent=n;beep(300+n*80)} else if(n===0){els.countdown.textContent='PLAY!';beep(720,.12,'square')}
    else{clearInterval(timer);els.countdown.textContent='';state.phase='ready';spawnDelivery();}},700);
  cancelAnimationFrame(raf); lastTime=performance.now(); raf=requestAnimationFrame(loop);
}
function spawnDelivery(){
  if(!state || state.ended) return;
  state.phase='delivery';
  const speed=.42+Math.random()*.28 + state.balls*.009;
  state.delivery={progress:0,speed,curve:(Math.random()-.5)*.22,bounce:.54+Math.random()*.2,swung:false};
}
function swing(){
  if(!state || state.paused || state.phase!=='delivery' || state.delivery.swung) return;
  state.delivery.swung=true;
  const p=state.delivery.progress, distance=Math.abs(p-.5);
  let result, runs=0, cls='';
  const luck=Math.random();
  if(distance<=.045){result='PERFECT 6!';runs=6;state.perfects++;cls='boundary';beep(900,.18,'square',.07)}
  else if(distance<=.105){result=luck<.62?'FOUR!':'SIX!';runs=result[0]==='F'?4:6;cls='boundary';beep(760,.14,'square',.065)}
  else if(distance<=.19){runs=luck<.25?4:(luck<.7?2:1);result=runs===4?'FOUR!':`${runs} RUN${runs>1?'S':''}`;cls=runs===4?'boundary':'';beep(560,.1)}
  else if(distance<=.28){runs=luck<.55?1:0;result=runs?'SINGLE':'DOT BALL';beep(runs?420:210,.09)}
  else if(luck<.45){result='WICKET!';cls='wicket';state.wickets++;state.combo=0;state.multiplier=1;beep(120,.35,'sawtooth',.07)}
  else{result='MISSED';runs=0;state.combo=0;state.multiplier=1;beep(170,.13)}
  if(runs>=4){
    state.boundaries++; state.combo++; state.multiplier=Math.min(4,1+Math.floor(state.combo/2));
    state.bestCombo=Math.max(state.bestCombo,state.multiplier);
  } else if(runs<1){state.combo=0;state.multiplier=1}
  const awarded=runs*state.multiplier; state.score+=awarded; state.balls++;
  recordBall(runs,cls,awarded,runs!==awarded); showBurst(result+(runs&&awarded!==runs?` ×${state.multiplier}`:''));
  renderHud(); state.phase='result';
  setTimeout(()=>{if(state.wickets>=MAX_WICKETS||state.balls>=MAX_BALLS)endGame();else spawnDelivery()},750);
}
function autoMiss(){
  if(!state || state.phase!=='delivery') return;
  state.delivery.swung=true; state.balls++; state.combo=0;state.multiplier=1;
  const wicket=Math.random()<.32;if(wicket)state.wickets++;
  recordBall(0,wicket?'wicket':'',0,false,wicket?'W':'•');showBurst(wicket?'BOWLED!':'TOO LATE');beep(wicket?120:180,.18,'sawtooth');
  renderHud();state.phase='result';
  setTimeout(()=>{if(state.wickets>=MAX_WICKETS||state.balls>=MAX_BALLS)endGame();else spawnDelivery()},750);
}
function recordBall(runs,cls,awarded,multi,label){
  const text=label || (cls==='wicket'?'W':runs);
  state.feed.push({text,cls,title:multi?`${runs} × multiplier = ${awarded}`:`${awarded} run(s)`});
  els.feed.innerHTML=state.feed.map(x=>`<span class="ball-chip ${x.cls}" title="${x.title}">${x.text}</span>`).join('');
  els.feed.scrollLeft=els.feed.scrollWidth;
}
function showBurst(text){els.burst.textContent=text;els.burst.classList.remove('show');void els.burst.offsetWidth;els.burst.classList.add('show')}
function renderHud(){
  els.score.textContent=state.score;els.balls.textContent=`${state.balls}/${MAX_BALLS}`;
  els.wickets.textContent=`${state.wickets}/${MAX_WICKETS}`;els.multiplier.textContent=`x${state.multiplier}`;
}
function loop(ts){
  if(!state||state.ended)return;
  const dt=Math.min(.04,(ts-lastTime)/1000);lastTime=ts;
  if(!state.paused&&state.phase==='delivery'){
    state.delivery.progress+=state.delivery.speed*dt;
    if(state.delivery.progress>1.06)autoMiss();
  }
  draw();raf=requestAnimationFrame(loop);
}
function draw(){
  const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#173e51');sky.addColorStop(.5,'#568b70');sky.addColorStop(.51,'#2f6a36');sky.addColorStop(1,'#174323');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#203c28';ctx.beginPath();ctx.moveTo(0,h*.48);ctx.lineTo(w*.14,h*.31);ctx.lineTo(w*.27,h*.47);ctx.lineTo(w*.45,h*.28);ctx.lineTo(w*.63,h*.47);ctx.lineTo(w*.82,h*.27);ctx.lineTo(w,h*.46);ctx.lineTo(w,h*.58);ctx.lineTo(0,h*.58);ctx.fill();
  ctx.fillStyle='#b98c58';ctx.beginPath();ctx.moveTo(w*.42,h);ctx.lineTo(w*.47,h*.48);ctx.lineTo(w*.55,h*.48);ctx.lineTo(w*.64,h);ctx.fill();
  ctx.strokeStyle='#f8e4b3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.43,h*.79);ctx.lineTo(w*.62,h*.79);ctx.stroke();
  drawStumps(w*.84,h*.68,h*.18); drawBatter(w*.78,h*.65,h*.22);
  if(state?.delivery){
    const p=Math.min(1,state.delivery.progress), x=w*.1+(w*.72*p), arc=Math.sin(p*Math.PI)*h*.22;
    const y=h*.57-arc+(state.delivery.curve*Math.sin(p*Math.PI)*h);
    ctx.save();ctx.shadowColor='#fff';ctx.shadowBlur=9;ctx.fillStyle='#d72727';ctx.beginPath();ctx.arc(x,y,Math.max(6,w*.009),0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='white';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x,y,Math.max(4,w*.006),-.8,1.7);ctx.stroke();ctx.restore();
    els.marker.style.left=`calc(${Math.max(0,Math.min(100,p*100))}% - 4px)`;
  } else els.marker.style.left='0';
}
function drawStumps(x,y,size){ctx.strokeStyle='#f3d38c';ctx.lineWidth=Math.max(3,size*.04);for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(x+i*size*.12,y);ctx.lineTo(x+i*size*.12,y-size);ctx.stroke()}ctx.beginPath();ctx.moveTo(x-size*.18,y-size);ctx.lineTo(x+size*.18,y-size);ctx.stroke()}
function drawBatter(x,y,size){ctx.strokeStyle='#f4f0dd';ctx.lineWidth=Math.max(5,size*.07);ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y-size*.78,size*.13,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-size*.65);ctx.lineTo(x,y-size*.25);ctx.lineTo(x-size*.16,y);ctx.moveTo(x,y-size*.25);ctx.lineTo(x+size*.16,y);ctx.moveTo(x,y-size*.5);ctx.lineTo(x-size*.22,y-size*.33);ctx.stroke();ctx.strokeStyle='#d9a64f';ctx.lineWidth=Math.max(5,size*.08);ctx.beginPath();ctx.moveTo(x-size*.2,y-size*.34);ctx.lineTo(x-size*.43,y-size*.78);ctx.stroke()}
async function endGame(){
  state.ended=true;cancelAnimationFrame(raf);
  els.finalScore.textContent=state.score;els.finalBoundaries.textContent=state.boundaries;els.finalCombo.textContent=`x${state.bestCombo}`;
  els.finalPerfects.textContent=state.perfects;els.resultTitle.textContent=state.score>=80?'Absolute carnage!':state.score>=50?'Captain’s knock!':state.score>=25?'Solid innings!':'Back to the nets!';
  show(els.result);saveScore();
}
async function submitScore(entry){
  const response=await fetch('/api/game-score',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(entry)});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload.error||'API unavailable');
  return payload;
}
async function notifyIfNewLeader(entry){
  if(!entry?.playerId||Number(entry.score||0)<=0)return;
  try{
    const boardResponse=await fetch('/api/game-leaderboard?limit=1',{cache:'no-store'});
    if(!boardResponse.ok)return;
    const board=await boardResponse.json();
    const top=board.scores?.[0];
    if(!top||top.playerId!==entry.playerId||Number(top.score)!==Number(entry.score))return;
    const key=`${top.playerId}:${top.score}:${top.perfects||0}`;
    if(localStorage.getItem('bb_last_leader_notification')===key)return;
    const response=await fetch('/api/push/send',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:'New Boundary Blitz leader!',body:`${top.name} leads the team with ${top.score} points.`,url:'/game.html#leaderboard',tag:'boundary-blitz-leader',type:'game'})});
    if(response.ok)localStorage.setItem('bb_last_leader_notification',key);
  }catch{/* leaderboard notifications are best effort */}
}
async function syncPendingScores(){
  if(!navigator.onLine)return;
  const scores=getLocalScores();let changed=false,synced=0;
  for(const entry of scores.filter(item=>item.synced!==true)){
    try{const result=await submitScore(entry);entry.synced=true;changed=true;synced++;if(!result?.duplicate)await notifyIfNewLeader(entry);}catch{break}
  }
  if(changed)setLocalScores(scores);
  if(synced)showBadge(`${synced} saved score${synced===1?'':'s'} synced globally.`,'success');
}
async function saveScore(){
  const entry={submissionId:`bb-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,playerId:identity.playerId||'',name:state.name,score:state.score,boundaries:state.boundaries,perfects:state.perfects,balls:state.balls,wickets:state.wickets,playedAt:new Date().toISOString(),synced:false};
  const local=getLocalScores();local.push(entry);local.sort((a,b)=>b.score-a.score||new Date(a.playedAt)-new Date(b.playedAt));setLocalScores(local);updateBest();
  els.saveStatus.textContent='Saving score…';
  try{
    const result=await submitScore(entry);entry.synced=true;setLocalScores(local);if(!result?.duplicate)await notifyIfNewLeader(entry);els.saveStatus.textContent='Score saved to the global leaderboard.';showBadge('High score saved globally.','success');
  }catch(error){els.saveStatus.textContent=navigator.onLine?'Saved on this device. Global leaderboard save failed. Tap the leaderboard later to retry.':'Saved on this device. It will sync when you reconnect.';showBadge(error?.message||'Leaderboard unavailable','offline')}
}

async function loadBoard(type='global'){
  els.boardList.innerHTML='<div class="empty-board">Loading scores…</div>';
  let rows=[];
  if(type==='global'){
    try{const r=await fetch('/api/game-leaderboard?limit=25');if(!r.ok)throw 0;const data=await r.json();rows=data.scores||[]}catch{rows=[]}
  } else rows=getLocalScores().slice(0,25);
  if(!rows.length){els.boardList.innerHTML='<div class="empty-board">No scores yet. Be the first batter on the board.</div>';return}
  els.boardList.innerHTML=rows.map((x,i)=>`<div class="leader-row ${identity.playerId&&x.playerId===identity.playerId?'me':''}"><span class="rank">#${i+1}</span><div><strong>${escapeHtml(x.name||'Player')}</strong><small>${x.boundaries||0} boundaries · ${new Date(x.playedAt||Date.now()).toLocaleDateString()}</small></div><span class="leader-score">${Number(x.score)||0}</span></div>`).join('');
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openBoard(){boardReturnScreen=document.querySelector('.screen.active')||els.menu;show(els.board);syncPendingScores().finally(()=>loadBoard(document.querySelector('.tab.active').dataset.board))}
function togglePause(force){
  if(!state||state.ended)return;state.paused=typeof force==='boolean'?force:!state.paused;
  els.pauseOverlay.classList.toggle('hidden',!state.paused);
}
$('#playBtn').onclick=startGame;$('#replayBtn').onclick=()=>{show(els.menu);startGame()};$('#boardPlayBtn').onclick=()=>show(els.menu);
$('#leaderboardBtn').onclick=openBoard;$('#menuLeaderboardBtn').onclick=openBoard;$('#closeLeaderboardBtn').onclick=()=>show(boardReturnScreen||els.menu);
$('#howBtn').onclick=()=>$('#howDialog').showModal();$('#closeHowBtn').onclick=()=>$('#howDialog').close();
$('#dialogPlayBtn').onclick=()=>{$('#howDialog').close();startGame()};$('#swingBtn').onclick=swing;canvas.onclick=swing;
$('#pauseBtn').onclick=()=>togglePause();$('#resumeBtn').onclick=()=>togglePause(false);$('#quitBtn').onclick=()=>{togglePause(false);endGame()};
$('#soundBtn').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'🔊':'🔇';localStorage.setItem('bb_sound',soundOn?'1':'0')};
$('#shareScoreBtn').onclick=async()=>{if(!state)return;const text=`I scored ${state.score} in Boundary Blitz for Ball Kho Gayi XI. Can you beat me?`;try{if(navigator.share)await navigator.share({title:'Boundary Blitz',text,url:location.origin+'/game.html'});else{await navigator.clipboard.writeText(`${text} ${location.origin}/game.html`);showBadge('Score copied to clipboard.','success')}}catch{}};
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');loadBoard(t.dataset.board)});
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();swing()}if(e.code==='Escape'&&state&&!state.ended)togglePause()});
addEventListener('resize',resizeCanvas);document.addEventListener('visibilitychange',()=>{if(document.hidden&&state&&!state.ended)togglePause(true)});
addEventListener('offline',()=>showBadge('You are offline. Scores will save on this device.','offline'));addEventListener('online',()=>{showBadge('Back online. Syncing scores…','success');syncPendingScores()});
soundOn=localStorage.getItem('bb_sound')!=='0';$('#soundBtn').textContent=soundOn?'🔊':'🔇';els.playerName.value=savedName();updateBest();show(els.menu);loadIdentity().finally(syncPendingScores);
})();