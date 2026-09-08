/**
 * PrivaCraft - Offscreen Audio Engine
 * Executes Web Audio API playback for background incoming mail & OTP alerts.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PLAY_NOTIFICATION_SOUND") {
    try {
      if (window.PrivaCraftAudio) {
        window.PrivaCraftAudio.playAlertChime();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, reason: "Audio engine missing" });
      }
    } catch (err) {
      console.error("Offscreen audio error:", err);
      sendResponse({ success: false, error: String(err) });
    }
    return true;
  }
});
