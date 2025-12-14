// app.js
'use strict';

/* -------------------- STATE -------------------- */
const state = {
  handle: '@spawniz',
  roleKey: 'creator',
  roleName: 'Creator / Artist',
  walletConnected: false,
  walletAddress: '0x1A6...b9fD',
  xp: 1575,
  spn: 497,
  wallets: 0,
  alerts: 3,
  gas: 0.20,
  eventsToday: 9,
  view: 'dashboard',
  tickerOffset: 0,
  tickerSpeed: 0.45,
};

const roleMap = {
  dev: 'Dev / Builder',
  creator: 'Creator / Artist',
  hunter: 'Alpha hunter',
  collector: 'Collector / Fan',
};

const rarityColors = {
  Fragment: 'tag',
  Shard: 'tag',
  Core: 'tag',
  Artifact: 'tag artifact',
  Relic: 'tag relic',
};

const kindIcon = {
  pack_open: '💎',
  zora_buy: '💰',
  burn: '🔥',
  farcaster_cast: '🟦',
  whale_alert: '🐋',
  treasure_hit: '🪙',
};

const kinds = [
  { kind: 'pack_open', label: 'Pack Öppnad' },
  { kind: 'zora_buy', label: 'Zora Köp' },
  { kind: 'burn', label: 'Fragment Burn' },
  { kind: 'farcaster_cast', label: 'Farcaster Cast' },
  { kind: 'whale_alert', label: 'Val Alert' },
  { kind: 'treasure_hit', label: 'Relik Funnen' },
];

const rarities = ['Fragment', 'Shard', 'Core', 'Artifact', 'Relic'];
const actors = ['CreatorX', 'MeshArchitect', 'SniperBot', 'WhaleA', 'NewUser', 'Spawniz'];
const seriesIds = ['S001-ALPHA', 'S002-BETA', 'S003-ZORA', 'S004-BASE', 'S005-MONAD'];
const seriesHeat = [
  { id: 'S001-ALPHA', name: 'Alpha Drop V1', spike: 'up', heat: 78, change: 12.3, asset: 'Ethereum' },
  { id: 'S002-BETA', name: 'Base Beta Set', spike: 'down', heat: 22, change: -4.5, asset: 'Base L2' },
  { id: 'S003-ZORA', name: 'Zora Coin Rail', spike: 'up', heat: 95, change: 25.1, asset: 'Zora' },
];

/* -------------------- HELPERS -------------------- */
const $ = (id) => document.getElementById(id);
            const quickPack = document.getElementById('btn-quick-pack');
            if (quickPack) quickPack.addEventListener('click', handleOpenPack);

            const quickMesh = document.getElementById('btn-quick-mesh');
            if (quickMesh) quickMesh.addEventListener('click', () => handleTabChange('mesh'));
function toast(msg, isError = false) {
  const el = $('toast');
  el.textContent = msg;
  el.style.background = isError ? '#ef4444' : '#10b981';
  el.style.color = isError ? '#0b1220' : '#061016';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function shortRole(roleName){
  const first = roleName.split('/')[0].trim();
  return first.length ? first : roleName;
}

function rand(min, max){ return Math.random() * (max - min) + min; }

function genEvent(i){
  const k = kinds[i % kinds.length];
  const rarity = rarities[Math.floor(Math.random()*rarities.length)];
  const actor = actors[Math.floor(Math.random()*actors.length)];
  const seriesId = seriesIds[Math.floor(Math.random()*seriesIds.length)];
  const value = (rand(12, 1200)).toFixed(2);

  return {
    id: `event-${Date.now()}-${i}`,
    timestamp: Date.now() - Math.floor(rand(1, 25))*60*1000,
    kind: k.kind,
    label: k.label,
    actor,
    rarity,
    seriesId,
    value: parseFloat(value),
  };
}

let events = Array.from({length: 30}, (_,i)=>genEvent(i));

/* -------------------- UI RENDER -------------------- */
function syncHeader(){
  $('handle').textContent = state.handle;
  $('settingsHandle').textContent = state.handle;

  $('rolePill').textContent = state.roleName;
  $('roleShort').textContent = shortRole(state.roleName);

  $('xp').textContent = String(state.xp);
  $('spn').textContent = String(state.spn);
  $('wallets').textContent = String(state.wallets);
  $('alertsCount').textContent = String(state.alerts);
  $('alertsKpi').textContent = String(state.alerts);
  $('gas').textContent = `~${state.gas.toFixed(2)} gwei`;
  $('eventsToday').textContent = String(state.eventsToday);

  $('vaultEth').textContent = state.walletConnected ? 'Vault 0.23 ETH' : 'Not connected';
  $('settingsWalletAddress').textContent = state.walletConnected ? state.walletAddress : 'Not connected';

  // Role grid selection
  document.querySelectorAll('#roleGrid .role-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.role === state.roleKey);
  });

  // Connect button look
  const connectBtn = $('btn-connect');
  connectBtn.querySelector('.label').textContent = state.walletConnected ? 'Ansluten' : 'Anslut';
  connectBtn.querySelector('.sub').textContent = state.walletConnected ? 'Vault 0.23 ETH' : 'Base wallet';
}

