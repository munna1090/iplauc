// ============================================================
// IPL AUCTION BUILDER v2 - 18 Player Squad + Auto Best XII
// (12 players including Impact Player)
// ============================================================

const STAR_PLAYERS = new Set([
    "Virat Kohli","Rohit Sharma","David Warner","Suryakumar Yadav","Shubman Gill",
    "Yashasvi Jaiswal","Faf du Plessis","Shreyas Iyer","Tilak Varma","Sai Sudharsan",
    "MS Dhoni","KL Rahul","Rishabh Pant","Jos Buttler","Sanju Samson","Heinrich Klaasen","Phil Salt",
    "Jasprit Bumrah","Rashid Khan","Yuzvendra Chahal","Kagiso Rabada","Arshdeep Singh",
    "Kuldeep Yadav","Trent Boult","Mohammad Shami","Jofra Archer","Mitchell Starc",
    "Hardik Pandya","Ravindra Jadeja","Andre Russell","Sunil Narine","Pat Cummins",
    "Ben Stokes","Axar Patel","Sam Curran","Glenn Maxwell","Marcus Stoinis"
]);

const IPL_TEAMS = [
    {id:"csk",name:"Chennai Super Kings",short:"CSK",color:"#f9cd05",bg:"rgba(249,205,5,0.12)"},
    {id:"mi",name:"Mumbai Indians",short:"MI",color:"#004ba0",bg:"rgba(0,75,160,0.12)"},
    {id:"rcb",name:"Royal Challengers Bengaluru",short:"RCB",color:"#d4213d",bg:"rgba(212,33,61,0.12)"},
    {id:"kkr",name:"Kolkata Knight Riders",short:"KKR",color:"#3a225d",bg:"rgba(58,34,93,0.12)"},
    {id:"dc",name:"Delhi Capitals",short:"DC",color:"#17479e",bg:"rgba(23,71,158,0.12)"},
    {id:"pbks",name:"Punjab Kings",short:"PBKS",color:"#ed1b24",bg:"rgba(237,27,36,0.12)"},
    {id:"rr",name:"Rajasthan Royals",short:"RR",color:"#ea1a85",bg:"rgba(234,26,133,0.12)"},
    {id:"srh",name:"Sunrisers Hyderabad",short:"SRH",color:"#f7a721",bg:"rgba(247,167,33,0.12)"},
    {id:"gt",name:"Gujarat Titans",short:"GT",color:"#1c1c2b",bg:"rgba(28,28,43,0.25)"},
    {id:"lsg",name:"Lucknow Super Giants",short:"LSG",color:"#a72056",bg:"rgba(167,32,86,0.12)"}
];

const MAX_SQUAD = 18;

// ---- Rating Calculations (out of 5) ----
function calcRating(p) {
    let r;
    if (p.category==='batsmen') {
        r = Math.min(p.runs/9000*10,10)*0.30+Math.min(p.avg/50*10,10)*0.25+Math.min((p.sr-100)/80*10,10)*0.20+Math.min(p.mat/250*10,10)*0.10+Math.min((p.hundreds*3+p.fifties*1.5+p.sixes*0.05)/25*10,10)*0.15;
    } else if (p.category==='keepers') {
        r = Math.min(p.runs/6000*10,10)*0.28+Math.min(p.avg/48*10,10)*0.25+Math.min((p.sr-100)/80*10,10)*0.20+Math.min(p.mat/280*10,10)*0.12+Math.min((p.hundreds*3+p.fifties*1.5+p.sixes*0.06)/22*10,10)*0.15;
    } else if (p.category==='bowlers') {
        r = Math.max(1,Math.min(p.wkts/200*10,10)*0.30+Math.min((40-p.bowlAvg)/20*10,10)*0.25+Math.min((10-p.econ)/4*10,10)*0.20+Math.min(p.mat/180*10,10)*0.10+Math.min((p.fourW*2+p.fiveW*5)/15*10,10)*0.15);
    } else {
        const bav=p.bowlAvg?Math.min((40-p.bowlAvg)/20*10,10):3, be=p.econ?Math.min((10-p.econ)/4*10,10):3;
        r = Math.max(1,Math.min(p.runs/4000*10,10)*0.15+Math.min(p.avg/35*10,10)*0.12+Math.min((p.sr-100)/80*10,10)*0.13+Math.min(p.wkts/150*10,10)*0.18+bav*0.15+be*0.12+Math.min(p.mat/200*10,10)*0.15);
    }
    if (STAR_PLAYERS.has(p.name)) r += 0.5;
    r = Math.min(9.9, Math.max(1.0, r));
    // Convert from /10 to /5 scale
    return parseFloat((r / 2).toFixed(1));
}

