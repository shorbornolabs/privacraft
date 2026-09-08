/**
 * PrivaCraft - Background Service Worker (Manifest V3)
 * Monitors active temporary mailbox every 5 seconds, extracts OTP verification codes,
 * plays audible notification chimes via Web Audio / Offscreen, and triggers OS desktop notifications.
 */

try {
  importScripts("tempmail.js");
} catch (e) {
  console.error("Failed to import tempmail.js in service worker:", e);
}

const ALARM_NAME = "privacraft_bg_mail_poll";
let fastPollTimer = null;
let isPollInProgress = false;

// ---------------------------------------------------------------------------
// 1. Offscreen Document & Multi-Layer Audio Engine
// ---------------------------------------------------------------------------

async function ensureOffscreenDocument() {
  try {
    if (chrome.offscreen && chrome.offscreen.hasDocument) {
      const hasDoc = await chrome.offscreen.hasDocument();
      if (hasDoc) return;
    }
    if (chrome.offscreen && chrome.offscreen.createDocument) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Plays audible alert chime when a temporary email or OTP arrives"
      });
    }
  } catch (err) {
    // Ignore if document is already creating or open
  }
}

async function triggerAudioAlert() {
  // Layer 1: Dedicated Offscreen Document Web Audio Context
  try {
    await ensureOffscreenDocument();
    chrome.runtime.sendMessage({ type: "PLAY_NOTIFICATION_SOUND" }).catch(() => {});
  } catch (e) {}

  // Layer 2: Active Browser Tab Web Audio API Injection (plays sound in the tab the user is browsing)
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tabs && tabs[0] && tabs[0].id && tabs[0].url && !tabs[0].url.startsWith("chrome://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === "suspended") ctx.resume();
            const now = ctx.currentTime;
            const freqs = [1046.5, 1318.5, 1568]; // High-clarity C6, E6, G6 ascending chime
            freqs.forEach((freq, idx) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, now + idx * 0.08);
              const start = now + idx * 0.08;
              const dur = (idx === 2) ? 0.35 : 0.12;
              gain.gain.setValueAtTime(0.35, start);
              gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(start);
              osc.stop(start + dur);
            });
          } catch (e) {}
        }
      }).catch(() => {});
    }
  } catch (e) {}
}

const NOTIFICATION_ID = "privacraft_mail_alert";

function showDesktopNotification(latestMessage, otpCode) {
  const icon = chrome.runtime.getURL("icons/icon-128.png");

  const title = otpCode
    ? `⚡ OTP: ${otpCode} (PrivaCraft)`
    : `✉️ New Temp Email: ${latestMessage?.subject || "(No Subject)"}`;

  const message = otpCode
    ? `Verification Code: ${otpCode}\nFrom: ${latestMessage?.from || "Unknown"}`
    : `From: ${latestMessage?.from || "Unknown"}\n${latestMessage?.subject || ""}`;

  chrome.notifications.create(
    NOTIFICATION_ID,
    {
      type: "basic",
      iconUrl: icon,
      title: title,
      message: message,
      contextMessage: "PrivaCraft Disposable Mailbox",
      priority: 2,
      requireInteraction: true, // Prevents Windows from prematurely hiding toast
      silent: false
    },
    () => {
      if (chrome.runtime.lastError) {
        console.warn("Notification error:", chrome.runtime.lastError.message);
      }
    }
  );

  // Update extension icon badge
  if (otpCode) {
    chrome.action.setBadgeText({ text: otpCode.slice(0, 4) });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
  }
}

// ---------------------------------------------------------------------------
// 3. Periodic Alarm & Fast Polling Engine (Every 15s)
// ---------------------------------------------------------------------------

function setupAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: 1 // Reliable 1m fallback when service worker sleeps
  });
}

// Always ensure alarm is scheduled immediately on startup
setupAlarm();

chrome.runtime.onInstalled.addListener(() => {
  setupAlarm();
  startActivePolling();
});

chrome.runtime.onStartup.addListener(() => {
  setupAlarm();
  startActivePolling();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await checkMailboxInBackground();
    startActivePolling();
  }
});

function startActivePolling() {
  if (fastPollTimer) clearTimeout(fastPollTimer);
  runFastPollLoop();
}