function setActiveView(view){
  state.view = view;

  // sidebar highlight
  document.querySelectorAll('.nav-item').forEach(b=>{
    b.classList.toggle('active', b.dataset.view === view);
  });

  // bottom nav highlight
  document.querySelectorAll('.bottom-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.view === view);
  });

  // views
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const target = $(`view-${view}`);
  if (target) target.classList.add('active');

  // special route: settings opens sheet
  if (view === 'settings'){
    openSettings();
  }

  // close sidebar on mobile
  $('sidebar').classList.remove('open');
}

function renderDashboard(){
  const root = $('view-dashboard');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Mesh HUD / Översikt</h2>
          <p>En enda sammanhängande vy över all aktivitet i SpawnEngine-ekosystemet.</p>
        </div>
        <div class="chip">Mesh · Live mock</div>
      </div>

      <div class="grid">
        <div class="gcard"><div class="k">Totala Packs Öppnade</div><div class="v">4,321</div></div>
        <div class="gcard"><div class="k">Total Volym (24h)</div><div class="v">$1.2M</div></div>
        <div class="gcard"><div class="k">Aktiva Skapare</div><div class="v">18</div></div>
        <div class="gcard"><div class="k">Mina XP / Nivå</div><div class="v">8,900 / 9</div></div>
      </div>
    </div>

    <div class="card section" style="margin-top:12px">
      <div class="section-head">
        <div>
          <h2>Senaste Mesh Aktivitet</h2>
          <p>Pack opens, burns, swaps, casts, whale alerts.</p>
        </div>
        <div class="chip">Feed</div>
      </div>
      <div class="list" id="dashList"></div>
    </div>
  `;

  const list = root.querySelector('#dashList');
  list.innerHTML = events.slice(0, 12).map(e => rowHTML(e)).join('');
  list.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', onRowAction);
  });
}

function renderTrading(){
  const root = $('view-trading');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Trading Wall</h2>
          <p>Live feed av marknadshändelser, valar och serie-spikes.</p>
        </div>
        <div class="chip">Wall</div>
      </div>

      <div class="card section" style="background: rgba(255,255,255,.02); border-color: rgba(255,255,255,.06)">
        <div class="section-head">
          <div>
            <h2>Serie Heatmap</h2>
            <p>Snabb känsla: vad som kokar i meshen just nu.</p>
          </div>
          <div class="chip">Heat</div>
        </div>
        <div class="grid" style="grid-template-columns: repeat(3, minmax(0, 1fr))" id="heatGrid"></div>
      </div>

      <div style="height:12px"></div>

      <div class="controls">
        <button class="pillbtn active" data-filter="all">All aktivitet</button>
        <button class="pillbtn" data-filter="whales">Valar</button>
        <button class="pillbtn" data-filter="spikes">Spikes (Artifact/Relic)</button>
        <button class="pillbtn" data-filter="packs">Pack opens</button>
      </div>

      <div class="list" id="tradeList"></div>
    </div>
  `;

  const heat = root.querySelector('#heatGrid');
  heat.innerHTML = seriesHeat.map(s=>{
    const up = s.spike === 'up';
    return `
      <div class="gcard" style="cursor:pointer">
        <div class="k">${s.name}</div>
        <div class="v" style="font-size:22px">${up ? '▲' : '▼'} ${s.change}%</div>
        <div style="margin-top:10px;height:8px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden">
          <div style="height:100%;width:${s.heat}%;background:${s.heat>70?'rgba(239,68,68,.75)':'rgba(91,124,250,.8)'}"></div>
        </div>
        <div class="k" style="margin-top:10px">${s.asset} · Heat ${s.heat}</div>
      </div>
    `;
  }).join('');

  const list = root.querySelector('#tradeList');
  list.innerHTML = events.map(e => rowHTML(e, true)).join('');
  list.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', onRowAction);
  });

  root.querySelectorAll('.pillbtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      root.querySelectorAll('.pillbtn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const f = b.dataset.filter;
      const filtered = filterEvents(f);
      list.innerHTML = filtered.map(e=>rowHTML(e, true)).join('');
      list.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click', onRowAction));
    });
  });
}

