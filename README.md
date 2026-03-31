# 🏏 IPL Auction Player Rating & Team Builder

A complete IPL Auction tool that rates every player and lets you simulate building squads for all 10 IPL teams with real budget management.

🔗 **Live App:** [ipl-c5ouvuey7-chittis-projects-1248ef3e.vercel.app](https://ipl-c5ouvuey7-chittis-projects-1248ef3e.vercel.app)

---

## 📖 How to Use

### Page 1: Player Rating Dashboard

When you open the app, you'll see **all 184+ IPL players** rated on a scale of 1-10.

#### Browsing Players
1. **Scroll** through player cards to see ratings, key stats, and rankings
2. **Filter by role** — Click the tabs at the top:
   - 🏟️ All Players | 🏏 Batsmen | 🧤 Keepers | 🎯 Bowlers | ⚡ All-Rounders
3. **Search** — Type any player name in the search box (e.g. "Virat", "Bumrah")
4. **Sort** — Use the dropdown to sort by Rating ↓, Rating ↑, Name A-Z, or Name Z-A

#### Understanding the Cards
- **Rating Circle** — Color-coded score out of 10
  - 🥇 Gold (9+) = Elite | 🟢 Green (8+) = Outstanding | 🔵 Blue (7+) = Excellent
  - 🩵 Cyan (6+) = Good | ⚪ Gray (5+) = Average | ⬜ Dark (<5) = Below Avg
- **#1, #2, #3...** — Player's rank in the current view
- **⭐ STAR badge** — Marquee player with +0.5 rating boost
- **Click any card** → Opens a detailed popup with full stats and rating breakdown bars

---

### Page 2: Auction Builder (Playing XII)

Click the **"🏏 Open Auction Builder"** button at the top of the dashboard to enter the auction simulator.

#### Step 1: Set Your Budget
- At the top-right, enter your **total auction budget** (default: ₹100 Cr)
- Click **"Set for All Teams"** — this applies the same budget to all 10 teams

#### Step 2: Pick a Team
- Click any **team tab** (CSK, MI, RCB, KKR, DC, PBKS, RR, SRH, GT, LSG)
- Each team has its own separate squad and budget
- The number badge on each tab shows how many players that team has bought

#### Step 3: Buy Players
1. Browse the **Available Players** panel on the right side
   - Use **Search**, **Role filter**, and **Sort** (by Price or Rating) to find players
   - Each player shows an **Estimated Price** (₹ Cr) — this is auto-calculated based on their rating and market conditions
2. **Click a player** → A purchase modal opens showing:
   - Player name, role, rating
   - Suggested estimated price
   - Your remaining budget
3. **Enter the price** you want to pay (or keep the estimated price)
4. Click **"✓ Confirm Purchase"**
5. The player appears in your **squad slots** on the left

#### Step 4: Track Your Budget
The **info bar** at the top shows real-time stats:
| Stat | What it shows |
|------|--------------|
| **TEAM** | Currently selected team name |
| **TOTAL BUDGET** | Your set budget (same for all teams) |
| **SPENT** | Total money spent on players so far |
| **REMAINING** | Budget left (turns 🔴 red when low) |
| **SQUAD** | Players bought out of 18 max |
| **AVG RATING** | Average rating of your entire squad |

#### Step 5: Generate Best Playing XII
Once you have **12+ players** in a team's squad:

1. **Set your team composition** — Adjust the numbers for each role:
   - Default: 5 Batsmen + 1 Keeper + 4 Bowlers + 2 All-Rounders = **12 total**
   - The 12th player is the **Impact Player** (IPL's special substitution rule)
   - You can change these numbers — total must equal 12
2. Click **"⚡ Generate Best XII"**
3. The app automatically picks the **highest-rated players** from your squad for each role
4. The **Best Playing XII** section shows:
   - All 12 selected players with their rating and price
   - The 12th slot marked with **IMPACT** badge (highlighted in amber)
   - **XII Average Rating** — team strength indicator
   - **XII Cost** — how much your playing XII costs

#### Step 6: Manage Your Squad
- **Remove a player** — Click the ✕ button on any squad slot
- **Clear all** — Click "🗑️ Clear" to reset the entire team
- **Switch teams** — Click another team tab to build their squad separately

---

## 💡 Tips & Strategy

- **Buy a mix of roles** — You need at least 5 batsmen, 1 keeper, 4 bowlers, and 2 all-rounders (by default) for the Best XII
- **Watch the estimated prices** — They go UP as more players in that category get bought (scarcity!)
- **Star players (⭐) cost more** — They have a 30% price premium built into estimates
- **Overseas players** cost ~10% more in estimates
- **Budget wisely** — Buy some cheap options too, not just stars
- **Compare across teams** — Switch tabs to see how different team builds compare on average rating

---

## 🧮 How Ratings are Calculated

Ratings are calculated using a **weighted formula** based on official IPL career stats:

**Batsmen:** Runs (30%) + Average (25%) + Strike Rate (20%) + Impact 100s/50s (15%) + Experience (10%)

**Bowlers:** Wickets (30%) + Bowling Avg (25%) + Economy (20%) + Impact 4W/5W (15%) + Experience (10%)

**All-Rounders:** Balanced mix of batting + bowling metrics across 7 factors

**Star Boost:** 36 marquee players get +0.5 added to their final rating

---

## 💰 How Estimated Prices Work

The app suggests a price for every player based on:

1. **Rating tier** — Higher rated = more expensive (₹0.5 Cr to ₹18 Cr base)
2. **Star premium** — Star players are 1.3× more expensive
3. **Scarcity** — If fewer players remain in a role, prices go up (up to 60% increase)
4. **Overseas tax** — Non-Indian players cost 10% more

You are **not locked** to the estimated price — you can enter any price you want when buying.

---

## 📊 Data Source

All stats from **[iplt20.com](https://www.iplt20.com/stats/all-time)** — Official IPL All-Time Records.

---

Built with ❤️ for IPL fans and auction strategists.
