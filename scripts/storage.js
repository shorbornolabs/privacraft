/**
 * PrivaCraft - Storage & History Management
 * Supports chrome.storage.local with automatic localStorage fallback.
 */

const DEFAULT_SETTINGS = {
  mode: "tempmail", // Default starting view: Temp Mail
  password: {
    length: 18,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    customSymbols: ""
  },
  passphrase: {
    wordsCount: 4,
    separator: "-",
    capitalize: "title",
    includeNumber: true
  },
  pin: {
    length: 6
  },
  theme: "indigo", // 'indigo' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan'
  soundEnabled: true,
  historyEnabled: true
};

const HISTORY_LIMIT = 25;

async function getStorageData(keys) {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, (res) => resolve(res || {}));
    } else {
      const res = {};
      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const k of keyList) {
        try {
          const raw = localStorage.getItem(`privacraft_${k}`) || localStorage.getItem(`passcraft_${k}`);
          if (raw !== null) res[k] = JSON.parse(raw);
        } catch {
          // ignore parsing errors
        }
      }
      resolve(res);
    }
  });
}

async function setStorageData(items) {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(items, () => resolve(true));
    } else {
      for (const [k, v] of Object.entries(items)) {
        try {
          localStorage.setItem(`privacraft_${k}`, JSON.stringify(v));
        } catch {
          // ignore
        }
      }
      resolve(true);
    }
  });
}

async function loadSettings() {
  const data = await getStorageData(["settings"]);
  return { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

async function saveSettings(settings) {
  await setStorageData({ settings });
}

async function loadHistory() {
  const data = await getStorageData(["history"]);
  return data.history || [];
}

async function saveHistoryItem(item) {
  const settings = await loadSettings();
  if (!settings.historyEnabled) return;

  const history = await loadHistory();
  // Avoid immediate duplicate entries
  if (history.length > 0 && history[0].password === item.password) {
    return;
  }

  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    password: item.password,
    mode: item.mode || "password",
    score: item.score || 0,
    entropy: item.entropy || 0,
    timestamp: Date.now()
  };

  const updated = [newItem, ...history].slice(0, HISTORY_LIMIT);
  await setStorageData({ history: updated });
}

async function clearHistory() {
  await setStorageData({ history: [] });
}

async function deleteHistoryItem(id) {
  const history = await loadHistory();
  const filtered = history.filter(h => h.id !== id);
  await setStorageData({ history: filtered });
}

// Copied Passwords Management (Past 10 copied passwords)
const MAX_COPIED_PASSWORDS = 10;

async function loadCopiedPasswords() {
  const data = await getStorageData(["copiedPasswords"]);
  return data.copiedPasswords || [];
}

async function saveCopiedPassword(password, mode = "password") {
  if (!password || typeof password !== "string") return [];
  const list = await loadCopiedPasswords();

  // If already at the top, just update timestamp
  if (list.length > 0 && list[0].password === password) {
    list[0].timestamp = Date.now();
    await setStorageData({ copiedPasswords: list });
    return list;
  }

  // Remove duplicate of this password if present lower in the list
  const filtered = list.filter(item => item.password !== password);

  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    password: password,
    mode: mode || "password",
    timestamp: Date.now()
  };

  // Add new one to top, keep exactly past 10 (FIFO: deletes oldest when an 11th arrives)
  const updated = [newItem, ...filtered].slice(0, MAX_COPIED_PASSWORDS);
  await setStorageData({ copiedPasswords: updated });
  return updated;
}

async function deleteCopiedPassword(id) {
  const list = await loadCopiedPasswords();
  const updated = list.filter(item => item.id !== id);
  await setStorageData({ copiedPasswords: updated });
  return updated;
}

async function clearCopiedPasswords() {
  await setStorageData({ copiedPasswords: [] });
  return [];
}

// Active Password Persistence (Preserves current password between popup closes)
async function loadLastPassword() {
  const data = await getStorageData(["lastPassword"]);
  return data.lastPassword || null;
}

async function saveLastPassword(password, mode = "password") {
  if (!password) return;
  await setStorageData({ lastPassword: { password, mode, timestamp: Date.now() } });
}

// 2FA Accounts Management
async function loadTotpAccounts() {
  const data = await getStorageData(["totpAccounts"]);
  return data.totpAccounts || [];
}

async function saveTotpAccount(account) {
  const accounts = await loadTotpAccounts();
  const newAccount = {
    id: account.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    issuer: account.issuer || "2FA",
    label: account.label || "Account",
    secret: account.secret,
    digits: account.digits || 6,
    period: account.period || 30,
    created: Date.now()
  };

  // Replace if exists, otherwise add
  const existingIdx = accounts.findIndex(a => a.id === newAccount.id || a.secret === newAccount.secret);
  if (existingIdx >= 0) {
    accounts[existingIdx] = newAccount;
  } else {
    accounts.push(newAccount);
  }

  await setStorageData({ totpAccounts: accounts });
  return newAccount;
}

async function deleteTotpAccount(id) {
  const accounts = await loadTotpAccounts();
  const filtered = accounts.filter(a => a.id !== id);
  await setStorageData({ totpAccounts: filtered });
}

window.PrivaCraftStorage = {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistoryItem,
  clearHistory,
  deleteHistoryItem,
  loadCopiedPasswords,
  saveCopiedPassword,
  deleteCopiedPassword,
  clearCopiedPasswords,
  loadLastPassword,
  saveLastPassword,
  loadTotpAccounts,
  saveTotpAccount,
  deleteTotpAccount
};
window.PassCraftStorage = window.PrivaCraftStorage;