function renderPacks(){
  const root = $('view-packs');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Packs & Inventory</h2>
          <p>Här hamnar dina packs, kort, rarities och sets (mock).</p>
        </div>
        <div class="chip">Inventory</div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(2, minmax(0,1fr))">
        <div class="gcard">
          <div class="k">Oöppnade packs</div>
          <div class="v">7</div>
        </div>
        <div class="gcard">
          <div class="k">Fragments</div>
          <div class="v">142</div>
        </div>
        <div class="gcard">
          <div class="k">Artifacts</div>
          <div class="v">3</div>
        </div>
        <div class="gcard">
          <div class="k">Relics</div>
          <div class="v">1</div>
        </div>
      </div>

      <div style="height:12px"></div>

      <div class="card section" style="background: rgba(255,255,255,.02); border-color: rgba(255,255,255,.06)">
        <div class="section-head">
          <div>
            <h2>Pack Reveal Widget</h2>
            <p>CSGO-style opening (demo). Detta är exakt den “import-bara funktionen” du snackar om.</p>
          </div>
          <div class="chip">Widget</div>
        </div>

        <button class="btn-primary" id="btnOpenPack">Open a pack</button>
        <div id="revealBox" class="note" style="margin-top:12px">Ready.</div>
      </div>
    </div>
  `;

  root.querySelector('#btnOpenPack').addEventListener('click', ()=>{
    const box = root.querySelector('#revealBox');
    box.textContent = 'Revealing...';
    setTimeout(()=>{
      const r = rarities[Math.floor(Math.random()*rarities.length)];
      const value = rand(5, 900).toFixed(2);
      box.textContent = `PULL: ${r} · Notional $${value} · (mock reveal)`;
      toast('Pack opened · event logged');
      addEvent({ kind:'pack_open', label:'Pack Öppnad', rarity: r, value: parseFloat(value) });
    }, 900);
  });
}

function renderPull(){
  const root = $('view-pull');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Pull Lab / Luck Engine</h2>
          <p>Burn → Synth → gamble. Hårda regler, snygg UI, brutal tur.</p>
        </div>
        <div class="chip">Luck</div>
      </div>

      <div class="formrow">
        <div class="controls">
          ${rarities.map(r=>`<button class="pillbtn ${r==='Relic'?'active':''}" data-rarity="${r}">${r}</button>`).join('')}
        </div>

        <button class="btn-primary" id="btnPredict">Få Lyckoförutsägelse</button>
        <div id="luckOut" class="note">Välj rarity och kör.</div>

        <div class="card section" style="background: rgba(255,255,255,.02); border-color: rgba(255,255,255,.06)">
          <div class="section-head">
            <div>
              <h2>Burn & Syntes</h2>
              <p>Platshållare för riktiga kontrakts-calls senare.</p>
            </div>
            <div class="chip">Mechanics</div>
          </div>
          <button class="btn-primary" id="btnBurn">Burn 10 Fragments</button>
        </div>
      </div>
    </div>
  `;

  let desired = 'Relic';
  root.querySelectorAll('[data-rarity]').forEach(b=>{
    b.addEventListener('click', ()=>{
      root.querySelectorAll('[data-rarity]').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      desired = b.dataset.rarity;
    });
  });

  root.querySelector('#btnPredict').addEventListener('click', ()=>{
    const out = root.querySelector('#luckOut');
    out.textContent = 'Frammanar skuggan...';
    setTimeout(()=>{
      out.textContent =
        `Luck Engine: Du jagar ${desired}. \n`+
        `Offret som krävs är tid, disciplin och 1 onchain-ritual per dag.\n`+
        `Om meshen pulserar grönt (val-alerts + spikes), då slår du till.\n\n`+
        `Belöning: +XP när du följer reglerna. Straff: du bränner i mörker.`;
      toast('Luck Engine delivered');
    }, 700);
  });

  root.querySelector('#btnBurn').addEventListener('click', ()=>{
    toast('Burn executed (mock)');
    addEvent({ kind:'burn', label:'Fragment Burn', rarity:'Shard', value: rand(10,120) });
    state.xp += 40;
    state.spn += 6;
    syncHeader();
  });
}

