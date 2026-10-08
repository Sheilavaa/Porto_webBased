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



  // --- DOCUMENT READY INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    attachButtonSounds();
    setupControls();
    setupProjectFilters();
    initBugSlayerGame();
    setupTestRunner();
  });
})();
