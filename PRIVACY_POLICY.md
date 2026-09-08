# Privacy Policy for PrivaCraft

**Last Updated**: September 8, 2026  
**Extension Name**: PrivaCraft - Temp Mail & 2FA Vault  

PrivaCraft is an open-source, privacy-first browser extension designed to provide disposable temporary email, 2FA live authenticator codes, and cryptographic password generation without compromising user privacy.

---

### 1. Data Collection & Analytics
**PrivaCraft does NOT collect, track, log, or sell any personal information.**
- We do not use tracking pixels, telemetry, Google Analytics, or third-party behavioral analytics.
- We do not store your passwords, passphrases, PINs, or 2FA secret keys on any external servers.
- We do not monitor your web browsing activity, browsing history, or search queries.

---

### 2. Password Generation & 2FA Authenticator Security
- **Local Generation**: Passwords, passphrases, and PINs are computed directly on your machine using the browser's native `window.crypto.getRandomValues()` API.
- **Offline 2FA Engine**: The 2FA live authenticator computes RFC 6238 time-based one-time passwords (TOTP) entirely offline using Web Crypto HMAC-SHA1. Your 2FA secret keys never leave your browser.
- **Local Storage**: Your settings, 2FA accounts vault, and optional local history are stored exclusively in your browser's local sandbox via `chrome.storage.local`. You can clear this data at any time from within the extension.

---

### 3. Disposable Temporary Email Service
When you navigate to the Temp Mail tab, the extension communicates with free, public disposable email APIs:
- **Mail.tm** (`https://api.mail.tm`)
- **GuerrillaMail** (`https://api.guerrillamail.com`)

**Scope of Network Requests**:
- Outbound network requests occur solely to create a randomized temporary mailbox and poll for incoming activation/verification messages.
- Network activity occurs on-demand while the mailbox is active.
- When you click the discard/delete button or change domains, the extension explicitly dispatches deletion calls (`del_email` and `DELETE /accounts/{id}`) to purge the mailbox on the server, and purges local message caches immediately.

---

### 4. Permissions Disclosure
- **`storage`**: Used exclusively to save user preferences, theme options, 2FA account labels, and recent local history on your device.
- **`clipboardWrite`**: Used exclusively when you explicitly click a "Copy" button to copy passwords, OTP codes, or email addresses to your clipboard.
- **`activeTab` & `scripting`**: Used strictly when you click "Fill Page" to detect and autofill credentials into login or registration inputs on your active browser tab.
- **`alarms` & `notifications`**: Used to alert you via desktop notifications when a new verification email arrives in your temporary inbox.
- **`offscreen`**: Used to play native synthesized Web Audio notification chimes when incoming verification emails are received.

---

### 5. Third-Party Sharing
We do not sell, rent, trade, or share user data with any third party. None of your data is used for advertising, credit scoring, or data brokers.

---

### 6. Open Source & Transparency
PrivaCraft is 100% open source under the MIT License. Anyone can review the full source code on GitHub to verify our security and privacy claims.

---

### 7. Contact
If you have questions, feedback, or security inquiries regarding this privacy policy, please open an issue on our official GitHub repository.