function renderForge(){
  const root = $('view-forge');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Creator Forge</h2>
          <p>Zero-code “Roblox för kontrakt” + Importera app + köp moduler.</p>
        </div>
        <div class="chip">Forge</div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(2, minmax(0,1fr))">
        <div class="gcard">
          <div class="k">Importera din app</div>
          <div class="v" style="font-size:18px">Surface SDK</div>
          <div class="note" style="margin-top:10px">
            Lägg in din miniapp här och få: wallet, events, XP, reveal-widget.
          </div>
          <button class="btn-mini green" data-action="import">Start</button>
        </div>

        <div class="gcard">
          <div class="k">Köp/Hyr funktioner</div>
          <div class="v" style="font-size:18px">Module Store</div>
          <div class="note" style="margin-top:10px">
            Reveal, Market Sync, Alerts, Leaderboard, Referral, Badges.
          </div>
          <button class="btn-mini" data-action="store">Browse</button>
        </div>

        <div class="gcard">
          <div class="k">SpawnBot Command</div>
          <div class="v" style="font-size:18px">Create a module</div>
          <div class="note" style="margin-top:10px">Skriv exakt som du vill: “Create a app for me…”</div>
        </div>

        <div class="gcard">
          <div class="k">Deploy Center</div>
          <div class="v" style="font-size:18px">Factory</div>
          <div class="note" style="margin-top:10px">PackFactory / Router / ReserveGuard (pluggas in senare).</div>
          <button class="btn-mini red" data-action="deploy">Prepare</button>
        </div>
      </div>

      <div style="height:12px"></div>

      <label class="mono small" style="color: var(--muted)">SpawnBot prompt</label>
      <textarea id="forgePrompt" rows="4" placeholder="Create a module for me that..."></textarea>
      <div style="height:10px"></div>
      <button class="btn-primary" id="btnRunForge">Run mesh</button>
      <div id="forgeOut" class="note" style="margin-top:12px">Ready.</div>
    </div>
  `;

  root.querySelector('#btnRunForge').addEventListener('click', ()=>{
    const t = root.querySelector('#forgePrompt').value.trim();
    const out = root.querySelector('#forgeOut');
    out.textContent = 'Running mesh query...';
    if (t.length < 5){
      out.textContent = 'Error: prompt too short.';
      toast('Mesh command failed', true);
      return;
    }
    setTimeout(()=>{
      out.textContent = `[SUCCESS] Drafted: "${t.slice(0,42)}${t.length>42?'...':''}"\nXP Route: CREATE-FLOW-COMPLETED (+150 XP)\nSurface: importable-widget::reveal_v1`;
      state.xp += 150;
      syncHeader();
      toast('Module drafted · +150 XP');
      addEvent({ kind:'treasure_hit', label:'Relik Funnen', rarity:'Artifact', value: rand(120,1200) });
      root.querySelector('#forgePrompt').value = '';
    }, 900);
  });

  root.querySelectorAll('[data-action]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const a = b.dataset.action;
      if (a === 'import'){ toast('Surface SDK: import flow opened (mock)'); addEvent({kind:'farcaster_cast', label:'Farcaster Cast', rarity:'Core', value: rand(10,200)}); }
      if (a === 'store'){ toast('Module Store opened (mock)'); }
      if (a === 'deploy'){ toast('Deploy Center prepared (mock)', false); }
    });
  });
}

function renderFeed(){
  const root = $('view-feed');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>SpawnFeed / Reels</h2>
          <p>Vertikal feed av verifierade onchain-posts från Event Meshen (mock).</p>
        </div>
        <div class="chip">Feed</div>
      </div>

      <div class="list" id="feedList"></div>
    </div>
  `;
  const list = root.querySelector('#feedList');
  const items = events.slice(0, 10).map(e => ({
    title: `${e.actor} · ${e.label}`,
    meta: `${new Date(e.timestamp).toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'})} · ${e.seriesId} · ${e.rarity} · $${e.value}`,
    action: 'View'
  }));
  list.innerHTML = items.map((x,i)=>`
    <div class="row">
      <div class="bubble">🎥</div>
      <div>
        <div class="title">${escapeHTML(x.title)}</div>
        <div class="meta">${escapeHTML(x.meta)}</div>
      </div>
      <div class="right">
        <button class="btn-mini" data-action="feed" data-idx="${i}">${x.action}</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-action="feed"]').forEach(b=>{
    b.addEventListener('click', ()=>toast('Reel opened (mock)'));
  });
}

function renderSupcast(){
  const root = $('view-supcast');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>SupCast / Support</h2>
          <p>Support som gameplay: replies + solves → XP (mock).</p>
        </div>
        <div class="chip">Support</div>
      </div>

      <div class="list">
        ${ticketRow('#1023','Pack reveal not loading','Open',45)}
        ${ticketRow('#1024','Listing sync delay','Open',30)}
        ${ticketRow('#1025','Wallet connect UX','Solved',60)}
      </div>
    </div>
  `;

  root.querySelectorAll('[data-ticket]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const xp = Number(b.dataset.xp || 0);
      const id = b.dataset.ticket;
      toast(`${id} updated · +${xp} XP`);
      state.xp += xp;
      syncHeader();
      addEvent({ kind:'farcaster_cast', label:'Farcaster Cast', rarity:'Core', value: rand(10,180) });
    });
  });
}