function getRatingClass(r) { if(r>=4.5)return'elite';if(r>=4.0)return'outstanding';if(r>=3.5)return'excellent';if(r>=3.0)return'good';if(r>=2.5)return'average';return'below'; }
function getRoleLabel(c) { return {batsmen:'Batsman',keepers:'Keeper',bowlers:'Bowler',allrounders:'All-Rounder'}[c]||c; }
function getRoleClass(c) { return {batsmen:'batsman',keepers:'keeper',bowlers:'bowler',allrounders:'allrounder'}[c]||''; }

// ---- Player Data ----
let allPlayers = PLAYERS.map((p,i) => ({...p, _idx:i, _rating:parseFloat(calcRating(p).toFixed(1)), _star:STAR_PLAYERS.has(p.name)}));

// ---- State ----
let budget = 100;
let activeTeamId = 'csk';
let teamData = {};
IPL_TEAMS.forEach(t => { teamData[t.id] = { squad: [], prices: [], bestXII: [] }; });
let pendingPlayerIdx = null;

// ---- Dynamic Price Estimation ----
function estimatePrice(player) {
    const allSold = new Set();
    Object.values(teamData).forEach(td => td.squad.forEach(idx => allSold.add(idx)));
    const catCounts={batsmen:0,keepers:0,bowlers:0,allrounders:0};
    const catTotal={batsmen:0,keepers:0,bowlers:0,allrounders:0};
    allPlayers.forEach(p => { catTotal[p.category]++; if(!allSold.has(p._idx)) catCounts[p.category]++; });

    const rating = player._rating;
    let base;
    if(rating>=4.5)base=18;else if(rating>=4.25)base=14;else if(rating>=4.0)base=11;
    else if(rating>=3.75)base=8;else if(rating>=3.5)base=6;else if(rating>=3.25)base=4.5;
    else if(rating>=3.0)base=3;else if(rating>=2.75)base=2;else if(rating>=2.5)base=1.5;
    else if(rating>=2.0)base=0.75;else base=0.5;
    if(player._star) base*=1.3;
    const avail=catCounts[player.category],total=catTotal[player.category];
    const scarcity=1+((1-(avail/total))*0.6);
    if(player.country!=='IND') base*=1.1;
    return Math.round(base*scarcity*4)/4;
}

// ---- Render Functions ----
function renderTeamTabs() {
    document.getElementById('teamTabs').innerHTML = IPL_TEAMS.map(t => {
        const c = teamData[t.id].squad.length;
        let avgHtml = '';
        if (c > 0) {
            const ratings = teamData[t.id].squad.map(idx => allPlayers.find(p => p._idx === idx)._rating);
            const avg = (ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1);
            avgHtml = `<span class="tab-avg" style="color:var(--r-${getRatingClass(parseFloat(avg))})">${avg}★</span>`;
        }
        return `<button class="team-tab ${t.id===activeTeamId?'active':''}" data-team="${t.id}" style="--team-color:${t.color};--team-bg:${t.bg}" onclick="selectTeam('${t.id}')">${t.short}${c?`<span class="tab-count">${c}</span>`:''}${avgHtml}</button>`;
    }).join('');
}

