const players=[
 {name:'Rohan Singh',role:'Batter',runs:348,wickets:2,sr:151,available:true},
 {name:'Kabir Khan',role:'Bowler',runs:86,wickets:17,sr:112,available:true},
 {name:'Aryan Verma',role:'All-rounder',runs:302,wickets:11,sr:144,available:true},
 {name:'Aman Raj',role:'Wicketkeeper',runs:220,wickets:0,sr:137,available:false},
 {name:'Dev Mishra',role:'Batter',runs:189,wickets:1,sr:129,available:true},
 {name:'Nikhil Yadav',role:'Bowler',runs:66,wickets:12,sr:105,available:true},
 {name:'Shivam Tiwari',role:'All-rounder',runs:178,wickets:9,sr:132,available:false},
 {name:'Harsh Patel',role:'Batter',runs:155,wickets:0,sr:128,available:true},
 {name:'Yash Gupta',role:'Bowler',runs:44,wickets:8,sr:98,available:true}
];
let matches=[
 {status:'Upcoming',title:'Circle XI vs Rising Royals',venue:'City Ground',date:'Sunday · 7:00 AM',teamA:'Circle XI',teamB:'Rising Royals',result:'Squad not locked'},
 {status:'Live',title:'Circle XI vs Thunder Club',venue:'Academy Turf',date:'Today · 4:30 PM',teamA:'Circle XI',teamB:'Thunder Club',result:'Circle XI need 56 from 20 balls'},
 {status:'Completed',title:'Circle XI vs Royal Strikers',venue:'River Ground',date:'Last Sunday',teamA:'Circle XI',teamB:'Royal Strikers',result:'Circle XI won by 18 runs'}
];
let expenses=[{name:'Ground Booking',amount:1200,status:'₹850 collected'},{name:'New Tennis Balls',amount:420,status:'Paid by Aryan'},{name:'Refreshments',amount:650,status:'₹280 pending'}];
let score={runs:86,wickets:3,balls:52,history:['1','4','0','Wd','2','W','6','1']};
function $(id){return document.getElementById(id)}
function renderMatches(){ $('matchGrid').innerHTML=matches.map(m=>`<article class="match-card"><span class="status">${m.status}</span><h3>${m.title}</h3><p class="muted">${m.date} · ${m.venue}</p><div class="versus"><div class="team-badge">${m.teamA}</div><strong>vs</strong><div class="team-badge">${m.teamB}</div></div><p>${m.result}</p><button class="secondary-btn small" onclick="toast('Scorecard opened')">Open Scorecard</button></article>`).join('')}
function renderPlayers(filter='all'){const data=filter==='all'?players:players.filter(p=>p.role===filter);$('playerGrid').innerHTML=data.map((p,i)=>`<article class="player-card"><div class="player-top"><div class="avatar">${p.name.split(' ').map(x=>x[0]).join('')}</div><div><h3>${p.name}</h3><p class="muted">${p.role} · ${p.available?'Available':'Maybe'}</p></div></div><div class="player-stats"><span><b>${p.runs}</b>Runs</span><span><b>${p.wickets}</b>Wkts</span><span><b>${p.sr}</b>SR</span></div></article>`).join('')}
function filterPlayers(role){renderPlayers(role);toast(role==='all'?'Showing all players':`Showing ${role}s`)}
function renderLeader(){const sorted=[...players].sort((a,b)=>b.runs-a.runs).slice(0,6);$('leaderRows').innerHTML=sorted.map((p,i)=>`<tr><td>#${i+1}</td><td><strong>${p.name}</strong><br><span class="muted">${p.role}</span></td><td>${p.runs}</td><td>${p.wickets}</td><td>${p.sr}</td></tr>`).join('')}
function renderExpenses(){ $('expenseList').innerHTML=expenses.map(e=>`<div class="expense-item"><div><strong>${e.name}</strong><br><span class="muted">${e.status}</span></div><b>₹${e.amount}</b></div>`).join('')}
function renderScore(){ $('runs').textContent=score.runs;$('wickets').textContent=score.wickets;const o=Math.floor(score.balls/6)+'.'+(score.balls%6);$('overs').textContent=o;$('crr').textContent=(score.runs/(score.balls/6)).toFixed(2);$('timeline').innerHTML=score.history.slice(-18).map(b=>`<span class="ball">${b}</span>`).join('')}
function scoreBall(n){score.runs+=n;score.balls++;score.history.push(String(n));renderScore();toast(`${n} run${n===1?'':'s'} added`)}
function extra(type){score.runs+=1;score.history.push(type);renderScore();toast(`${type} added`)}
function wicket(){if(score.wickets<10){score.wickets++;score.balls++;score.history.push('W');renderScore();toast('Wicket added')}}
function undoBall(){const last=score.history.pop();if(!last)return;if(['0','1','2','3','4','6'].includes(last)){score.runs-=Number(last);score.balls--}else if(last==='W'){score.wickets--;score.balls--}else{score.runs--}renderScore();toast('Last ball undone')}
function endInnings(){toast('Innings saved. Scorecard updated.')}
function openModal(id){$(id).classList.add('show')}function closeModal(id){$(id).classList.remove('show')}
function createMatch(){const opponent=$('newOpponent').value||'New Opponent';const venue=$('newVenue').value||'Local Ground';const overs=$('newOvers').value||12;matches.unshift({status:'Upcoming',title:`Circle XI vs ${opponent}`,venue,date:`New fixture · ${overs} overs`,teamA:'Circle XI',teamB:opponent,result:'Waiting for playing XI'});renderMatches();closeModal('matchModal');toast('Match created')}
function addExpense(){expenses.unshift({name:'Demo Expense',amount:300,status:'Split among available players'});renderExpenses();toast('Expense added')}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)}
$('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('light');$('themeBtn').textContent=document.body.classList.contains('light')?'Dark Mode':'Night Mode'});
renderMatches();renderPlayers();renderLeader();renderExpenses();renderScore();