function renderLeaderboard(){
  const root = $('view-leaderboard');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Leaderboard</h2>
          <p>XP + reputation + streaks (mock).</p>
        </div>
        <div class="chip">Rank</div>
      </div>

      <div class="list">
        ${lbRow(1,'Spawniz', state.xp, 'Creator')}
        ${lbRow(2,'CreatorX', 8200, 'Builder')}
        ${lbRow(3,'WhaleA', 6400, 'Trader')}
        ${lbRow(4,'NewUser', 1200, 'Collector')}
      </div>
    </div>
  `;
}

function renderProfile(){
  const root = $('view-profile');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Min Profil</h2>
          <p>En wallet, flera surfaces. Allt flödar in i ett mesh.</p>
        </div>
        <div class="chip">Profile</div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(2, minmax(0,1fr))">
        <div class="gcard">
          <div class="k">XP streak</div>
          <div class="v">1575</div>
          <div class="k" style="margin-top:8px">Grows via daily mesh tasks</div>
        </div>
        <div class="gcard">
          <div class="k">Spawn balance</div>
          <div class="v">497</div>
          <div class="k" style="margin-top:8px">Rewards from packs & quests</div>
        </div>
      </div>

      <div style="height:12px"></div>

      <div class="card section" style="background: rgba(255,255,255,.02); border-color: rgba(255,255,255,.06)">
        <div class="section-head">
          <div>
            <h2>Connected surfaces</h2>
            <p>Token packs · NFT packs · Zora coins · Farcaster casts.</p>
          </div>
          <div class="chip">Surfaces</div>
        </div>

        <div class="list">
          <div class="row">
            <div class="bubble">🧱</div>
            <div><div class="title">Base wallet</div><div class="meta">Required for XP + rewards binding</div></div>
            <div class="right"><div class="tag">REQUIRED</div></div>
          </div>
          <div class="row">
            <div class="bubble">🟣</div>
            <div><div class="title">Farcaster</div><div class="meta">Casts → first-class mesh events</div></div>
            <div class="right"><div class="tag artifact">PLANNED</div></div>
          </div>
          <div class="row">
            <div class="bubble">🟢</div>
            <div><div class="title">Zora</div><div class="meta">Coins + mints streamed into activity mesh</div></div>
            <div class="right"><div class="tag">DOCKED</div></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSettingsView(){
  const root = $('view-settings');
  root.innerHTML = `
    <div class="card section">
      <div class="section-head">
        <div>
          <h2>Inställningar</h2>
          <p>Öppna sheeten via ⚙ (Settings). Den här vyn är bara en landing.</p>
        </div>
        <div class="chip">Settings</div>
      </div>
      <button class="btn-primary" id="openSettingsHere">Open settings sheet</button>
    </div>
  `;
  root.querySelector('#openSettingsHere').addEventListener('click', openSettings);
}

/* -------------------- ROW HTML -------------------- */
function rowHTML(e, compact = false){
  const time = new Date(e.timestamp).toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'});
  const icon = kindIcon[e.kind] || '•';
  const tagClass = rarityColors[e.rarity] || 'tag';
  const action = (e.kind === 'pack_open' || e.kind === 'treasure_hit') ? 'Se Kort'
              : (e.kind === 'burn') ? 'Pull Lab'
              : (e.kind === 'whale_alert') ? 'Följ Val'
              : 'Diskutera';

  const actionClass = (e.kind === 'burn') ? 'btn-mini red' : (e.kind === 'whale_alert') ? 'btn-mini green' : 'btn-mini';

  return `
    <div class="row">
      <div class="bubble">${icon}</div>
      <div>
        <div class="title">${escapeHTML(e.label)} <span class="mono small" style="color:var(--muted)">(${time})</span></div>
        <div class="meta">
          <span class="kv">${escapeHTML(e.actor)}</span> interagerade med <span class="mono">${escapeHTML(e.seriesId)}</span>.
          Notional <span class="kv green">$${Number(e.value).toFixed(2)}</span>
        </div>
      </div>
      <div class="right">
        <div class="${tagClass}">${escapeHTML(e.rarity)}</div>
        <button class="${actionClass}" data-action="${action}" data-kind="${e.kind}">${action}</button>
      </div>
    </div>
  `;
}

function ticketRow(id,title,status,xp){
  const color = status === 'Solved' ? 'kv green' : 'kv yellow';
  return `
    <div class="row">
      <div class="bubble">🛰</div>
      <div>
        <div class="title">${escapeHTML(id)} — “${escapeHTML(title)}”</div>
        <div class="meta"><span class="${color}">${escapeHTML(status)}</span> · <span class="kv">+${xp} XP</span></div>
      </div>
      <div class="right">
        <button class="btn-mini" data-ticket="${escapeHTML(id)}" data-xp="${xp}">Update</button>
      </div>
    </div>
  `;
}

function lbRow(rank,name,xp,role){
  return `
    <div class="row">
      <div class="bubble">#${rank}</div>
      <div>
        <div class="title">${escapeHTML(name)}</div>
        <div class="meta">${escapeHTML(role)} · <span class="kv green">${xp} XP</span></div>
      </div>
      <div class="right">
        <button class="btn-mini">View</button>
      </div>
    </div>
  `;
}

function escapeHTML(s){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

/* -------------------- ACTIONS -------------------- */
function onRowAction(ev){
  ev.stopPropagation();
  const kind = ev.currentTarget.dataset.kind || '';
  if (kind === 'burn') setActiveView('pull');
  if (kind === 'pack_open' || kind === 'treasure_hit') toast('Card opened (mock)');
  if (kind === 'whale_alert') toast('Whale followed (mock)');
  if (!kind) toast('Action');
}

function filterEvents(filter){
  if (filter === 'whales') return events.filter(e=>e.kind === 'whale_alert');
  if (filter === 'spikes') return events.filter(e=>e.rarity === 'Artifact' || e.rarity === 'Relic');
  if (filter === 'packs') return events.filter(e=>e.kind === 'pack_open');
  return events;
}

function addEvent(partial){
  const e = {
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: Date.now(),
    kind: partial.kind || 'pack_open',
    label: partial.label || 'Event',
    actor: partial.actor || 'Spawniz',
    rarity: partial.rarity || 'Core',
    seriesId: partial.seriesId || 'S003-ZORA',
    value: partial.value ?? rand(5, 500),
  };
  events.unshift(e);
  events = events.slice(0, 30);
  state.eventsToday = Math.min(99, state.eventsToday + 1);
  syncHeader();
  rebuildTicker();
  rerenderActiveLists();
}

function rerenderActiveLists(){
  // only refresh lists if their view exists
  const dash = $('view-dashboard');
  if (dash.classList.contains('active')){
    const list = dash.querySelector('#dashList');
    if (list){
      list.innerHTML = events.slice(0, 12).map(e=>rowHTML(e)).join('');
      list.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click', onRowAction));
    }
  }
  const trade = $('view-trading');
  if (trade.classList.contains('active')){
    const list = trade.querySelector('#tradeList');
    if (list){
      list.innerHTML = events.map(e=>rowHTML(e,true)).join('');
      list.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click', onRowAction));
    }
  }
}

/* -------------------- SETTINGS SHEET -------------------- */
function openSettings(){
  $('settings-backdrop').classList.remove('hidden');
}
function closeSettings(){
  $('settings-backdrop').classList.add('hidden');
}

/* -------------------- NAV WIRING -------------------- */
function wireNav(){
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.addEventListener('click', ()=>setActiveView(btn.dataset.view));
  });
  document.querySelectorAll('.bottom-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>setActiveView(btn.dataset.view));
  });

  $('btn-menu').addEventListener('click', ()=>{
    $('sidebar').classList.toggle('open');
  });

  $('settings-btn').addEventListener('click', openSettings);
  $('settings-close').addEventListener('click', closeSettings);

  $('settings-backdrop').addEventListener('click', (e)=>{
    if (e.target.id === 'settings-backdrop') closeSettings();
  });

  $('btn-alerts').addEventListener('click', ()=>{
    state.alerts = 0;
    syncHeader();
    toast('Alerts cleared');
  });

  $('btn-connect').addEventListener('click', ()=>{
    state.walletConnected = !state.walletConnected;
    if (state.walletConnected){
      state.wallets += 1;
      state.xp += 100;
      toast(`Wallet connected · ${state.walletAddress}`);
      addEvent({ kind:'zora_buy', label:'Zora Köp', rarity:'Core', value: rand(15, 400) });
    } else {
      state.wallets = Math.max(0, state.wallets - 1);
      toast('Wallet disconnected');
    }
    syncHeader();
  });

  $('btn-logout').addEventListener('click', ()=>{
    toast('Logged out (mock)');
  });

  // role selection + save
  $('roleGrid').addEventListener('click', (e)=>{
    const card = e.target.closest('.role-card');
    if (!card) return;
    const newKey = card.dataset.role;
    const save = $('save-role');
    document.querySelectorAll('#roleGrid .role-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    save.disabled = (newKey === state.roleKey);
    save.dataset.pending = newKey;
  });

  $('save-role').addEventListener('click', ()=>{
    const pending = $('save-role').dataset.pending;
    if (!pending || pending === state.roleKey) return;
    state.roleKey = pending;
    state.roleName = roleMap[pending] || state.roleName;
    $('save-role').disabled = true;
    toast(`Role updated: ${state.roleName}`);
    syncHeader();
  });
}

/* -------------------- VIEW RENDER ROUTER -------------------- */
function renderAllViews(){
  renderDashboard();
  renderTrading();
  renderPacks();
  renderPull();
  renderForge();
  renderFeed();
  renderSupcast();
  renderSettingsView();
  renderLeaderboard();
  renderProfile();
}

/* -------------------- TICKER -------------------- */
function tickHTML(e){
  const time = new Date(e.timestamp).toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'});
  const icon = kindIcon[e.kind] || '•';
  const tagClass = rarityColors[e.rarity] || 'tag';
  const verb = (e.kind === 'treasure_hit') ? 'Hittade' : (e.kind === 'whale_alert') ? 'Köpte' : e.label;

  return `
    <div class="tick">
      <span class="t mono">${time}</span>
      <span>${icon}</span>
      <span class="actor">${escapeHTML(e.actor)}</span>
      <span class="what">${escapeHTML(verb)}</span>
      <span class="${tagClass}">${escapeHTML(e.rarity)}</span>
      <span class="money mono">$${Number(e.value).toFixed(2)}</span>
      <span class="t">↗</span>
    </div>
  `;
}

function rebuildTicker(){
  const track = $('tickerTrack');
  const interesting = events.filter(e => (e.kind === 'whale_alert' || e.kind === 'treasure_hit' || e.rarity === 'Artifact' || e.rarity === 'Relic')).slice(0, 12);
  const base = interesting.length ? interesting : events.slice(0, 10);

  // duplicate for infinite loop
  track.innerHTML = base.map(tickHTML).join('') + base.map(tickHTML).join('');
  state.tickerOffset = 0;
}

function animateTicker(){
  const track = $('tickerTrack');
  if (!track) return;
  state.tickerOffset -= state.tickerSpeed;

  // reset when half scrolled
  const half = track.scrollWidth / 2;
  if (Math.abs(state.tickerOffset) > half) state.tickerOffset = 0;

  track.style.transform = `translate3d(${state.tickerOffset}px,0,0)`;
  requestAnimationFrame(animateTicker);
}

/* -------------------- CANVAS MESH -------------------- */
function initCanvasBackground(){
  const canvas = $('meshCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const num = 85;
  const linkDist = 160;

  function resize(){
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  window.addEventListener('resize', resize);
  resize();

  class P{
    constructor(){
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random()-0.5) * 0.35;
      this.vy = (Math.random()-0.5) * 0.35;
      this.r = Math.random() * 1.6 + 0.6;
    }
    step(){
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20 || this.x > window.innerWidth+20) this.vx *= -1;
      if (this.y < -20 || this.y > window.innerHeight+20) this.vy *= -1;
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(91,124,250,.85)';
      ctx.fill();
    }
  }

  particles = Array.from({length:num}, ()=>new P());

  function connect(){
    for (let i=0;i<num;i++){
      for (let j=i+1;j<num;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy=a.y-b.y;
        const d = Math.hypot(dx,dy);
        if (d < linkDist){
          const o = 1 - d/linkDist;
          ctx.strokeStyle = `rgba(91,124,250,${o*0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
  }

  function loop(){
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    connect();
    particles.forEach(p=>{p.step();p.draw();});
    requestAnimationFrame(loop);
  }
  loop();
}

/* -------------------- LIVE SIM -------------------- */
function startLiveSim(){
  setInterval(()=>{
    const e = genEvent(events.length);
    events.unshift(e);
    events = events.slice(0, 30);

    if (Math.random() > 0.72) state.alerts = Math.min(9, state.alerts + 1);
    state.gas = Math.max(0.08, Math.min(2.2, state.gas + (Math.random()-0.5)*0.12));
    state.eventsToday = Math.min(99, state.eventsToday + 1);

    syncHeader();
    rebuildTicker();
    rerenderActiveLists();
  }, 5000);
}

/* -------------------- BOOT -------------------- */
function boot(){
  syncHeader();
  wireNav();

  renderAllViews();
  rebuildTicker();
  animateTicker();
  initCanvasBackground();
  startLiveSim();

  setActiveView('dashboard');
  toast('SpawnEngine Mesh HUD loaded');
}

window.addEventListener('DOMContentLoaded', boot);