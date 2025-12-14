// app.js
(() => {
  // ===== STATE =====
  const state = {
    currentRoleKey: "creator",
    roles: {
      dev: "Dev / Builder",
      creator: "Creator / Artist",
      hunter: "Alpha hunter",
      collector: "Collector / Fan",
    },
    walletConnected: false,
    walletAddress: "0x1A6...b9fD",
    vaultEth: 0.23,
    alerts: 3,
    xp: 1575,
    spn: 497,
    wallets: 0,
    eventsToday: 9,
  };

  // ===== DOM =====
  const $ = (id) => document.getElementById(id);

  const toastEl = $("toast");
  const meshCanvas = $("meshCanvas");

  const sidebar = $("sidebar");
  const btnMenu = $("btn-menu");

  const btnConnect = $("btn-connect");
  const connectLabel = $("connectLabel");
  const vaultEthEl = $("vaultEth");

  const btnAlerts = $("btn-alerts");
  const alertsCount = $("alertsCount");

  const settingsBtn = $("settings-btn");
  const settingsBackdrop = $("settings-backdrop");
  const settingsClose = $("settings-close");

  const roleGrid = $("roleGrid");
  const saveRoleBtn = $("save-role");
  const rolePill = $("rolePill");
  const roleShort = $("roleShort");

  const handleEl = $("handle");
  const settingsHandle = $("settingsHandle");
  const settingsWalletAddress = $("settingsWalletAddress");

  const gasEl = $("gas");
  const walletsEl = $("wallets");
  const xpEl = $("xp");
  const spnEl = $("spn");
  const eventsTodayEl = $("eventsToday");
  const alertsKpiEl = $("alertsKpi");

  const tickerTrack = $("tickerTrack");

  // Quick actions
  const quickPack = $("btn-quick-pack");
  const quickMesh = $("btn-quick-mesh");

  // Views
  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  const bottomBtns = Array.from(document.querySelectorAll(".bottom-btn"));
  const views = {
    dashboard: $("view-dashboard"),
    trading: $("view-trading"),
    packs: $("view-packs"),
    pull: $("view-pull"),
    forge: $("view-forge"),
    feed: $("view-feed"),
    supcast: $("view-supcast"),
    settings: $("view-settings"),
    leaderboard: $("view-leaderboard"),
    profile: $("view-profile"),
  };

  // ===== TOAST =====
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  // ===== UI RENDER =====
  function renderRole() {
    const full = state.roles[state.currentRoleKey] || "Creator / Artist";
    const short = full.split(" / ")[0];

    if (rolePill) rolePill.textContent = full;
    if (roleShort) roleShort.textContent = short;

    // role selection UI
    if (roleGrid) {
      roleGrid.querySelectorAll(".role-card").forEach((btn) => {
        const key = btn.getAttribute("data-role");
        btn.classList.toggle("selected", key === state.currentRoleKey);
      });
    }
    if (saveRoleBtn) saveRoleBtn.disabled = true;
  }

  function renderStats() {
    if (vaultEthEl) vaultEthEl.textContent = state.walletConnected ? `Vault ${state.vaultEth.toFixed(2)} ETH` : "Base wallet";
    if (alertsCount) alertsCount.textContent = String(state.alerts);
    if (alertsKpiEl) alertsKpiEl.textContent = String(state.alerts);

    if (xpEl) xpEl.textContent = String(state.xp);
    if (spnEl) spnEl.textContent = String(state.spn);
    if (walletsEl) walletsEl.textContent = String(state.wallets);
    if (eventsTodayEl) eventsTodayEl.textContent = String(state.eventsToday);

    if (connectLabel) connectLabel.textContent = state.walletConnected ? "Ansluten" : "Anslut";
    if (settingsWalletAddress) settingsWalletAddress.textContent = state.walletConnected ? state.walletAddress : "Not connected";
  }

  function renderIdentity() {
    if (handleEl) handleEl.textContent = "@spawniz";
    if (settingsHandle) settingsHandle.textContent = "@spawniz";
  }

  // ===== NAV =====
  function setActiveView(viewKey) {
    // nav state
    navItems.forEach((b) => b.classList.toggle("active", b.getAttribute("data-view") === viewKey));
    bottomBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-view") === viewKey));

    // view visibility
    Object.entries(views).forEach(([k, el]) => {
      if (!el) return;
      el.classList.toggle("active", k === viewKey);
    });

    // close sidebar on mobile
    if (window.matchMedia("(max-width: 920px)").matches) {
      sidebar?.classList.remove("open");
    }
  }

  // ===== SETTINGS SHEET =====
  function openSettings() {
    settingsBackdrop?.classList.remove("hidden");
  }
  function closeSettings() {
    settingsBackdrop?.classList.add("hidden");
  }

  // ===== WALLET (MOCK) =====
  function toggleWallet() {
    state.walletConnected = !state.walletConnected;
    if (state.walletConnected) {
      state.wallets = Math.max(1, state.wallets + 1);
      state.xp += 120;
      state.alerts = Math.min(9, state.alerts + 1);
      toast(`Wallet ansluten (${state.walletAddress})`);
    } else {
      state.wallets = Math.max(0, state.wallets - 1);
      toast("Wallet frånkopplad");
    }
    renderStats();
  }

  // ===== ALERTS =====
  function clearAlerts() {
    state.alerts = 0;
    renderStats();
    toast("Alerts rensade");
  }

  // ===== GAS (MOCK) =====
  function tickGas() {
    const g = (0.12 + Math.random() * 0.12).toFixed(2);
    if (gasEl) gasEl.textContent = `~${g} gwei`;
  }

  // ===== TICKER =====
  const TICK_EVENTS = [
    { t: "Pack Öppnad", who: "SniperBot", tag: "Artifact", money: "$53.60" },
    { t: "Farcaster Cast", who: "CreatorX", tag: "Core", money: "$207.71" },
    { t: "Zora Köp", who: "NewUser", tag: "Shard", money: "$18.22" },
    { t: "Fragment Burn", who: "MeshArchitect", tag: "Fragment", money: "$9.10" },
    { t: "Val Alert", who: "feetsniffer.eth", tag: "Relic", money: "$530.60" },
  ];

  function buildTicker() {
    if (!tickerTrack) return;
    tickerTrack.innerHTML = "";
    const items = [];

    for (let i = 0; i < 10; i++) {
      const e = TICK_EVENTS[i % TICK_EVENTS.length];
      const time = new Date(Date.now() - i * 60_000).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

      const node = document.createElement("div");
      node.className = "tick";
      node.innerHTML = `
        <span class="time mono small">${time}</span>
        <span class="mono">${e.who}</span>
        <span class="tag">${e.t}</span>
        <span class="tag" style="border-color: rgba(255,220,120,.18); background: rgba(255,220,120,.10)">${e.tag}</span>
        <span class="money mono">${e.money}</span>
      `;
      items.push(node);
    }

    // duplicera för loop
    [...items, ...items].forEach((n) => tickerTrack.appendChild(n));
  }

  // ===== VIEW CONTENT (MAXIMERAR YTA) =====
  function mountDashboard() {
    const el = views.dashboard;
    if (!el) return;

    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Senaste Mesh Aktivitet</h2>
            <p class="section-sub">Packs, buys, burns, casts — allt in i samma feed (mock).</p>
          </div>
          <div class="section-tag">Platform · Live mock</div>
        </div>

        <div class="list" id="feedList"></div>
      </div>
    `;

    const list = el.querySelector("#feedList");
    const rows = [
      { title: "feetsniffer.eth bought 250 of your Zora coin", meta: "12 min ago · token_buy · +320 XP", right: `<span class="badge-soft">Shard</span><button class="btn-mini">Följ</button>` },
      { title: "Spawniz minted 3 packs on VibeMarket", meta: "1 min ago · pack_open · +120 XP", right: `<span class="badge-soft">Artifact</span><button class="btn-mini">Se kort</button>` },
      { title: "Daily mesh check-in completed", meta: "Today · streak · +25 XP", right: `<span class="badge-soft">Core</span><button class="btn-mini">Claim</button>` },
      { title: "New follower bridged to Base", meta: "Live mesh · bridge event", right: `<span class="badge-soft">Fragment</span><button class="btn-mini">Open</button>` },
      { title: "SupCast reply marked as solved", meta: "Support mesh · +45 XP", right: `<span class="badge-soft">Core</span><button class="btn-mini">Diskutera</button>` },
    ];

    list.innerHTML = rows.map(r => `
      <div class="item">
        <div class="left">
          <div class="title">${r.title}</div>
          <div class="meta">${r.meta}</div>
        </div>
        <div class="right">${r.right}</div>
      </div>
    `).join("");
  }

  function mountTrading() {
    const el = views.trading;
    if (!el) return;

    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Trading Wall</h2>
            <p class="section-sub">Valar, spikes och aktiva kontrakt som driver meshen (mock).</p>
          </div>
          <div class="section-tag">Module</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">Zora Coin Rail</div>
              <div class="meta">Heat: 95 · 24h change: +25.1%</div>
            </div>
            <div class="right">
              <span class="money mono">$1.2M</span>
              <button class="btn-mini">Insikt</button>
            </div>
          </div>

          <div class="item">
            <div class="left">
              <div class="title">Base Beta Set</div>
              <div class="meta">Heat: 22 · 24h change: -4.5%</div>
            </div>
            <div class="right">
              <span class="badge-soft">Watch</span>
              <button class="btn-mini">Track</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountPacks() {
    const el = views.packs;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Packs & Inventory</h2>
            <p class="section-sub">Här hamnar dina packs, kort, rarities och sets (mock).</p>
          </div>
          <div class="section-tag">Core</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">Oöppnade packs</div>
              <div class="meta">Ready to reveal</div>
            </div>
            <div class="right">
              <span class="badge-soft">7</span>
              <button class="btn-mini" id="btn-open-pack">Open</button>
            </div>
          </div>

          <div class="item">
            <div class="left">
              <div class="title">Fragments</div>
              <div class="meta">Burn → synth</div>
            </div>
            <div class="right">
              <span class="badge-soft">142</span>
              <button class="btn-mini">Pull Lab</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountPull() {
    const el = views.pull;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Pull Lab / Luck Engine</h2>
            <p class="section-sub">Burn, synth och gamble-flöden (mock). Här blir det brutalt bra sen.</p>
          </div>
          <div class="section-tag">Module</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">Burn Fragment</div>
              <div class="meta">Öka odds för Core/Artifact</div>
            </div>
            <div class="right">
              <button class="btn-mini">Burn</button>
              <button class="btn-mini">Simulera</button>
            </div>
          </div>

          <div class="item">
            <div class="left">
              <div class="title">Synthesize</div>
              <div class="meta">Fragment → Shard → Core</div>
            </div>
            <div class="right">
              <button class="btn-mini">Synthesize</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountForge() {
    const el = views.forge;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Creator Forge</h2>
            <p class="section-sub">Zero-code “Roblox för kontrakt”: presets, deploy, modules, routing (mock → live).</p>
          </div>
          <div class="section-tag">Core</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">Create module</div>
              <div class="meta">"Create a module for me that..."</div>
            </div>
            <div class="right">
              <button class="btn-mini">Open Builder</button>
              <button class="btn-mini">API</button>
            </div>
          </div>

          <div class="item">
            <div class="left">
              <div class="title">Import app</div>
              <div class="meta">Lägg till din miniapp som Surface i SpawnEngine</div>
            </div>
            <div class="right">
              <span class="badge-soft">Surfaces</span>
              <button class="btn-mini">Import</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountFeed() {
    const el = views.feed;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">SpawnFeed / Reels</h2>
            <p class="section-sub">Vertikal onchain-feed (mock). Sen kopplar vi Farcaster + Zora.</p>
          </div>
          <div class="section-tag">Social</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">Verified drop · “Tiny Legends Pack”</div>
              <div class="meta">Mint spike · +XP route</div>
            </div>
            <div class="right">
              <button class="btn-mini">View</button>
              <button class="btn-mini">Remix</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountSupcast() {
    const el = views.supcast;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">SupCast / Support</h2>
            <p class="section-sub">Support som gameplay: replies + solves → XP (mock).</p>
          </div>
          <div class="section-tag">Support</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">#1023 — “Pack reveal not loading”</div>
              <div class="meta">Open · +45 XP</div>
            </div>
            <div class="right">
              <button class="btn-mini">Update</button>
              <button class="btn-mini">Solve</button>
            </div>
          </div>

          <div class="item">
            <div class="left">
              <div class="title">#1024 — “Listing sync delay”</div>
              <div class="meta">Open · +30 XP</div>
            </div>
            <div class="right">
              <button class="btn-mini">Update</button>
              <button class="btn-mini">Solve</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountSettingsView() {
    const el = views.settings;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Inställningar</h2>
            <p class="section-sub">Öppna sheet för role/lanes och kopplingar.</p>
          </div>
          <div class="section-tag">System</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">Open Settings Sheet</div>
              <div class="meta">Role, lanes, connected platforms</div>
            </div>
            <div class="right">
              <button class="btn-mini" id="btn-open-settings">Open</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const openBtn = el.querySelector("#btn-open-settings");
    if (openBtn) openBtn.addEventListener("click", openSettings);
  }

  function mountLeaderboard() {
    const el = views.leaderboard;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Leaderboard</h2>
            <p class="section-sub">XP, streak, pulls, supporter score (mock).</p>
          </div>
          <div class="section-tag">Core</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">1) MeshArchitect</div>
              <div class="meta">XP 8,900 · Level 9</div>
            </div>
            <div class="right">
              <span class="badge-soft">Top</span>
            </div>
          </div>
          <div class="item">
            <div class="left">
              <div class="title">2) CreatorX</div>
              <div class="meta">XP 6,120 · Level 7</div>
            </div>
            <div class="right">
              <button class="btn-mini">Follow</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountProfile() {
    const el = views.profile;
    if (!el) return;
    el.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Min Profil</h2>
            <p class="section-sub">Mesh identity, surfaces, API keys, reputation (mock).</p>
          </div>
          <div class="section-tag">Identity</div>
        </div>

        <div class="list">
          <div class="item">
            <div class="left">
              <div class="title">@spawniz</div>
              <div class="meta">Role: ${state.roles[state.currentRoleKey]} · Wallet: ${state.walletConnected ? state.walletAddress : "Not connected"}</div>
            </div>
            <div class="right">
              <button class="btn-mini">Export</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountAllViews() {
    mountDashboard();
    mountTrading();
    mountPacks();
    mountPull();
    mountForge();
    mountFeed();
    mountSupcast();
    mountSettingsView();
    mountLeaderboard();
    mountProfile();
  }

  // ===== CANVAS MESH =====
  function initMeshCanvas() {
    if (!meshCanvas) return;
    const ctx = meshCanvas.getContext("2d");
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w, h;

    const particles = [];
    const N = 85;
    const LINK = 155;

    function resize() {
      w = meshCanvas.clientWidth;
      h = meshCanvas.clientHeight;
      meshCanvas.width = Math.floor(w * DPR);
      meshCanvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function spawn() {
      particles.length = 0;
      for (let i = 0; i < N; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: 0.8 + Math.random() * 1.4,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const o = (1 - d / LINK) * 0.22;
            ctx.strokeStyle = `rgba(90,167,255,${o})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20 || p.x > w + 20) p.vx *= -1;
        if (p.y < -20 || p.y > h + 20) p.vy *= -1;

        ctx.fillStyle = "rgba(90,167,255,0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    window.addEventListener("resize", () => {
      resize();
      spawn();
    });

    resize();
    spawn();
    step();
  }

  // ===== EVENTS =====
  function bindEvents() {
    // menu
    if (btnMenu) btnMenu.addEventListener("click", () => sidebar?.classList.toggle("open"));

    // sidebar nav
    navItems.forEach((b) => b.addEventListener("click", () => setActiveView(b.getAttribute("data-view"))));
    bottomBtns.forEach((b) => b.addEventListener("click", () => setActiveView(b.getAttribute("data-view"))));

    // wallet
    if (btnConnect) btnConnect.addEventListener("click", toggleWallet);

    // alerts
    if (btnAlerts) btnAlerts.addEventListener("click", clearAlerts);

    // settings sheet open/close
    if (settingsBtn) settingsBtn.addEventListener("click", openSettings);
    if (settingsClose) settingsClose.addEventListener("click", closeSettings);
    if (settingsBackdrop) {
      settingsBackdrop.addEventListener("click", (e) => {
        if (e.target === settingsBackdrop) closeSettings();
      });
    }

    // role selection
    if (roleGrid) {
      roleGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".role-card");
        if (!card) return;
        const key = card.getAttribute("data-role");
        if (!key || key === state.currentRoleKey) {
          saveRoleBtn.disabled = true;
          return;
        }
        roleGrid.querySelectorAll(".role-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        saveRoleBtn.disabled = false;
        saveRoleBtn.dataset.nextRole = key;
      });
    }

    if (saveRoleBtn) {
      saveRoleBtn.addEventListener("click", () => {
        const next = saveRoleBtn.dataset.nextRole;
        if (!next) return;
        state.currentRoleKey = next;
        renderRole();
        toast(`Role uppdaterad: ${state.roles[state.currentRoleKey]}`);
      });
    }

    // quick actions
    if (quickPack) quickPack.addEventListener("click", () => {
      setActiveView("packs");
      toast("Quick Pack: öppna inventory");
    });

    if (quickMesh) quickMesh.addEventListener("click", () => {
      setActiveView("dashboard");
      toast("Mesh: tillbaka till HUD");
    });

    // logout (mock)
    const logout = $("btn-logout");
    if (logout) logout.addEventListener("click", () => toast("Logout (mock)"));
  }

  // ===== INIT =====
  function init() {
    renderIdentity();
    renderRole();
    renderStats();
    buildTicker();
    mountAllViews();
    bindEvents();
    initMeshCanvas();

    // default view
    setActiveView("dashboard");

    // periodic mock updates
    tickGas();
    setInterval(tickGas, 3000);
    setInterval(() => {
      state.eventsToday = Math.min(99, state.eventsToday + (Math.random() > 0.55 ? 1 : 0));
      state.alerts = Math.min(9, state.alerts + (Math.random() > 0.88 ? 1 : 0));
      renderStats();
    }, 5000);
  }

  window.addEventListener("load", init);
})();