function selectTeam(id) { activeTeamId=id; renderTeamTabs(); renderAll(); }

function renderInfoBar() {
    const td=teamData[activeTeamId], team=IPL_TEAMS.find(t=>t.id===activeTeamId);
    const spent=td.prices.reduce((s,v)=>s+v,0), remaining=budget-spent;
    document.getElementById('infoTeamName').textContent=team.name;
    document.getElementById('infoTeamName').style.color=team.color;
    document.getElementById('infoTotalBudget').textContent=`₹${budget} Cr`;
    document.getElementById('infoSpent').textContent=`₹${spent.toFixed(2)} Cr`;
    document.getElementById('infoRemaining').textContent=`₹${remaining.toFixed(2)} Cr`;
    document.getElementById('infoRemaining').style.color=remaining<10?'var(--rose)':'var(--green)';
    document.getElementById('infoPlayers').textContent=`${td.squad.length}/${MAX_SQUAD}`;
    if(td.squad.length>0){
        const ratings=td.squad.map(idx=>allPlayers.find(p=>p._idx===idx)._rating);
        const avg=(ratings.reduce((s,v)=>s+v,0)/ratings.length).toFixed(1);
        const el=document.getElementById('infoAvgRating');
        el.textContent=`${avg}/5`; el.style.color=`var(--r-${getRatingClass(parseFloat(avg))})`;
    }else{document.getElementById('infoAvgRating').textContent='-';document.getElementById('infoAvgRating').style.color='var(--t3)';}
}

function renderSquad() {
    const td=teamData[activeTeamId], team=IPL_TEAMS.find(t=>t.id===activeTeamId);
    let html='';
    for(let i=0;i<MAX_SQUAD;i++){
        if(i<td.squad.length){
            const p=allPlayers.find(x=>x._idx===td.squad[i]), price=td.prices[i];
            const inXII=td.bestXII.includes(td.squad[i]);
            html+=`<div class="sq-slot filled ${inXII?'in-xi':''}">
                <span class="sq-num" style="background:${team.color}">${i+1}</span>
                <div class="sq-info"><div class="sq-name">${p.name}${p._star?' ⭐':''}${inXII?' <span class="xi-tag">XII</span>':''}</div><span class="sq-role ${getRoleClass(p.category)}">${getRoleLabel(p.category)} • ${p.country}</span></div>
                <span class="sq-price">₹${price} Cr</span>
                <span class="sq-rating" style="color:var(--r-${getRatingClass(p._rating)})">${p._rating}/5</span>
                <button class="sq-remove" onclick="removePlayer(${i})" title="Remove">✕</button>
            </div>`;
        } else {
            html+=`<div class="sq-slot empty"><span class="sq-num">${i+1}</span><div class="sq-info"><div class="sq-name empty-text">Select a player...</div></div></div>`;
        }
    }
    document.getElementById('squadSlots').innerHTML=html;

    const spent=td.prices.reduce((s,v)=>s+v,0), remaining=budget-spent;
    const cb={batsmen:0,keepers:0,bowlers:0,allrounders:0};
    td.squad.forEach(idx=>{const p=allPlayers.find(x=>x._idx===idx);cb[p.category]++;});
    document.getElementById('squadSummary').innerHTML=`
        <div class="summary-row"><span class="label">🏏 Batsmen</span><span class="val">${cb.batsmen}</span></div>
        <div class="summary-row"><span class="label">🧤 Keepers</span><span class="val">${cb.keepers}</span></div>
        <div class="summary-row"><span class="label">🎯 Bowlers</span><span class="val">${cb.bowlers}</span></div>
        <div class="summary-row"><span class="label">⚡ All-Rounders</span><span class="val">${cb.allrounders}</span></div>
        <div class="summary-row total"><span class="label">💰 Budget Remaining</span><span class="val">₹${remaining.toFixed(2)} Cr</span></div>`;
}

