/* ==========================================================================
   PIXEL GAMING IT QA PORTFOLIO - JAVASCRIPT ENGINE
   Personalized for Sheila Riva Rezqian (Core Banking QA & SDET Specialist)
   Features: 8-Bit Web Audio Synthesizer, Bug Slayer Arcade, Core Banking Test Runner,
   Project Category Filtering, CRT/Scanlines & Audio Controls.
   ========================================================================== */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API - No External Audio Files) ---
  let audioCtx = null;
  let isMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play synthesized retro sound effects
  function playSound(type) {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'blip') {
        // 8-bit button blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'squash') {
        // Bug slayer hit crunch
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'pass') {
        // Test Passed chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'levelup') {
        // Level up chord fanfare
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(freq, now + idx * 0.09);
          g.gain.setValueAtTime(0.12, now + idx * 0.09);
          g.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.09);
          o.connect(g);
          g.connect(audioCtx.destination);
          o.start(now + idx * 0.09);
          o.stop(now + (idx + 1) * 0.09);
        });
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Attach sound to clickable interactive elements
  function attachButtonSounds() {
    document.querySelectorAll('.btn-pixel, .nav-link, .filter-btn, .game-slot, .stat-card, .skill-item, .cert-card').forEach(el => {
      el.addEventListener('click', () => playSound('blip'));
    });
  }

  // --- AUDIO & CRT SCANLINE CONTROLS ---
  function setupControls() {
    const soundToggle = document.getElementById('toggle-sound');
    const scanlineToggle = document.getElementById('toggle-scanlines');
    const scanlinesOverlay = document.getElementById('scanlines-overlay');

    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        soundToggle.textContent = isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
        soundToggle.classList.toggle('active', !isMuted);
        if (!isMuted) playSound('blip');
      });
    }

    if (scanlineToggle && scanlinesOverlay) {
      scanlineToggle.addEventListener('click', () => {
        const isHidden = scanlinesOverlay.style.display === 'none';
        scanlinesOverlay.style.display = isHidden ? 'block' : 'none';
        scanlineToggle.classList.toggle('active', isHidden);
        playSound('blip');
      });
    }
  }

  // --- PROJECT FILTERING ---
  function setupProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat.includes(category)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- BUG SLAYER ARCADE MINI-GAME ---
  const bugTypes = [
    { icon: '🐛', label: 'DB Sync Glitch' },
    { icon: '🐞', label: 'Trade Limit Err' },
    { icon: '🕷️', label: 'SQL Mismatch' },
    { icon: '👾', label: 'UAT Defect' },
    { icon: '⚠️', label: 'GBO Timeout' }
  ];

  let gameScore = 0;
  let bugsSlayed = 0;
  let gameInterval = null;
  let isGameActive = false;

  function initBugSlayerGame() {
    const slots = document.querySelectorAll('.game-slot');
    const scoreDisplay = document.getElementById('game-score-val');
    const bugsDisplay = document.getElementById('bugs-slayed-val');
    const startBtn = document.getElementById('btn-start-game');

    if (!startBtn) return;

    function spawnBug() {
      // Clear slots
      slots.forEach(slot => {
        slot.innerHTML = '<span style="color: #30363d; font-size: 0.8rem;">[STANDBY]</span>';
        slot.classList.remove('has-bug');
      });

      // Pick random 1-2 slots
      const randomCount = Math.random() > 0.5 ? 2 : 1;
      const chosenIndexes = [];

      while (chosenIndexes.length < randomCount) {
        const rIndex = Math.floor(Math.random() * slots.length);
        if (!chosenIndexes.includes(rIndex)) {
          chosenIndexes.push(rIndex);
        }
      }

      chosenIndexes.forEach(idx => {
        const slot = slots[idx];
        const randomBug = bugTypes[Math.floor(Math.random() * bugTypes.length)];

        slot.innerHTML = `
          <div class="bug-target">
            <span>${randomBug.icon}</span>
            <span class="bug-label">${randomBug.label}</span>
          </div>
        `;
        slot.classList.add('has-bug');
      });
    }

    slots.forEach(slot => {
      slot.addEventListener('click', () => {
        if (!isGameActive) return;
        if (slot.classList.contains('has-bug')) {
          playSound('squash');
          slot.innerHTML = '<div style="font-family: var(--font-pixel); font-size: 0.6rem; color: var(--neon-green);">[VALIDATED ✓]</div>';
          slot.classList.remove('has-bug');
          gameScore += 100;
          bugsSlayed += 1;

          if (scoreDisplay) scoreDisplay.textContent = gameScore;
          if (bugsDisplay) bugsDisplay.textContent = bugsSlayed;

          // Bonus fanfare every 5 bugs
          if (bugsSlayed % 5 === 0) {
            playSound('levelup');
          }
        }
      });
    });

    startBtn.addEventListener('click', () => {
      initAudio();
      if (!isGameActive) {
        isGameActive = true;
        gameScore = 0;
        bugsSlayed = 0;
        if (scoreDisplay) scoreDisplay.textContent = '0';
        if (bugsDisplay) bugsDisplay.textContent = '0';
        startBtn.textContent = '⏹ STOP ARCADE';
        startBtn.classList.remove('btn-primary');
        startBtn.classList.add('btn-secondary');
        playSound('levelup');

        spawnBug();
        gameInterval = setInterval(spawnBug, 1500);
      } else {
        isGameActive = false;
        clearInterval(gameInterval);
        startBtn.textContent = '▶ START BUG SLAYER';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
        slots.forEach(slot => {
          slot.innerHTML = '<span style="color: #30363d; font-size: 0.8rem;">[READY]</span>';
          slot.classList.remove('has-bug');
        });
      }
    });
  }

  // --- CORE BANKING TEST RUNNER SIMULATOR ---
  function setupTestRunner() {
    const runBtn = document.getElementById('btn-run-tests');
    const logBody = document.getElementById('terminal-log-body');

    if (!runBtn || !logBody) return;

    const bankingTestScenarios = [
      { text: '[INIT] Menghubungkan ke Core Banking Testbed (TIPlus & Surroundings)...', type: 'info', delay: 400 },
      { text: '[FE-TEST] Validasi UI Modul TIPlus: Import, Export, & Garansi Bank Online (GBO) -> OK', type: 'pass', delay: 1000 },
      { text: '[SQL-QUERY] Menjalankan query validasi database settlement & limit kredit transaksi...', type: 'warn', delay: 1700 },
      { text: '[DB-SYNC] SELECT * FROM core_trade_settlement WHERE status=\'SETTLED\' -> 100% Cocok', type: 'pass', delay: 2400 },
      { text: '[KCLN-LONDON] Validasi integrasi workflow Kantor Cabang Luar Negeri London -> Sukses', type: 'pass', delay: 3000 },
      { text: '[JOINT-TESTING] Memverifikasi 3,000+ skenario Join Testing dengan Tim Business & Dev...', type: 'info', delay: 3600 },
      { text: '=========================================================================', type: 'info', delay: 4000 },
      { text: 'HASIL UAT: SELURUH MODUL CORE BANKING LOLOS UJI & SIAP LIVE DEPLOYMENT!', type: 'pass', delay: 4300 }
    ];

    runBtn.addEventListener('click', () => {
      initAudio();
      runBtn.disabled = true;
      runBtn.textContent = '⏳ MENJALANKAN TEST SUITE BANKING...';
      logBody.innerHTML = '<div class="log-info">> [CORE_QA_RUNNER] Memulai Eksekusi Pipeline Pengujian Core Banking BNI...</div>';

      bankingTestScenarios.forEach(item => {
        setTimeout(() => {
          const line = document.createElement('div');
          const time = new Date().toLocaleTimeString();
          line.className = `log-${item.type}`;
          line.innerHTML = `[${time}] ${item.text}`;
          logBody.appendChild(line);
          logBody.scrollTop = logBody.scrollHeight;

          if (item.type === 'pass') {
            playSound('pass');
          } else {
            playSound('blip');
          }
        }, item.delay);
      });

      setTimeout(() => {
        runBtn.disabled = false;
        runBtn.textContent = '▶ JALANKAN ULANG SUITE PENGUJIAN';
        playSound('levelup');
      }, 4600);
    });
  }

  // --- DOCUMENT READY INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    attachButtonSounds();
    setupControls();
    setupProjectFilters();
    initBugSlayerGame();
    setupTestRunner();
  });
})();
