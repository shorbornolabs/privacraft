# PrivaCraft — Temp Mail, 2FA Vault & Password Studio

[![Live Overview](https://img.shields.io/badge/Overview%20Page-Interactive%20Suite-00f0ff?logo=html5&logoColor=white)](overview-page/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshorbornolabs%2Fprivacraft&root-directory=overview-page)
[![Chrome Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-blue?logo=googlechrome&logoColor=white)](extension/)
[![Android App](https://img.shields.io/badge/Android-Jetpack%20Compose-3DDC84?logo=android&logoColor=white)](privacraft-android/)
[![Download APK](https://img.shields.io/badge/Release-PrivaCraft--v1.0.1.apk-orange?logo=android&logoColor=white)](https://github.com/shorbornolabs/privacraft/releases/latest)
[![Creator LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/azaharonline24/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Privacy: Zero Tracking](https://img.shields.io/badge/Privacy-Zero%20Tracking-green)](PRIVACY_POLICY.md)
[![Memory: 0--RAM Idle](https://img.shields.io/badge/Memory-0%20RAM%20Idle-purple)]()

**PrivaCraft** is a modern, privacy-first open-source security suite combining three essential cybersecurity tools into both a high-performance **Chromium browser extension** and a native **Android mobile app**:

1. ✉️ **Disposable Temp Mail** with real-time inboxes, custom domain picker, and instant OTP verification code extraction.
2. ⚡ **2FA Live Cyber Authenticator** with dynamic 30-second animated circular ring, split code display, and encrypted local vault.
3. 🔐 **Cryptographic Password Studio** with session persistence, entropy analysis, Diceware passphrases, and a **10-item copied passwords list**.

---

## 📥 Direct Downloads & Project Quick Links

| Platform | Location | Description |
|:---|:---|:---|
| 💻 **Browser Extension** | [`extension/`](extension/) | Manifest V3 extension for Chrome, Brave, Edge, Opera & Kiwi |
| 📱 **Android APK (Direct Download)** | [**Download PrivaCraft-v1.0.1.apk**](https://github.com/shorbornolabs/privacraft/releases/download/v1.0.1/PrivaCraft-v1.0.1.apk) | Pre-compiled, signed offline release APK (v1.0.1 &bull; API 36) |
| 🏷️ **GitHub Release** | [**v1.0.1 Release (Latest)**](https://github.com/shorbornolabs/privacraft/releases/latest) | Official release notes & verified asset binary |
| 🤖 **Android Source Code** | [`privacraft-android/`](privacraft-android/) | Full Android Studio project (Kotlin + Jetpack Compose) |
| 👨‍💻 **Creator Profile** | [**LinkedIn Profile**](https://www.linkedin.com/in/azaharonline24/) | Connect with the creator on LinkedIn |

---

## 📸 Interface Preview

<div align="center">

| ✉️ Disposable Temp Mail | 🔐 Password Studio & Copied List | ⚡ 2FA Live Authenticator |
|:---:|:---:|:---:|
| <img src="screenshots/temp-mail.png" width="250" alt="PrivaCraft Temp Mail View" /> | <img src="screenshots/password-studio.png" width="250" alt="PrivaCraft Password Studio View" /> | <img src="screenshots/2fa-authenticator.png" width="250" alt="PrivaCraft 2FA Live Authenticator" /> |
| *10+ Free Domains, Live Inbox & OTP Extractor* | *CSPRNG Generator & Copied Passwords List* | *RFC 6238 TOTP Engine & Cyber Countdown* |

</div>

---

## 🌟 Key Features

### 1. Disposable Temporary Email (Default View)
- **10+ Free Domains**: Switch seamlessly across GuerrillaMail (`@sharklasers.com`, `@guerrillamail.com`, `@grr.la`, `@pokemail.net`, `@spam4.me`) and Mail.tm (`@uberip.com`).
- **Touch-Friendly Controls**: Ergonomic, full-width domain selector with large **`[ 🔄 Reload ]`** and **`[ 🗑️ Delete/Change ]`** action buttons.
- **Survival Countdown Timer**: Live `MM:SS` timer showing mailbox lifespan with a **`+15m`** quick extension button.
- **Smart OTP & Link Extractor**: Scans incoming verification emails and displays a prominent **"Copy Verification Code"** banner and 1-click link button.
- **1-Click Webpage Autofill** *(Extension)*: Injects your temporary email address straight into active web sign-up inputs.
- **Clean Mailbox Destruction**: Discarding or changing domains triggers server-side deletion (`del_email` and `DELETE /accounts/{id}`) to eliminate ghost inboxes.

### 2. Futuristic 2FA Live Authenticator
- **Replaces Insecure Web Tools**: Eliminate the security risk of pasting 2FA secret keys into public third-party sites like `2fa.live` or `2fa.cn`.
- **Animated Circular Ring**: Dynamic SVG / Canvas countdown ring with color warning transitions (Cyan &rarr; Amber &rarr; Pulsing Red).
- **Cyber Split Code Display**: High-visibility split 6-digit display (e.g. `[482] • [910]`) with 1-click clipboard copy.
- **Encrypted Local Vault**: Save frequently used 2FA keys (GitHub, Google, Binance, Discord) for instant access.
- **1-Click Autofill** *(Extension)*: Automatically fills 6-digit 2FA codes into active login fields.
- **100% Offline Computation**: RFC 6238 Web Crypto & Android Crypto HMAC-SHA1 engine with zero network calls.

### 3. Password Studio & Auditor
- **CSPRNG Strength**: Built on cryptographic random generators (`window.crypto.getRandomValues()` / `java.security.SecureRandom`).
- **Flicker-Free Smooth Controls**: Responsive, smooth slider with instant entropy feedback and stable layout.
- **Recent Copied Passwords List (Past 10 FIFO)**:
  - Automatically records copied passwords directly below the generator.
  - Keeps your **past 10 copied passwords** (oldest automatically drops when an 11th is copied).
  - 1-click reveal/hide eye toggle, 1-click re-copy, single item delete, and "Clear" button.
- **Memorable Passphrases & Numeric PINs**: Diceware dictionary phrases and banking PINs.
- **Real-Time Entropy Analytics**: Exact bits of entropy and brute-force crack time estimates.
- **Password Auditor**: Interactive weakness checklist with a 1-click **"Fortify"** auto-fixer.
- **NATO Phonetic Spelling Guide**: Audio/voice breakdown for phone verification (e.g. `UPPER-Kilo • Nine • Hash • Mike`).
- **Wi-Fi QR Code Generator**: Generate offline QR codes to instantly share Wi-Fi credentials.

---

## 💻 Chrome Extension Installation Guide (Step-by-Step for Normal Users)

You can install PrivaCraft in **Google Chrome**, **Microsoft Edge**, **Brave**, **Opera**, or mobile Chromium browsers like **Kiwi Browser**:

### Step 1: Download the Project
1. Scroll up to the top of this GitHub repository page.
2. Click the green **`<> Code`** button and select **`Download ZIP`**.
3. Extract (unzip) the downloaded ZIP archive to any folder on your computer.

### Step 2: Open Extensions in your Browser
- In **Chrome**: type `chrome://extensions` in the address bar and press **Enter**.
- In **Brave**: type `brave://extensions` in the address bar.
- In **Edge**: type `edge://extensions` in the address bar.

### Step 3: Enable Developer Mode
Look in the **top-right corner** of the Extensions page and toggle the **"Developer mode"** switch to **ON**.

### Step 4: Load the Extension
1. Look in the **top-left corner** and click the **"Load unpacked"** button.
2. In the folder picker window, navigate to your extracted folder and select the **`extension`** subfolder (the folder containing `manifest.json`).
3. Click **Select Folder**.

### Step 5: Pin for Quick Access
1. Click the **Puzzle Piece icon** 🧩 in your browser toolbar (next to your profile icon).
2. Click the **Pin icon** 📌 next to **PrivaCraft**.
3. You now have 1-click access to Temp Mail, 2FA codes, and Passwords!

> **Note on Updating**: Whenever a new update is released, simply download the new files, replace the `extension` folder, and click the circular **Reload** icon on the extension card in `chrome://extensions`.

---

## 📱 Android APK Installation & Google Play Protect Guide

PrivaCraft is distributed directly as an independent open-source APK so you don't need Google Play Services or Play Store accounts.

### Step 1: Download the APK
Download the APK file directly to your Android phone or tablet:
- 🚀 **Direct APK Download**: [**PrivaCraft-v1.0.0.apk**](https://github.com/shorbornolabs/privacraft/releases/download/v1.0.0/PrivaCraft-v1.0.0.apk)
- 🏷️ **GitHub Release Page**: [**View Release v1.0.0**](https://github.com/shorbornolabs/privacraft/releases/tag/v1.0.0)
- 📦 **Local Repository Links**: [**`PrivaCraft.apk`**](PrivaCraft.apk) or [**`release/PrivaCraft-v1.0.0.apk`**](release/PrivaCraft-v1.0.0.apk)

### Step 2: Allow Installation of Unknown Apps
1. Open your device's **Downloads** folder (or browser download notification) and tap **`PrivaCraft-v1.0.0.apk`** (or `PrivaCraft.apk`).
2. If Android displays a prompt saying:
   > *"For your security, your phone is not allowed to install unknown apps from this source"*
3. Tap **Settings** on the prompt.
4. Turn **ON** the toggle switch next to **"Allow from this source"**.
5. Tap the **Back** arrow to return to the installer.

### Step 3: Google Play Protect / Android Safety Guard Walkthrough
Because PrivaCraft is an open-source application distributed outside the commercial Google Play Store, **Google Play Protect** may show an alert:

> *"Blocked by Play Protect"* or *"Play Protect doesn't recognize this app's developer"*

#### Why does this alert appear?
Google Play Protect automatically flags apps that are not registered through Google's commercial developer console. PrivaCraft is **100% open-source**, contains **zero trackers**, **zero ads**, and **zero external telemetry**. You can verify every single line of code in this repository!

#### How to proceed:
1. When the Play Protect warning appears, look at the bottom of the dialog.
2. Tap **"More details"** (or the small down arrow ⌄).
3. Tap **"Install anyway"** (or *"Install without scanning"*).
4. Wait a few seconds for installation to complete.
5. Tap **Open** and enjoy private, offline-ready security tools!

---

## 📁 Repository Directory Structure

The repository is organized into distinct, clean subdirectories:

```text
privacraft/
├── extension/                        # Complete Chrome / Chromium Manifest V3 Extension
│   ├── manifest.json                 # Extension configuration & permissions
│   ├── popup.html                    # Main UI popup & 3-option navigation dock
│   ├── offscreen.html                # Offscreen document for Web Audio chimes
│   ├── styles/
│   │   └── popup.css                 # Dark glassmorphism & responsive CSS
│   ├── scripts/
│   │   ├── generator.js              # CSPRNG password & Diceware engine
│   │   ├── strength.js               # Entropy analytics & fortifier
│   │   ├── totp.js                   # RFC 6238 TOTP Web Crypto engine
│   │   ├── tempmail.js               # Multi-provider Temp Mail engine
│   │   ├── background.js             # Alarms & background notification worker
│   │   ├── offscreen.js              # Synthesized Web Audio chime player
│   │   ├── storage.js                # Local persistence (past 10 copied passwords, 2FA vault)
│   │   ├── popup.js                  # Controller, animations & webpage autofill
│   │   ├── qr.js                     # Offline SVG QR generator
│   │   ├── phonetic.js               # NATO phonetic dictionary
│   │   └── audio.js                  # Web Audio sound effects
│   ├── icons/                        # High-res extension icons (16px, 48px, 128px)
│   ├── generate_icons.py             # Script to regenerate icon PNGs
│   └── package_extension.py          # Store packager script (creates .zip)
│
├── privacraft-android/               # Complete Native Android Studio Project
│   ├── app/                          # Main Android application module
│   │   ├── src/main/java/...         # Kotlin Jetpack Compose UI, ViewModels & Repos
│   │   ├── src/main/res/...          # Vector drawables, themes, colors, launcher icons
│   │   └── build.gradle.kts          # App dependencies & build configuration
│   ├── gradle/                       # Gradle wrapper binaries
│   ├── gradlew / gradlew.bat         # CLI Gradle wrappers
│   ├── build.gradle.kts              # Root build script
│   ├── settings.gradle.kts           # Module definitions
│   └── README.md                     # Android-specific developer documentation
│
├── release/                          # Pre-compiled Release Binaries
│   └── PrivaCraft-v1.0.0.apk         # Verified installable release APK
│
├── screenshots/                      # Interface preview screenshots
│   ├── temp-mail.png
│   ├── password-studio.png
│   └── 2fa-authenticator.png
│
├── PrivaCraft.apk                    # Root quick-download release APK
├── CHROMEWEBSTORE.md                 # Chrome Web Store metadata & promotional copy
├── PRIVACY_POLICY.md                 # Official Zero-Telemetry Privacy Policy
├── LICENSE                           # MIT License
└── README.md                         # Complete project documentation (You are here)
```

---

## 🛠️ Building from Source (For Developers)

### 1. Packaging the Chrome Extension
To create a clean `.zip` archive ready for the Chrome Web Store:
```bash
cd extension
python package_extension.py
```
This generates `privacraft-v1.0.0.zip` with test files and development scripts excluded.

### 2. Building the Android App
Open the `privacraft-android/` folder in **Android Studio (Ladybug or newer)**, or build via command line:
```bash
cd privacraft-android
./gradlew assembleRelease
```
The output APK will be generated at `app/build/outputs/apk/release/app-release-unsigned.apk`.

---

## 🔒 Security & Privacy Model

- **No Remote Servers or Tracking**: PrivaCraft operates entirely on your device with no third-party analytics or telemetry.
- **Local Sandbox Storage**: Settings, 2FA keys, and copied password history are stored exclusively in local sandboxed storage (`chrome.storage.local` on Chrome, Jetpack DataStore on Android).
- **Strict Content Security Policy**: Zero inline scripts, zero `eval()`, and zero dynamic remote code loading.
- Read our full [Privacy Policy](PRIVACY_POLICY.md).

---

## 👨‍💻 Creator & Maintainer

PrivaCraft is created and actively maintained by **Md. Azahar Ali** ([@shorbornolabs](https://github.com/shorbornolabs)).

- 💼 **LinkedIn**: [linkedin.com/in/azaharonline24](https://www.linkedin.com/in/azaharonline24/)
- 🌐 **GitHub**: [github.com/shorbornolabs](https://github.com/shorbornolabs)

[![Connect on LinkedIn](https://img.shields.io/badge/LinkedIn-Connect%20on%20LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/azaharonline24/)

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