function renderPicker() {
    const search=document.getElementById('pickerSearch').value.toLowerCase();
    const cat=document.getElementById('pickerCat').value;
    const sort=document.getElementById('pickerSort').value;
    const td=teamData[activeTeamId];
    const allSold=new Set(); Object.values(teamData).forEach(d=>d.squad.forEach(idx=>allSold.add(idx)));
    const spent=td.prices.reduce((s,v)=>s+v,0), remaining=budget-spent;

    let available=allPlayers.filter(p=>!allSold.has(p._idx));
    if(cat!=='all') available=available.filter(p=>p.category===cat);
    if(search) available=available.filter(p=>p.name.toLowerCase().includes(search)||p.country.toLowerCase().includes(search));
    available=available.map(p=>({...p,_estPrice:estimatePrice(p)}));
    if(sort==='price-desc')available.sort((a,b)=>b._estPrice-a._estPrice);
    else if(sort==='price-asc')available.sort((a,b)=>a._estPrice-b._estPrice);
    else if(sort==='rating-desc')available.sort((a,b)=>b._rating-a._rating);
    else available.sort((a,b)=>a.name.localeCompare(b.name));

    document.getElementById('availCount').textContent=`${available.length} available`;
    const isFull=td.squad.length>=MAX_SQUAD;
    document.getElementById('pickerList').innerHTML=available.slice(0,50).map(p=>`
        <div class="pick-player ${isFull?'disabled':''}" onclick="${isFull?'':`openPriceModal(${p._idx})`}">
            <div class="pick-info"><div class="pick-name">${p.name}${p._star?' <span class="star">⭐</span>':''}</div><div class="pick-meta">${getRoleLabel(p.category)} • ${p.country} • ${p.mat} mat</div></div>
            <div class="pick-price"><span class="pick-est">₹${p._estPrice} Cr</span><span class="pick-est-label">Est. Price</span></div>
            <span class="pick-rating" style="color:var(--r-${getRatingClass(p._rating)})">${p._rating}/5</span>
        </div>`).join('')||'<div style="text-align:center;padding:40px;color:var(--t3)">No players available</div>';
}

function renderAll() { renderInfoBar(); renderSquad(); renderPicker(); updateCompTotal(); }

// ---- Price Modal ----
function openPriceModal(idx) {
    const p=allPlayers.find(x=>x._idx===idx); if(!p) return;
    pendingPlayerIdx=idx;
    const est=estimatePrice(p), td=teamData[activeTeamId];
    const spent=td.prices.reduce((s,v)=>s+v,0), remaining=budget-spent;
    document.getElementById('pmPlayerInfo').innerHTML=`
        <div class="pm-name">${p.name}${p._star?' ⭐':''}</div>
        <div class="pm-detail">${getRoleLabel(p.category)} • ${p.country} • Rating: ${p._rating}/5</div>
        <span class="pm-rating-badge" style="background:rgba(59,130,246,.15);color:var(--r-${getRatingClass(p._rating)})">${p._rating}/5 ${getRatingClass(p._rating).toUpperCase()}</span>`;
    document.getElementById('pmEstimate').innerHTML=`💡 <strong>Estimated Price: ₹${est} Cr</strong> — Based on rating, role scarcity & market dynamics.<br><span style="color:var(--green)">Your remaining budget: ₹${remaining.toFixed(2)} Cr</span>`;
    document.getElementById('pmPriceInput').value=est;
    document.getElementById('priceModalOverlay').classList.add('active');
    document.getElementById('pmPriceInput').focus();
}
function closePriceModal() { document.getElementById('priceModalOverlay').classList.remove('active'); pendingPlayerIdx=null; }

