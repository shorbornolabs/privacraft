/**
 * PrivaCraft - Ultra-Lightweight Temp Mail Engine
 * Multi-provider free disposable email service with countdown timer and zero idle RAM drain.
 */

(function () {
  const STORAGE_KEY = "privacraft_tempmail";
  const LEGACY_STORAGE_KEY = "passcraft_tempmail";
  const DEFAULT_LIFESPAN_MINUTES = 60;

  // Predefined fallback domains for Guerrilla Mail
  const GUERRILLA_DOMAINS = [
    "guerrillamailblock.com",
    "sharklasers.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "grr.la",
    "pokemail.net",
    "spam4.me"
  ];

  function generateRandomUser(len = 9) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  // =========================================================================
  // Provider 1: Mail.tm
  // =========================================================================
  const ProviderMailTm = {
    async getDomains() {
      try {
        const res = await fetch("https://api.mail.tm/domains", {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data["hydra:member"] || []).map(d => d.domain);
      } catch {
        return [];
      }
    },

    async createAccount(domain) {
      const username = generateRandomUser(8);
      const address = `${username}@${domain}`;
      const password = `PrivaCraft_${Math.random().toString(36).slice(2, 10)}!`;

      // 1. Create account
      const createRes = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      if (!createRes.ok) throw new Error("Could not create mail.tm account");
      const createData = await createRes.json();

      // 2. Obtain JWT Token
      const tokenRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      if (!tokenRes.ok) throw new Error("Could not authenticate with mail.tm");
      const tokenData = await tokenRes.json();

      return {
        provider: "mailtm",
        email: address,
        token: tokenData.token,
        domain,
        accountId: createData.id
      };
    },

    async getMessages(token) {
      const res = await fetch("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data["hydra:member"] || []).map(m => ({
        id: m.id,
        from: m.from?.address || m.from?.name || "Unknown",
        subject: m.subject || "(No Subject)",
        date: m.createdAt,
        preview: m.intro || ""
      }));
    },

    async getMessageDetails(id, token) {
      const res = await fetch(`https://api.mail.tm/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      const text = data.text || "";
      const html = data.html?.[0] || "";

      return {
        id: data.id,
        from: data.from?.address || data.from?.name,
        subject: data.subject,
        date: data.createdAt,
        body: text || html,
        code: extractVerificationCode(text || html),
        link: extractVerificationLink(text || html)
      };
    }
  };

  // =========================================================================
  // Provider 2: Guerrilla Mail
  // =========================================================================
  const ProviderGuerrilla = {
    async createAccount(preferredDomain = "sharklasers.com") {
      const res = await fetch("https://api.guerrillamail.com/ajax.php?f=get_email_address");
      if (!res.ok) throw new Error("Could not connect to GuerrillaMail");
      const data = await res.json();
      const sid = data.sid_token;

      // Always generate a UNIQUE fresh random username so old emails are NEVER returned
      const newUser = generateRandomUser(9);
      const targetDomain = preferredDomain || "sharklasers.com";

      try {
        const switchRes = await fetch(
          `https://api.guerrillamail.com/ajax.php?f=set_email_user&email_user=${newUser}&lang=en&sid_token=${sid}&site=${targetDomain}`
        );
        if (switchRes.ok) {
          await switchRes.json();
        }
      } catch (e) {
        console.warn("Could not set random user on GuerrillaMail:", e);
      }

      // Displayed email address matching the selected domain
      const email = `${newUser}@${targetDomain}`;

      return {
        provider: "guerrilla",
        email,
        token: sid,
        domain: targetDomain,
        user: newUser
      };
    },

    async getMessages(sid) {
      const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${sid}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.list || [])
        .filter(m => !/no-reply@guerrillamail/i.test(m.mail_from || "") && !/Welcome to Guerrilla Mail/i.test(m.mail_subject || ""))
        .map(m => ({
          id: m.mail_id,
          from: m.mail_from,
          subject: m.mail_subject || "(No Subject)",
          date: m.mail_date,
          preview: m.mail_excerpt || ""
        }));
    },

    async getMessageDetails(id, sid) {
      const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${id}&sid_token=${sid}`);
      if (!res.ok) return null;
      const data = await res.json();
      const text = data.mail_body || "";

      return {
        id: data.mail_id,
        from: data.mail_from,
        subject: data.mail_subject,
        date: data.mail_date,
        body: text,
        code: extractVerificationCode(text),
        link: extractVerificationLink(text)
      };
    }
  };

  // Helper: Extract OTP/Verification Code
  function extractVerificationCode(content) {
    if (!content) return null;
    const cleanText = content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");
    const patterns = [
      /(?:verification|security|confirm|one-time|otp|pin|passcode|code)[^\d\n\r]{0,30}\b([0-9]{4,8})\b/i,
      /\b([0-9]{3}[-\s][0-9]{3})\b/,
      /(?:is|is:|was|code:)\s*\b([0-9]{4,8})\b/i,
      /\b([0-9]{6})\b/
    ];
    for (const p of patterns) {
      const match = cleanText.match(p);
      if (match) return match[1].replace(/[-\s]/g, "");
    }
    return null;
  }

  // Helper: Extract Verification / Activation Link
  function extractVerificationLink(content) {
    if (!content) return null;
    const match = content.match(/(https?:\/\/[^\s<>"']+(?:verify|confirm|activate|token|auth)[^\s<>"']*)/i);
    return match ? match[1] : null;
  }

  // =========================================================================
  // Unified Temp Mail Engine API
  // =========================================================================

  async function getActiveMailbox() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY, LEGACY_STORAGE_KEY], (res) => {
          resolve(res?.[STORAGE_KEY] || res?.[LEGACY_STORAGE_KEY] || null);
        });
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
          resolve(raw ? JSON.parse(raw) : null);
        } catch {
          resolve(null);
        }
      }
    });
  }

  async function saveActiveMailbox(mailbox) {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: mailbox }, () => resolve(true));
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mailbox));
        } catch {
          // ignore
        }
        resolve(true);
      }
    });
  }

  const MESSAGES_KEY = "privacraft_tempmail_messages";

  async function getStoredMessages(currentEmail = null) {
    return new Promise(async (resolve) => {
      let targetEmail = currentEmail;
      if (!targetEmail) {
        const box = await getActiveMailbox();
        targetEmail = box?.email || "";
      }

      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([MESSAGES_KEY], (res) => {
          const data = res?.[MESSAGES_KEY];
          if (!data) return resolve([]);
          if (typeof data === "object" && Array.isArray(data.messages)) {
            if (data.email && targetEmail && data.email !== targetEmail) {
              return resolve([]); // Different mailbox - discard old messages
            }
            return resolve(data.messages);
          }
          if (Array.isArray(data)) return resolve(data);
          resolve([]);
        });
      } else {
        try {
          const raw = localStorage.getItem(MESSAGES_KEY);
          if (!raw) return resolve([]);
          const data = JSON.parse(raw);
          if (typeof data === "object" && Array.isArray(data.messages)) {
            if (data.email && targetEmail && data.email !== targetEmail) {
              return resolve([]);
            }
            return resolve(data.messages);
          }
          if (Array.isArray(data)) return resolve(data);
          resolve([]);
        } catch {
          resolve([]);
        }
      }
    });
  }

  async function saveStoredMessages(messages, forEmail = null) {
    let targetEmail = forEmail;
    if (!targetEmail) {
      const box = await getActiveMailbox();
      targetEmail = box?.email || "";
    }

    const payload = {
      email: targetEmail,
      messages: messages || []
    };

    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [MESSAGES_KEY]: payload }, () => resolve(true));
      } else {
        try {
          localStorage.setItem(MESSAGES_KEY, JSON.stringify(payload));
        } catch {
          // ignore
        }
        resolve(true);
      }
    });
  }

  async function clearStoredMessages() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove([MESSAGES_KEY], () => resolve(true));
      } else {
        try {
          localStorage.removeItem(MESSAGES_KEY);
        } catch {
          // ignore
        }
        resolve(true);
      }
    });
  }

  const NOTIFIED_KEY = "privacraft_notified_ids";

  async function getNotifiedIds() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([NOTIFIED_KEY], (res) => {
          resolve(new Set((res?.[NOTIFIED_KEY] || []).map(String)));
        });
      } else {
        try {
          const raw = localStorage.getItem(NOTIFIED_KEY);
          resolve(new Set((raw ? JSON.parse(raw) : []).map(String)));
        } catch {
          resolve(new Set());
        }
      }
    });
  }

  async function markIdsAsNotified(ids) {
    if (!ids || ids.length === 0) return true;
    const set = await getNotifiedIds();
    ids.forEach(id => set.add(String(id)));
    const arr = Array.from(set);
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [NOTIFIED_KEY]: arr }, () => resolve(true));
      } else {
        try {
          localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
        } catch {}
        resolve(true);
      }
    });
  }

  async function clearNotifiedIds() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove([NOTIFIED_KEY], () => resolve(true));
      } else {
        try {
          localStorage.removeItem(NOTIFIED_KEY);
        } catch {}
        resolve(true);
      }
    });
  }

  async function fetchAllDomains() {
    const tmDomains = await ProviderMailTm.getDomains();
    return {
      mailtm: tmDomains.length > 0 ? tmDomains : ["uberip.com"],
      guerrilla: GUERRILLA_DOMAINS
    };
  }

  async function createNewMailbox(provider = "guerrilla", domain = null) {
    // 1. Fully delete previous mailbox from server and wipe local storage
    await deleteMailbox();

    let mailbox;
    if (provider === "mailtm") {
      const domains = await ProviderMailTm.getDomains();
      const targetDomain = domain || domains[0] || "uberip.com";
      mailbox = await ProviderMailTm.createAccount(targetDomain);
    } else {
      const targetDomain = domain || GUERRILLA_DOMAINS[0];
      mailbox = await ProviderGuerrilla.createAccount(targetDomain);
    }

    const now = Date.now();
    mailbox.createdAt = now;
    mailbox.expiresAt = now + DEFAULT_LIFESPAN_MINUTES * 60 * 1000;
    await saveActiveMailbox(mailbox);
    return mailbox;
  }

  async function checkMessages(mailbox) {
    if (!mailbox) return [];
    if (mailbox.provider === "mailtm") {
      return await ProviderMailTm.getMessages(mailbox.token);
    } else {
      return await ProviderGuerrilla.getMessages(mailbox.token);
    }
  }

  async function readMessage(mailbox, messageId) {
    if (!mailbox) return null;
    if (mailbox.provider === "mailtm") {
      return await ProviderMailTm.getMessageDetails(messageId, mailbox.token);
    } else {
      return await ProviderGuerrilla.getMessageDetails(messageId, mailbox.token);
    }
  }

  async function extendLifespan(mailbox, minutes = 15) {
    if (!mailbox) return null;
    const now = Date.now();
    const base = Math.max(now, mailbox.expiresAt || now);
    mailbox.expiresAt = base + minutes * 60 * 1000;
    await saveActiveMailbox(mailbox);
    return mailbox.expiresAt;
  }

  async function deleteMailbox() {
    const current = await getActiveMailbox();
    if (current) {
      if (current.provider === "guerrilla" && current.token) {
        try {
          // Delete server messages if any (with timeout guard)
          const msgs = await Promise.race([
            ProviderGuerrilla.getMessages(current.token),
            new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2000))
          ]).catch(() => []);

          if (msgs.length > 0) {
            const idsParam = msgs.map(m => `email_ids[]=${m.id}`).join("&");
            await Promise.race([
              fetch(`https://api.guerrillamail.com/ajax.php?f=del_email&${idsParam}&sid_token=${current.token}`),
              new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2000))
            ]).catch(() => {});
          }

          // Forget session on GuerrillaMail (with timeout guard)
          await Promise.race([
            fetch(`https://api.guerrillamail.com/ajax.php?f=forget_me&sid_token=${current.token}&email_addr=${encodeURIComponent(current.email || "")}`),
            new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2000))
          ]).catch(() => {});
        } catch (e) {
          console.warn("Could not wipe GuerrillaMail session:", e);
        }
      } else if (current.provider === "mailtm" && current.token && current.accountId) {
        try {
          await Promise.race([
            fetch(`https://api.mail.tm/accounts/${current.accountId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${current.token}` }
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2000))
          ]).catch(() => {});
        } catch (e) {}
      }
    }

    // Wipe all local messages, notified IDs, and storage
    await clearNotifiedIds();
    await clearStoredMessages();
    if (typeof chrome !== "undefined" && chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ text: "" });
    }
    if (typeof chrome !== "undefined" && chrome.notifications && chrome.notifications.clear) {
      chrome.notifications.clear("privacraft_mail_alert", () => {});
    }

    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove([STORAGE_KEY, MESSAGES_KEY, NOTIFIED_KEY, LEGACY_STORAGE_KEY], () => resolve(true));
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MESSAGES_KEY);
        localStorage.removeItem(NOTIFIED_KEY);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        resolve(true);
      }
    });
  }

  const globalScope = typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : globalThis);
  globalScope.PrivaCraftTempMail = {
    fetchAllDomains,
    getActiveMailbox,
    createNewMailbox,
    checkMessages,
    readMessage,
    extendLifespan,
    deleteMailbox,
    getStoredMessages,
    saveStoredMessages,
    clearStoredMessages,
    getNotifiedIds,
    markIdsAsNotified,
    clearNotifiedIds,
    extractVerificationCode,
    extractVerificationLink
  };
  globalScope.PassCraftTempMail = globalScope.PrivaCraftTempMail;
})();
