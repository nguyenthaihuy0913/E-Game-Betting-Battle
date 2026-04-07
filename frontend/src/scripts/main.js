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
    let currentTab = 'host';
    function switchTab(t) {
      currentTab = t;
      const th = document.getElementById('th'), tj = document.getElementById('tj');
      if (t === 'host') {
        th.className = 'tb ah'; tj.className = 'tb';
      } else {
        tj.className = 'tb aj'; th.className = 'tb';
      }
      applyLayout();
    }

    function applyLayout() {
      const mob = innerWidth < 600;
      const pjd = document.getElementById('pjd');
      const pj = document.getElementById('pj');
      const ph = document.getElementById('ph');
      
      if (!mob) {
         // Desktop: Show both Host and Desktop-Join. Hide Mobile-Join.
         if(ph) ph.style.display = 'flex';
         if(pjd) pjd.style.display = 'flex';
         if(pj) pj.style.display = 'none';
      } else {
         // Mobile: Only show one at a time based on active tab
         if(pjd) pjd.style.display = 'none';
         if (currentTab === 'host') {
            if(ph) ph.style.display = 'flex';
            if(pj) pj.style.display = 'none';
         } else {
            if(ph) ph.style.display = 'none';
            if(pj) pj.style.display = 'flex';
         }
      }
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

    /* ── AVATARS ── */
    function selAva(el) {
      const p = el.parentElement;
      if (p) {
        p.querySelectorAll('.ava-opt').forEach(o => o.classList.remove('active'));
        el.classList.add('active');
        
        // Spawn particles immediately over the clicked avatar natively matching game aesthetic
        const rect = el.getBoundingClientRect();
        const colors = ['#38BDF8', '#FBBF24', '#34D399'];
        for(let i=0; i<4; i++) {
          const pt = document.createElement('div');
          pt.className = 'click-particle';
          pt.style.left = (rect.left + rect.width/2) + 'px';
          pt.style.top = (rect.top + rect.height/2) + 'px';
          pt.style.setProperty('--dx', (Math.random()-0.5)*40 + 'px');
          pt.style.setProperty('--dy', (Math.random()-1)*40 + 'px');
          pt.style.background = colors[Math.floor(Math.random()*colors.length)];
          pt.style.width = pt.style.height = (Math.random()*3+3)+'px';
          document.body.appendChild(pt);
          setTimeout(() => pt.remove(), 550);
        }
      }
    }
    
    // Horizontal scroll avatars
    document.querySelectorAll('.ava-sel').forEach(el => {
        el.addEventListener('wheel', (e) => {
            if(e.deltaY !== 0) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        });
        
        // Drag to scroll logic
        let isDown = false;
        let startX;
        let scrollLeft;

        el.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        });
        el.addEventListener('mouseleave', () => { isDown = false; });
        el.addEventListener('mouseup', () => { isDown = false; });
        el.addEventListener('mousemove', (e) => {
            if(!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier
            el.scrollLeft = scrollLeft - walk;
        });
    });

    /* ── BUTTONS ── */
    function doCreate(btn) {
      if (window.playCreate) window.playCreate();
      btn.disabled = true;
      document.getElementById('bcri').textContent = '⏳'; document.getElementById('bcrt').textContent = 'Creating Room...';
      
      const hostName = document.querySelector('.ch .fi').value.trim() || 'Host';
      
      if (window.GameClient) {
          window.GameClient.createRoom(hostName, (roomId) => {
              setTimeout(() => {
                window.location.href = './src/pages/host/host-room.html';
              }, 600);
          });
      } else {
        setTimeout(() => window.location.href = './src/pages/host/host-room.html', 1200);
      }
    }

    function doJoin(btn) {
      const isDesktop = btn.closest('.card').id === 'pjd';
      const root = isDesktop ? document.getElementById('pjd') : document.getElementById('pj');
      
      const v = document.getElementById(isDesktop ? 'rcid' : 'rci').value.trim();
      const dotPrefix = isDesktop ? 'dd' : 'd';
      
      const playerNameObj = root.querySelector('.fi');
      const playerName = playerNameObj ? playerNameObj.value.trim() : '';

      const avatarOpt = root.querySelector('.ava-opt.active');
      const avatarStr = avatarOpt ? avatarOpt.innerText.trim() : '👻';
      
      if(!playerName) {
          toast('⚠️ Please enter your name!');
          return;
      }

      if (v.length < 6) {
        [0, 1, 2, 3, 4, 5].forEach(i => { const d = document.getElementById(dotPrefix + i); d.classList.add('err'); setTimeout(() => d.classList.remove('err'), 600) });
        toast('⚠️ Enter a valid 6-character code!'); return;
      }
      
      if (window.playCreate) window.playCreate();
      btn.disabled = true;
      const bText = document.getElementById(isDesktop ? 'bjndt' : 'bjnt');
      const bIcon = document.getElementById(isDesktop ? 'bjndi' : 'bjni');
      
      bIcon.textContent = '⏳'; bText.textContent = 'Joining...';
      
      if (window.GameClient) {
          window.GameClient.joinRoom(v, playerName, avatarStr, (success, err) => {
              if (success) {
                  bIcon.textContent = '→'; bText.textContent = 'Enter Room';
                  toast('✅ Joined! Waiting for host...');
                  setTimeout(() => window.location.href = './src/pages/player/player-waiting.html', 1000);
              } else {
                  btn.disabled = false;
                  bIcon.textContent = '→'; bText.textContent = 'Enter Room';
                  toast('⚠️ ' + (err || 'Room not found!'));
                  [0, 1, 2, 3, 4, 5].forEach(i => { const d = document.getElementById(dotPrefix + i); d.classList.add('err'); setTimeout(() => d.classList.remove('err'), 600) });
              }
          });
      }
    }
    
    function doJoinDesktop(btn) {
        doJoin(btn);
    }

    /* ── CLICK PARTICLES ── */
    document.addEventListener('click', (e) => {
      // Check if it's a clickable element
      const target = e.target.closest('button, .btn, .chip, .hr-mode-opt, .tb, .card');
      if (!target) return;
      
      const numParticles = Math.floor(Math.random() * 4) + 6; // 6-9 particles
      const colors = ['#38BDF8', '#0EA5E9', '#34D399', '#FBBF24', '#FFFFFF', '#06B6D4']; // Diamond and UI colors
      
      for (let i = 0; i < numParticles; i++) {
        const p = document.createElement('div');
        p.className = 'click-particle';
        
        // Starting position exactly at the mouse click coordinate
        p.style.left = e.clientX + 'px';
        p.style.top = e.clientY + 'px';
        
        // Random direction (-40 to 40px X, -60 to 10px Y for flying slightly UP)
        const dx = (Math.random() - 0.5) * 80;
        const dy = (Math.random() - 0.8) * 80;
        
        p.style.setProperty('--dx', dx + 'px');
        p.style.setProperty('--dy', dy + 'px');
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Size 3 to 6px
        const size = Math.random() * 3 + 3;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        
        document.body.appendChild(p);
        
        // Cleanup wrapper
        setTimeout(() => p.remove(), 550);
      }
    });

    /* ── URL PARSING ── */
    window.addEventListener('DOMContentLoaded', () => {
       const params = new URLSearchParams(window.location.search);
       const roomCode = params.get('room');
       if(roomCode && roomCode.length === 6) {
           switchTab('join');
           
           // Hide Host/Tabs entirely
           const tabs = document.querySelector('.tabs');
           if (tabs) tabs.style.display = 'none';
           
           const ordiv = document.querySelector('.ordiv');
           if (ordiv) ordiv.style.display = 'none';

           const rci = document.getElementById('rci');
           if(rci) {
               rci.value = roomCode;
               rci.dispatchEvent(new Event('input')); // fire dot updates
               rci.closest('.field').style.display = 'none';
           }
           const d0 = document.getElementById('d0');
           if (d0) d0.parentElement.style.display = 'none';
           
           const rcid = document.getElementById('rcid');
           if(rcid) {
               rcid.value = roomCode;
               rcid.dispatchEvent(new Event('input'));
               rcid.closest('.field').style.display = 'none';
           }
           const dd0 = document.getElementById('dd0');
           if (dd0) dd0.parentElement.style.display = 'none';
           
           // Force only JOIN card to show
           const ph = document.getElementById('ph');
           if (ph) ph.style.display = 'none';
       }
    });