function confirmPurchase() {
    if(pendingPlayerIdx===null) return;
    const price=parseFloat(document.getElementById('pmPriceInput').value);
    if(isNaN(price)||price<=0){alert('Enter a valid price');return;}
    const td=teamData[activeTeamId], spent=td.prices.reduce((s,v)=>s+v,0), remaining=budget-spent;
    if(price>remaining){alert(`Not enough budget! Remaining: ₹${remaining.toFixed(2)} Cr`);return;}
    if(td.squad.length>=MAX_SQUAD){alert(`Squad is full (${MAX_SQUAD} players)`);return;}
    td.squad.push(pendingPlayerIdx); td.prices.push(price);
    closePriceModal(); renderTeamTabs(); renderAll();
}

function removePlayer(i) {
    const td=teamData[activeTeamId];
    td.squad.splice(i,1); td.prices.splice(i,1);
    td.bestXII=td.bestXII.filter(idx=>td.squad.includes(idx));
    renderTeamTabs(); renderAll(); renderBestXII();
}

function clearSquad() {
    if(!confirm('Clear all players from this team?')) return;
    teamData[activeTeamId]={squad:[],prices:[],bestXII:[]};
    renderTeamTabs(); renderAll(); renderBestXII();
}

// ---- Composition Config ----
function updateCompTotal() {
    const b=parseInt(document.getElementById('compBat').value)||0;
    const k=parseInt(document.getElementById('compKeep').value)||0;
    const w=parseInt(document.getElementById('compBowl').value)||0;
    const a=parseInt(document.getElementById('compAR').value)||0;
    const total=b+k+w+a;
    const el=document.getElementById('compTotal');
    if(total===12){el.textContent='Total: 12 ✓ (incl. Impact Player)';el.style.color='var(--green)';}
    else{el.textContent=`Total: ${total} (need 12 incl. Impact Player)`;el.style.color='var(--rose)';}
}

// ---- Best XII Algorithm (11 + Impact Player) ----
function generateBestXII() {
    const td=teamData[activeTeamId];
    if(td.squad.length<12){alert('Need at least 12 players in squad to generate Best XII');return;}

    const nBat=parseInt(document.getElementById('compBat').value)||0;
    const nKeep=parseInt(document.getElementById('compKeep').value)||0;
    const nBowl=parseInt(document.getElementById('compBowl').value)||0;
    const nAR=parseInt(document.getElementById('compAR').value)||0;
    if(nBat+nKeep+nBowl+nAR!==12){alert('Team composition must total exactly 12 (incl. Impact Player)!');return;}

    const squadPlayers=td.squad.map(idx=>allPlayers.find(p=>p._idx===idx));
    const byCat={
        batsmen:squadPlayers.filter(p=>p.category==='batsmen').sort((a,b)=>b._rating-a._rating),
        keepers:squadPlayers.filter(p=>p.category==='keepers').sort((a,b)=>b._rating-a._rating),
        bowlers:squadPlayers.filter(p=>p.category==='bowlers').sort((a,b)=>b._rating-a._rating),
        allrounders:squadPlayers.filter(p=>p.category==='allrounders').sort((a,b)=>b._rating-a._rating)
    };

    const warnings=[];
    if(byCat.batsmen.length<nBat) warnings.push(`Need ${nBat} batsmen but only have ${byCat.batsmen.length}`);
    if(byCat.keepers.length<nKeep) warnings.push(`Need ${nKeep} keepers but only have ${byCat.keepers.length}`);
    if(byCat.bowlers.length<nBowl) warnings.push(`Need ${nBowl} bowlers but only have ${byCat.bowlers.length}`);
    if(byCat.allrounders.length<nAR) warnings.push(`Need ${nAR} all-rounders but only have ${byCat.allrounders.length}`);

    if(warnings.length){
        alert('Cannot form XII:\n'+warnings.join('\n')+'\n\nAdjust composition or buy more players.');
        return;
    }

    const xii=[];
    xii.push(...byCat.batsmen.slice(0,nBat));
    xii.push(...byCat.keepers.slice(0,nKeep));
    xii.push(...byCat.bowlers.slice(0,nBowl));
    xii.push(...byCat.allrounders.slice(0,nAR));

    td.bestXII=xii.map(p=>p._idx);
    renderSquad();
    renderBestXII();
}

