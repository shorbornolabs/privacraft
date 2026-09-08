/**
 * PrivaCraft - Popup Controller (Temp Mail, Password Studio & 2FA Authenticator Vault)
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Mobile device adaptation (only applied if running on mobile browser with screen < 390px)
  if (window.innerWidth < 390 && /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.body.classList.add("mobile-viewport");
  }

  // DOM Elements - Navigation & Modes
  const modeTabs = document.querySelectorAll(".mode-tab");
  const subTabs = document.querySelectorAll(".sub-tab");
  const generalDisplayGroup = document.getElementById("general-display-group");
  const panelPassword = document.getElementById("panel-password");
  const panelPassphrase = document.getElementById("panel-passphrase");
  const panelPin = document.getElementById("panel-pin");
  const panelAuditor = document.getElementById("panel-auditor");
  const panelTotp = document.getElementById("panel-totp");
  const panelTempMail = document.getElementById("panel-tempmail");
  const sectionCopiedPasswords = document.getElementById("section-copied-passwords");
  const copiedCountBadge = document.getElementById("copied-count-badge");
  const btnClearCopied = document.getElementById("btn-clear-copied");
  const copiedPasswordsList = document.getElementById("copied-passwords-list");

  // Output Box Elements
  const passwordOutput = document.getElementById("password-output");
  const btnToggleMask = document.getElementById("btn-toggle-mask");
  const btnCopy = document.getElementById("btn-copy");
  const btnRegenerate = document.getElementById("btn-regenerate");
  const btnQr = document.getElementById("btn-qr");
  const btnFill = document.getElementById("btn-fill");
  const btnBulk = document.getElementById("btn-bulk");
  const btnHistory = document.getElementById("btn-history");
  const btnPhonetic = document.getElementById("btn-phonetic");

  // Header Tools
  const btnTheme = document.getElementById("btn-theme");
  const btnSound = document.getElementById("btn-sound");
  const soundIconOn = btnSound.querySelector(".sound-on");
  const soundIconOff = btnSound.querySelector(".sound-off");

  // Strength Elements
  const strengthBar = document.getElementById("strength-bar");
  const strengthLabel = document.getElementById("strength-label");
  const entropyBadge = document.getElementById("entropy-badge");
  const crackTimeEl = document.getElementById("crack-time-val");

  // Password Mode Controls
  const pwdLengthSlider = document.getElementById("pwd-length-slider");
  const pwdLengthVal = document.getElementById("pwd-length-val");
  const pwdPresetBtns = document.querySelectorAll(".pwd-preset");
  const optUpper = document.getElementById("opt-upper");
  const optLower = document.getElementById("opt-lower");
  const optNumbers = document.getElementById("opt-numbers");
  const optSymbols = document.getElementById("opt-symbols");
  const optAmbiguous = document.getElementById("opt-ambiguous");

  // Passphrase Mode Controls
  const passLengthSlider = document.getElementById("pass-length-slider");
  const passLengthVal = document.getElementById("pass-length-val");
  const passSeparator = document.getElementById("pass-separator");
  const passCapitalize = document.getElementById("pass-capitalize");
  const passIncludeNum = document.getElementById("pass-include-num");

  // PIN Mode Controls
  const pinLengthSlider = document.getElementById("pin-length-slider");
  const pinLengthVal = document.getElementById("pin-length-val");
  const pinPresetBtns = document.querySelectorAll(".pin-preset");

  // Auditor Controls
  const auditorInput = document.getElementById("auditor-input");
  const btnToggleAuditorMask = document.getElementById("btn-toggle-auditor-mask");
  const btnFortify = document.getElementById("btn-fortify");
  const chkLen = document.getElementById("chk-len");
  const chkUpper = document.getElementById("chk-upper");
  const chkLower = document.getElementById("chk-lower");
  const chkNum = document.getElementById("chk-num");
  const chkSym = document.getElementById("chk-sym");
  const chkClean = document.getElementById("chk-clean");

  // 2FA TOTP Controls
  const totpAccountsList = document.getElementById("totp-accounts-list");
  const totpKeyInput = document.getElementById("totp-key-input");
  const btnPasteTotp = document.getElementById("btn-paste-totp");
  const btnClearTotp = document.getElementById("btn-clear-totp");
  const btnSaveTotpAccount = document.getElementById("btn-save-totp-account");
  const totpIssuerBadge = document.getElementById("totp-issuer-badge");
  const totpAccountLabel = document.getElementById("totp-account-label");
  const btnDeleteTotpAccount = document.getElementById("btn-delete-totp-account");
  const totpProgressRing = document.getElementById("totp-progress-ring");
  const totpCountdownSec = document.getElementById("totp-countdown-sec");
  const totpPart1 = document.getElementById("totp-part1");
  const totpPart2 = document.getElementById("totp-part2");
  const btnCopyTotp = document.getElementById("btn-copy-totp");
  const btnFillTotp = document.getElementById("btn-fill-totp");

  // Temp Mail Controls
  const tempmailDomainSelect = document.getElementById("tempmail-domain-select");
  const tempmailTimerVal = document.getElementById("tempmail-timer-val");
  const btnExtendMail = document.getElementById("btn-extend-mail");
  const tempmailAddressVal = document.getElementById("tempmail-address-val");
  const btnRefreshInbox = document.getElementById("btn-refresh-inbox");
  const btnNewTempMail = document.getElementById("btn-new-tempmail");
  const btnCopyTempMail = document.getElementById("btn-copy-tempmail");
  const btnFillTempMail = document.getElementById("btn-fill-tempmail");
  const tempmailMsgCount = document.getElementById("tempmail-msg-count");
  const tempmailMessagesList = document.getElementById("tempmail-messages-list");

  // Email Viewer Modal
  const modalViewEmail = document.getElementById("modal-view-email");
  const btnCloseEmail = document.getElementById("btn-close-email");
  const emailDetailFrom = document.getElementById("email-detail-from");
  const emailDetailSubject = document.getElementById("email-detail-subject");
  const emailDetailDate = document.getElementById("email-detail-date");
  const emailOtpBanner = document.getElementById("email-otp-banner");
  const emailDetectedCode = document.getElementById("email-detected-code");
  const btnCopyEmailCode = document.getElementById("btn-copy-email-code");
  const emailLinkBanner = document.getElementById("email-link-banner");
  const emailDetectedLink = document.getElementById("email-detected-link");
  const emailDetailBody = document.getElementById("email-detail-body");

  // Modals
  const modalSaveTotp = document.getElementById("modal-save-totp");
  const saveTotpLabel = document.getElementById("save-totp-label");
  const saveTotpIssuer = document.getElementById("save-totp-issuer");
  const btnConfirmSaveTotp = document.getElementById("btn-confirm-save-totp");
  const btnCloseSaveTotp = document.getElementById("btn-close-save-totp");

  const modalQr = document.getElementById("modal-qr");
  const qrContainer = document.getElementById("qr-container");
  const btnCloseQr = document.getElementById("btn-close-qr");
  const qrTabRaw = document.getElementById("qr-tab-raw");
  const qrTabWifi = document.getElementById("qr-tab-wifi");
  const wifiConfigBox = document.getElementById("wifi-config-box");
  const wifiSsid = document.getElementById("wifi-ssid");
  const wifiEnc = document.getElementById("wifi-enc");
  const qrHintText = document.getElementById("qr-hint-text");

  const modalPhonetic = document.getElementById("modal-phonetic");
  const phoneticList = document.getElementById("phonetic-list");
  const btnCopyPhonetic = document.getElementById("btn-copy-phonetic");
  const btnClosePhonetic = document.getElementById("btn-close-phonetic");

  const modalBulk = document.getElementById("modal-bulk");
  const bulkList = document.getElementById("bulk-list");
  const btnCopyBulk = document.getElementById("btn-copy-bulk");
  const btnCloseBulk = document.getElementById("btn-close-bulk");

  const modalHistory = document.getElementById("modal-history");
  const historyList = document.getElementById("history-list");
  const btnClearHistory = document.getElementById("btn-clear-history");
  const btnCloseHistory = document.getElementById("btn-close-history");
  const modalBackdrop = document.getElementById("modal-backdrop");

  // Toast
  const toast = document.getElementById("toast");

  // State
  const THEMES = ["indigo", "emerald", "violet", "amber", "cyan", "rose"];
  let currentPassword = "";
  let isMasked = false;
  let activeMode = "tempmail"; // 'tempmail', 'password', 'totp'
  let activePwdSubmode = "password"; // 'password', 'passphrase', 'pin', 'auditor'
  let isWifiQr = false;
  let settings = await window.PrivaCraftStorage.loadSettings();

  // 2FA State
  let activeTotpAccount = null;
  let currentTotpSecret = "";
  let currentTotpCode = "";
  let totpInterval = null;

  // Temp Mail State
  let activeMailbox = null;
  let tempMailCountdownInterval = null;
  let tempMailPollInterval = null;
  let isTempMailPolling = false;
  let cachedMessages = [];

  // Apply Theme
  function applyTheme(themeName) {
    if (!THEMES.includes(themeName)) themeName = "indigo";
    document.documentElement.setAttribute("data-theme", themeName);
    settings.theme = themeName;
  }

  // Apply Audio Setting
  function applyAudioSetting(enabled) {
    settings.soundEnabled = enabled;
    window.PrivaCraftAudio.enabled = enabled;
    soundIconOn.style.display = enabled ? "block" : "none";
    soundIconOff.style.display = enabled ? "none" : "block";
  }

  // Initialize UI with saved settings
  function applySettings() {
    applyTheme(settings.theme || "indigo");
    applyAudioSetting(settings.soundEnabled ?? true);

    const savedMode = settings.mode || "tempmail";
    if (savedMode === "tempmail") {
      activeMode = "tempmail";
      activePwdSubmode = "password";
    } else if (["password", "passphrase", "pin", "auditor"].includes(savedMode)) {
      activeMode = "password";
      activePwdSubmode = savedMode === "auditor" ? "password" : savedMode;
    } else if (savedMode === "totp") {
      activeMode = "totp";
      activePwdSubmode = "password";
    } else {
      activeMode = "tempmail";
      activePwdSubmode = "password";
    }

    modeTabs.forEach(t => t.classList.toggle("active", t.dataset.mode === activeMode));
    subTabs.forEach(t => t.classList.toggle("active", t.dataset.submode === activePwdSubmode));
    switchModePanel(activeMode);

    // Password values
    pwdLengthSlider.value = settings.password.length;
    pwdLengthVal.textContent = settings.password.length;
    optUpper.checked = settings.password.uppercase;
    optLower.checked = settings.password.lowercase;
    optNumbers.checked = settings.password.numbers;
    optSymbols.checked = settings.password.symbols;
    optAmbiguous.checked = settings.password.excludeAmbiguous;
    updatePresetActive(pwdPresetBtns, settings.password.length);

    // Passphrase values
    passLengthSlider.value = settings.passphrase.wordsCount;
    passLengthVal.textContent = settings.passphrase.wordsCount;
    passSeparator.value = settings.passphrase.separator;
    passCapitalize.value = settings.passphrase.capitalize;
    passIncludeNum.checked = settings.passphrase.includeNumber;

    // PIN values
    pinLengthSlider.value = settings.pin.length;
    pinLengthVal.textContent = settings.pin.length;
    updatePresetActive(pinPresetBtns, settings.pin.length);
  }

  function updatePresetActive(buttons, currentVal) {
    buttons.forEach(btn => {
      btn.classList.toggle("active", parseInt(btn.dataset.val, 10) === parseInt(currentVal, 10));
    });
  }

  function switchModePanel(mode) {
    activeMode = mode;
    const isTotp = mode === "totp";
    const isMail = mode === "tempmail";

    // Toggle main display group vs specialized standalone panels
    generalDisplayGroup.style.display = (isTotp || isMail) ? "none" : "block";
    if (sectionCopiedPasswords) {
      sectionCopiedPasswords.style.display = (isTotp || isMail) ? "none" : "block";
    }

    if (!isTotp && !isMail) {
      switchPwdSubmode(activePwdSubmode, false);
      stopTotpTimer();
      stopTempMailTimers();
      renderCopiedPasswordsList();
    } else if (isTotp) {
      panelPassword.classList.remove("active");
      panelPassphrase.classList.remove("active");
      panelPin.classList.remove("active");
      panelAuditor.classList.remove("active");
      panelTotp.classList.add("active");
      panelTempMail.classList.remove("active");

      stopTempMailTimers();
      renderTotpAccountsList();
      startTotpTimer();
      setTimeout(() => totpKeyInput.focus(), 50);
    } else if (isMail) {
      panelPassword.classList.remove("active");
      panelPassphrase.classList.remove("active");
      panelPin.classList.remove("active");
      panelAuditor.classList.remove("active");
      panelTotp.classList.remove("active");
      panelTempMail.classList.add("active");

      stopTotpTimer();
      initTempMailUI();
    }
  }

  function switchPwdSubmode(submode, generate = true) {
    activePwdSubmode = submode;
    subTabs.forEach(t => t.classList.toggle("active", t.dataset.submode === submode));

    panelPassword.classList.toggle("active", submode === "password");
    panelPassphrase.classList.toggle("active", submode === "passphrase");
    panelPin.classList.toggle("active", submode === "pin");
    panelAuditor.classList.toggle("active", submode === "auditor");
    panelTotp.classList.remove("active");
    panelTempMail.classList.remove("active");

    if (submode === "auditor") {
      auditorInput.value = currentPassword;
      runAuditor(currentPassword);
      setTimeout(() => auditorInput.focus(), 50);
    } else if (generate) {
      generateAndDisplay();
    }
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(message, icon = "✓") {
    clearTimeout(toastTimer);
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    toast.classList.add("visible");
    toastTimer = setTimeout(() => {
      toast.classList.remove("visible");
    }, 2200);
  }

  // Format password HTML with syntax coloring
  function formatPasswordDisplay(pwd) {
    if (isMasked) {
      return `<span class="masked-dots">${"•".repeat(Math.min(pwd.length, 24))}</span>`;
    }

    let html = "";
    for (const char of pwd) {
      if (/[0-9]/.test(char)) {
        html += `<span class="char-num">${char}</span>`;
      } else if (/[^a-zA-Z0-9\s]/.test(char)) {
        html += `<span class="char-sym">${escapeHtml(char)}</span>`;
      } else if (/[A-Z]/.test(char)) {
        html += `<span class="char-upper">${char}</span>`;
      } else {
        html += `<span class="char-lower">${char}</span>`;
      }
    }
    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Update Strength Display
  function updateStrength(pwd) {
    const analysis = window.PrivaCraftStrength.analyzeStrength(pwd, activePwdSubmode, {
      wordsCount: parseInt(passLengthSlider.value, 10)
    });

    strengthLabel.textContent = analysis.label;
    strengthLabel.style.color = analysis.color;

    entropyBadge.textContent = `${analysis.entropy} bits`;
    crackTimeEl.textContent = analysis.crackTime;

    const segments = strengthBar.querySelectorAll(".segment");
    const activeSegments = Math.max(1, Math.min(5, Math.ceil(analysis.score / 20)));

    segments.forEach((seg, idx) => {
      if (idx < activeSegments) {
        seg.className = `segment filled ${analysis.tier}`;
        seg.style.backgroundColor = analysis.color;
        seg.style.boxShadow = `0 0 8px ${analysis.color}66`;
      } else {
        seg.className = "segment";
        seg.style.backgroundColor = "";
        seg.style.boxShadow = "";
      }
    });

    return analysis;
  }

  // Run Auditor on an arbitrary string
  function runAuditor(pwd) {
    currentPassword = pwd;
    passwordOutput.innerHTML = formatPasswordDisplay(pwd);
    const analysis = updateStrength(pwd);

    function setCheck(el, passed) {
      el.classList.toggle("passed", Boolean(passed));
      el.querySelector(".check-icon").textContent = passed ? "✓" : "✕";
    }

    setCheck(chkLen, analysis.criteria.length);
    setCheck(chkUpper, analysis.criteria.hasUpper);
    setCheck(chkLower, analysis.criteria.hasLower);
    setCheck(chkNum, analysis.criteria.hasNumber);
    setCheck(chkSym, analysis.criteria.hasSymbol);
    setCheck(chkClean, analysis.criteria.noRepeats && analysis.criteria.noSequence && analysis.criteria.notCommon);
  }

  // Main Generation Handler
  async function generateAndDisplay(saveToHistory = true) {
    if (activeMode === "totp" || activeMode === "tempmail") return;

    window.PrivaCraftAudio.playClick();
    let pwd = "";
    if (activePwdSubmode === "passphrase") {
      pwd = window.PrivaCraftGenerator.generatePassphrase({
        wordsCount: parseInt(passLengthSlider.value, 10),
        separator: passSeparator.value,
        capitalize: passCapitalize.value,
        includeNumber: passIncludeNum.checked
      });
    } else if (activePwdSubmode === "pin") {
      pwd = window.PrivaCraftGenerator.generatePIN({
        length: parseInt(pinLengthSlider.value, 10)
      });
    } else if (activePwdSubmode === "auditor") {
      pwd = auditorInput.value || window.PrivaCraftGenerator.generatePassword();
      runAuditor(pwd);
      return;
    } else {
      pwd = window.PrivaCraftGenerator.generatePassword({
        length: parseInt(pwdLengthSlider.value, 10),
        uppercase: optUpper.checked,
        lowercase: optLower.checked,
        numbers: optNumbers.checked,
        symbols: optSymbols.checked,
        excludeAmbiguous: optAmbiguous.checked
      });
    }

    currentPassword = pwd;
    passwordOutput.innerHTML = formatPasswordDisplay(pwd);
    const analysis = updateStrength(pwd);

    // Save as active lastPassword
    await window.PrivaCraftStorage.saveLastPassword(pwd, activePwdSubmode);

    if (saveToHistory) {
      await window.PrivaCraftStorage.saveHistoryItem({
        password: pwd,
        mode: activePwdSubmode,
        score: analysis.score,
        entropy: analysis.entropy
      });
    }
  }

  // Restore previously active password or generate initial
  async function restoreLastOrGenerate() {
    try {
      const saved = await window.PrivaCraftStorage.loadLastPassword();
      if (saved && saved.password) {
        currentPassword = saved.password;
        if (saved.mode && ["password", "passphrase", "pin", "auditor"].includes(saved.mode)) {
          activePwdSubmode = saved.mode;
          subTabs.forEach(t => t.classList.toggle("active", t.dataset.submode === activePwdSubmode));
          panelPassword.classList.toggle("active", activePwdSubmode === "password");
          panelPassphrase.classList.toggle("active", activePwdSubmode === "passphrase");
          panelPin.classList.toggle("active", activePwdSubmode === "pin");
          panelAuditor.classList.toggle("active", activePwdSubmode === "auditor");
          if (activePwdSubmode === "auditor") {
            auditorInput.value = saved.password;
            runAuditor(saved.password);
          }
        }
        passwordOutput.innerHTML = formatPasswordDisplay(saved.password);
        updateStrength(saved.password);
        return;
      }
    } catch (e) {
      console.warn("Could not restore last password:", e);
    }

    if (activeMode === "password") {
      await generateAndDisplay(false);
    }
  }

  // =========================================================================
  // 2FA (TOTP) Authenticator Implementation
  // =========================================================================

  async function updateTotpDisplay() {
    if (!currentTotpSecret || currentTotpSecret.trim().length === 0) {
      totpPart1.textContent = "---";
      totpPart2.textContent = "---";
      totpCountdownSec.textContent = "30s";
      totpProgressRing.style.strokeDashoffset = "0";
      totpProgressRing.className = "ring-progress timer-safe";
      return;
    }

    const res = await window.PrivaCraftTOTP.generateTOTP(currentTotpSecret);
    if (res.error) {
      totpPart1.textContent = "ERR";
      totpPart2.textContent = "KEY";
      totpCountdownSec.textContent = "!";
      totpProgressRing.className = "ring-progress timer-danger";
      return;
    }

    const previousCode = currentTotpCode;
    currentTotpCode = res.token;

    // Split into two 3-digit groups
    totpPart1.textContent = res.token.slice(0, 3);
    totpPart2.textContent = res.token.slice(3, 6);
    totpCountdownSec.textContent = `${res.remainingSeconds}s`;

    // Circular ring circumference is 2 * PI * 25 = 157.08
    const circumference = 157.08;
    const offset = circumference * (1 - (res.remainingSeconds / res.period));
    totpProgressRing.style.strokeDashoffset = offset.toFixed(2);

    // Dynamic timer ring color states
    if (res.remainingSeconds <= 5) {
      totpProgressRing.className = "ring-progress timer-danger";
    } else if (res.remainingSeconds <= 10) {
      totpProgressRing.className = "ring-progress timer-warning";
    } else {
      totpProgressRing.className = "ring-progress timer-safe";
    }

    // Play click sound if code rolled over to a new code
    if (previousCode && previousCode !== res.token) {
      window.PrivaCraftAudio.playClick();
    }
  }

  function startTotpTimer() {
    stopTotpTimer();
    updateTotpDisplay();
    totpInterval = setInterval(updateTotpDisplay, 1000);
  }

  function stopTotpTimer() {
    if (totpInterval) {
      clearInterval(totpInterval);
      totpInterval = null;
    }
  }

  async function renderTotpAccountsList() {
    const accounts = await window.PrivaCraftStorage.loadTotpAccounts();
    totpAccountsList.innerHTML = "";

    // "+ New / Live Key" pill (disposable mode)
    const newPill = document.createElement("button");
    newPill.className = `totp-pill ${!activeTotpAccount ? "active" : ""}`;
    newPill.innerHTML = `<span>⚡ Live Key</span>`;
    newPill.addEventListener("click", () => {
      selectTotpAccount(null);
    });
    totpAccountsList.appendChild(newPill);

    // Render saved accounts
    accounts.forEach(acc => {
      const pill = document.createElement("button");
      const isActive = activeTotpAccount && activeTotpAccount.id === acc.id;
      pill.className = `totp-pill ${isActive ? "active" : ""}`;
      pill.innerHTML = `<span>${escapeHtml(acc.issuer || acc.label)}</span>`;
      pill.addEventListener("click", () => {
        selectTotpAccount(acc);
      });
      totpAccountsList.appendChild(pill);
    });
  }

  function selectTotpAccount(acc) {
    activeTotpAccount = acc;
    if (!acc) {
      // Disposable / custom input mode
      totpIssuerBadge.textContent = "INSTANT";
      totpAccountLabel.textContent = "Live 2FA Generator";
      btnDeleteTotpAccount.style.display = "none";
      if (!currentTotpSecret) {
        totpKeyInput.value = "";
      }
    } else {
      // Saved account mode
      totpKeyInput.value = acc.secret;
      currentTotpSecret = acc.secret;
      totpIssuerBadge.textContent = (acc.issuer || "2FA").toUpperCase();
      totpAccountLabel.textContent = acc.label || "Account";
      btnDeleteTotpAccount.style.display = "inline-flex";
    }

    renderTotpAccountsList();
    updateTotpDisplay();
  }

  // Handle secret input typing or pasting
  totpKeyInput.addEventListener("input", (e) => {
    const raw = e.target.value.trim();
    if (!raw) {
      currentTotpSecret = "";
      updateTotpDisplay();
      return;
    }

    const parsed = window.PrivaCraftTOTP.parseOtpUriOrSecret(raw);
    currentTotpSecret = parsed.secret;
    totpIssuerBadge.textContent = parsed.issuer.toUpperCase();
    totpAccountLabel.textContent = parsed.label;
    activeTotpAccount = null;
    renderTotpAccountsList();
    updateTotpDisplay();
  });

  // Paste 2FA Key
  btnPasteTotp.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        totpKeyInput.value = text.trim();
        const parsed = window.PrivaCraftTOTP.parseOtpUriOrSecret(text.trim());
        currentTotpSecret = parsed.secret;
        totpIssuerBadge.textContent = parsed.issuer.toUpperCase();
        totpAccountLabel.textContent = parsed.label;
        activeTotpAccount = null;
        renderTotpAccountsList();
        updateTotpDisplay();
        window.PrivaCraftAudio.playClick();
        showToast("Secret key pasted!", "📋");
      }
    } catch {
      showToast("Unable to read clipboard", "✕");
    }
  });

  // Clear 2FA Key
  btnClearTotp.addEventListener("click", () => {
    totpKeyInput.value = "";
    currentTotpSecret = "";
    activeTotpAccount = null;
    totpIssuerBadge.textContent = "INSTANT";
    totpAccountLabel.textContent = "Live 2FA Generator";
    btnDeleteTotpAccount.style.display = "none";
    renderTotpAccountsList();
    updateTotpDisplay();
  });

  // Save 2FA Account Modal
  btnSaveTotpAccount.addEventListener("click", () => {
    if (!currentTotpSecret) {
      showToast("Enter a secret key first", "ℹ");
      return;
    }
    saveTotpLabel.value = totpAccountLabel.textContent !== "Live 2FA Generator" ? totpAccountLabel.textContent : "";
    saveTotpIssuer.value = totpIssuerBadge.textContent !== "INSTANT" ? totpIssuerBadge.textContent : "";
    openModal(modalSaveTotp);
  });

  btnCloseSaveTotp.addEventListener("click", closeAllModals);

  btnConfirmSaveTotp.addEventListener("click", async () => {
    const label = (saveTotpLabel.value || "2FA Account").trim();
    const issuer = (saveTotpIssuer.value || "2FA").trim();
    if (!currentTotpSecret) return;

    const saved = await window.PrivaCraftStorage.saveTotpAccount({
      label,
      issuer,
      secret: currentTotpSecret
    });

    closeAllModals();
    selectTotpAccount(saved);
    window.PrivaCraftAudio.playSuccess();
    showToast(`Saved "${issuer}" to vault!`, "✓");
  });

  // Delete saved 2FA account
  btnDeleteTotpAccount.addEventListener("click", async () => {
    if (!activeTotpAccount) return;
    await window.PrivaCraftStorage.deleteTotpAccount(activeTotpAccount.id);
    showToast(`Removed "${activeTotpAccount.issuer || activeTotpAccount.label}"`, "✓");
    selectTotpAccount(null);
  });

  // Copy 2FA Code
  btnCopyTotp.addEventListener("click", () => {
    if (!currentTotpCode || currentTotpCode === "------") {
      showToast("Enter a valid key first", "ℹ");
      return;
    }
    copyPassword(currentTotpCode, "2FA Code copied!");
  });

  // Autofill 2FA code into active webpage
  btnFillTotp.addEventListener("click", async () => {
    if (!currentTotpCode || currentTotpCode === "------") {
      showToast("No active 2FA code", "ℹ");
      return;
    }

    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
      showToast("Autofill available in Chrome tab", "ℹ");
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (code) => {
          // 1. One-time-code / OTP inputs
          const selectors = [
            'input[autocomplete="one-time-code"]',
            'input[name*="otp" i]',
            'input[id*="otp" i]',
            'input[name*="2fa" i]',
            'input[id*="2fa" i]',
            'input[name*="code" i]',
            'input[id*="code" i]',
            'input[name*="totp" i]',
            'input[id*="totp" i]'
          ];

          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.type !== "hidden") {
              el.focus();
              el.value = code;
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
              return { success: true };
            }
          }

          // 2. Individual digit boxes (e.g. 6 single character inputs)
          const singleBoxes = Array.from(document.querySelectorAll('input[maxlength="1"]'));
          if (singleBoxes.length >= code.length) {
            for (let i = 0; i < code.length; i++) {
              singleBoxes[i].focus();
              singleBoxes[i].value = code[i];
              singleBoxes[i].dispatchEvent(new Event("input", { bubbles: true }));
              singleBoxes[i].dispatchEvent(new Event("change", { bubbles: true }));
            }
            return { success: true };
          }

          // 3. Fallback active element
          if (document.activeElement && document.activeElement.tagName === "INPUT") {
            document.activeElement.value = code;
            document.activeElement.dispatchEvent(new Event("input", { bubbles: true }));
            document.activeElement.dispatchEvent(new Event("change", { bubbles: true }));
            return { success: true };
          }

          return { success: false };
        },
        args: [currentTotpCode]
      });

      const res = results?.[0]?.result;
      if (res && res.success) {
        window.PrivaCraftAudio.playSuccess();
        showToast("2FA filled into page!", "⚡");
      } else {
        showToast("No 2FA input found on page", "✕");
      }
    } catch (err) {
      console.error("2FA Autofill error:", err);
      showToast("Could not fill 2FA code", "✕");
    }
  });

  // =========================================================================
  // Temp Mail (Disposable Email & Live Inbox) Implementation
  // =========================================================================

  function formatTimeRemaining(ms) {
    if (ms <= 0) return "00:00";
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function updateTempMailTimer() {
    if (!activeMailbox || !activeMailbox.expiresAt) {
      tempmailTimerVal.textContent = "--:--";
      tempmailTimerVal.parentElement.className = "mail-timer-badge";
      return;
    }

    const remainingMs = activeMailbox.expiresAt - Date.now();
    if (remainingMs <= 0) {
      tempmailTimerVal.textContent = "Expired";
      tempmailTimerVal.parentElement.className = "mail-timer-badge timer-danger";
      stopTempMailTimers();
      showToast("Mailbox expired. Generating new address...", "ℹ");
      recreateMailbox();
      return;
    }

    tempmailTimerVal.textContent = formatTimeRemaining(remainingMs);
    const badge = tempmailTimerVal.parentElement;

    if (remainingMs < 3 * 60 * 1000) {
      badge.className = "mail-timer-badge timer-danger";
    } else if (remainingMs < 10 * 60 * 1000) {
      badge.className = "mail-timer-badge timer-warning";
    } else {
      badge.className = "mail-timer-badge";
    }
  }

  function startTempMailTimers() {
    stopTempMailTimers();
    updateTempMailTimer();
    tempMailCountdownInterval = setInterval(updateTempMailTimer, 1000);
    tempMailPollInterval = setInterval(() => {
      if (activeMode === "tempmail") {
        pollTempMailInbox(false); // Live polling with audio chime on new mail
      }
    }, 7000); // 7s smooth polling while popup is open
  }

  function stopTempMailTimers() {
    if (tempMailCountdownInterval) {
      clearInterval(tempMailCountdownInterval);
      tempMailCountdownInterval = null;
    }
    if (tempMailPollInterval) {
      clearInterval(tempMailPollInterval);
      tempMailPollInterval = null;
    }
  }

  async function initTempMailUI() {
    activeMailbox = await window.PrivaCraftTempMail.getActiveMailbox();

    // Check if expired
    if (!activeMailbox || (activeMailbox.expiresAt && Date.now() >= activeMailbox.expiresAt)) {
      await recreateMailbox(tempmailDomainSelect.value || "sharklasers.com");
      return;
    }

    // 1. Immediately render mailbox state (address, domain)
    renderMailboxState();

    // 2. Immediately load and render stored messages from local storage (0ms wait!)
    cachedMessages = await window.PrivaCraftTempMail.getStoredMessages();
    renderMessagesList(cachedMessages);

    // 3. Clear toolbar badge and notifications since user has opened and inspected the inbox
    if (typeof chrome !== "undefined" && chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ text: "" });
    }
    if (typeof chrome !== "undefined" && chrome.notifications && chrome.notifications.clear) {
      chrome.notifications.clear("privacraft_mail_alert", () => {});
    }
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "CLEAR_BADGE" }).catch(() => {});
    }

    // 4. Start countdown timer and live inbox polling
    startTempMailTimers();

    // 5. Query provider for any new emails right away
    await pollTempMailInbox(false);
  }

  function renderMailboxState() {
    if (!activeMailbox) return;
    tempmailAddressVal.textContent = activeMailbox.email || "No email available";

    if (activeMailbox.domain) {
      const matchOpt = Array.from(tempmailDomainSelect.options).find(o => o.value === activeMailbox.domain);
      if (matchOpt) {
        tempmailDomainSelect.value = activeMailbox.domain;
      }
    }
    updateTempMailTimer();
  }

  let isMailboxRecreating = false;

  async function recreateMailbox(preferredDomain = null) {
    if (isMailboxRecreating) return;
    isMailboxRecreating = true;
    stopTempMailTimers();

    // 1. Immediately purge UI and cache for instant feedback (0ms wait)
    cachedMessages = [];
    renderMessagesList([]);
    tempmailMsgCount.textContent = "0";
    tempmailAddressVal.textContent = "Purging old inbox & creating new...";
    tempmailMessagesList.innerHTML = `<div class="mail-empty-state"><span class="mail-empty-sub">Connecting to secure email server...</span></div>`;

    const selectedDomain = preferredDomain || tempmailDomainSelect.value || "sharklasers.com";
    const provider = selectedDomain === "uberip.com" ? "mailtm" : "guerrilla";

    try {
      // 2. Destroy previous mailbox on server and wipe local storage, then create fresh mailbox
      activeMailbox = await window.PrivaCraftTempMail.createNewMailbox(provider, selectedDomain);
      cachedMessages = [];

      // 3. Notify background service worker of mailbox change
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: "MAILBOX_CHANGED" }).catch(() => {});
      }

      renderMailboxState();
      renderMessagesList([]);
      startTempMailTimers();
      window.PrivaCraftAudio.playClick();
      showToast("Old inbox purged! Brand-new email ready.", "🗑️");
      await pollTempMailInbox(true);
    } catch (err) {
      console.error("Failed to create mailbox:", err);
      tempmailAddressVal.textContent = "Connection error";
      showToast("Error creating mailbox. Check internet.", "✕");
    } finally {
      isMailboxRecreating = false;
    }
  }

  async function pollTempMailInbox(silent = false) {
    if (!activeMailbox || isTempMailPolling || isMailboxRecreating) return;
    if (activeMailbox.expiresAt && Date.now() >= activeMailbox.expiresAt) return;
    isTempMailPolling = true;
    const pollingBox = activeMailbox;

    try {
      const remoteMessages = await window.PrivaCraftTempMail.checkMessages(pollingBox);
      // Guard against race conditions if mailbox was deleted or switched during check
      if (!activeMailbox || activeMailbox.email !== pollingBox.email || isMailboxRecreating) {
        return;
      }

      const existingIds = new Set(cachedMessages.map(m => String(m.id)));
      const hasNewArrivals = remoteMessages.some(m => !existingIds.has(String(m.id)));
      const isInitialRender = (cachedMessages.length === 0 && remoteMessages.length > 0);

      if (hasNewArrivals || isInitialRender) {
        // Fetch details (with OTP code extraction) for messages
        const fullMessages = await Promise.all(
          remoteMessages.map(async (m) => {
            const existing = cachedMessages.find(c => String(c.id) === String(m.id));
            if (existing && existing.body) return existing;
            try {
              return await window.PrivaCraftTempMail.readMessage(pollingBox, m.id) || m;
            } catch {
              return m;
            }
          })
        );

        if (!activeMailbox || activeMailbox.email !== pollingBox.email || isMailboxRecreating) {
          return;
        }

        cachedMessages = fullMessages;
        await window.PrivaCraftTempMail.saveStoredMessages(fullMessages, pollingBox.email);
        renderMessagesList(fullMessages);

        // ONLY trigger audio chime, toast, and desktop notification for TRULY NEW arrivals
        if (hasNewArrivals) {
          const notifiedIds = await window.PrivaCraftTempMail.getNotifiedIds();
          const unnotified = fullMessages.filter(m => !notifiedIds.has(String(m.id)));

          if (unnotified.length > 0) {
            await window.PrivaCraftTempMail.markIdsAsNotified(unnotified.map(m => m.id));

            if (window.PrivaCraftAudio && window.PrivaCraftAudio.playAlertChime) {
              window.PrivaCraftAudio.playAlertChime();
            } else if (window.PrivaCraftAudio) {
              window.PrivaCraftAudio.playSuccess();
            }

            const latestOtp = unnotified[0]?.code;
            if (latestOtp) {
              showToast(`OTP Code Received: ${latestOtp}`, "⚡");
            } else {
              showToast(`New email received! (${fullMessages.length})`, "🔔");
            }

            if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
              chrome.runtime.sendMessage({
                type: "SHOW_NEW_MAIL_NOTIF",
                latest: unnotified[0],
                code: latestOtp
              }).catch(() => {});
            }
          }
        } else if (isInitialRender) {
          // Mark already loaded emails as notified so background checker will never re-alert
          await window.PrivaCraftTempMail.markIdsAsNotified(fullMessages.map(m => m.id));
        }
      } else if (remoteMessages.length !== cachedMessages.length) {
        renderMessagesList(cachedMessages);
      }
    } catch (err) {
      console.error("Failed to check emails:", err);
    } finally {
      isTempMailPolling = false;
    }
  }

  // Notify background worker when popup closes to guarantee immediate active background polling
  window.addEventListener("pagehide", () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "POPUP_CLOSED" }).catch(() => {});
    }
  });

  function renderMessagesList(messages) {
    tempmailMsgCount.textContent = messages.length;

    if (!messages || messages.length === 0) {
      tempmailMessagesList.innerHTML = `
        <div class="mail-empty-state">
          <svg class="mail-empty-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span class="mail-empty-title">Inbox is Empty</span>
          <span class="mail-empty-sub">Incoming activation emails and OTPs will appear here automatically.</span>
        </div>
      `;
      return;
    }

    tempmailMessagesList.innerHTML = "";
    messages.forEach(msg => {
      const item = document.createElement("div");
      item.className = "mail-message-item";

      const previewText = `${msg.subject || ""} ${msg.preview || ""}`;
      const codeMatch = msg.code || previewText.match(/\b([0-9]{4,8})\b/)?.[1];
      const otpChip = codeMatch ? `<span class="mail-item-otp-chip">OTP: ${codeMatch}</span>` : "";

      item.innerHTML = `
        <div class="mail-item-header">
          <span class="mail-item-sender" title="${escapeHtml(msg.from || "Unknown")}">${escapeHtml(msg.from || "Unknown")}</span>
          <span class="mail-item-time">${escapeHtml(msg.date || "")}</span>
        </div>
        <div class="mail-item-subject" title="${escapeHtml(msg.subject || "(No Subject)")}">${escapeHtml(msg.subject || "(No Subject)")}</div>
        <div class="mail-item-preview">${escapeHtml(msg.preview || "(No preview)")}</div>
        ${otpChip ? `<div class="mail-item-footer">${otpChip}</div>` : ""}
      `;

      item.addEventListener("click", () => openEmailViewer(msg.id));
      tempmailMessagesList.appendChild(item);
    });
  }

  async function openEmailViewer(messageId) {
    if (!activeMailbox) return;

    // Check if we already have the full details cached locally
    const cached = cachedMessages.find(m => String(m.id) === String(messageId));
    if (cached && cached.body) {
      displayEmailDetails(cached);
      openModal(modalViewEmail);
      return;
    }

    emailDetailFrom.textContent = "Loading...";
    emailDetailSubject.textContent = "Loading...";
    emailDetailDate.textContent = "...";
    emailDetailBody.textContent = "Fetching email contents from secure provider...";
    emailOtpBanner.style.display = "none";
    emailLinkBanner.style.display = "none";

    openModal(modalViewEmail);

    try {
      const details = await window.PrivaCraftTempMail.readMessage(activeMailbox, messageId);
      if (!details) {
        emailDetailBody.textContent = "Could not load email body.";
        return;
      }

      displayEmailDetails(details);

      // Cache details in memory and storage
      const idx = cachedMessages.findIndex(m => String(m.id) === String(messageId));
      if (idx >= 0) {
        cachedMessages[idx] = { ...cachedMessages[idx], ...details };
        await window.PrivaCraftTempMail.saveStoredMessages(cachedMessages);
      }
    } catch (err) {
      console.error("Failed to read email:", err);
      emailDetailBody.textContent = "Error reading email contents.";
    }
  }

  function displayEmailDetails(details) {
    emailDetailFrom.textContent = details.from || "Unknown";
    emailDetailSubject.textContent = details.subject || "(No Subject)";
    emailDetailDate.textContent = details.date || "";
    emailDetailBody.textContent = details.body || "(Empty message)";

    // Detected OTP Code banner
    if (details.code) {
      emailDetectedCode.textContent = details.code;
      emailOtpBanner.style.display = "flex";
      btnCopyEmailCode.onclick = () => {
        copyPassword(details.code, "Verification code copied!");
      };
    } else {
      emailOtpBanner.style.display = "none";
    }

    // Detected Activation Link banner
    if (details.link) {
      emailDetectedLink.href = details.link;
      emailLinkBanner.style.display = "block";
    } else {
      emailLinkBanner.style.display = "none";
    }
  }

  // Temp Mail Event Listeners
  btnExtendMail.addEventListener("click", async () => {
    if (!activeMailbox) return;
    await window.PrivaCraftTempMail.extendLifespan(activeMailbox, 15);
    updateTempMailTimer();
    window.PrivaCraftAudio.playSuccess();
    showToast("Mailbox lifespan extended +15m!", "⏳");
  });

  btnRefreshInbox.addEventListener("click", async () => {
    btnRefreshInbox.classList.add("spinning");
    await pollTempMailInbox(false);
    setTimeout(() => btnRefreshInbox.classList.remove("spinning"), 400);
    showToast("Inbox checked", "✓");
  });

  btnNewTempMail.addEventListener("click", async () => {
    btnNewTempMail.classList.add("spinning");
    await recreateMailbox();
    setTimeout(() => btnNewTempMail.classList.remove("spinning"), 400);
  });

  tempmailDomainSelect.addEventListener("change", async () => {
    await recreateMailbox(tempmailDomainSelect.value);
  });

  btnCopyTempMail.addEventListener("click", () => {
    if (!activeMailbox || !activeMailbox.email) {
      showToast("No email address to copy", "ℹ");
      return;
    }
    copyPassword(activeMailbox.email, "Temp Email copied to clipboard!");
  });

  // Autofill Temp Email into active tab
  btnFillTempMail.addEventListener("click", async () => {
    if (!activeMailbox || !activeMailbox.email) {
      showToast("No email to autofill", "ℹ");
      return;
    }

    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
      showToast("Autofill available in Chrome tab", "ℹ");
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (email) => {
          const selectors = [
            'input[type="email"]',
            'input[name*="email" i]',
            'input[id*="email" i]',
            'input[autocomplete="email"]',
            'input[placeholder*="email" i]',
            'input[name*="mail" i]'
          ];

          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.type !== "hidden") {
              el.focus();
              el.value = email;
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
              return { success: true };
            }
          }

          if (document.activeElement && document.activeElement.tagName === "INPUT") {
            document.activeElement.value = email;
            document.activeElement.dispatchEvent(new Event("input", { bubbles: true }));
            document.activeElement.dispatchEvent(new Event("change", { bubbles: true }));
            return { success: true };
          }

          return { success: false };
        },
        args: [activeMailbox.email]
      });

      const res = results?.[0]?.result;
      if (res && res.success) {
        window.PrivaCraftAudio.playSuccess();
        showToast("Email filled into page!", "⚡");
      } else {
        showToast("No email input found on page", "✕");
      }
    } catch (err) {
      console.error("Email autofill error:", err);
      showToast("Could not autofill email", "✕");
    }
  });

  btnCloseEmail.addEventListener("click", closeAllModals);

  // =========================================================================
  // Standard Actions & Modals
  // =========================================================================

  // Save current preferences to storage
  async function persistPreferences() {
    settings.mode = (activeMode === "password") ? activePwdSubmode : activeMode;
    settings.password = {
      length: parseInt(pwdLengthSlider.value, 10),
      uppercase: optUpper.checked,
      lowercase: optLower.checked,
      numbers: optNumbers.checked,
      symbols: optSymbols.checked,
      excludeAmbiguous: optAmbiguous.checked
    };
    settings.passphrase = {
      wordsCount: parseInt(passLengthSlider.value, 10),
      separator: passSeparator.value,
      capitalize: passCapitalize.value,
      includeNumber: passIncludeNum.checked
    };
    settings.pin = {
      length: parseInt(pinLengthSlider.value, 10)
    };
    await window.PrivaCraftStorage.saveSettings(settings);
  }

  // Copy to Clipboard
  async function copyPassword(textToCopy, notifyMsg = "Password copied to clipboard!", skipSaveCopied = false) {
    if (!textToCopy) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      window.PrivaCraftAudio.playSuccess();
      btnCopy.classList.add("copied");
      showToast(notifyMsg, "✓");

      setTimeout(() => {
        btnCopy.classList.remove("copied");
      }, 1800);

      // Save to Copied Passwords list (past 10 FIFO)
      const is2FA = (activeMode === "totp") || (textToCopy === currentTotpCode);
      const isMail = (activeMode === "tempmail") || textToCopy.includes("@");
      const isMultiLine = textToCopy.includes("\n");

      if (!skipSaveCopied && !is2FA && !isMail && !isMultiLine && textToCopy.trim().length > 0) {
        await window.PrivaCraftStorage.saveCopiedPassword(textToCopy, activePwdSubmode || "password");
        renderCopiedPasswordsList();
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Unable to copy", "✕");
    }
  }

  // Render Copied Passwords Section (Past 10 list)
  async function renderCopiedPasswordsList() {
    if (!copiedPasswordsList) return;
    const list = await window.PrivaCraftStorage.loadCopiedPasswords();
    if (copiedCountBadge) {
      copiedCountBadge.textContent = `${list.length}/10`;
    }

    copiedPasswordsList.innerHTML = "";
    if (list.length === 0) {
      copiedPasswordsList.innerHTML = `
        <div class="copied-empty">
          <span>No copied passwords yet. Passwords you copy will appear here (past 10 kept).</span>
        </div>
      `;
      return;
    }

    list.forEach(item => {
      const row = document.createElement("div");
      row.className = "copied-item";
      const timeAgo = formatTimeAgo(item.timestamp);
      const tagClass = `tag-${item.mode || "password"}`;

      row.innerHTML = `
        <div class="copied-main">
          <div class="copied-pwd-row">
            <span class="copied-pwd" data-masked="false">${escapeHtml(item.password)}</span>
          </div>
          <div class="copied-meta">
            <span class="copied-tag ${tagClass}">${escapeHtml(item.mode || "pwd")}</span>
            <span class="copied-time">${timeAgo}</span>
          </div>
        </div>
        <div class="copied-actions">
          <button class="btn-icon-subtle btn-copied-reveal" title="Show / Hide">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-icon-subtle btn-copied-copy" title="Copy again">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="btn-icon-subtle btn-copied-del" title="Remove">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      const pwdSpan = row.querySelector(".copied-pwd");
      const revealBtn = row.querySelector(".btn-copied-reveal");
      revealBtn.addEventListener("click", () => {
        const isCurrentlyMasked = pwdSpan.getAttribute("data-masked") === "true";
        if (isCurrentlyMasked) {
          pwdSpan.textContent = item.password;
          pwdSpan.setAttribute("data-masked", "false");
        } else {
          pwdSpan.textContent = "•".repeat(Math.min(item.password.length, 16));
          pwdSpan.setAttribute("data-masked", "true");
        }
      });

      const copyBtn = row.querySelector(".btn-copied-copy");
      copyBtn.addEventListener("click", async () => {
        await copyPassword(item.password, "Password copied!", true);
        await window.PrivaCraftStorage.saveCopiedPassword(item.password, item.mode);
        renderCopiedPasswordsList();
      });

      const delBtn = row.querySelector(".btn-copied-del");
      delBtn.addEventListener("click", async () => {
        window.PrivaCraftAudio.playClick();
        await window.PrivaCraftStorage.deleteCopiedPassword(item.id);
        renderCopiedPasswordsList();
        showToast("Removed from copied list", "✓");
      });

      copiedPasswordsList.appendChild(row);
    });
  }

  if (btnClearCopied) {
    btnClearCopied.addEventListener("click", async () => {
      window.PrivaCraftAudio.playClick();
      await window.PrivaCraftStorage.clearCopiedPasswords();
      renderCopiedPasswordsList();
      showToast("Copied list cleared", "✓");
    });
  }

  // Autofill Active Page
  async function fillIntoPage() {
    if (!currentPassword) return;

    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
      showToast("Autofill available in Chrome tab", "ℹ");
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        showToast("No active tab found", "✕");
        return;
      }

      if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("edge://") || tab.url?.startsWith("chrome-extension://")) {
        showToast("Cannot autofill on internal browser pages", "✕");
        return;
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (pwd) => {
          let target = document.activeElement;
          if (!target || (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA")) {
            target = document.querySelector('input[type="password"]');
          }
          if (!target) {
            target = document.querySelector('input[name*="pass" i], input[id*="pass" i], input[autocomplete*="password" i]');
          }
          if (!target) {
            target = document.querySelector('input[type="text"], input:not([type])');
          }

          if (target) {
            target.focus();
            target.value = pwd;
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
            return { success: true };
          }
          return { success: false };
        },
        args: [currentPassword]
      });

      const res = results?.[0]?.result;
      if (res && res.success) {
        window.PrivaCraftAudio.playSuccess();
        showToast("Filled into page!", "⚡");
      } else {
        showToast("No input field found on page", "✕");
      }
    } catch (err) {
      console.error("Autofill error:", err);
      showToast("Could not autofill this page", "✕");
    }
  }

  // Modals management
  function openModal(modal) {
    window.PrivaCraftAudio.playClick();
    modalBackdrop.classList.add("active");
    modal.classList.add("active");
  }

  function closeAllModals() {
    modalBackdrop.classList.remove("active");
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
  }

  // QR Code Modal & Wi-Fi QR
  function updateQrDisplay() {
    if (!currentPassword) return;
    let qrPayload = currentPassword;

    if (isWifiQr) {
      const ssid = (wifiSsid.value || "MyWiFi").trim();
      const enc = wifiEnc.value || "WPA";
      qrPayload = `WIFI:T:${enc};S:${ssid};P:${currentPassword};;`;
      qrHintText.textContent = `Point phone camera at code to instantly connect to "${ssid}".`;
    } else {
      qrHintText.textContent = "Scan with your phone's camera to transfer password securely without syncing.";
    }

    const svg = window.PrivaCraftQR.generateSvg(qrPayload);
    qrContainer.innerHTML = svg;
  }

  function showQrModal() {
    isWifiQr = false;
    qrTabRaw.classList.add("active");
    qrTabWifi.classList.remove("active");
    wifiConfigBox.style.display = "none";
    updateQrDisplay();
    openModal(modalQr);
  }

  qrTabRaw.addEventListener("click", () => {
    isWifiQr = false;
    qrTabRaw.classList.add("active");
    qrTabWifi.classList.remove("active");
    wifiConfigBox.style.display = "none";
    updateQrDisplay();
  });

  qrTabWifi.addEventListener("click", () => {
    isWifiQr = true;
    qrTabWifi.classList.add("active");
    qrTabRaw.classList.remove("active");
    wifiConfigBox.style.display = "flex";
    wifiSsid.focus();
    updateQrDisplay();
  });

  wifiSsid.addEventListener("input", updateQrDisplay);
  wifiEnc.addEventListener("change", updateQrDisplay);

  // Phonetic Modal
  function showPhoneticModal() {
    if (!currentPassword) return;
    const breakdown = window.PrivaCraftPhonetic.getPhoneticBreakdown(currentPassword);
    phoneticList.innerHTML = "";

    breakdown.forEach(item => {
      const row = document.createElement("div");
      row.className = "phonetic-row";
      const isUpper = item.type === "upper";
      const isSym = item.type === "symbol";

      row.innerHTML = `
        <span class="phonetic-char">${escapeHtml(item.char)}</span>
        <span class="phonetic-word ${isUpper ? "is-upper" : ""} ${isSym ? "is-symbol" : ""}">
          ${isUpper ? "UPPER " : ""}${escapeHtml(item.phonetic)}
        </span>
      `;
      phoneticList.appendChild(row);
    });

    btnCopyPhonetic.onclick = () => {
      const dictation = window.PrivaCraftPhonetic.getPhoneticDictationString(currentPassword);
      copyPassword(dictation, "Phonetic dictation copied!");
    };

    openModal(modalPhonetic);
  }

  // Bulk Generator Modal
  function showBulkModal() {
    const list = window.PrivaCraftGenerator.generateBulk(6, activeMode === "auditor" || activeMode === "totp" ? "password" : activeMode, {
      length: parseInt(activeMode === "pin" ? pinLengthSlider.value : pwdLengthSlider.value, 10),
      wordsCount: parseInt(passLengthSlider.value, 10),
      separator: passSeparator.value,
      capitalize: passCapitalize.value,
      includeNumber: passIncludeNum.checked,
      uppercase: optUpper.checked,
      lowercase: optLower.checked,
      numbers: optNumbers.checked,
      symbols: optSymbols.checked,
      excludeAmbiguous: optAmbiguous.checked
    });

    bulkList.innerHTML = "";
    list.forEach(p => {
      const row = document.createElement("div");
      row.className = "bulk-item";
      row.innerHTML = `
        <span class="bulk-text">${escapeHtml(p)}</span>
        <button class="btn-icon-subtle bulk-copy" title="Copy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      `;
      row.querySelector(".bulk-copy").addEventListener("click", () => copyPassword(p, "Copied!"));
      bulkList.appendChild(row);
    });

    btnCopyBulk.onclick = () => {
      copyPassword(list.join("\n"), "All 6 passwords copied!");
    };

    openModal(modalBulk);
  }

  // History Modal
  async function showHistoryModal() {
    const history = await window.PrivaCraftStorage.loadHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🕒</div>
          <p>No password history yet</p>
          <span>Generated passwords will appear here</span>
        </div>
      `;
    } else {
      history.forEach(item => {
        const timeAgo = formatTimeAgo(item.timestamp);
        const row = document.createElement("div");
        row.className = "history-item";
        row.innerHTML = `
          <div class="history-main">
            <span class="history-pwd" data-masked="true">${"•".repeat(Math.min(item.password.length, 16))}</span>
            <div class="history-meta">
              <span class="history-tag tag-${item.mode}">${item.mode}</span>
              <span class="history-time">${timeAgo}</span>
            </div>
          </div>
          <div class="history-actions">
            <button class="btn-icon-subtle hist-reveal" title="Show/Hide">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn-icon-subtle hist-copy" title="Copy">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <button class="btn-icon-subtle hist-delete" title="Remove">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `;

        const pwdEl = row.querySelector(".history-pwd");
        const revealBtn = row.querySelector(".hist-reveal");

        revealBtn.addEventListener("click", () => {
          const isCurrentlyMasked = pwdEl.getAttribute("data-masked") === "true";
          if (isCurrentlyMasked) {
            pwdEl.textContent = item.password;
            pwdEl.setAttribute("data-masked", "false");
          } else {
            pwdEl.textContent = "•".repeat(Math.min(item.password.length, 16));
            pwdEl.setAttribute("data-masked", "true");
          }
        });

        row.querySelector(".hist-copy").addEventListener("click", () => copyPassword(item.password, "Copied from history!"));
        row.querySelector(".hist-delete").addEventListener("click", async () => {
          await window.PrivaCraftStorage.deleteHistoryItem(item.id);
          row.remove();
          if (historyList.children.length === 0) {
            showHistoryModal();
          }
        });

        historyList.appendChild(row);
      });
    }

    openModal(modalHistory);
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return "Just now";
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 30) return "Just now";
    if (elapsed < 60) return `${elapsed}s ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    return `${Math.floor(elapsed / 86400)}d ago`;
  }

  // Theme Accent Switching
  btnTheme.addEventListener("click", async () => {
    const currentIdx = THEMES.indexOf(settings.theme || "indigo");
    const nextTheme = THEMES[(currentIdx + 1) % THEMES.length];
    applyTheme(nextTheme);
    await window.PrivaCraftStorage.saveSettings(settings);
    window.PrivaCraftAudio.playClick();
    showToast(`Accent: ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)}`, "🎨");
  });

  // Sound Toggle
  btnSound.addEventListener("click", async () => {
    const newState = !settings.soundEnabled;
    applyAudioSetting(newState);
    await window.PrivaCraftStorage.saveSettings(settings);
    if (newState) window.PrivaCraftAudio.playClick();
    showToast(newState ? "Sound enabled" : "Sound muted", newState ? "🔔" : "🔕");
  });

  // Event Listeners: Main Top Tabs
  modeTabs.forEach(tab => {
    tab.addEventListener("click", async () => {
      modeTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      switchModePanel(tab.dataset.mode);
      persistPreferences();
      if (tab.dataset.mode === "password" && activePwdSubmode !== "auditor") {
        if (!currentPassword) {
          await restoreLastOrGenerate();
        } else {
          passwordOutput.innerHTML = formatPasswordDisplay(currentPassword);
          updateStrength(currentPassword);
        }
      }
    });
  });

  // Event Listeners: Password Sub-Tabs (Pass, Phrase, PIN, Audit)
  subTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      switchPwdSubmode(tab.dataset.submode, true);
      persistPreferences();
    });
  });

  // Password Length Slider
  pwdLengthSlider.addEventListener("input", (e) => {
    pwdLengthVal.textContent = e.target.value;
    updatePresetActive(pwdPresetBtns, e.target.value);
    persistPreferences();
    generateAndDisplay();
  });

  // Password Presets
  pwdPresetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.val;
      pwdLengthSlider.value = val;
      pwdLengthVal.textContent = val;
      updatePresetActive(pwdPresetBtns, val);
      persistPreferences();
      generateAndDisplay();
    });
  });

  // Checkbox toggles for Password Mode
  [optUpper, optLower, optNumbers, optSymbols, optAmbiguous].forEach(opt => {
    opt.addEventListener("change", () => {
      if (!optUpper.checked && !optLower.checked && !optNumbers.checked && !optSymbols.checked) {
        optLower.checked = true;
      }
      persistPreferences();
      generateAndDisplay();
    });
  });

  // Passphrase Controls
  passLengthSlider.addEventListener("input", (e) => {
    passLengthVal.textContent = e.target.value;
    persistPreferences();
    generateAndDisplay();
  });

  passSeparator.addEventListener("change", () => {
    persistPreferences();
    generateAndDisplay();
  });

  passCapitalize.addEventListener("change", () => {
    persistPreferences();
    generateAndDisplay();
  });

  passIncludeNum.addEventListener("change", () => {
    persistPreferences();
    generateAndDisplay();
  });

  // PIN Controls
  pinLengthSlider.addEventListener("input", (e) => {
    pinLengthVal.textContent = e.target.value;
    updatePresetActive(pinPresetBtns, e.target.value);
    persistPreferences();
    generateAndDisplay();
  });

  pinPresetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.val;
      pinLengthSlider.value = val;
      pinLengthVal.textContent = val;
      updatePresetActive(pinPresetBtns, val);
      persistPreferences();
      generateAndDisplay();
    });
  });

  // Auditor Input Handlers
  auditorInput.addEventListener("input", (e) => {
    runAuditor(e.target.value);
  });

  btnToggleAuditorMask.addEventListener("click", () => {
    const isPass = auditorInput.type === "password";
    auditorInput.type = isPass ? "text" : "password";
    btnToggleAuditorMask.classList.toggle("active", !isPass);
  });

  btnFortify.addEventListener("click", async () => {
    const improved = window.PrivaCraftStrength.improvePassword(auditorInput.value);
    auditorInput.value = improved;
    runAuditor(improved);
    window.PrivaCraftAudio.playSuccess();
    showToast("Password fortified!", "🛡️");
    await window.PrivaCraftStorage.saveHistoryItem({
      password: improved,
      mode: "auditor",
      score: 95,
      entropy: 90
    });
  });

  // Output action buttons
  btnCopy.addEventListener("click", () => copyPassword(currentPassword));

  btnRegenerate.addEventListener("click", () => {
    btnRegenerate.classList.add("spinning");
    setTimeout(() => btnRegenerate.classList.remove("spinning"), 380);
    generateAndDisplay();
  });

  btnToggleMask.addEventListener("click", () => {
    isMasked = !isMasked;
    passwordOutput.innerHTML = formatPasswordDisplay(currentPassword);
    btnToggleMask.classList.toggle("active", isMasked);
  });

  btnFill.addEventListener("click", fillIntoPage);
  btnQr.addEventListener("click", showQrModal);
  btnPhonetic.addEventListener("click", showPhoneticModal);
  btnBulk.addEventListener("click", showBulkModal);
  btnHistory.addEventListener("click", showHistoryModal);

  // Close modals
  btnCloseQr.addEventListener("click", closeAllModals);
  btnClosePhonetic.addEventListener("click", closeAllModals);
  btnCloseBulk.addEventListener("click", closeAllModals);
  btnCloseHistory.addEventListener("click", closeAllModals);
  modalBackdrop.addEventListener("click", closeAllModals);

  btnClearHistory.addEventListener("click", async () => {
    await window.PrivaCraftStorage.clearHistory();
    showHistoryModal();
    showToast("History cleared", "✓");
  });

  // Global Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && !window.getSelection().toString()) {
      if (activeMode === "totp") {
        btnCopyTotp.click();
      } else if (activeMode === "tempmail") {
        btnCopyTempMail.click();
      } else {
        copyPassword(currentPassword);
      }
    } else if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON" && e.target.tagName !== "SELECT") {
      if (activeMode !== "totp" && activeMode !== "tempmail") {
        e.preventDefault();
        btnRegenerate.click();
      }
    }
  });

  // Boot
  applySettings();
  await restoreLastOrGenerate();
  renderCopiedPasswordsList();
});
