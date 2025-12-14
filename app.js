// app.js
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    view: "dashboard",
    role: "creator",
    roleLabel: "Creator / Artist",
    roleShort: "Creator",
    alerts: 3,
    xp: 1575,
    spn: 497,
    eventsToday: 10,
    gas: 0.19,
    wallets: 0,
    vaultText: "Base wallet",
    handle: "@spawniz",
  };

  // ---------- Toast ----------
  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1200);
  }

  // ---------- Views ----------
  const viewIds = [
    "dashboard","trading","packs","pull","forge","feed","supcast","settings","leaderboard","profile"
  ];
  function setActiveView(next) {
    state.view = next;

    // sidebar buttons
    $$(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === next));
    // bottom buttons
    $$(".bottom-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === next));

    // sections
    viewIds.forEach(id => {
      const el = $("#view-" + id);
      if (el) el.classList.toggle("active", id === next);
    });

    // close mobile sidebar
    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open");
  }

  // ---------- Render blocks ----------
  const MOCK_EVENTS = [
    { t:"Zora Köp", tag:"Fragment", cta:"Diskutera", val:"$606.61", who:"CreatorX", meta:"interagerade med S002–BETA. Notional", ico:"💰" },
    { t:"Fragment Burn", tag:"Core", cta:"Pull Lab", val:"$1008.70", who:"MeshArchitect", meta:"interagerade med S005–MONAD. Notional", ico:"🔥" },
    { t:"Farcaster Cast", tag:"Fragment", cta:"Diskutera", val:"$192.69", who:"NewUser", meta:"interagerade med S005–MONAD. Notional", ico:"🟦" },
    { t:"Val Alert", tag:"Relic", cta:"Följ Val", val:"$104.41", who:"MeshArchitect", meta:"interagerade med S004–BASE. Notional", ico:"🐺" },
    { t:"Relik Funnen", tag:"Core", cta:"Se Kort", val:"$645.29", who:"NewUser", meta:"interagerade med S004–BASE. Notional", ico:"🪙" },
    { t:"Pack Öppnad", tag:"Fragment", cta:"Se Kort", val:"$1137.37", who:"Spawniz", meta:"interagerade med S003–ZORA. Notional", ico:"🎒" },
  ];

  function panel(title, sub, inner) {
    return `
      <div class="panel">
        <h3>${title}</h3>
        ${sub ? `<p class="sub">${sub}</p>` : ``}
        ${inner}
      </div>
    `;
  }

  function rows(items) {
    return `
      <div class="list">
        ${items.map(it => `
          <div class="row">
            <div class="left">
              <div class="ico">${it.ico}</div>
              <div class="meta">
                <div class="t">${it.t} <span class="chip" style="margin-left:8px">${it.tag}</span></div>
                <div class="s">${it.who} ${it.meta}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <button class="chip" type="button" data-cta="${it.cta}">${it.cta}</button>
              <div class="val">${it.val}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderDashboard() {
    const el = $("#view-dashboard");
    if (!el) return;

    el.innerHTML = `
      <div class="grid2">
        ${panel("Mesh HUD / Översikt", "En enda sammanhängande vy över all aktivitet i SpawnEngine-ekosystemet.", `
          <div class="grid2" style="margin-top:10px">
            <div class="panel" style="padding:12px">
              <div class="sub">Totala Packs Öppnade</div>
              <div style="font-weight:950;font-size:28px">4,321</div>
            </div>
            <div class="panel" style="padding:12px">
              <div class="sub">Total Volym (24h)</div>
              <div style="font-weight:950;font-size:28px">$1.2M</div>
            </div>
          </div>
        `)}
        ${panel("Live events (mock)", "Zora · Farcaster · Vibe · Base → in i Mesh", rows(MOCK_EVENTS))}
      </div>
    `;

    // CTA click (mock)
    $$("#view-dashboard [data-cta]").forEach(btn => {
      btn.addEventListener("click", () => toast(btn.dataset.cta + " (mock)"));
    });
  }

  function renderTrading() {
    const el = $("#view-trading");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("Trading Wall", "Snipes, flows, spreads, PnL (mock).", rows(MOCK_EVENTS.slice(0,4)))}
        ${panel("Signals", "Auto-tagga events → alerts + XP.", `
          <div class="list">
            <div class="row"><div class="left"><div class="ico">📡</div><div class="meta"><div class="t">SniperBot</div><div class="s">Pack öppnad · Artifact</div></div></div><div class="val">$53.60</div></div>
            <div class="row"><div class="left"><div class="ico">🧠</div><div class="meta"><div class="t">Alpha Lane</div><div class="s">Farcaster trend match</div></div></div><span class="chip chip-green">+45 XP</span></div>
          </div>
        `)}
      </div>
    `;
  }

  function renderPacks() {
    const el = $("#view-packs");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("Packs & Inventory", "Här hamnar dina packs, kort, rarities och sets (mock).", `
          <div class="grid2" style="margin-top:10px">
            <div class="panel" style="padding:12px"><div class="sub">Öppnade packs</div><div style="font-weight:950;font-size:28px">7</div></div>
            <div class="panel" style="padding:12px"><div class="sub">Fragments</div><div style="font-weight:950;font-size:28px">142</div></div>
          </div>
          <div style="margin-top:12px">${rows(MOCK_EVENTS.slice(2,6))}</div>
        `)}
        ${panel("Pack Reveal (mock)", "CSGO-style opening senare. Här är en snabb demo-knapp.", `
          <button class="btn-primary full-width" id="btn-open-pack" type="button">Open Pack (mock reveal)</button>
        `)}
      </div>
    `;

    const btn = $("#btn-open-pack");
    if (btn) btn.addEventListener("click", () => toast("Pack opened → Artifact (mock)"));
  }

  function renderPull() {
    const el = $("#view-pull");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("Pull Lab / Luck Engine", "Odds, burns, rerolls, entropy hooks (mock).", `
          <div class="list">
            <div class="row"><div class="left"><div class="ico">💎</div><div class="meta"><div class="t">Luck Multiplier</div><div class="s">v1 hooks ready</div></div></div><span class="chip chip-purple">x1.30</span></div>
            <div class="row"><div class="left"><div class="ico">🧪</div><div class="meta"><div class="t">Fragment Burn</div><div class="s">Burn 10 → reroll</div></div></div><button class="chip" type="button" data-cta="Burn">Burn</button></div>
          </div>
        `)}
        ${panel("Relics", "Lista/validera fynd (mock).", rows(MOCK_EVENTS.slice(0,3)))}
      </div>
    `;
    $$("#view-pull [data-cta]").forEach(btn => btn.addEventListener("click", () => toast("Burn (mock)")));
  }

  function renderForge() {
    const el = $("#view-forge");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("Creator Forge", "Skapa moduler, drops, miniapp-surfaces (mock).", `
          <div class="list">
            <div class="row"><div class="left"><div class="ico">🧩</div><div class="meta"><div class="t">Create Module</div><div class="s">Deploy template (mock)</div></div></div><button class="chip" type="button" data-cta="Create">Create</button></div>
            <div class="row"><div class="left"><div class="ico">🪪</div><div class="meta"><div class="t">API Key</div><div class="s">Issue + rate limits</div></div></div><button class="chip" type="button" data-cta="Issue">Issue</button></div>
          </div>
        `)}
        ${panel("Surfaces", "Lägg in din egen app i SpawnEngine (mock).", rows(MOCK_EVENTS.slice(1,4)))}
      </div>
    `;
    설명
    $$("#view-forge [data-cta]").forEach(btn => btn.addEventListener("click", () => toast(btn.dataset.cta + " (mock)")));
  }

  function renderFeed() {
    const el = $("#view-feed");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("SpawnFeed / Reels", "Snabb feed med actions + replay (mock).", rows(MOCK_EVENTS))}
        ${panel("Clip Queue", "Auto-klipp event → share to Farcaster (mock).", `
          <div class="list">
            <div class="row"><div class="left"><div class="ico">🎥</div><div class="meta"><div class="t">Auto Clip</div><div class="s">Pack reveal → 6s clip</div></div></div><span class="chip chip-amber">Queued</span></div>
            <div class="row"><div class="left"><div class="ico">🟪</div><div class="meta"><div class="t">Post Draft</div><div class="s">Warpcast ready</div></div></div><button class="chip" type="button" data-cta="Post">Post</button></div>
          </div>
        `)}
      </div>
    `;
    $$("#view-feed [data-cta]").forEach(btn => btn.addEventListener("click", () => toast("Posted (mock)")));
  }

  function renderSupcast() {
    const el = $("#view-supcast");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("SupCast / Support", "Support som gameplay: replies + solves → XP (mock).", `
          <div class="list">
            <div class="row"><div class="left"><div class="ico">🛰</div><div class="meta"><div class="t">#1023 — “Pack reveal not loading”</div><div class="s">Open · +45 XP</div></div></div><button class="chip" type="button" data-cta="Update">Update</button></div>
            <div class="row"><div class="left"><div class="ico">🛰</div><div class="meta"><div class="t">#1024 — “Listing sync”</div><div class="s">Assign · +20 XP</div></div></div><button class="chip" type="button" data-cta="Assign">Assign</button></div>
          </div>
        `)}
        ${panel("Alerts Router", "Event Mesh routing → notis + badges (mock).", rows(MOCK_EVENTS.slice(0,4)))}
      </div>
    `;
    $$("#view-supcast [data-cta]").forEach(btn => btn.addEventListener("click", () => toast(btn.dataset.cta + " (mock)")));
  }

  function renderSettingsView() {
    const el = $("#view-settings");
    if (!el) return;
    el.innerHTML = `
      <div class="panel">
        <h3>Inställningar</h3>
        <p class="sub">Öppna sheet: klicka ⚙ uppe till höger.</p>
        <div class="list">
          <div class="row"><div class="left"><div class="ico">⚙</div><div class="meta"><div class="t">Mesh profile</div><div class="s">Role lanes / connections</div></div></div><button class="chip" type="button" id="openSheet">Open</button></div>
        </div>
      </div>
    `;
    const openSheet = $("#openSheet");
    if (openSheet) openSheet.addEventListener("click", () => openSettings(true));
  }

  function renderLeaderboard() {
    const el = $("#view-leaderboard");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("Leaderboard", "XP / activity / streaks (mock).", `
          <div class="list">
            <div class="row"><div class="left"><div class="ico">🥇</div><div class="meta"><div class="t">@spawniz</div><div class="s">XP 1575 · Streak 6</div></div></div><span class="chip chip-green">#1</span></div>
            <div class="row"><div class="left"><div class="ico">🥈</div><div class="meta"><div class="t">@mesharchitect</div><div class="s">XP 1320 · Streak 4</div></div></div><span class="chip">#2</span></div>
            <div class="row"><div class="left"><div class="ico">🥉</div><div class="meta"><div class="t">@sniperbot</div><div class="s">XP 1210 · Streak 3</div></div></div><span class="chip">#3</span></div>
          </div>
        `)}
        ${panel("Rewards", "Daily claim + quests (mock).", `
          <button class="btn-primary full-width" id="btn-claim" type="button">Claim (mock)</button>
        `)}
      </div>
    `;
    const claim = $("#btn-claim");
    if (claim) claim.addEventListener("click", () => toast("Claimed +25 XP (mock)"));
  }

  function renderProfile() {
    const el = $("#view-profile");
    if (!el) return;
    el.innerHTML = `
      <div class="grid2">
        ${panel("Min Profil", "Mesh identity + connections (mock).", `
          <div class="list">
            <div class="row"><div class="left"><div class="ico">👤</div><div class="meta"><div class="t">${state.handle}</div><div class="s">Role: ${state.roleLabel}</div></div></div><span class="chip chip-purple">Mesh</span></div>
            <div class="row"><div class="left"><div class="ico">🟪</div><div class="meta"><div class="t">Farcaster</div><div class="s">ready (mock)</div></div></div><span class="chip chip-green">Active</span></div>
            <div class="row"><div class="left"><div class="ico">🟣</div><div class="meta"><div class="t">Zora</div><div class="s">docked (mock)</div></div></div><span class="chip chip-purple">Docked</span></div>
          </div>
        `)}
        ${panel("Activity", "Senaste events (mock).", rows(MOCK_EVENTS))}
      </div>
    `;
  }

  function renderAll() {
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

  // ---------- Settings sheet ----------
  const backdrop = $("#settings-backdrop");
  function openSettings(open) {
    if (!backdrop) return;
    backdrop.classList.toggle("hidden", !open);
  }

  // ---------- Header / values ----------
  function syncHeader() {
    const alertsCount = $("#alertsCount");
    const alertsKpi = $("#alertsKpi");
    const vaultEth = $("#vaultEth");
    const handle = $("#handle");
    const settingsHandle = $("#settingsHandle");
    const rolePill = $("#rolePill");
    const roleShort = $("#roleShort");
    const xp = $("#xp");
    const spn = $("#spn");
    const eventsToday = $("#eventsToday");
    const gas = $("#gas");
    const wallets = $("#wallets");
    const alertsBtnCount = $("#alertsCount");

    if (alertsCount) alertsCount.textContent = String(state.alerts);
    if (alertsKpi) alertsKpi.textContent = String(state.alerts);
    if (vaultEth) vaultEth.textContent = state.vaultText;
    if (handle) handle.textContent = state.handle;
    if (settingsHandle) settingsHandle.textContent = state.handle;
    if (rolePill) rolePill.textContent = state.roleLabel;
    if (roleShort) roleShort.textContent = state.roleShort;
    if (xp) xp.textContent = String(state.xp);
    if (spn) spn.textContent = String(state.spn);
    if (eventsToday) eventsToday.textContent = String(state.eventsToday);
    if (gas) gas.textContent = `~${state.gas.toFixed(2)} gwei`;
    if (wallets) wallets.textContent = String(state.wallets);
    if (alertsBtnCount) alertsBtnCount.textContent = String(state.alerts);
  }

  // ---------- Nav wiring ----------
  function wireNav() {
    $$(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => setActiveView(btn.dataset.view));
    });

    $$(".bottom-btn").forEach(btn => {
      btn.addEventListener("click", () => setActiveView(btn.dataset.view));
    });

    const menuBtn = $("#btn-menu");
    const sidebar = $("#sidebar");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    const settingsBtn = $("#settings-btn");
    const settingsClose = $("#settings-close");
    if (settingsBtn) settingsBtn.addEventListener("click", () => openSettings(true));
    if (settingsClose) settingsClose.addEventListener("click", () => openSettings(false));
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) openSettings(false);
      });
    }

    const btnAccount = $("#btn-account");
    if (btnAccount) btnAccount.addEventListener("click", () => openSettings(true));

    const connectBtn = $("#btn-connect");
    if (connectBtn) {
      connectBtn.addEventListener("click", () => {
        state.vaultText = state.vaultText === "Base wallet" ? "Vault 0.23 ETH" : "Base wallet";
        toast(state.vaultText === "Base wallet" ? "Disconnected (mock)" : "Connected (mock)");
        syncHeader();
      });
    }

    const alertsBtn = $("#btn-alerts");
    if (alertsBtn) alertsBtn.addEventListener("click", () => toast("Alerts panel (mock)"));

    const logoutBtn = $("#btn-logout");
    if (logoutBtn) logoutBtn.addEventListener("click", () => toast("Logged out (mock)"));

    // quick actions
    const quickPack = $("#btn-quick-pack");
    if (quickPack) quickPack.addEventListener("click", () => {
      setActiveView("packs");
      toast("Quick Pack → Packs (mock)");
    });

    const quickMesh = $("#btn-quick-mesh");
    if (quickMesh) quickMesh.addEventListener("click", () => {
      setActiveView("dashboard");
      toast("Mesh → HUD (mock)");
    });

    // role selection
    const roleGrid = $("#roleGrid");
    const saveRole = $("#save-role");
    if (roleGrid && saveRole) {
      roleGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".role-card");
        if (!card) return;
        $$(".role-card", roleGrid).forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        saveRole.disabled = false;
        state.role = card.dataset.role;

        const map = {
          dev: ["Dev / Builder", "Dev"],
          creator: ["Creator / Artist", "Creator"],
          hunter: ["Alpha hunter", "Hunter"],
          collector: ["Collector / Fan", "Collector"]
        };
        state.roleLabel = map[state.role][0];
        state.roleShort = map[state.role][1];
        syncHeader();
      });

      saveRole.addEventListener("click", () => {
        saveRole.disabled = true;
        toast("Role saved (mock)");
        openSettings(false);
      });
    }
  }

  // ---------- Ticker ----------
  function initTicker() {
    const track = $("#tickerTrack");
    if (!track) return;

    const items = [
      { name: "SniperBot", tag:"Pack Öppnad", badge:"Artifact", val:"$53.60" },
      { name: "Zora Köp", tag:"Fragment", badge:"Diskutera", val:"$606.61" },
      { name: "Farcaster Cast", tag:"Fragment", badge:"Reply", val:"$192.69" },
      { name: "Fragment Burn", tag:"Core", badge:"Pull Lab", val:"$1008.70" },
      { name: "Val Alert", tag:"Relic", badge:"Följ", val:"$104.41" },
    ];

    track.innerHTML = items.map(it => `
      <div class="tick">
        <strong>${it.name}</strong>
        <span class="tag">${it.tag}</span>
        <span class="tag">${it.badge}</span>
        <span class="val">${it.val}</span>
      </div>
    `).join("");

    // simple marquee
    let x = 0;
    function step() {
      x -= 0.45;
      if (Math.abs(x) > track.scrollWidth / 2) x = 0;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- Mesh canvas ----------
  function initMesh() {
    const canvas = $("#meshCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const pts = [];
    const N = 58;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      pts.length = 0;
      for (let i = 0; i < N; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 1.2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // subtle haze
      const g = ctx.createRadialGradient(w*0.2, h*0.1, 0, w*0.2, h*0.1, Math.max(w,h));
      g.addColorStop(0, "rgba(59,130,246,0.10)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);

      // move
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.y > h + 30) p.y = -30;
      }

      // connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.18;
            ctx.strokeStyle = `rgba(120,160,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // points
      for (const p of pts) {
        ctx.fillStyle = "rgba(180,210,255,0.22)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    seed();
    draw();

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        seed();
      }, 120);
    }, { passive: true });
  }

  // ---------- Boot ----------
  function boot() {
    syncHeader();
    renderAll();
    wireNav();
    initTicker();
    initMesh();
    setActiveView("dashboard");
  }

  document.addEventListener("DOMContentLoaded", boot, { once: true });
})();