function renderBestXII() {
    const td=teamData[activeTeamId], team=IPL_TEAMS.find(t=>t.id===activeTeamId);
    const el=document.getElementById('bestXIResult');
    if(!td.bestXII.length){
        el.innerHTML='<div class="bestxi-empty">Buy players first, then generate Best XII</div>';
        return;
    }
    const xiiPlayers=td.bestXII.map(idx=>allPlayers.find(p=>p._idx===idx));
    const avgR=(xiiPlayers.reduce((s,p)=>s+p._rating,0)/xiiPlayers.length).toFixed(1);
    const totalSpent=td.bestXII.map(idx=>{const i=td.squad.indexOf(idx);return td.prices[i]||0;}).reduce((s,v)=>s+v,0);

    // The 12th player is the impact player
    let html=`<div class="xi-header">
        <div class="xi-avg"><span class="xi-avg-label">XII AVG RATING</span><span class="xi-avg-value" style="color:var(--r-${getRatingClass(parseFloat(avgR))})">${avgR}/5</span></div>
        <div class="xi-avg"><span class="xi-avg-label">XII COST</span><span class="xi-avg-value" style="color:var(--amber)">₹${totalSpent.toFixed(2)} Cr</span></div>
    </div><div class="xi-list">`;

    xiiPlayers.forEach((p,i)=>{
        const price=td.prices[td.squad.indexOf(p._idx)]||0;
        const isImpact = i===11;
        html+=`<div class="xi-player ${isImpact?'impact-player':''}" style="border-left:3px solid ${isImpact?'var(--amber)':team.color}">
            <span class="xi-num" style="background:${isImpact?'var(--amber)':team.color}">${isImpact?'IP':(i+1)}</span>
            <div class="xi-info"><div class="xi-pname">${p.name}${p._star?' ⭐':''}${isImpact?' <span class="impact-tag">IMPACT</span>':''}</div><span class="sq-role ${getRoleClass(p.category)}">${getRoleLabel(p.category)}</span></div>
            <span class="sq-price">₹${price} Cr</span>
            <span class="sq-rating" style="color:var(--r-${getRatingClass(p._rating)})">${p._rating}/5</span>
        </div>`;
    });
    html+='</div>';
    el.innerHTML=html;
}

// ---- Budget ----
function setBudget() {
    const val=parseFloat(document.getElementById('budgetInput').value);
    if(isNaN(val)||val<10){alert('Enter a valid budget (min ₹10 Cr)');return;}
    budget=val;
    IPL_TEAMS.forEach(t=>{const s=teamData[t.id].prices.reduce((a,v)=>a+v,0);if(s>budget)alert(`Warning: ${t.short} has spent ₹${s.toFixed(2)} Cr, exceeds new budget!`);});
    renderAll();
}

// ---- Events ----
document.addEventListener('DOMContentLoaded',()=>{
    renderTeamTabs(); renderAll(); renderBestXII();
    document.getElementById('setBudgetBtn').addEventListener('click',setBudget);
    document.getElementById('budgetInput').addEventListener('keydown',e=>{if(e.key==='Enter')setBudget();});
    document.getElementById('pickerSearch').addEventListener('input',renderPicker);
    document.getElementById('pickerCat').addEventListener('change',renderPicker);
    document.getElementById('pickerSort').addEventListener('change',renderPicker);
    document.getElementById('pmConfirmBtn').addEventListener('click',confirmPurchase);
    document.getElementById('pmPriceInput').addEventListener('keydown',e=>{if(e.key==='Enter')confirmPurchase();});
    document.getElementById('priceModalOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closePriceModal();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closePriceModal();});
    ['compBat','compKeep','compBowl','compAR'].forEach(id=>document.getElementById(id).addEventListener('input',updateCompTotal));
});
