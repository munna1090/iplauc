// ============================================================
// IPL AUCTION PLAYER RATING DASHBOARD - APP LOGIC v2
// Star Players, Rankings, Playing 11 Builder
// ============================================================

// Star players get a +0.5 rating boost
const STAR_PLAYERS = new Set([
    "Virat Kohli","Rohit Sharma","David Warner","Suryakumar Yadav","Shubman Gill",
    "Yashasvi Jaiswal","Faf du Plessis","Shreyas Iyer","Tilak Varma","Sai Sudharsan",
    "MS Dhoni","KL Rahul","Rishabh Pant","Jos Buttler","Sanju Samson","Heinrich Klaasen","Phil Salt",
    "Jasprit Bumrah","Rashid Khan","Yuzvendra Chahal","Kagiso Rabada","Arshdeep Singh",
    "Kuldeep Yadav","Trent Boult","Mohammad Shami","Jofra Archer","Mitchell Starc",
    "Hardik Pandya","Ravindra Jadeja","Andre Russell","Sunil Narine","Pat Cummins",
    "Ben Stokes","Axar Patel","Sam Curran","Glenn Maxwell","Marcus Stoinis"
]);

// ---- Rating Calculations ----
function calcBatsmanRating(p) {
    const r = Math.min(p.runs/9000*10,10), a = Math.min(p.avg/50*10,10),
          s = Math.min((p.sr-100)/80*10,10), e = Math.min(p.mat/250*10,10),
          i = Math.min((p.hundreds*3+p.fifties*1.5+p.sixes*0.05)/25*10,10);
    return r*0.30 + a*0.25 + s*0.20 + e*0.10 + i*0.15;
}
function calcKeeperRating(p) {
    const r = Math.min(p.runs/6000*10,10), a = Math.min(p.avg/48*10,10),
          s = Math.min((p.sr-100)/80*10,10), e = Math.min(p.mat/280*10,10),
          i = Math.min((p.hundreds*3+p.fifties*1.5+p.sixes*0.06)/22*10,10);
    return r*0.28 + a*0.25 + s*0.20 + e*0.12 + i*0.15;
}
function calcBowlerRating(p) {
    const w = Math.min(p.wkts/200*10,10), a = Math.min((40-p.bowlAvg)/20*10,10),
          ec = Math.min((10-p.econ)/4*10,10), e = Math.min(p.mat/180*10,10),
          i = Math.min((p.fourW*2+p.fiveW*5)/15*10,10);
    return Math.max(1, w*0.30 + a*0.25 + ec*0.20 + e*0.10 + i*0.15);
}
function calcAllrounderRating(p) {
    const br = Math.min(p.runs/4000*10,10), ba = Math.min(p.avg/35*10,10),
          bs = Math.min((p.sr-100)/80*10,10), bw = Math.min(p.wkts/150*10,10),
          bav = p.bowlAvg ? Math.min((40-p.bowlAvg)/20*10,10) : 3,
          be = p.econ ? Math.min((10-p.econ)/4*10,10) : 3,
          e = Math.min(p.mat/200*10,10);
    return Math.max(1, br*0.15 + ba*0.12 + bs*0.13 + bw*0.18 + bav*0.15 + be*0.12 + e*0.15);
}

function getBaseRating(p) {
    let r;
    if (p.category==='batsmen') r = calcBatsmanRating(p);
    else if (p.category==='keepers') r = calcKeeperRating(p);
    else if (p.category==='bowlers') r = calcBowlerRating(p);
    else r = calcAllrounderRating(p);
    return r;
}

function getPlayerRating(p) {
    let r = getBaseRating(p);
    if (STAR_PLAYERS.has(p.name)) r += 0.5; // Star boost
    return Math.min(9.9, Math.max(1.0, r)).toFixed(1);
}

function getRatingClass(r) {
    if (r>=9.0) return 'elite'; if (r>=8.0) return 'outstanding';
    if (r>=7.0) return 'excellent'; if (r>=6.0) return 'good';
    if (r>=5.0) return 'average'; return 'below';
}
function getRatingLabel(r) {
    if (r>=9.0) return 'Elite'; if (r>=8.0) return 'Outstanding';
    if (r>=7.0) return 'Excellent'; if (r>=6.0) return 'Good';
    if (r>=5.0) return 'Average'; return 'Below Avg';
}
function getRoleLabel(c) { return {batsmen:'Batsman',keepers:'Wicket-Keeper',bowlers:'Bowler',allrounders:'All-Rounder'}[c]||c; }
function getRoleClass(c) { return {batsmen:'batsman',keepers:'keeper',bowlers:'bowler',allrounders:'allrounder'}[c]||''; }

// Pre-compute ratings & rankings
let playerData = PLAYERS.map((p,i) => ({...p, _idx:i, _rating: parseFloat(getPlayerRating(p)), _star: STAR_PLAYERS.has(p.name)}));

// Compute rankings per category
function computeRankings() {
    const cats = ['batsmen','keepers','bowlers','allrounders'];
    cats.forEach(cat => {
        const group = playerData.filter(p => p.category===cat).sort((a,b) => b._rating - a._rating);
        group.forEach((p,i) => p._catRank = i+1);
    });
    const all = [...playerData].sort((a,b) => b._rating - a._rating);
    all.forEach((p,i) => p._overallRank = i+1);
}
computeRankings();

