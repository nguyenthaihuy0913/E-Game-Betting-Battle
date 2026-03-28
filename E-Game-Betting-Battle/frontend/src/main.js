/* ── CANVAS BG ── */
    (() => {
      const cv = document.getElementById('cv');
      const ctx = cv.getContext('2d');
      let W, H;
      const cols = [[56, 189, 248], [14, 165, 233], [251, 191, 36], [245, 158, 11], [52, 211, 153], [251, 113, 133]];
      const blobs = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * 800, y: Math.random() * 600,
        r: Math.random() * 260 + 160,
        vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
        c: cols[i], ph: Math.random() * Math.PI * 2, sp: Math.random() * .005 + .002
      }));
      function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; blobs.forEach(b => { if (b.x > W) b.x = W / 2; if (b.y > H) b.y = H / 2 }) }
      resize(); addEventListener('resize', resize);
      function draw() {
        ctx.clearRect(0, 0, W, H);
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#EEF8FF'); g.addColorStop(.5, '#F5FBFF'); g.addColorStop(1, '#FFF9EE');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        blobs.forEach(b => {
          b.ph += b.sp; b.x += b.vx + Math.sin(b.ph) * .35; b.y += b.vy + Math.cos(b.ph * .8) * .28;
          if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
          if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
          const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          gr.addColorStop(0, `rgba(${b.c},.13)`); gr.addColorStop(1, `rgba(${b.c},0)`);
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = gr; ctx.fill();
        });
        requestAnimationFrame(draw);
      }
      draw();
    })();

    /* ── PARTICLES ── */
    (() => {
      const emos = ['📚', '✏️', '💡', '🔤', '⭐', '🎯', '💬', '🏆', '📖', '✦', '🪙', '🎲', '🅰️', '🅱️'];
      const c = document.getElementById('pts');
      function sp() {
        const el = document.createElement('div'); el.className = 'p';
        el.textContent = emos[Math.floor(Math.random() * emos.length)];
        const d = Math.random() * 14 + 10;
        el.style.cssText = `left:${Math.random() * 95}%;font-size:${Math.random() * 12 + 14}px;animation-duration:${d}s;animation-delay:${-Math.random() * d}s`;
        c.appendChild(el); setTimeout(() => el.remove(), (d + 2) * 1000);
      }
      for (let i = 0; i < 14; i++)sp(); setInterval(sp, 1900);
    })();

    /* ── MOBILE TAB ── */
    function switchTab(t) {
      const ph = document.getElementById('ph'), pj = document.getElementById('pj');
      const th = document.getElementById('th'), tj = document.getElementById('tj');
      if (t === 'host') {
        ph.style.display = 'flex'; pj.style.display = 'none';
        th.className = 'tb ah'; tj.className = 'tb';
      } else {
        pj.style.display = 'flex'; ph.style.display = 'none';
        tj.className = 'tb aj'; th.className = 'tb';
      }
    }

    /* desktop join visible, mobile join hidden initially */
    function applyLayout() {
      const mob = innerWidth < 600;
      document.getElementById('pjd').style.display = mob ? 'none' : 'flex';
      document.getElementById('pj').style.display = 'none';
      document.getElementById('ph').style.display = 'flex';
      if (!mob) { document.getElementById('tabs'); }
    }
    applyLayout(); addEventListener('resize', applyLayout);

    /* ── CODE DOTS ── */
    function wireDots(inputId, prefix) {
      const inp = document.getElementById(inputId);
      if (!inp) return;
      const dots = [0, 1, 2, 3, 4, 5].map(i => document.getElementById(prefix + i));
      inp.addEventListener('input', () => {
        // FIX: Ép cứng chỉ lấy 6 ký tự kể cả khi copy-paste
        inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        dots.forEach((d, i) => { const ch = inp.value[i] || ''; d.textContent = ch; d.classList.toggle('on', !!ch); d.classList.remove('err') });
      });
    }
    wireDots('rci', 'd'); wireDots('rcid', 'dd');

    /* ── TOAST ── */
    function toast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg; t.classList.add('show');
      clearTimeout(t._to); t._to = setTimeout(() => t.classList.remove('show'), 2400);
    }

    /* ── BUTTONS ── */
    function doCreate(btn) {
      btn.disabled = true;
      document.getElementById('bcri').textContent = '⏳'; document.getElementById('bcrt').textContent = 'Creating Room...';
      setTimeout(() => {
        btn.disabled = false;
        document.getElementById('bcri').textContent = '✦'; document.getElementById('bcrt').textContent = 'Create Room';
        toast('🎉 Room created! Code: XK7M2Q');
      }, 1600);
    }

    function doJoin(btn) {
      const v = document.getElementById('rci').value.trim();
      if (v.length < 6) {
        [0, 1, 2, 3, 4, 5].forEach(i => { const d = document.getElementById('d' + i); d.classList.add('err'); setTimeout(() => d.classList.remove('err'), 600) });
        toast('⚠️ Enter a valid 6-character code!'); return;
      }
      btn.disabled = true;
      document.getElementById('bjni').textContent = '⏳'; document.getElementById('bjnt').textContent = 'Joining...';
      setTimeout(() => {
        btn.disabled = false;
        document.getElementById('bjni').textContent = '→'; document.getElementById('bjnt').textContent = 'Enter Room';
        toast('✅ Joined! Waiting for host...');
      }, 1500);
    }

    function doJoinDesktop(btn) {
      const v = document.getElementById('rcid').value.trim();
      if (v.length < 6) {
        [0, 1, 2, 3, 4, 5].forEach(i => { const d = document.getElementById('dd' + i); d.classList.add('err'); setTimeout(() => d.classList.remove('err'), 600) });
        toast('⚠️ Enter a valid 6-character code!'); return;
      }
      btn.disabled = true;
      document.getElementById('bjndi').textContent = '⏳'; document.getElementById('bjndt').textContent = 'Joining...';
      setTimeout(() => {
        btn.disabled = false;
        document.getElementById('bjndi').textContent = '→'; document.getElementById('bjndt').textContent = 'Enter Room';
        toast('✅ Joined! Waiting for host...');
      }, 1500);
    }
