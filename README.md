# PrivaCraft — Temp Mail, 2FA Vault & Password Studio

[![Live Web Application](https://img.shields.io/badge/Live%20Web%20App-privacraft.vercel.app-00f0ff?logo=vercel&logoColor=white&style=for-the-badge)](https://privacraft.vercel.app/)
[![Download APK](https://img.shields.io/badge/Download%20APK-v1.0.1%20(API%2036)-3DDC84?logo=android&logoColor=white&style=for-the-badge)](https://github.com/shorbornolabs/privacraft/releases/latest)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue?logo=googlechrome&logoColor=white&style=for-the-badge)](extension/)
[![Creator LinkedIn](https://img.shields.io/badge/LinkedIn-Md.%20Azahar%20Ali-0A66C2?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/azaharonline24/)

---

### 🌐 Instant Sovereign Web Workstation (Zero Install)
> Use PrivaCraft directly in your browser with zero installation, zero tracking, and air-gapped cryptography:  
> 👉 **[https://privacraft.vercel.app/](https://privacraft.vercel.app/)**

---

**PrivaCraft** is an uncompromising, sovereign cybersecurity suite combining three essential digital defense tools into a high-performance **Web Application**, a native **Android Mobile App**, and a **Chromium Browser Extension**:

1. ✉️ **Disposable Temp Mail:** Real-time disposable inboxes, multi-domain picker, and automated OTP verification code extraction straight to your clipboard.
2. ⚡ **2FA Live Authenticator:** Air-gapped RFC 6238 / RFC 4226 engine with animated 30-second circular countdown ring, split-view code display, and encrypted local storage.
3. 🔐 **Cryptographic Password Studio:** CSPRNG entropy generator with rejection sampling, EFF Diceware passphrases, Shannon entropy scoring, and session-persisted copy history.

---

## 🚀 Direct Downloads & Project Quick Links

| Platform | Location / Binary | Security Model | Description |
|---|---|---|---|
| 🌐 **Live Web Application** | **[privacraft.vercel.app](https://privacraft.vercel.app/)** | Client-Side Web Crypto | Instant browser access to 2FA Vault, Temp Mail & Password Studio (Zero install). |
| 📱 **Android APK (Direct)** | **[Download PrivaCraft-v1.0.1.apk](https://github.com/shorbornolabs/privacraft/releases/download/v1.0.1/PrivaCraft-v1.0.1.apk)** | Android Hardware Keystore | Pre-compiled, signed offline release APK (v1.0.1 • Android 16 / API 36). |
| 🏷️ **GitHub Release** | **[v1.0.1 Release (Latest)](https://github.com/shorbornolabs/privacraft/releases/latest)** | Verified Tag | Official release notes & verified asset binaries. |
| 🛡️ **Google Play (Closed Beta)** | **[Join Tester Community](https://groups.google.com/g/privacraft-testers)** | Google Verified Distribution | Closed testing track active. Join group for automatic updates. |
| 🧩 **Browser Extension** | **[`extension/`](extension/)** | Manifest V3 Zero-RAM | Extension for Chrome, Brave, Edge, Opera & Kiwi. |
| 📦 **Android Source Code** | **[`privacraft-android/`](privacraft-android/)** | Jetpack Compose + Kotlin | Full Android Studio project. |
| 👨‍💻 **Creator Profile** | **[Md. Azahar Ali (LinkedIn)](https://www.linkedin.com/in/azaharonline24/)** | Verified Lead Architect | Connect with the creator on LinkedIn. |

---

## 🔒 Threat Model Comparison

| Capability | PrivaCraft (v1.0.1) | Shady Web 2FA (2fa.live) | Big Tech Cloud Sync | Traditional Managers |
|---|---|---|---|---|
| **Secret Seed Security** | **Local Browser / Keystore** | Exposed over Remote HTTP | Tied to Cloud Account | Cloud Vault |
| **Offline Execution** | **100% Air-Gapped** | Fails without Network | Partial Sync Conflicts | Supported |
| **Disposable Temp Mail** | **Built-in Auto OTP Extractor** | Not Available | Not Available | Premium Add-on |
| **Telemetry & Trackers** | **Strictly Zero (0)** | Ad Beacons & Trackers | Corporate Telemetry | Telemetry & Crash Logs |
| **Open Source** | **100% MIT Licensed** | Proprietary / Hidden | Proprietary Black Box | Mixed |

---

## 💻 Manual Chrome Extension Installation (Developer Mode)

### Step 1: Download or Clone this Repository
- Click the green **Code** button at the top of this repository and select **Download ZIP**, then extract it.

### Step 2: Open Extensions Management
- In Chrome, Brave, Edge, or Opera, navigate to: `chrome://extensions`

### Step 3: Enable Developer Mode
- Toggle the **"Developer mode"** switch in the top-right corner to **ON**.

### Step 4: Load the Extension
- Click **"Load unpacked"** in the top-left corner.
- Select the **`extension`** folder from the repository.

---

## 📱 Android APK Installation & Google Play Protect Guide

### Step 1: Download the APK
- 🚀 **Direct APK Download**: [**PrivaCraft-v1.0.1.apk**](https://github.com/shorbornolabs/privacraft/releases/download/v1.0.1/PrivaCraft-v1.0.1.apk)
- 🏷️ **GitHub Release Page**: [**View Release v1.0.1**](https://github.com/shorbornolabs/privacraft/releases/latest)

### Step 2: Allow Installation of Unknown Apps
1. Open your device's **Downloads** folder and tap **`PrivaCraft-v1.0.1.apk`**.
2. If Android prompts *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and turn **ON** *"Allow from this source"*.
3. Tap **Back** and click **Install**.

### Step 3: Google Play Protect Walkthrough
Because PrivaCraft is distributed directly outside the commercial Play Store:
1. When the Play Protect warning appears, tap **"More details"** (or ⌄).
2. Tap **"Install anyway"**.
3. PrivaCraft contains **zero trackers**, **zero ads**, and **zero external telemetry**.

---

## 📁 Repository Directory Structure

```text
privacraft/
├── overview-page/                    # Complete Web Workstation & Landing Page
│   ├── assets/                       # High-res graphics & screenshots
│   ├── index.html                    # Workstation layout & feature breakdown
│   ├── style.css                     # Obsidian & cyan glow styles
│   ├── app.js                        # Web Crypto TOTP & real Temp Mail client
│   ├── vercel.json                   # Vercel deployment configuration
│   └── package.json                  # Web package descriptor
├── extension/                        # Manifest V3 Chromium Extension
│   ├── manifest.json                 # Extension configuration
│   ├── popup.html                    # UI popup
│   ├── styles/popup.css              # Glassmorphism styling
│   └── scripts/                      # TOTP, TempMail & Generator engines
├── privacraft-android/               # Native Android Project (Jetpack Compose)
│   ├── app/                          # App module (API Level 36)
│   └── build.gradle.kts              # Dependencies & build scripts
├── release/                          # Pre-compiled Release Binaries
│   └── PrivaCraft-v1.0.1.apk         # Verified installable release APK
├── PrivaCraft.apk                    # Root quick-download release APK
├── index.html                        # Root web workstation entrypoint
├── style.css                         # Root stylesheet
├── app.js                            # Root script
├── assets/                           # Root assets
├── vercel.json                       # Root Vercel edge configuration
├── CHROMEWEBSTORE.md                 # Chrome Web Store metadata
├── PRIVACY_POLICY.md                 # Zero-Telemetry Privacy Policy
├── LICENSE                           # MIT License
└── README.md                         # Complete project documentation
```

---

## 🛠️ Tech Stack & Cryptography
- **Web App:** HTML5, CSS3 Glassmorphism, Vanilla JS, Web Crypto API (`crypto.subtle`), Web Audio API.
- **Android App:** Kotlin, Jetpack Compose, Material 3, AndroidX Biometrics, Android Keystore (AES-256-GCM + Argon2id).
- **Extension:** Chromium Manifest V3, Web Crypto HMAC-SHA1, Service Worker background alarms.
- **Hosting:** Vercel Edge Network with strict security headers (no-sniff, deny frame, zero-latency edge rewrites).

---

## 👤 Creator & Maintainer
Created and engineered with pride by **Md. Azahar Ali** ([Shorborno Labs](https://github.com/shorbornolabs)).  
Connect on LinkedIn: [linkedin.com/in/azaharonline24/](https://www.linkedin.com/in/azaharonline24/)

Licensed under the [MIT License](LICENSE).