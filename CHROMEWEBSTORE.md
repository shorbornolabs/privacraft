# Chrome Web Store Listing: PrivaCraft

**Last Updated**: 2026-09-08  
**Extension Name**: PrivaCraft - Temp Mail & 2FA Vault  
**Version**: 1.0.0  
**Package File**: `privacraft-v1.0.0.zip` (Generated via `package_extension.py`)  

---

## 1. Store Metadata (Dashboard Copy-Paste)

### Extension Name (Max 75 characters)
```
PrivaCraft - Temp Mail & 2FA Vault
```

### Short Description / Summary (Max 132 characters)
```
Disposable temp email with live inbox, 30s 2FA live authenticator, and secure password generator with zero RAM drain.
```

### Detailed Description (Plain Text for Chrome Web Store)
```
PrivaCraft is an ultra-fast, modern, and privacy-first security suite designed to keep your digital identity bulletproof.

Built with native Web Crypto APIs (crypto.getRandomValues), PrivaCraft combines three indispensable online security tools into a single lightweight extension with zero idle memory consumption.

KEY FEATURES:

1. DISPOSABLE TEMP MAIL (Default Starting View)
• 10+ Free Domains: Instant disposable email generation across GuerrillaMail (@sharklasers.com, @guerrillamail.com, @guerrillamailblock.com, @grr.la, @pokemail.net, @spam4.me) and Mail.tm (@uberip.com).
• Real-Time Inbox & Auto-Polling: Incoming messages appear automatically with instant badge alerts and sound chimes.
• Smart OTP Code & Link Extraction: Automatically scans incoming emails and extracts 4-to-8 digit verification codes and activation links for 1-click copying.
• Mailbox Survival Timer: Live MM:SS countdown timer with a 1-click "+15m" extension button.
• One-Click Autofill: Injects your temp email address directly into active sign-up form fields.
• Server-Side Purge: Clicking the trash icon permanently wipes messages and destroys the mailbox on the server.

2. 2FA (TOTP) LIVE AUTHENTICATOR & VAULT
• Replaces External Web Tools: Never paste sensitive 2FA seeds into public web tools like 2fa.live or 2fa.cn.
• RFC 6238 Web Crypto Engine: Calculates standard 30-second HMAC-SHA1 codes completely offline.
• Animated Cyber Countdown Ring: Smooth circular visual timer with color-coded safety warnings.
• Instant / Disposable Mode: Paste any secret key or otpauth:// link for instant live 2FA codes.
• Encrypted Local Vault: Save accounts (GitHub, Google, Binance, Discord) for 1-click access.
• 1-Click OTP Fill: Injects 6-digit authentication codes into the active browser page.

3. CRYPTOGRAPHIC PASSWORD STUDIO & AUDITOR
• CSPRNG Strong Passwords: Customizable length (6–64 chars), uppercase, lowercase, numbers, symbols, and ambiguous character filters.
• Active Session Persistence: Your generated password is preserved across extension opens—never accidentally re-rolls.
• Recent Copied Passwords List: Automatically stores your past 10 copied passwords in a dedicated FIFO list with 1-click reveal, re-copy, and deletion.
• Memorable Passphrases: Diceware-inspired dictionary passphrases with custom separators and numbers.
• Numeric Banking PINs: 4 to 16 digit secure PINs.
• Live Password Auditor: Real-time entropy and crack time calculation with 1-click "Fortify" auto-fixer.
• NATO Phonetic Spelling: Clear voice dictation breakdown for phone verification.
• Wi-Fi QR Codes: Generate offline QR codes to instantly share Wi-Fi credentials.

PRIVACY & SECURITY:
• 100% Client-Side: Password generation, entropy calculation, and 2FA computations run strictly on your device.
• Zero Data Collection: PrivaCraft has no user tracking, no telemetry, no accounts, and no analytics.
• Zero-RAM Idle Architecture: Runs on Manifest V3 with lightweight service worker architecture.
• Open Source: Fully auditable source code available on GitHub.
```

### Category
```
Productivity  (Alternative: Developer Tools)
```

### Primary Language
```
English
```

### Single Purpose Description
```
Provides disposable temporary email, an offline 2FA live authenticator, and cryptographic password generation in a unified browser popup.
```

---

## 2. Permissions Justification (For Review Team)

| Permission | Type | Exact Justification to Enter |
|---|---|---|
| `storage` | permissions | Required to save user preferences (selected theme, audio settings, default password parameters), the encrypted local 2FA vault, and the past 10 copied passwords on the user's local device. |
| `clipboardWrite` | permissions | Required to copy generated passwords, 2FA one-time codes, temporary email addresses, and phonetic spelling to the user's clipboard upon clicking Copy. |
| `activeTab` | permissions | Required to locate input fields on the active browser tab when the user explicitly clicks the "Fill Page" button. |
| `scripting` | permissions | Required to inject the generated password, 2FA code, or temp email into the form field on the active web page upon user request. |
| `alarms` | permissions | Required to schedule periodic checks for incoming verification emails in the background while the extension popup is closed. |
| `notifications` | permissions | Required to display desktop notification alerts with extracted OTP codes when a new verification email arrives in the temp inbox. |
| `offscreen` | permissions | Required to play native synthesized Web Audio notification chimes for incoming email alerts while the service worker is idle. |
| `https://api.mail.tm/*` | host_permissions | Required strictly to create disposable temporary email addresses and retrieve incoming verification emails via the free Mail.tm API. |
| `https://api.guerrillamail.com/*` | host_permissions | Required strictly to generate temporary mailboxes across 8+ domains and retrieve incoming activation emails via GuerrillaMail API. |

---

## 3. Privacy & Data Use Disclosures

### Data Collection Answers:
- **Personally identifiable information**: NOT collected.
- **Health information**: NOT collected.
- **Financial & payment information**: NOT collected.
- **Authentication information**: NOT collected externally (2FA secret keys are stored only locally in `chrome.storage.local`).
- **Personal communications**: NOT collected (temporary emails are fetched directly to the user's browser and stored locally).
- **Location**: NOT collected.
- **Web history**: NOT collected.
- **User activity**: NOT collected.
- **Website content**: NOT collected.

### Certifications to Check:
- [x] I certify that this extension does not sell user data to third parties.
- [x] I certify that this extension does not use or transfer user data for purposes unrelated to the item's core functionality.
- [x] I certify that this extension does not use or transfer user data for creditworthiness or lending purposes.

### Privacy Policy URL
```
https://github.com/shorbornolabs/privacraft/blob/main/PRIVACY_POLICY.md
```
*(Replace `shorbornolabs` with your actual GitHub username once uploaded)*

---

## 4. Visual Assets Checklist

| Asset | Dimensions | Source File / Recommendation |
|---|---|---|
| **Store Icon** [Required] | 128×128 PNG | `icons/icon-128.png` (Ready in project!) |
| **Screenshot 1** [Required] | 1280×800 or 640×400 | Screenshot showing **Temp Mail** tab with live inbox & OTP banner |
| **Screenshot 2** [Recommended] | 1280×800 or 640×400 | Screenshot showing **Password Studio** with the **Copied Passwords list** |
| **Screenshot 3** [Recommended] | 1280×800 or 640×400 | Screenshot showing **2FA Authenticator** with cyber circular ring |
| **Small Promo Tile** [Optional] | 440×280 PNG | Logo + tagline: "PrivaCraft — Privacy Security Suite" |
| **Marquee Promo Tile** [Optional] | 1400×560 PNG | Wide promotional banner for store frontpage |\n