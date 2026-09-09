// PrivaCraft Sovereign Web Workstation Client Engine
(function() {
  'use strict';

  // ===========================================================================
  // 1. Audio Synthesizer (Web Audio API)
  // ===========================================================================
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

  // ===========================================================================
  // 2. Toast System
  // ===========================================================================
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

  // ===========================================================================
  // 3. Navigation Tabs Switcher
  // ===========================================================================
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

  // ===========================================================================
  // 4. INSTANT 2FA GENERATOR & VAULT (Clean HUD, Real Web Crypto RFC 6238)
  // ===========================================================================
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

  async function computeTotp(secretBase32, timestampSeconds = null) {
    try {
      const keyBytes = base32ToUint8Array(secretBase32);
      if (keyBytes.length === 0) return '------';

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      );

      const epoch = timestampSeconds || Math.floor(Date.now() / 1000);
      const counter = Math.floor(epoch / 30);

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

      const otp = binary % 1000000;
      return otp.toString().padStart(6, '0');
    } catch (e) {
      return '------';
    }
  }

  // 2FA DOM Elements
  const inputTotpKey = document.getElementById('totp-key-input');
  const btnPasteTotp = document.getElementById('btn-paste-totp');
  const btnClearTotp = document.getElementById('btn-clear-totp');
  const totpPart1 = document.getElementById('totp-part1');
  const totpPart2 = document.getElementById('totp-part2');
  const btnCopyTotp = document.getElementById('btn-copy-totp');
  const totpRingCircle = document.getElementById('totp-ring-circle');
  const totpCountdownSec = document.getElementById('totp-countdown-sec');
  const btnSaveAccount = document.getElementById('btn-save-current-totp');
  const savedPillsContainer = document.getElementById('saved-totp-pills');

  // Stored Vault Accounts
  const VAULT_STORAGE_KEY = 'privacraft_web_saved_keys';
  function getSavedVault() {
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch(e) { return []; }
  }

  function saveVaultList(list) {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(list));
    renderSavedPills();
  }

  let currentRawTotpCode = '------';

  async function updateActiveTotp() {
    let key = inputTotpKey ? inputTotpKey.value.trim() : '';
    if (key.startsWith('otpauth://totp/')) {
      try {
        const url = new URL(key);
        key = url.searchParams.get('secret') || key;
      } catch(err) {}
    }
    key = key.replace(/[\s\-_=]/g, '').toUpperCase();

    if (!key) {
      if (totpPart1) totpPart1.textContent = '---';
      if (totpPart2) totpPart2.textContent = '---';
      currentRawTotpCode = '------';
      return;
    }

    const code = await computeTotp(key);
    currentRawTotpCode = code;
    if (code.length === 6) {
      if (totpPart1) totpPart1.textContent = code.slice(0, 3);
      if (totpPart2) totpPart2.textContent = code.slice(3);
    } else {
      if (totpPart1) totpPart1.textContent = '---';
      if (totpPart2) totpPart2.textContent = '---';
    }
  }

  // 30-second live ring animation
  const ringCircumference = 157.08; // 2 * pi * 25
  function runTotpClock() {
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = 30 - (now % 30);
    const fraction = secondsRemaining / 30;

    if (totpRingCircle) {
      totpRingCircle.style.strokeDashoffset = ringCircumference * (1 - fraction);
      totpRingCircle.style.stroke = secondsRemaining <= 5 ? '#f43f5e' : '#00f0ff';
    }
    if (totpCountdownSec) {
      totpCountdownSec.textContent = `${secondsRemaining}s`;
    }

    if (secondsRemaining === 30 || secondsRemaining === 1) {
      updateActiveTotp();
    }
  }

  setInterval(runTotpClock, 1000);
  runTotpClock();

  if (inputTotpKey) {
    inputTotpKey.addEventListener('input', updateActiveTotp);
  }

  if (btnPasteTotp && inputTotpKey) {
    btnPasteTotp.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        inputTotpKey.value = text.trim();
        updateActiveTotp();
        window.showToast('Key pasted from clipboard');
      } catch(e) {
        inputTotpKey.focus();
      }
    });
  }

  if (btnClearTotp && inputTotpKey) {
    btnClearTotp.addEventListener('click', () => {
      inputTotpKey.value = '';
      updateActiveTotp();
      inputTotpKey.focus();
    });
  }

  if (btnCopyTotp) {
    btnCopyTotp.addEventListener('click', () => {
      if (currentRawTotpCode && currentRawTotpCode !== '------') {
        window.copyToClipboard(currentRawTotpCode, '2FA Code');
      } else {
        window.showToast('Please enter a secret key first', false);
      }
    });
  }

  // Save current key to local pills
  if (btnSaveAccount) {
    btnSaveAccount.addEventListener('click', () => {
      const key = inputTotpKey ? inputTotpKey.value.trim() : '';
      if (!key) {
        window.showToast('Enter a secret key to save', false);
        return;
      }
      const label = prompt('Enter a label for this 2FA account (e.g. GitHub, Work, Binance):');
      if (!label) return;

      const list = getSavedVault();
      list.push({ id: Date.now().toString(), label: label.trim(), secret: key });
      saveVaultList(list);
      window.showToast(`Saved '${label}' to your local vault!`);
    });
  }

  function renderSavedPills() {
    if (!savedPillsContainer) return;
    const list = getSavedVault();
    if (list.length === 0) {
      savedPillsContainer.innerHTML = '<span class="vault-empty-hint">No saved keys yet. Click "+ Save Key to Vault" to pin keys for 1-click access.</span>';
      return;
    }
    savedPillsContainer.innerHTML = '';
    list.forEach(item => {
      const pill = document.createElement('div');
      pill.className = 'vault-pill';
      pill.innerHTML = `
        <span class="vault-pill-name" title="Load this key">${item.label}</span>
        <button class="vault-pill-del" data-id="${item.id}" title="Delete">✕</button>
      `;
      pill.querySelector('.vault-pill-name').addEventListener('click', () => {
        if (inputTotpKey) {
          inputTotpKey.value = item.secret;
          updateActiveTotp();
          window.showToast(`Loaded '${item.label}'`);
        }
      });
      pill.querySelector('.vault-pill-del').addEventListener('click', (e) => {
        e.stopPropagation();
        const updated = getSavedVault().filter(a => a.id !== item.id);
        saveVaultList(updated);
        window.showToast('Key removed from vault');
      });
      savedPillsContainer.appendChild(pill);
    });
  }

  renderSavedPills();

  // Set default initial key so user immediately sees real working 2FA on load
  if (inputTotpKey && !inputTotpKey.value) {
    inputTotpKey.value = 'JBSWY3DPEHPK3PXP';
    updateActiveTotp();
  }

  // ===========================================================================
  // 5. FULL-POWER DISPOSABLE TEMP MAIL (Multi-Provider, 7+ Real Domains)
  // ===========================================================================
  let activeMailProvider = 'guerrilla'; // 'guerrilla' or 'mailtm'
  let activeEmailAddress = '';
  let activeSessionToken = '';
  let mailboxExpiry = Date.now() + 60 * 60 * 1000;
  let cachedInboxMessages = [];
  let pollTimer = null;

  const DOMAIN_OPTIONS = [
    { domain: 'sharklasers.com', provider: 'guerrilla', label: '@sharklasers.com (Guerrilla)' },
    { domain: 'guerrillamail.com', provider: 'guerrilla', label: '@guerrillamail.com (Guerrilla)' },
    { domain: 'guerrillamailblock.com', provider: 'guerrilla', label: '@guerrillamailblock.com (Guerrilla)' },
    { domain: 'grr.la', provider: 'guerrilla', label: '@grr.la (Guerrilla)' },
    { domain: 'pokemail.net', provider: 'guerrilla', label: '@pokemail.net (Guerrilla)' },
    { domain: 'spam4.me', provider: 'guerrilla', label: '@spam4.me (Guerrilla)' },
    { domain: 'uberip.com', provider: 'mailtm', label: '@uberip.com (Mail.tm)' }
  ];

  const selectDomain = document.getElementById('tempmail-domain-select');
  const txtAddress = document.getElementById('tempmail-address-val');
  const txtTimer = document.getElementById('tempmail-timer-val');
  const badgeCount = document.getElementById('tempmail-msg-count');
  const messagesList = document.getElementById('tempmail-messages-list');
  const btnRefreshInbox = document.getElementById('btn-refresh-inbox');
  const btnNewAddress = document.getElementById('btn-new-tempmail');
  const btnExtendMail = document.getElementById('btn-extend-mail');
  const btnCopyMail = document.getElementById('btn-copy-tempmail');

  // Populate domain options
  if (selectDomain) {
    selectDomain.innerHTML = DOMAIN_OPTIONS.map(d => `<option value="${d.domain}" data-provider="${d.provider}">${d.label}</option>`).join('');
  }

  function randomUser(len = 9) {
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

  async function createMailbox(targetDomain = 'sharklasers.com') {
    if (txtAddress) txtAddress.textContent = 'Allocating clean disposable inbox...';
    const opt = DOMAIN_OPTIONS.find(d => d.domain === targetDomain) || DOMAIN_OPTIONS[0];
    activeMailProvider = opt.provider;

    try {
      if (opt.provider === 'guerrilla') {
        const res = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
        if (!res.ok) throw new Error('Guerrilla API error');
        const data = await res.json();
        const sid = data.sid_token;
        const newUser = randomUser(9);

        try {
          await fetch(`https://api.guerrillamail.com/ajax.php?f=set_email_user&email_user=${newUser}&lang=en&sid_token=${sid}&site=${targetDomain}`);
        } catch(e) {}

        activeEmailAddress = `${newUser}@${targetDomain}`;
        activeSessionToken = sid;
      } else {
        // Mail.tm
        const user = randomUser(9);
        const email = `${user}@${targetDomain}`;
        const pwd = `Priva_${Math.random().toString(36).slice(2, 10)}!`;

        const cr = await fetch('https://api.mail.tm/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: email, password: pwd })
        });
        if (!cr.ok) throw new Error('Mail.tm creation error');

        const tr = await fetch('https://api.mail.tm/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: email, password: pwd })
        });
        const td = await tr.json();

        activeEmailAddress = email;
        activeSessionToken = td.token;
      }

      mailboxExpiry = Date.now() + 60 * 60 * 1000;
      if (txtAddress) txtAddress.textContent = activeEmailAddress;
      if (badgeCount) badgeCount.textContent = '0';
      cachedInboxMessages = [];
      renderInbox([]);
      window.showToast(`New mailbox active: ${activeEmailAddress}`);
      pollInbox();
    } catch(err) {
      console.warn('Mailbox allocation fallback:', err);
      activeEmailAddress = `temp_${randomUser(6)}@sharklasers.com`;
      if (txtAddress) txtAddress.textContent = activeEmailAddress;
    }
  }

  async function pollInbox() {
    if (!activeEmailAddress || !activeSessionToken) return;

    try {
      let rawList = [];
      if (activeMailProvider === 'guerrilla') {
        const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${activeSessionToken}`);
        if (res.ok) {
          const data = await res.json();
          rawList = (data.list || [])
            .filter(m => !/Welcome to Guerrilla Mail/i.test(m.mail_subject || '') && !/no-reply@guerrillamail/i.test(m.mail_from || ''))
            .map(m => ({
              id: m.mail_id,
              from: m.mail_from,
              subject: m.mail_subject || '(No Subject)',
              date: m.mail_date,
              body: m.mail_excerpt || ''
            }));
        }
      } else {
        // Mail.tm
        const res = await fetch('https://api.mail.tm/messages', {
          headers: { Authorization: `Bearer ${activeSessionToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          rawList = (data['hydra:member'] || []).map(m => ({
            id: m.id,
            from: m.from?.address || m.from?.name || 'Unknown',
            subject: m.subject || '(No Subject)',
            date: m.createdAt,
            body: m.intro || ''
          }));
        }
      }

      if (rawList.length !== cachedInboxMessages.length) {
        if (rawList.length > cachedInboxMessages.length) {
          playTone(880, 0.18);
          window.showToast('New email arrived!');
        }
        cachedInboxMessages = rawList;
        renderInbox(rawList);
      }
    } catch(e) {}
  }

  function renderInbox(messages) {
    if (badgeCount) badgeCount.textContent = messages.length;
    if (!messagesList) return;

    if (messages.length === 0) {
      messagesList.innerHTML = `
        <div class="mail-empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <p>Inbox is waiting for incoming traffic...</p>
          <span>Send any signup or OTP confirmation to test real-time extraction.</span>
        </div>
      `;
      return;
    }

    messagesList.innerHTML = '';
    messages.forEach(msg => {
      const otp = extractVerificationCode(msg.body + ' ' + msg.subject);
      const card = document.createElement('div');
      card.className = 'mail-message-card';
      card.innerHTML = `
        <div class="mail-msg-left">
          <div class="mail-msg-header">
            <span class="mail-msg-from">${msg.from}</span>
            <span class="mail-msg-time">${new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="mail-msg-subject">${msg.subject}</div>
          <div class="mail-msg-snippet">${msg.body.slice(0, 100)}...</div>
        </div>
        <div class="mail-msg-right">
          ${otp ? `
            <div class="mail-otp-badge" onclick="copyToClipboard('${otp}', 'OTP ${otp}')" title="Click to copy OTP">
              <span>OTP: ${otp}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          ` : ''}
          <button class="btn btn-secondary btn-sm read-msg-btn" data-id="${msg.id}">Read</button>
        </div>
      `;

      card.querySelector('.read-msg-btn').addEventListener('click', () => openEmailModal(msg));
      messagesList.appendChild(card);
    });
  }

  // Email Viewer Modal
  const modalEmail = document.getElementById('modal-view-email');
  const btnCloseEmail = document.getElementById('btn-close-email');
  const elEmailFrom = document.getElementById('email-detail-from');
  const elEmailSubject = document.getElementById('email-detail-subject');
  const elEmailDate = document.getElementById('email-detail-date');
  const elEmailBody = document.getElementById('email-detail-body');
  const elEmailOtpBanner = document.getElementById('email-otp-banner');
  const elEmailOtpCode = document.getElementById('email-detected-code');
  const btnCopyEmailCode = document.getElementById('btn-copy-email-code');

  async function openEmailModal(msg) {
    if (!modalEmail) return;
    if (elEmailFrom) elEmailFrom.textContent = msg.from;
    if (elEmailSubject) elEmailSubject.textContent = msg.subject;
    if (elEmailDate) elEmailDate.textContent = new Date(msg.date).toLocaleString();
    if (elEmailBody) elEmailBody.textContent = 'Loading full message content...';

    modalEmail.classList.add('active');

    let fullBody = msg.body;
    try {
      if (activeMailProvider === 'guerrilla') {
        const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${msg.id}&sid_token=${activeSessionToken}`);
        if (res.ok) {
          const data = await res.json();
          fullBody = data.mail_body || fullBody;
        }
      } else {
        const res = await fetch(`https://api.mail.tm/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${activeSessionToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          fullBody = data.text || data.html?.[0] || fullBody;
        }
      }
    } catch(e) {}

    if (elEmailBody) elEmailBody.innerHTML = fullBody;
    const otp = extractVerificationCode(fullBody + ' ' + msg.subject);

    if (otp && elEmailOtpBanner && elEmailOtpCode) {
      elEmailOtpBanner.style.display = 'flex';
      elEmailOtpCode.textContent = otp;
      if (btnCopyEmailCode) {
        btnCopyEmailCode.onclick = () => window.copyToClipboard(otp, 'OTP ' + otp);
      }
    } else if (elEmailOtpBanner) {
      elEmailOtpBanner.style.display = 'none';
    }
  }

  if (btnCloseEmail && modalEmail) {
    btnCloseEmail.addEventListener('click', () => modalEmail.classList.remove('active'));
  }

  // Mail Countdown Timer
  function runMailCountdown() {
    const diff = Math.max(0, Math.floor((mailboxExpiry - Date.now()) / 1000));
    const mins = Math.floor(diff / 60).toString().padStart(2, '0');
    const secs = (diff % 60).toString().padStart(2, '0');
    if (txtTimer) txtTimer.textContent = `${mins}:${secs}`;
  }
  setInterval(runMailCountdown, 1000);

  if (btnExtendMail) {
    btnExtendMail.addEventListener('click', () => {
      mailboxExpiry += 15 * 60 * 1000;
      runMailCountdown();
      window.showToast('Added +15 minutes to mailbox lifespan');
    });
  }

  if (selectDomain) {
    selectDomain.addEventListener('change', () => {
      createMailbox(selectDomain.value);
    });
  }

  if (btnNewAddress) {
    btnNewAddress.addEventListener('click', () => {
      const d = selectDomain ? selectDomain.value : 'sharklasers.com';
      createMailbox(d);
    });
  }

  if (btnRefreshInbox) {
    btnRefreshInbox.addEventListener('click', () => {
      window.showToast('Checking inbox for incoming mail...');
      pollInbox();
    });
  }

  if (btnCopyMail) {
    btnCopyMail.addEventListener('click', () => {
      if (activeEmailAddress) window.copyToClipboard(activeEmailAddress, 'Email Address');
    });
  }

  // Start initial mailbox
  createMailbox('sharklasers.com');
  pollTimer = setInterval(pollInbox, 6000);

  // ===========================================================================
  // 6. CRYPTOGRAPHIC PASSWORD STUDIO (CSPRNG, Diceware, Strength, History)
  // ===========================================================================
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

  const PWD_HISTORY_KEY = 'privacraft_web_password_history';
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

  const pwdOutput = document.getElementById('password-output');
  const btnToggleMask = document.getElementById('btn-toggle-mask');
  const btnRegenPwd = document.getElementById('btn-regen-pwd');
  const btnCopyPwd = document.getElementById('btn-copy-pwd');
  const sliderLength = document.getElementById('pwd-length-slider');
  const txtLengthVal = document.getElementById('pwd-length-val');
  const optUpper = document.getElementById('pwd-upper');
  const optLower = document.getElementById('pwd-lower');
  const optNums = document.getElementById('pwd-nums');
  const optSymbols = document.getElementById('pwd-symbols');
  const optNoAmbiguous = document.getElementById('pwd-no-ambiguous');
  const optDiceware = document.getElementById('pwd-diceware');
  const strengthLabel = document.getElementById('strength-label');
  const entropyBadge = document.getElementById('entropy-badge');
  const crackTimeVal = document.getElementById('crack-time-val');
  const strengthSegments = document.querySelectorAll('#strength-bar .segment');
  const historyContainer = document.getElementById('password-history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  let isMasked = false;
  let currentRawPassword = '';

  function generatePassword() {
    playTone(640, 0.04);
    if (optDiceware && optDiceware.checked) {
      const count = Math.max(3, Math.min(8, Math.round(sliderLength.value / 6)));
      let words = [];
      for (let i = 0; i < count; i++) {
        words.push(WORD_LIST[secureRandomInt(WORD_LIST.length)]);
      }
      const pass = words.join('-');
      currentRawPassword = pass;
      updatePasswordDisplay();
      evaluateStrength(pass, WORD_LIST.length);
      return pass;
    }

    let charset = '';
    if (optLower && optLower.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (optUpper && optUpper.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (optNums && optNums.checked) charset += '0123456789';
    if (optSymbols && optSymbols.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (optNoAmbiguous && optNoAmbiguous.checked) {
      charset = charset.replace(/[1lI|0O8B"';:`]/g, '');
    }
    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    const len = parseInt(sliderLength.value, 10);
    let pass = '';
    for (let i = 0; i < len; i++) {
      pass += charset[secureRandomInt(charset.length)];
    }

    currentRawPassword = pass;
    updatePasswordDisplay();
    evaluateStrength(pass, charset.length);
    return pass;
  }

  function updatePasswordDisplay() {
    if (!pwdOutput) return;
    if (isMasked) {
      pwdOutput.textContent = '•'.repeat(currentRawPassword.length);
    } else {
      pwdOutput.textContent = currentRawPassword;
    }
  }

  function evaluateStrength(pass, poolSize) {
    const len = pass.length;
    const bits = Math.round(len * Math.log2(poolSize || 64));
    if (entropyBadge) entropyBadge.textContent = `${bits} bits`;

    let tier = 'Weak';
    let activeSegs = 1;
    let colorClass = 'seg-red';
    let crackTime = '< 1 Second';

    if (bits < 40) {
      tier = 'Weak';
      activeSegs = 1;
      colorClass = 'seg-red';
      crackTime = '< 1 Second';
    } else if (bits < 55) {
      tier = 'Medium';
      activeSegs = 2;
      colorClass = 'seg-yellow';
      crackTime = '4.5 Hours';
    } else if (bits < 68) {
      tier = 'Strong';
      activeSegs = 3;
      colorClass = 'seg-green';
      crackTime = '12 Years';
    } else if (bits < 85) {
      tier = 'Very Strong';
      activeSegs = 4;
      colorClass = 'seg-cyan';
      crackTime = '34,000 Years';
    } else {
      tier = 'Military-Grade';
      activeSegs = 5;
      colorClass = 'seg-cyan-glow';
      crackTime = '8.2 Million Years';
    }

    if (strengthLabel) strengthLabel.textContent = tier;
    if (crackTimeVal) crackTimeVal.textContent = crackTime;

    strengthSegments.forEach((seg, idx) => {
      seg.className = 'segment';
      if (idx < activeSegs) {
        seg.classList.add('active', colorClass);
      }
    });
  }

  function renderPasswordHistory() {
    if (!historyContainer) return;
    const history = getPasswordHistory();
    if (history.length === 0) {
      historyContainer.innerHTML = '<span class="history-empty">No copied passwords in this session.</span>';
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

  if (sliderLength) {
    sliderLength.addEventListener('input', (e) => {
      if (txtLengthVal) txtLengthVal.textContent = e.target.value;
      generatePassword();
    });
  }

  [optUpper, optLower, optNums, optSymbols, optNoAmbiguous, optDiceware].forEach(opt => {
    if (opt) opt.addEventListener('change', generatePassword);
  });

  if (btnRegenPwd) btnRegenPwd.addEventListener('click', generatePassword);

  if (btnToggleMask) {
    btnToggleMask.addEventListener('click', () => {
      isMasked = !isMasked;
      updatePasswordDisplay();
      btnToggleMask.innerHTML = isMasked
        ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  if (btnCopyPwd) {
    btnCopyPwd.addEventListener('click', () => {
      if (currentRawPassword) {
        window.copyToClipboard(currentRawPassword, 'Password');
        addPasswordToHistory(currentRawPassword);
      }
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      localStorage.removeItem(PWD_HISTORY_KEY);
      renderPasswordHistory();
      window.showToast('History cleared');
    });
  }

  generatePassword();
  renderPasswordHistory();

  // ===========================================================================
  // 7. FAQ Accordion
  // ===========================================================================
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