function getStatsHTML(p) {
    if (p.category==='batsmen'||p.category==='keepers')
        return `<div class="stat-item"><span class="stat-value">${p.runs.toLocaleString()}</span><span class="stat-label">Runs</span></div>
                <div class="stat-item"><span class="stat-value">${p.avg}</span><span class="stat-label">Average</span></div>
                <div class="stat-item"><span class="stat-value">${p.sr}</span><span class="stat-label">Strike Rate</span></div>`;
    if (p.category==='bowlers')
        return `<div class="stat-item"><span class="stat-value">${p.wkts}</span><span class="stat-label">Wickets</span></div>
                <div class="stat-item"><span class="stat-value">${p.bowlAvg}</span><span class="stat-label">Avg</span></div>
                <div class="stat-item"><span class="stat-value">${p.econ}</span><span class="stat-label">Economy</span></div>`;
    return `<div class="stat-item"><span class="stat-value">${p.runs.toLocaleString()}</span><span class="stat-label">Runs</span></div>
            <div class="stat-item"><span class="stat-value">${p.wkts}</span><span class="stat-label">Wickets</span></div>
            <div class="stat-item"><span class="stat-value">${p.sr}</span><span class="stat-label">Strike Rate</span></div>`;
}

// ---- Card Rendering with Rank ----
function createCard(p, displayRank) {
    const rating = p._rating;
    const rClass = getRatingClass(rating);
    const circ = 2*Math.PI*24, offset = circ - (rating/10)*circ;
    const starBadge = p._star ? '<span class="star-badge">⭐ STAR</span>' : '';
    return `<div class="player-card" data-idx="${p._idx}" onclick="openModal(${p._idx})" style="animation-delay:${Math.min(displayRank*0.03,1.2)}s">
        <div class="rank-badge">#${displayRank}</div>
        <div class="card-header">
            <div class="player-info">
                <div class="player-name">${p.name} ${starBadge}</div>
                <span class="player-role ${getRoleClass(p.category)}">${getRoleLabel(p.category)}</span>
                <div class="player-country">${p.country}</div>
            </div>
            <div class="rating-circle rating-${rClass}">
                <svg viewBox="0 0 56 56"><circle class="bg-ring" cx="28" cy="28" r="24"/><circle class="progress-ring" cx="28" cy="28" r="24" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/></svg>
                <div class="rating-value">${rating}</div>
            </div>
        </div>
        <div class="card-stats">${getStatsHTML(p)}</div>
        <div class="card-footer">
            <span class="matches-badge">🏟️ ${p.mat} matches</span>
            <span class="view-more">View Details →</span>
        </div>
    </div>`;
}

// ---- Modal ----
function bar(label,val,max,grad) {
    const pct = Math.min(100,Math.max(0,(val/max)*100));
    return `<div class="breakdown-item"><span class="breakdown-label">${label}</span><div class="breakdown-bar"><div class="breakdown-fill" style="width:${pct}%;background:${grad}"></div></div><span class="breakdown-value">${Math.round(pct)}%</span></div>`;
}