async function runFastPollLoop() {
  if (isPollInProgress) {
    fastPollTimer = setTimeout(runFastPollLoop, 15000);
    return;
  }

  isPollInProgress = true;
  let shouldContinue = true;
  try {
    shouldContinue = await checkMailboxInBackground();
  } catch (err) {
    console.error("Poll loop error:", err);
  } finally {
    isPollInProgress = false;
  }

  // If mailbox is active and not expired, poll again in 15 seconds
  if (shouldContinue !== false) {
    fastPollTimer = setTimeout(runFastPollLoop, 15000);
  }
}

// ---------------------------------------------------------------------------
// 4. Core Background Checker (Strict One-Time Notification)
// ---------------------------------------------------------------------------

async function checkMailboxInBackground() {
  try {
    if (!self.PrivaCraftTempMail) return false;

    const mailbox = await self.PrivaCraftTempMail.getActiveMailbox();
    if (!mailbox || !mailbox.email || !mailbox.token) {
      chrome.action.setBadgeText({ text: "" });
      return false;
    }

    // Check expiration - stop if expired and clear badge
    const now = Date.now();
    if (mailbox.expiresAt && now >= mailbox.expiresAt) {
      chrome.action.setBadgeText({ text: "" });
      return false;
    }

    // Fetch messages from provider
    const remoteMessages = await self.PrivaCraftTempMail.checkMessages(mailbox);
    if (!remoteMessages || remoteMessages.length === 0) return true;

    // Compare with already notified message IDs (STRICT DEDUPLICATION)
    const notifiedIds = await self.PrivaCraftTempMail.getNotifiedIds();
    const unnotifiedItems = remoteMessages.filter(m => !notifiedIds.has(String(m.id)));

    // If all current remote messages have already been notified, DO NOT NOTIFY AGAIN!
    if (unnotifiedItems.length === 0) {
      return true;
    }

    // Mark these items as notified IMMEDIATELY to prevent any repeated alerts
    await self.PrivaCraftTempMail.markIdsAsNotified(unnotifiedItems.map(m => m.id));

    // Fetch details & extract OTP for the truly new unnotified messages
    const processedNew = await Promise.all(
      unnotifiedItems.map(async (m) => {
        try {
          const details = await self.PrivaCraftTempMail.readMessage(mailbox, m.id);
          if (details) return details;
        } catch (e) {}
        return m;
      })
    );

    // Save updated messages array
    const storedMessages = await self.PrivaCraftTempMail.getStoredMessages(mailbox.email);
    const unnotifiedIdSet = new Set(unnotifiedItems.map(u => String(u.id)));
    const merged = [...processedNew, ...storedMessages.filter(s => !unnotifiedIdSet.has(String(s.id)))];
    await self.PrivaCraftTempMail.saveStoredMessages(merged, mailbox.email);

    // Extract OTP code
    const latest = processedNew[0];
    const otpCode = latest.code || null;

    // Trigger audible alert chime ONCE
    await triggerAudioAlert();

    // Show desktop notification and set badge ONCE
    showDesktopNotification(latest, otpCode);

    return true;
  } catch (err) {
    console.error("Background mail check error:", err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// 5. Runtime Message Listeners
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHECK_MAIL_NOW" || request.type === "POPUP_CLOSED" || request.type === "START_BG_POLL") {
    startActivePolling();
    checkMailboxInBackground().then(() => sendResponse({ success: true }));
    return true;
  } else if (request.type === "CLEAR_BADGE") {
    chrome.action.setBadgeText({ text: "" });
    if (chrome.notifications && chrome.notifications.clear) {
      chrome.notifications.clear(NOTIFICATION_ID, () => {});
    }
    sendResponse({ success: true });
  } else if (request.type === "MAILBOX_CHANGED") {
    chrome.action.setBadgeText({ text: "" });
    if (chrome.notifications && chrome.notifications.clear) {
      chrome.notifications.clear(NOTIFICATION_ID, () => {});
    }
    startActivePolling();
    checkMailboxInBackground().then(() => sendResponse({ success: true }));
    return true;
  } else if (request.type === "SHOW_NEW_MAIL_NOTIF") {
    triggerAudioAlert();
    showDesktopNotification(request.latest || {}, request.code || null);
    sendResponse({ success: true });
  } else if (request.type === "PLAY_ALERT_CHIME") {
    triggerAudioAlert();
    sendResponse({ success: true });
  }
});

// Click notification to open popup in browser tab
chrome.notifications.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
  chrome.notifications.clear(NOTIFICATION_ID, () => {});
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});

// Start active polling
startActivePolling();
