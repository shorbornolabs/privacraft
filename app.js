// PrivaCraft Interactive Client Engine
(function() {
  'use strict';

  // Sound Synthesizer (Zero external dependencies, Web Audio API)
  let audioCtx = null;
  let soundEnabled = false;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq = 600, duration = 0.08, type = 'sine') {
    if (!soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      soundToggle.innerHTML = soundEnabled 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
      soundToggle.setAttribute('title', soundEnabled ? 'Mute Interface Sound' : 'Enable Audio Feedback');
      if (soundEnabled) playTone(880, 0.1);
    });
  }

  // Toast Notification System
  function showToast(message) {
    playTone(1020, 0.06);
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.25s ease-out';
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  window.copyToClipboard = function(text, label = 'Copied') {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard!`);
    }).catch(() => {
      showToast(`Copied: ${text}`);
    });
  };

  // Tab Switcher
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playTone(520, 0.05);
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // 2FA Live Simulation Engine
  const totpCircle = document.getElementById('totp-timer-circle');
  const totpCodes = {
    github: document.getElementById('code-github'),
    cloudflare: document.getElementById('code-cloudflare'),
    proton: document.getElementById('code-proton'),
    aws: document.getElementById('code-aws')
  };

  function generateMockTotp() {
    const r = () => Math.floor(100 + Math.random() * 900);
    return `${r()} ${r()}`;
  }

  function updateTotpCodes() {
    for (const key in totpCodes) {
      if (totpCodes[key]) {
        totpCodes[key].textContent = generateMockTotp();
      }
    }
    playTone(720, 0.08);
  }

  // 30-Second Countdown Loop
  const fullDash = 88;
  function runTotpTimer() {
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = 30 - (now % 30);
    const fraction = secondsRemaining / 30;
    
    if (totpCircle) {
      totpCircle.style.strokeDashoffset = fullDash * (1 - fraction);
      if (secondsRemaining <= 5) {
        totpCircle.style.stroke = '#f43f5e';
      } else {
        totpCircle.style.stroke = '#00f0ff';
      }
    }

    if (secondsRemaining === 30) {
      updateTotpCodes();
    }
  }

  setInterval(runTotpTimer, 1000);
  runTotpTimer();

  // Password Studio Generator
  const lengthSlider = document.getElementById('pwd-length');
  const lengthVal = document.getElementById('pwd-length-val');
  const optUpper = document.getElementById('pwd-upper');
  const optLower = document.getElementById('pwd-lower');
  const optNums = document.getElementById('pwd-nums');
  const optSymbols = document.getElementById('pwd-symbols');
  const optDiceware = document.getElementById('pwd-diceware');
  const displayPass = document.getElementById('pwd-display');
  const entropyVal = document.getElementById('entropy-val');
  const crackTimeVal = document.getElementById('crack-time-val');
  const genBtn = document.getElementById('gen-pwd-btn');

  const dicewareWords = [
    'obsidian', 'quantum', 'cipher', 'horizon', 'shield', 'sentinel',
    'enigma', 'protocol', 'aurora', 'matrix', 'nebula', 'phantom',
    'kinetic', 'vortex', 'titan', 'beacon', 'bastion', 'glacier'
  ];

  function generatePassword() {
    playTone(640, 0.04);
    if (optDiceware && optDiceware.checked) {
      const wordsCount = Math.max(3, Math.min(8, Math.round(lengthSlider.value / 6)));
      let words = [];
      for (let i = 0; i < wordsCount; i++) {
        words.push(dicewareWords[Math.floor(Math.random() * dicewareWords.length)]);
      }
      const pass = words.join('-');
      displayPass.textContent = pass;
      calculateEntropy(pass, 7776);
      return;
    }

    let charset = '';
    if (optLower && optLower.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (optUpper && optUpper.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (optNums && optNums.checked) charset += '0123456789';
    if (optSymbols && optSymbols.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    const len = parseInt(lengthSlider.value, 10);
    let pass = '';
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) {
      pass += charset[array[i] % charset.length];
    }
    displayPass.textContent = pass;
    calculateEntropy(pass, charset.length);
  }

  function calculateEntropy(pass, poolSize) {
    const len = pass.length;
    const bits = Math.round(len * (Math.log2(poolSize || 64)));
    if (entropyVal) entropyVal.textContent = `${bits} bits`;

    let time = 'Instantly';
    if (bits < 40) time = '< 1 Second';
    else if (bits < 55) time = '4.5 Hours';
    else if (bits < 65) time = '12 Years';
    else if (bits < 80) time = '34,000 Years';
    else if (bits < 100) time = '8.2 Million Years';
    else time = '4.6 Trillion Centuries';

    if (crackTimeVal) crackTimeVal.textContent = time;
  }

  if (lengthSlider) {
    lengthSlider.addEventListener('input', (e) => {
      if (lengthVal) lengthVal.textContent = e.target.value;
      generatePassword();
    });
  }

  [optUpper, optLower, optNums, optSymbols, optDiceware].forEach(opt => {
    if (opt) opt.addEventListener('change', generatePassword);
  });

  if (genBtn) genBtn.addEventListener('click', generatePassword);

  // Generate initial password
  generatePassword();

  // FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      playTone(480, 0.04);
      const item = btn.parentElement;
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

})();