function openModal(idx) {
    const p = playerData.find(x=>x._idx===idx);
    if(!p) return;
    const rating = p._rating, rClass = getRatingClass(rating);
    const gradient = {elite:'linear-gradient(90deg,#f59e0b,#ef4444)',outstanding:'linear-gradient(90deg,#10b981,#059669)',excellent:'linear-gradient(90deg,#3b82f6,#6366f1)',good:'linear-gradient(90deg,#06b6d4,#0891b2)',average:'linear-gradient(90deg,#94a3b8,#64748b)',below:'linear-gradient(90deg,#64748b,#475569)'}[rClass];
    let statsGrid='', breakdown='';
    if (p.category==='batsmen'||p.category==='keepers') {
        statsGrid = `<div class="modal-stat"><div class="modal-stat-value">${p.runs.toLocaleString()}</div><div class="modal-stat-label">Runs</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.avg}</div><div class="modal-stat-label">Average</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.sr}</div><div class="modal-stat-label">Strike Rate</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.hs}</div><div class="modal-stat-label">Highest</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.hundreds}/${p.fifties}</div><div class="modal-stat-label">100s / 50s</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.fours}/${p.sixes}</div><div class="modal-stat-label">4s / 6s</div></div>`;
        breakdown = `${bar('Runs',p.runs,p.category==='keepers'?6000:9000,gradient)} ${bar('Average',p.avg,50,gradient)} ${bar('Strike Rate',p.sr-100,80,gradient)} ${bar('Impact',p.hundreds*3+p.fifties*1.5,40,gradient)} ${bar('Experience',p.mat,250,gradient)}`;
    } else if (p.category==='bowlers') {
        statsGrid = `<div class="modal-stat"><div class="modal-stat-value">${p.wkts}</div><div class="modal-stat-label">Wickets</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.bowlAvg}</div><div class="modal-stat-label">Avg</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.econ}</div><div class="modal-stat-label">Economy</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.bestBowl}</div><div class="modal-stat-label">Best</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.fourW}</div><div class="modal-stat-label">4-Wicket</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.fiveW}</div><div class="modal-stat-label">5-Wicket</div></div>`;
        breakdown = `${bar('Wickets',p.wkts,200,gradient)} ${bar('Bowl Avg',(40-p.bowlAvg),20,gradient)} ${bar('Economy',(10-p.econ),4,gradient)} ${bar('Impact',p.fourW*2+p.fiveW*5,15,gradient)} ${bar('Experience',p.mat,180,gradient)}`;
    } else {
        statsGrid = `<div class="modal-stat"><div class="modal-stat-value">${p.runs.toLocaleString()}</div><div class="modal-stat-label">Runs</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.wkts}</div><div class="modal-stat-label">Wickets</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.sr}</div><div class="modal-stat-label">Strike Rate</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.avg}</div><div class="modal-stat-label">Bat Avg</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.econ||'-'}</div><div class="modal-stat-label">Economy</div></div>
            <div class="modal-stat"><div class="modal-stat-value">${p.mat}</div><div class="modal-stat-label">Matches</div></div>`;
        breakdown = `${bar('Bat Runs',p.runs,4000,gradient)} ${bar('Bat Avg',p.avg,35,gradient)} ${bar('Strike Rate',p.sr-100,80,gradient)} ${bar('Wickets',p.wkts,150,gradient)} ${bar('Economy',(10-(p.econ||10)),4,gradient)} ${bar('Experience',p.mat,200,gradient)}`;
    }
    const starHTML = p._star ? '<span class="modal-star-badge">⭐ Star Player (+0.5 Boost)</span>' : '';
    document.getElementById('modalContent').innerHTML = `
        <div class="modal-header">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <span class="modal-rank-badge">#${p._overallRank} Overall</span>
                <span class="modal-rank-badge cat">#${p._catRank} ${getRoleLabel(p.category)}</span>
                ${starHTML}
            </div>
            <div class="modal-player-name">${p.name}</div>
            <span class="modal-role-badge ${getRoleClass(p.category)}">${getRoleLabel(p.category)} • ${p.country}</span>
        </div>
        <div class="modal-rating-section">
            <div><div class="modal-rating-big" style="color:var(--rating-${rClass})">${rating}</div><div class="modal-rating-label">${getRatingLabel(rating)}</div></div>
            <div style="flex:1"><div class="modal-rating-bar"><div class="modal-rating-fill" style="width:${rating*10}%;background:${gradient}"></div></div></div>
        </div>
        <div class="modal-stats-grid">${statsGrid}</div>
        <div class="modal-breakdown"><h4>Rating Breakdown</h4>${breakdown}</div>`;
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.getElementById('modalClose').onclick = () => { document.getElementById('modalOverlay').classList.remove('active'); document.body.style.overflow=''; };
document.getElementById('modalOverlay').onclick = e => { if(e.target===e.currentTarget){document.getElementById('modalOverlay').classList.remove('active');document.body.style.overflow='';} };
document.addEventListener('keydown', e => { if(e.key==='Escape'){document.getElementById('modalOverlay').classList.remove('active');document.body.style.overflow='';} });

// ---- Render Players with Rankings ----
function renderPlayers() {
    const cat = document.querySelector('.filter-tab.active').dataset.category;
    const search = document.getElementById('searchInput').value.toLowerCase().trim();
    const sort = document.getElementById('sortSelect').value;

    let filtered = [...playerData];
    if (cat!=='all') filtered = filtered.filter(p=>p.category===cat);
    if (search) filtered = filtered.filter(p=>p.name.toLowerCase().includes(search)||p.country.toLowerCase().includes(search));

    if (sort==='rating-desc') filtered.sort((a,b)=>b._rating-a._rating);
    else if (sort==='rating-asc') filtered.sort((a,b)=>a._rating-b._rating);
    else if (sort==='name-asc') filtered.sort((a,b)=>a.name.localeCompare(b.name));
    else filtered.sort((a,b)=>b.name.localeCompare(a.name));

    const grid = document.getElementById('playersGrid');
    const noRes = document.getElementById('noResults');
    if (!filtered.length) { grid.innerHTML=''; noRes.style.display='block'; }
    else { noRes.style.display='none'; grid.innerHTML = filtered.map((p,i)=>createCard(p,i+1)).join(''); }
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        renderPlayers();
    });
});
document.getElementById('searchInput').addEventListener('input', renderPlayers);
document.getElementById('sortSelect').addEventListener('change', renderPlayers);
window.addEventListener('scroll', () => { document.getElementById('filterBar').classList.toggle('scrolled', window.scrollY>100); });

// Init
document.addEventListener('DOMContentLoaded', () => {
    const totalEl = document.getElementById('totalPlayers');
    let c=0; const step=Math.ceil(PLAYERS.length/40);
    const timer = setInterval(()=>{c=Math.min(c+step,PLAYERS.length);totalEl.textContent=c;if(c>=PLAYERS.length)clearInterval(timer);},30);
    renderPlayers();
});
