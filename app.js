// app.js
(() => {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

  // ---------- STATE ----------
  const state = {
    view: "dashboard",
    role: "creator",
    connected: false,
    wallet: null,
    alerts: 3,
    xp: 1575,
    spn: 497,
    wallets: 0,
    eventsToday: 10,
    gas: 0.18
  };

  // ---------- UI refs ----------
  const sidebar = $("#sidebar");
  const btnMenu = $("#btn-menu");
  const settingsBtn = $("#settings-btn");
  const settingsBackdrop = $("#settings-backdrop");
  const settingsClose = $("#settings-close");
  const btnConnect = $("#btn-connect");
  const connectLabel = $("#connectLabel");
  const vaultEth = $("#vaultEth");
  const alertsCount = $("#alertsCount");
  const alertsKpi = $("#alertsKpi");
  const toast = $("#toast");

  const gasEl = $("#gas");
  const walletsEl = $("#wallets");
  const xpEl = $("#xp");
  const spnEl = $("#spn");
  const eventsTodayEl = $("#eventsToday");

  const roleGrid = $("#roleGrid");
  const saveRoleBtn = $("#save-role");
  const rolePill = $("#rolePill");
  const roleShort = $("#roleShort");

  const quickPack = $("#btn-quick-pack");
  const quickMesh = $("#btn-quick-mesh");

  const tickerTrack = $("#tickerTrack");

  // ---------- HELPERS ----------
  const fmtMoney = (n) => {
    try { return new Intl.NumberFormat("sv-SE", { style:"currency", currency:"USD", maximumFractionDigits:2 }).format(n); }
    catch { return `$${Number(n).toFixed(2)}`; }
  };

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> toast.classList.remove("show"), 1400);
  }

  function setView(view){
    state.view = view;

    $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    $$(".bottom-btn").forEach(b => b.classList.toggle("active", b.dataset.view === view));

    $$(".view").forEach(v => v.classList.remove("active"));
    const target = $(`#view-${view}`);
    if (target) target.classList.add("active");

    // close sidebar on mobile
    if (window.matchMedia("(max-width:980px)").matches) sidebar.classList.remove("open");

    // render view content
    renderView(view);
  }

  function openSettings(){
    settingsBackdrop.classList.remove("hidden");
  }
  function closeSettings(){
    settingsBackdrop.classList.add("hidden");
  }

  function connectMock(){
    state.connected = !state.connected;
    if (state.connected){
      state.wallet = "0x7a3f...B2d9";
      connectLabel.textContent = "Ansluten";
      vaultEth.textContent = "Vault 0.23 ETH";
      $("#settingsWalletAddress").textContent = state.wallet;
      showToast("Wallet ansluten (mock)");
    } else {
      state.wallet = null;
      connectLabel.textContent = "Anslut";
      vaultEth.textContent = "Base wallet";
      $("#settingsWalletAddress").textContent = "Not connected";
      showToast("Wallet frånkopplad");
    }
  }

  // ---------- TICKER ----------
  const TICK_ITEMS = [
    { left:"SniperBot", tag:"Pack Öppnad", badge:"Artifact", value:53.60 },
    { left:"Zora Köp", tag:"Fragment", badge:"Diskutera", value:606.61 },
    { left:"Fragment Burn", tag:"Core", badge:"Pull Lab", value:1008.70 },
    { left:"Farcaster Cast", tag:"Fragment", badge:"Diskutera", value:192.69 },
    { left:"Val Alert", tag:"Relic", badge:"Följ Val", value:104.41 }
  ];

  function renderTicker(){
    tickerTrack.innerHTML = "";
    const items = [...TICK_ITEMS, ...TICK_ITEMS, ...TICK_ITEMS]; // loop feel
    items.forEach(it => {
      const el = document.createElement("div");
      el.className = "ticker-item";
      el.innerHTML = `
        <strong>${it.left}</strong>
        <span class="tag">${it.tag}</span>
        <span class="tag">${it.badge}</span>
        <span class="value">${fmtMoney(it.value)}</span>
      `;
      tickerTrack.appendChild(el);
    });

    // simple marquee
    let x = 0;
    const speed = 0.35; // smooth
    function tick(){
      x -= speed;
      const w = tickerTrack.scrollWidth / 3; // because tripled
      if (Math.abs(x) > w) x = 0;
      tickerTrack.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- VIEWS RENDER ----------
  function renderView(view){
    const root = $(`#view-${view}`);
    if (!root) return;

    // dashboard default
    if (view === "dashboard"){
      root.innerHTML = `
        <div class="grid-2">
          <div class="panel">
            <div class="section-title">Mesh HUD / Översikt</div>
            <div class="grid-2">
              <div class="panel" style="padding:12px">
                <div class="k">Totala Packs Öppnade</div>
                <div class="v" style="font-size:28px;margin-top:6px">4,321</div>
              </div>
              <div class="panel" style="padding:12px">
                <div class="k">Total Volym (24h)</div>
                <div class="v" style="font-size:28px;margin-top:6px">$1.2M</div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="section-title">Live events (mock)</div>
            <div class="list" id="liveEvents"></div>
          </div>
        </div>
      `;
      renderEvents($("#liveEvents"));
      return;
    }

    if (view === "trading"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">Trading Wall</div>
          <div class="list" id="tradeList"></div>
        </div>
      `;
      renderTrade($("#tradeList"));
      return;
    }

    if (view === "packs"){
      root.innerHTML = `
        <div class="grid-2">
          <div class="panel">
            <div class="section-title">Packs & Inventory</div>
            <div class="grid-2">
              <div class="panel" style="padding:12px">
                <div class="k">Öppnade packs</div>
                <div class="v" style="font-size:28px;margin-top:6px">7</div>
              </div>
              <div class="panel" style="padding:12px">
                <div class="k">Fragments</div>
                <div class="v" style="font-size:28px;margin-top:6px">142</div>
              </div>
            </div>
            <div style="height:10px"></div>
            <button class="btn-primary full-width" id="openPackBtn">Open pack (mock reveal)</button>
          </div>

          <div class="panel">
            <div class="section-title">Senaste drops</div>
            <div class="list" id="packList"></div>
          </div>
        </div>
      `;
      renderPacks($("#packList"));
      const openPackBtn = $("#openPackBtn");
      if (openPackBtn) openPackBtn.addEventListener("click", handleOpenPack);
      return;
    }

    if (view === "pull"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">Pull Lab / Luck Engine</div>
          <div class="grid-2">
            <div class="panel" style="padding:12px">
              <div class="k">Luck</div>
              <div class="v" style="font-size:28px;margin-top:6px">${(Math.random()*100).toFixed(1)}%</div>
            </div>
            <div class="panel" style="padding:12px">
              <div class="k">Rarity bias</div>
              <div class="v" style="font-size:28px;margin-top:6px">+${(Math.random()*8).toFixed(1)}</div>
            </div>
          </div>
          <div style="height:10px"></div>
          <div class="list" id="pullList"></div>
        </div>
      `;
      renderPull($("#pullList"));
      return;
    }

    if (view === "forge"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">Creator Forge</div>
          <div class="grid-2">
            <div class="panel" style="padding:12px">
              <div class="k">Module slots</div>
              <div class="v" style="font-size:28px;margin-top:6px">5</div>
            </div>
            <div class="panel" style="padding:12px">
              <div class="k">Active surfaces</div>
              <div class="v" style="font-size:28px;margin-top:6px">2</div>
            </div>
          </div>
          <div style="height:10px"></div>
          <div class="list" id="forgeList"></div>
        </div>
      `;
      renderForge($("#forgeList"));
      return;
    }

    if (view === "feed"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">SpawnFeed / Reels</div>
          <div class="list" id="feedList"></div>
        </div>
      `;
      renderFeed($("#feedList"));
      return;
    }

    if (view === "supcast"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">SupCast / Support</div>
          <div class="list" id="supList"></div>
        </div>
      `;
      renderSup($("#supList"));
      return;
    }

    if (view === "settings"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">Inställningar</div>
          <p style="margin:0;color:rgba(255,255,255,.65)">Öppna Settings-sheeta uppe till höger för full profil.</p>
          <div style="height:10px"></div>
          <button class="btn-primary" id="openSettingsInline">Open Settings</button>
        </div>
      `;
      const b = $("#openSettingsInline");
      if (b) b.addEventListener("click", openSettings);
      return;
    }

    if (view === "leaderboard"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">Leaderboard</div>
          <div class="list" id="lbList"></div>
        </div>
      `;
      renderLeaderboard($("#lbList"));
      return;
    }

    if (view === "profile"){
      root.innerHTML = `
        <div class="panel">
          <div class="section-title">Min Profil</div>
          <div class="grid-2">
            <div class="panel" style="padding:12px">
              <div class="k">Handle</div>
              <div class="v" style="font-size:22px;margin-top:6px">@spawniz</div>
              <div class="sub" style="color:rgba(255,255,255,.60);font-size:12px;margin-top:4px">Mesh ID · ${state.role}</div>
            </div>
            <div class="panel" style="padding:12px">
              <div class="k">Status</div>
              <div class="v" style="font-size:22px;margin-top:6px">${state.connected ? "Connected" : "Not connected"}</div>
              <div class="sub" style="color:rgba(255,255,255,.60);font-size:12px;margin-top:4px">Wallet: ${state.wallet || "—"}</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    root.innerHTML = "";
  }

  // ---------- MOCK CONTENT ----------
  function renderEvents(root){
    if (!root) return;
    const now = new Date();
    const events = [
      { title:"Zora Köp", sub:"CreatorX interagerade med S002–BETA. Notional", tag:"Fragment", cta:"Diskutera", value:606.61 },
      { title:"Fragment Burn", sub:"MeshArchitect interagerade med S005–MONAD. Notional", tag:"Core", cta:"Pull Lab", value:1008.70 },
      { title:"Farcaster Cast", sub:"NewUser interagerade med S005–MONAD. Notional", tag:"Fragment", cta:"Diskutera", value:192.69 },
      { title:"Val Alert", sub:"MeshArchitect interagerade med S004–BASE. Notional", tag:"Relic", cta:"Följ Val", value:104.41 },
      { title:"Pack Öppnad", sub:"Spawniz interagerade med S003–ZORA. Notional", tag:"Fragment", cta:"Se Kort", value:1137.37 },
    ];

    root.innerHTML = "";
    events.forEach((e,i)=>{
      const t = new Date(now.getTime() - (i*6+2)*60000);
      const hh = String(t.getHours()).padStart(2,"0");
      const mm = String(t.getMinutes()).padStart(2,"0");

      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">${e.title} <span style="opacity:.55;font-weight:700">(${hh}:${mm})</span></div>
          <div class="sub">${e.sub}</div>
        </div>
        <div class="right">
          <span class="chip">${e.tag}</span>
          <button class="cta" data-cta="${e.cta}">${e.cta}</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${fmtMoney(e.value)}</div>
        </div>
      `;
      root.appendChild(el);
    });

    $$(".cta", root).forEach(b=>{
      b.addEventListener("click", ()=>{
        state.xp += 10;
        syncKpis();
        showToast(`Action: ${b.dataset.cta} (+10 XP)`);
      });
    });
  }

  function renderTrade(root){
    if (!root) return;
    const items = [
      { title:"Buy", sub:"S003–ZORA · 25 sparks · route: Base", tag:"Market", cta:"Simulera", value:53.60 },
      { title:"Sell", sub:"S005–MONAD · 12 sparks · route: Base", tag:"PnL", cta:"Se PnL", value:104.41 },
      { title:"Snipe", sub:"New token · latency watch", tag:"Bot", cta:"Arm", value:192.69 },
    ];
    root.innerHTML = "";
    items.forEach(i=>{
      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">${i.title}</div>
          <div class="sub">${i.sub}</div>
        </div>
        <div class="right">
          <span class="chip">${i.tag}</span>
          <button class="cta">${i.cta}</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${fmtMoney(i.value)}</div>
        </div>
      `;
      root.appendChild(el);
    });
  }

  function renderPacks(root){
    if (!root) return;
    const items = [
      { title:"Tiny Legends — Series 2", sub:"Pack · 5 cards · reveal: mock", tag:"Pack", cta:"Open", value:53.60 },
      { title:"Foil Realms — Neon Witch", sub:"Relic drop · shimmer", tag:"Relic", cta:"View", value:192.69 },
      { title:"Mesh Fragment", sub:"Burnable fragment · XP source", tag:"Fragment", cta:"Burn", value:104.41 },
    ];
    root.innerHTML = "";
    items.forEach(i=>{
      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">${i.title}</div>
          <div class="sub">${i.sub}</div>
        </div>
        <div class="right">
          <span class="chip">${i.tag}</span>
          <button class="cta">${i.cta}</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${fmtMoney(i.value)}</div>
        </div>
      `;
      root.appendChild(el);
    });

    $$(".cta", root).forEach(b=>{
      b.addEventListener("click", ()=>{
        showToast(`Pack action: ${b.textContent}`);
      });
    });
  }

  function renderPull(root){
    if (!root) return;
    const items = [
      { title:"Luck sweep", sub:"Analyserar volatilitetsfönster", tag:"Engine", cta:"Kör", value:104.41 },
      { title:"Rarity bias", sub:"Simulerar pool-vikter", tag:"Lab", cta:"Tweaka", value:53.60 },
      { title:"Entropy ping", sub:"Mock entropy feed", tag:"Entropy", cta:"Ping", value:192.69 },
    ];
    root.innerHTML = "";
    items.forEach(i=>{
      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">${i.title}</div>
          <div class="sub">${i.sub}</div>
        </div>
        <div class="right">
          <span class="chip">${i.tag}</span>
          <button class="cta">${i.cta}</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${fmtMoney(i.value)}</div>
        </div>
      `;
      root.appendChild(el);
    });
  }

  function renderForge(root){
    if (!root) return;
    const items = [
      { title:"Create module", sub:"Pack reveal, Market sync, Alerts", tag:"Module", cta:"Create", value:53.60 },
      { title:"Surface import", sub:"Embed miniapp / widget", tag:"Surface", cta:"Import", value:104.41 },
      { title:"Policy rails", sub:"Rate-limit, allowlist, safety", tag:"Safety", cta:"Set", value:192.69 },
    ];
    root.innerHTML = "";
    items.forEach(i=>{
      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">${i.title}</div>
          <div class="sub">${i.sub}</div>
        </div>
        <div class="right">
          <span class="chip">${i.tag}</span>
          <button class="cta">${i.cta}</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${fmtMoney(i.value)}</div>
        </div>
      `;
      root.appendChild(el);
    });
  }

  function renderFeed(root){
    if (!root) return;
    const items = [
      { title:"Spawniz minted", sub:"Tiny Legends · card #042", tag:"Feed", cta:"Open", value:53.60 },
      { title:"NewUser followed", sub:"MeshArchitect · +1 rep", tag:"Social", cta:"View", value:104.41 },
      { title:"Artifact reveal", sub:"Foil shimmer · Rare", tag:"Reel", cta:"Watch", value:192.69 },
    ];
    root.innerHTML = "";
    items.forEach(i=>{
      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">${i.title}</div>
          <div class="sub">${i.sub}</div>
        </div>
        <div class="right">
          <span class="chip">${i.tag}</span>
          <button class="cta">${i.cta}</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${fmtMoney(i.value)}</div>
        </div>
      `;
      root.appendChild(el);
    });
  }

  function renderSup(root){
    if (!root) return;
    const items = [
      { title:"#1023 — “Pack reveal not loading”", sub:"Open → +45 XP", tag:"Support", cta:"Update", value:53.60 },
      { title:"#1024 — “Listing sync slow”", sub:"Open → +25 XP", tag:"Support", cta:"Update", value:104.41 },
      { title:"#1025 — “Wallet connect UX”", sub:"Open → +15 XP", tag:"Support", cta:"Update", value:192.69 },
    ];
    root.innerHTML = "";
    items.forEach(i=>{
      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">${i.title}</div>
          <div class="sub">${i.sub}</div>
        </div>
        <div class="right">
          <span class="chip">${i.tag}</span>
          <button class="cta">${i.cta}</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${fmtMoney(i.value)}</div>
        </div>
      `;
      root.appendChild(el);
    });

    $$(".cta", root).forEach(b=>{
      b.addEventListener("click", ()=>{
        state.xp += 45;
        syncKpis();
        showToast("Support update (+45 XP)");
      });
    });
  }

  function renderLeaderboard(root){
    if (!root) return;
    const rows = [
      { name:"MeshArchitect", score: 9921 },
      { name:"Spawniz", score: 8704 },
      { name:"SniperBot", score: 7990 },
      { name:"CreatorX", score: 7122 },
      { name:"NewUser", score: 6401 },
    ];
    root.innerHTML = "";
    rows.forEach((r, idx)=>{
      const el = document.createElement("div");
      el.className = "event";
      el.innerHTML = `
        <div class="left">
          <div class="title">#${idx+1} ${r.name}</div>
          <div class="sub">XP total · mock ranking</div>
        </div>
        <div class="right">
          <span class="chip">Rank</span>
          <button class="cta">Inspect</button>
          <div style="font-weight:900;color:rgba(110,255,190,.95)">${r.score.toLocaleString("sv-SE")}</div>
        </div>
      `;
      root.appendChild(el);
    });
  }

  // ---------- PACK OPEN ----------
  function handleOpenPack(){
    state.eventsToday += 1;
    state.alerts += 1;
    state.xp += 25;
    state.spn += 7;
    syncKpis();
    showToast("Pack öppnad (mock) · +25 XP");
    // jump to packs view for platform feel
    setView("packs");
  }

  // ---------- KPIs ----------
  function syncKpis(){
    gasEl.textContent = `~${state.gas.toFixed(2)} gwei`;
    walletsEl.textContent = String(state.wallets);
    xpEl.textContent = String(state.xp);
    spnEl.textContent = String(state.spn);
    eventsTodayEl.textContent = String(state.eventsToday);

    alertsCount.textContent = String(state.alerts);
    alertsKpi.textContent = String(state.alerts);
  }

  // ---------- ROLE SELECT ----------
  const roleMap = {
    dev: { short:"Dev", pill:"Dev / Builder" },
    creator: { short:"Creator", pill:"Creator / Artist" },
    hunter: { short:"Hunter", pill:"Alpha hunter" },
    collector: { short:"Collector", pill:"Collector / Fan" },
  };

  function setRole(role){
    state.role = role;
    const r = roleMap[role] || roleMap.creator;
    roleShort.textContent = r.short;
    rolePill.textContent = r.pill;
    saveRoleBtn.disabled = false;
  }

  // ---------- EVENTS / LISTENERS ----------
  function bindNav(){
    $$(".nav-item").forEach(btn=>{
      btn.addEventListener("click", ()=> setView(btn.dataset.view));
    });
    $$(".bottom-btn").forEach(btn=>{
      btn.addEventListener("click", ()=> setView(btn.dataset.view));
    });
  }

  function bindTop(){
    if (btnMenu){
      btnMenu.addEventListener("click", ()=>{
        sidebar.classList.toggle("open");
      });
    }

    settingsBtn.addEventListener("click", openSettings);
    settingsClose.addEventListener("click", closeSettings);
    settingsBackdrop.addEventListener("click", (e)=>{
      if (e.target === settingsBackdrop) closeSettings();
    });

    btnConnect.addEventListener("click", connectMock);

    $("#btn-alerts").addEventListener("click", ()=>{
      state.alerts = Math.max(0, state.alerts - 1);
      syncKpis();
      showToast("Alerts acknowledged");
    });

    $("#btn-logout").addEventListener("click", ()=>{
      showToast("Logged out (mock)");
      state.connected = false;
      state.wallet = null;
      connectLabel.textContent = "Anslut";
      vaultEth.textContent = "Base wallet";
      $("#settingsWalletAddress").textContent = "Not connected";
    });

    $("#btn-account").addEventListener("click", openSettings);

    if (quickPack) quickPack.addEventListener("click", handleOpenPack);
    if (quickMesh) quickMesh.addEventListener("click", ()=> setView("dashboard"));
  }

  function bindSettings(){
    if (!roleGrid) return;

    $$(".role-card", roleGrid).forEach(card=>{
      card.addEventListener("click", ()=>{
        $$(".role-card", roleGrid).forEach(c=> c.classList.remove("selected"));
        card.classList.add("selected");
        setRole(card.dataset.role);
      });
    });

    saveRoleBtn.addEventListener("click", ()=>{
      saveRoleBtn.disabled = true;
      showToast("Role saved");
      closeSettings();
    });
  }

  // ---------- GAS mock ----------
  function tickGas(){
    const drift = (Math.random()-0.5) * 0.06;
    state.gas = Math.max(0.08, Math.min(0.65, state.gas + drift));
    gasEl.textContent = `~${state.gas.toFixed(2)} gwei`;
    setTimeout(tickGas, 1600);
  }

  // ---------- MESH CANVAS ----------
  function startMesh(){
    const canvas = $("#meshCanvas");
    const ctx = canvas.getContext("2d", { alpha:true });
    let w=0, h=0, dpr=1;

    const pts = [];
    const LINKS = 2.2; // connection radius multiplier

    function resize(){
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      pts.length = 0;
      const count = Math.round((w*h) / 52000); // density
      const n = Math.max(22, Math.min(62, count));
      for (let i=0;i<n;i++){
        pts.push({
          x: Math.random()*w,
          y: Math.random()*h,
          vx: (Math.random()-0.5)*0.22,
          vy: (Math.random()-0.5)*0.22,
          r: 1.2 + Math.random()*1.6
        });
      }
    }

    function draw(){
      ctx.clearRect(0,0,w,h);

      // soft glow background dots/lines
      ctx.globalCompositeOperation = "lighter";

      for (let i=0;i<pts.length;i++){
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>w) p.vx *= -1;
        if (p.y<0||p.y>h) p.vy *= -1;

        // dots
        ctx.beginPath();
        ctx.fillStyle = "rgba(140,180,255,.25)";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      }

      // links
      const maxDist = Math.min(w,h) / 3.2;
      for (let i=0;i<pts.length;i++){
        for (let j=i+1;j<pts.length;j++){
          const a = pts[i], b = pts[j];
          const dx = a.x-b.x, dy = a.y-b.y;
          const dist = Math.hypot(dx,dy);
          if (dist < maxDist){
            const t = 1 - dist/maxDist;
            ctx.strokeStyle = `rgba(120,160,255,${0.12*t})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
  }

  // ---------- INIT ----------
  function init(){
    alertsCount.textContent = String(state.alerts);
    alertsKpi.textContent = String(state.alerts);
    syncKpis();

    renderTicker();
    bindNav();
    bindTop();
    bindSettings();

    // start at dashboard
    renderView("dashboard");

    tickGas();
    startMesh();
  }

  init();
})();