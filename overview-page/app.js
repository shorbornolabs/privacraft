// PrivaCraft Sovereign Web Workstation Client Engine
(function() {
  'use strict';

  // 1. Audio Synthesizer (Web Audio API)
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
      if (audioCtx.state === 'suspended') audioCtx.resume();
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
      soundToggle.setAttribute('title', soundEnabled ? 'Mute Interface Sound' : 'Enable Cyber Audio');
      if (soundEnabled) playTone(880, 0.1);
    });
  }

  // 2. Toast Notifications
  window.showToast = function(message, isSuccess = true) {
    playTone(isSuccess ? 1020 : 440, 0.07);
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconColor = isSuccess ? '#10b981' : '#f43f5e';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5">
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
    }, 2500);
  };

  window.copyToClipboard = function(text, label = 'Copied') {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      window.showToast(`${label} copied to clipboard!`);
    }).catch(() => {
      window.showToast(`Copied: ${text}`);
    });
  };

  // 3. Tab Switcher
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

  // 4. REAL RFC 6238 Web Crypto TOTP Authenticator Engine
  const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  function base32ToUint8Array(base32Str) {
    if (!base32Str || typeof base32Str !== 'string') return new Uint8Array(0);
    const cleanStr = base32Str.toUpperCase().replace(/[\s\-_=]/g, '');
    if (cleanStr.length === 0) return new Uint8Array(0);

    for (let i = 0; i < cleanStr.length; i++) {
      if (!BASE32_CHARS.includes(cleanStr[i])) {
        throw new Error('Invalid Base32 character: ' + cleanStr[i]);
      }
    }

    const length = cleanStr.length;
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = new Uint8Array(Math.floor((length * 5) / 8));

    for (let i = 0; i < length; i++) {
      const charIndex = BASE32_CHARS.indexOf(cleanStr[i]);
      value = (value << 5) | charIndex;
      bits += 5;
      if (bits >= 8) {
        output[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }
    return output;
  }

  async function generateTotpCode(secretBase32, timestampSeconds = null, period = 30, digits = 6) {
    try {
      const keyBytes = base32ToUint8Array(secretBase32);
      if (keyBytes.length === 0) return '000000';

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      );

      const epoch = timestampSeconds || Math.floor(Date.now() / 1000);
      const counter = Math.floor(epoch / period);

      const counterBuffer = new ArrayBuffer(8);
      const counterView = new DataView(counterBuffer);
      counterView.setUint32(0, Math.floor(counter / 0x100000000), false);
      counterView.setUint32(4, counter & 0xffffffff, false);

      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
      const hmacResult = new Uint8Array(signature);

      const offset = hmacResult[hmacResult.length - 1] & 0x0f;
      const binary =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const otp = binary % Math.pow(10, digits);
      return otp.toString().padStart(digits, '0');
    } catch (e) {
      return '------';
    }
  }

  const VAULT_STORAGE_KEY = 'privacraft_web_vault_accounts';
  const DEFAULT_ACCOUNTS = [
    { id: '1', issuer: 'GitHub', name: 'GitHub Enterprise', account: 'dev@shorborno.io', secret: 'JBSWY3DPEHPK3PXP', color: '#24292e', icon: 'GH' },
    { id: '2', issuer: 'Cloudflare', name: 'Zero Trust Access', account: 'admin@privacraft.org', secret: 'KRUGS4ZANFZSA3TPOQQGKYTD', color: '#f38020', icon: 'CF' },
    { id: '3', issuer: 'ProtonMail', name: 'Encrypted Relay', account: 'sec-ops@pm.me', secret: 'MZXW6YTBOI======', color: '#6d4aff', icon: 'PM' },
    { id: '4', issuer: 'AWS', name: 'Root Infrastructure', account: 'root@cloud-vault', secret: 'NBSWY3DPEHPK3PXP', color: '#ff9900', icon: 'AWS' }
  ];

  function getVaultAccounts() {
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  }

  function saveVaultAccounts(accounts) {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(accounts));
  }

  const totpContainer = document.getElementById('totp-cards-container');
  const totpTimerCircle = document.getElementById('totp-timer-circle');
  const totpSecondsLabel = document.getElementById('totp-seconds-label');

  async function renderTotpCards() {
    if (!totpContainer) return;
    const accounts = getVaultAccounts();
    totpContainer.innerHTML = '';

    for (const acc of accounts) {
      const code = await generateTotpCode(acc.secret);
      const splitCode = code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

      const card = document.createElement('div');
      card.className = 'totp-card';
      card.innerHTML = `
        <div class="totp-meta">
          <div class="totp-issuer">
            <div class="totp-icon" style="background: ${acc.color || '#24292e'}; color: #fff;">${acc.icon || '2FA'}</div>
            <div>
              <div class="totp-name">${acc.name || acc.issuer}</div>
              <div class="totp-account">${acc.account || 'Local Device Key'}</div>
            </div>
          </div>
          <button class="delete-acc-btn" data-id="${acc.id}" title="Remove Account">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="totp-code-display">
          <span class="totp-code" id="totp-val-${acc.id}">${splitCode}</span>
          <button class="copy-mini-btn" onclick="copyToClipboard('${code}', '${acc.name}')" title="Copy 2FA Code">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      `;
      totpContainer.appendChild(card);
    }

    totpContainer.querySelectorAll('.delete-acc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const current = getVaultAccounts();
        const updated = current.filter(a => a.id !== id);
        saveVaultAccounts(updated);
        renderTotpCards();
        window.showToast('Account removed from local vault');
      });
    });
  }

  const fullDash = 88;
  async function refreshTotpCodes() {
    const accounts = getVaultAccounts();
    for (const acc of accounts) {
      const code = await generateTotpCode(acc.secret);
      const splitCode = code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
      const el = document.getElementById(`totp-val-${acc.id}`);
      if (el) el.textContent = splitCode;
    }
  }

  function runTotpLoop() {
    const now = Math.floor(Date.now() / 1000);
    const remaining = 30 - (now % 30);
    const fraction = remaining / 30;

    if (totpTimerCircle) {
      totpTimerCircle.style.strokeDashoffset = fullDash * (1 - fraction);
      totpTimerCircle.style.stroke = remaining <= 5 ? '#f43f5e' : '#00f0ff';
    }
    if (totpSecondsLabel) {
      totpSecondsLabel.textContent = `${remaining}s`;
    }

    if (remaining === 30 || remaining === 1) {
      refreshTotpCodes();
    }
  }

  setInterval(runTotpLoop, 1000);
  runTotpLoop();
  renderTotpCards();

  // Add 2FA Account Modal
  const btnOpenAddTotp = document.getElementById('btn-open-add-totp');
  const addTotpModal = document.getElementById('add-totp-modal');
  const btnCloseAddTotp = document.getElementById('btn-close-add-totp');
  const formAddTotp = document.getElementById('form-add-totp');

  if (btnOpenAddTotp && addTotpModal) {
    btnOpenAddTotp.addEventListener('click', () => {
      addTotpModal.classList.add('active');
    });
  }
  if (btnCloseAddTotp && addTotpModal) {
    btnCloseAddTotp.addEventListener('click', () => {
      addTotpModal.classList.remove('active');
    });
  }
  if (formAddTotp) {
    formAddTotp.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('input-totp-name').value.trim();
      const account = document.getElementById('input-totp-account').value.trim() || 'Workstation Key';
      let secret = document.getElementById('input-totp-secret').value.trim();

      if (secret.startsWith('otpauth://totp/')) {
        try {
          const url = new URL(secret);
          secret = url.searchParams.get('secret') || secret;
        } catch(err) {}
      }

      secret = secret.replace(/[\s\-_=]/g, '').toUpperCase();
      if (!secret) {
        alert('Please provide a valid Base32 secret key.');
        return;
      }

      const colors = ['#00f0ff', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const initials = (name.slice(0, 2) || '2F').toUpperCase();

      const newAcc = {
        id: Date.now().toString(),
        issuer: name,
        name: name,
        account: account,
        secret: secret,
        color: randomColor,
        icon: initials
      };

      const accounts = getVaultAccounts();
      accounts.push(newAcc);
      saveVaultAccounts(accounts);
      await renderTotpCards();
      addTotpModal.classList.remove('active');
      formAddTotp.reset();
      window.showToast(`Account '${name}' added to your local vault!`);
    });
  }

  // 5. REAL DISPOSABLE TEMP MAIL & LIVE INBOX (Mail.tm)
  const MAIL_STORAGE_KEY = 'privacraft_web_tempmail_session';
  let activeMailbox = null;
  let cachedMessages = [];

  const elMailAddress = document.getElementById('active-mail-address');
  const elMsgCount = document.getElementById('mail-msg-count');
  const elMessagesList = document.getElementById('mail-messages-container');
  const elDomainSelect = document.getElementById('tempmail-domain-picker');
  const btnNewMail = document.getElementById('btn-create-new-mail');
  const btnRefreshMail = document.getElementById('btn-refresh-inbox');

  function generateRandomStr(len = 9) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  }

  function extractVerificationCode(content) {
    if (!content) return null;
    const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
    const patterns = [
      /(?:verification|security|confirm|one-time|otp|pin|passcode|code)[^\d\n\r]{0,30}\b([0-9]{4,8})\b/i,
      /\b([0-9]{3}[-\s][0-9]{3})\b/,
      /(?:is|is:|was|code:)\s*\b([0-9]{4,8})\b/i,
      /\b([0-9]{6})\b/
    ];
    for (const p of patterns) {
      const match = cleanText.match(p);
      if (match) return match[1].replace(/[-\s]/g, '');
    }
    return null;
  }

  async function fetchAvailableDomains() {
    try {
      const res = await fetch('https://api.mail.tm/domains');
      if (!res.ok) return ['uberip.com'];
      const data = await res.json();
      const list = (data['hydra:member'] || []).map(d => d.domain);
      return list.length > 0 ? list : ['uberip.com'];
    } catch(e) {
      return ['uberip.com'];
    }
  }

  async function createMailTmAccount(selectedDomain = null) {
    try {
      if (elMailAddress) elMailAddress.textContent = 'Allocating secure mailbox...';
      const domains = await fetchAvailableDomains();
      if (elDomainSelect) {
        elDomainSelect.innerHTML = domains.map(d => `<option value="${d}">${d}</option>`).join('');
      }
      const domain = selectedDomain || domains[0];
      const username = generateRandomStr(9);
      const address = `${username}@${domain}`;
      const password = `PrivaCraft_${Math.random().toString(36).slice(2, 10)}!`;

      const createRes = await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
      });
      if (!createRes.ok) throw new Error('Account creation failed');
      const createData = await createRes.json();

      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
      });
      if (!tokenRes.ok) throw new Error('Authentication failed');
      const tokenData = await tokenRes.json();

      const session = {
        email: address,
        token: tokenData.token,
        domain: domain,
        accountId: createData.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600 * 1000
      };

      localStorage.setItem(MAIL_STORAGE_KEY, JSON.stringify(session));
      activeMailbox = session;
      updateMailboxUI();
      pollInbox();
      window.showToast(`Mailbox ready: ${address}`);
      return session;
    } catch(e) {
      console.warn('Mail.tm setup error:', e);
      if (elMailAddress) elMailAddress.textContent = 'relay-offline@privacraft.org';
    }
  }

  function updateMailboxUI() {
    if (!activeMailbox) return;
    if (elMailAddress) elMailAddress.textContent = activeMailbox.email;
    if (elDomainSelect && activeMailbox.domain) {
      elDomainSelect.value = activeMailbox.domain;
    }
  }

  async function pollInbox() {
    if (!activeMailbox || !activeMailbox.token) return;
    try {
      const res = await fetch('https://api.mail.tm/messages', {
        headers: { Authorization: `Bearer ${activeMailbox.token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const messages = data['hydra:member'] || [];

      if (messages.length !== cachedMessages.length) {
        if (messages.length > cachedMessages.length) {
          playTone(880, 0.15);
          window.showToast('New incoming email received!');
        }
        cachedMessages = messages;
        await renderMessages(messages);
      }
    } catch(e) {}
  }

  async function renderMessages(messages) {
    if (elMsgCount) elMsgCount.textContent = messages.length;
    if (!elMessagesList) return;

    if (messages.length === 0) {
      elMessagesList.innerHTML = `
        <div class="mail-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <p>Inbox is listening for incoming verification emails...</p>
          <span>Send any signup or OTP email to this address to test real extraction.</span>
        </div>
      `;
      return;
    }

    elMessagesList.innerHTML = '';
    for (const msg of messages) {
      const detailRes = await fetch(`https://api.mail.tm/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${activeMailbox.token}` }
      });
      let fullText = msg.intro || '';
      if (detailRes.ok) {
        const detail = await detailRes.json();
        fullText = detail.text || detail.html?.[0] || fullText;
      }
      const otp = extractVerificationCode(fullText);

      const item = document.createElement('div');
      item.className = 'mail-item';
      item.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 0.95rem; color: #fff;">${msg.subject || '(No Subject)'}</span>
            <span style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">
              ${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <span style="font-size: 0.82rem; color: var(--cyan); font-family: var(--font-mono);">From: ${msg.from?.address || msg.from?.name || 'Unknown'}</span>
          <span style="font-size: 0.82rem; color: var(--text-muted);">${(msg.intro || fullText).slice(0, 120)}...</span>
        </div>
        ${otp ? `
          <div class="mail-otp-badge" onclick="copyToClipboard('${otp}', 'OTP ${otp}')" style="cursor: pointer;" title="Click to copy OTP">
            <span>OTP: ${otp}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </div>
        ` : ''}
      `;
      elMessagesList.appendChild(item);
    }
  }

  (async function initTempMail() {
    try {
      const stored = localStorage.getItem(MAIL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          activeMailbox = parsed;
          updateMailboxUI();
          pollInbox();
        } else {
          await createMailTmAccount();
        }
      } else {
        await createMailTmAccount();
      }
    } catch(e) {
      await createMailTmAccount();
    }
    setInterval(pollInbox, 6000);
  })();

  if (btnNewMail) {
    btnNewMail.addEventListener('click', async () => {
      const domain = elDomainSelect ? elDomainSelect.value : null;
      await createMailTmAccount(domain);
    });
  }
  if (btnRefreshMail) {
    btnRefreshMail.addEventListener('click', async () => {
      window.showToast('Checking inbox for new mail...');
      await pollInbox();
    });
  }

  // 6. CRYPTOGRAPHIC PASSWORD STUDIO
  const WORD_LIST = [
    "acorn", "action", "active", "actor", "admire", "adobe", "aerobic", "afford", "agile", "airport",
    "alaska", "albatross", "alchemy", "alder", "alert", "algebra", "alien", "almanac", "almond", "alpine",
    "amazon", "amber", "ambient", "amethyst", "amplify", "anchor", "android", "angel", "anthem", "antique",
    "apex", "apollo", "apricot", "aqua", "arcade", "archer", "arctic", "arena", "aria", "armor",
    "arrow", "artist", "aspen", "aster", "astral", "atlas", "atom", "aurora", "autumn", "avatar",
    "bold", "bonfire", "bonsai", "boulder", "breeze", "bridge", "brisk", "bronze", "brook", "buffalo",
    "cactus", "cadence", "calm", "canyon", "canvas", "capitol", "carbon", "cardinal", "cascade", "castle",
    "cedar", "celestial", "centaur", "chalet", "champion", "channel", "charcoal", "cheetah", "cherry", "chime",
    "circuit", "citrus", "clarity", "cliff", "clover", "cobalt", "colibri", "comet", "compass", "condor",
    "copper", "coral", "corona", "cosmic", "cosmos", "crag", "crater", "crescent", "crest", "cricket",
    "crimson", "crystal", "cypress", "dancer", "daring", "dawn", "daybreak", "delta", "density", "dewdrop",
    "diamond", "diver", "dolphin", "dragon", "drift", "dynamo", "eagle", "earth", "echo", "eclipse",
    "ember", "emerald", "engine", "enigma", "epoch", "equinox", "essence", "eternal", "eureka", "everest",
    "falcon", "feather", "feline", "fern", "fiesta", "filament", "finch", "fir", "firefly", "fjord",
    "flame", "flint", "flora", "flow", "forest", "fountain", "fox", "galaxy", "galway", "garnet",
    "gateway", "gazelle", "gecko", "gemini", "genesis", "geyser", "glacier", "glade", "glimmer", "glowing",
    "gold", "granite", "gravity", "grove", "gull", "harbor", "haven", "hawk", "hazel", "helix",
    "heron", "horizon", "humming", "hunter", "hydra", "hyper", "ibex", "iceberg", "igloo", "impact",
    "indigo", "infinity", "island", "jaguar", "jasper", "javelin", "jovian", "journey", "jungle", "jupiter",
    "matrix", "nebula", "obsidian", "phantom", "protocol", "quantum", "sentinel", "shield", "titan", "vortex"
  ];

  const PWD_HISTORY_KEY = 'privacraft_password_history';
  function getPasswordHistory() {
    try {
      const stored = localStorage.getItem(PWD_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch(e) { return []; }
  }

  function addPasswordToHistory(pwd) {
    const list = getPasswordHistory();
    const filtered = list.filter(item => item.password !== pwd);
    filtered.unshift({ password: pwd, timestamp: Date.now() });
    const trimmed = filtered.slice(0, 10);
    localStorage.setItem(PWD_HISTORY_KEY, JSON.stringify(trimmed));
    renderPasswordHistory();
  }

  function secureRandomInt(max) {
    if (max <= 1) return 0;
    const range = 0x100000000;
    const limit = range - (range % max);
    const buffer = new Uint32Array(1);
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= limit);
    return rand % max;
  }

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
  const btnCopyPwd = document.getElementById('btn-copy-pwd');
  const historyContainer = document.getElementById('password-history-list');
  const btnClearHistory = document.getElementById('btn-clear-pwd-history');

  function generatePassword() {
    playTone(640, 0.04);
    if (optDiceware && optDiceware.checked) {
      const count = Math.max(3, Math.min(8, Math.round(lengthSlider.value / 6)));
      let words = [];
      for (let i = 0; i < count; i++) {
        words.push(WORD_LIST[secureRandomInt(WORD_LIST.length)]);
      }
      const pass = words.join('-');
      if (displayPass) displayPass.textContent = pass;
      calculateEntropy(pass, WORD_LIST.length);
      return pass;
    }

    let charset = '';
    if (optLower && optLower.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (optUpper && optUpper.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (optNums && optNums.checked) charset += '0123456789';
    if (optSymbols && optSymbols.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    const len = parseInt(lengthSlider.value, 10);
    let pass = '';
    for (let i = 0; i < len; i++) {
      pass += charset[secureRandomInt(charset.length)];
    }
    if (displayPass) displayPass.textContent = pass;
    calculateEntropy(pass, charset.length);
    return pass;
  }

  function calculateEntropy(pass, poolSize) {
    const len = pass.length;
    const bits = Math.round(len * Math.log2(poolSize || 64));
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

  function renderPasswordHistory() {
    if (!historyContainer) return;
    const history = getPasswordHistory();
    if (history.length === 0) {
      historyContainer.innerHTML = '<span style="font-size:0.8rem; color:var(--text-dim);">No copied passwords yet. Click "Copy Password" to save to local session.</span>';
      return;
    }
    historyContainer.innerHTML = '';
    history.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `
        <span class="history-pwd" onclick="copyToClipboard('${item.password}', 'Password')" title="Click to copy">${item.password}</span>
        <span class="history-time">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      `;
      historyContainer.appendChild(row);
    });
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

  if (genBtn) genBtn.addEventListener('click', () => generatePassword());

  if (btnCopyPwd && displayPass) {
    btnCopyPwd.addEventListener('click', () => {
      const pwd = displayPass.textContent;
      window.copyToClipboard(pwd, 'Password');
      addPasswordToHistory(pwd);
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      localStorage.removeItem(PWD_HISTORY_KEY);
      renderPasswordHistory();
      window.showToast('Password history cleared');
    });
  }

  generatePassword();
  renderPasswordHistory();

  // 7. FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      playTone(480, 0.04);
      const item = btn.parentElement;
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
    });
  });

})();