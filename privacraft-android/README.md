# PrivaCraft for Android (Native Jetpack Compose)

[![Android](https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-7F52FF?logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/UI-Jetpack%20Compose-4285F4?logo=jetpackcompose&logoColor=white)](https://developer.android.com/jetpack/compose)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

**PrivaCraft for Android** brings the full cybersecurity suite from the Chrome Extension to Android mobile devices using 100% native **Kotlin** and **Jetpack Compose**.

---

## 🌟 Features

### 1. ✉️ Disposable Temp Mail
- **10+ Free Domains**: GuerrillaMail (`@sharklasers.com`, `@guerrillamail.com`, `@grr.la`, `@pokemail.net`, `@spam4.me`) and Mail.tm (`@uberip.com`).
- **Live Inbox & Auto-Polling**: Checks for new emails every 5 seconds.
- **Smart OTP Extractor**: Detects 4-to-8 digit verification codes and shows an instant **"Copy OTP"** banner.
- **Lifespan Countdown Timer**: Real-time `MM:SS` countdown timer with a **`+15m`** lifespan extension button.
- **Server-Side Purge**: Permanently destroys mailboxes and messages on the mail server with one tap.

### 2. ⚡ 2FA Live Cyber Authenticator & Vault
- **100% Offline RFC 6238 TOTP Engine**: Computes standard 30-second HMAC-SHA1 tokens locally on device.
- **Animated Circular Countdown Ring**: Dynamic Canvas countdown ring transitioning from Cyan &rarr; Amber &rarr; Red.
- **Split 6-Digit Display**: High-visibility code split (e.g. `[482] • [910]`).
- **Encrypted Local Vault**: Save accounts (GitHub, Google, Binance, Discord) for 1-tap code copying.

### 3. 🔐 Cryptographic Password Studio & Copied History
- **CSPRNG Security**: Uniform random generation powered by `java.security.SecureRandom`.
- **Active Password Persistence**: Active password stays preserved across app minimizes and tab navigation.
- **Dedicated Copied Passwords List (Past 10 FIFO)**:
  - Automatically records every password or PIN you copy.
  - Retains past 10 copied passwords (oldest automatically drops when an 11th is copied).
  - 1-tap reveal/hide toggle, 1-tap copy again, individual delete, and "Clear" all.
- **Diceware Passphrases & Numeric PINs**: Memorable words and banking PINs.
- **Live Entropy Analytics**: Bit entropy calculations and brute-force crack time estimates.
- **Password Auditor & Fortifier**: Checks criteria and upgrades weak passwords with 1 tap.
- **NATO Phonetic Dictation**: Spelling breakdown for phone verification.

---

## 📱 How to Open & Run in Android Studio

1. **Open Android Studio** (Ladybug / Iguana or newer).
2. Click **File -> Open...** (or Open on the Welcome Screen).
3. Select the `privacraft-android` folder:
   ```
   c:\Users\imaza\Documents\Gemini-TEMP-CHATS\privacraft-android
   ```
4. Allow Gradle to sync dependencies automatically.
5. Connect your Android device via USB (with Developer Mode and USB Debugging enabled) OR select an Android Virtual Device (AVD Emulator).
6. Click the green **Run (▶)** button (or press `Shift + F10`) to build and launch the app!

---

## 📦 How to Build an APK for Your Phone

In Android Studio:
1. Go to **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
2. When the build completes, click **locate** in the notification pop-up.
3. Transfer the `.apk` file to your Android phone and tap to install!

---

## 📁 Architecture Overview

```
privacraft-android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/shorbornolabs/privacraft/
│   │   │   ├── PrivaCraftApp.kt                # Notification channel initializer
│   │   │   ├── MainActivity.kt                 # Compose Scaffold & Dock navigation
│   │   │   ├── data/
│   │   │   │   ├── model/Models.kt             # TempMailbox, MailMessage, TotpAccount, CopiedPassword
│   │   │   │   └── repository/
│   │   │   │       ├── TempMailRepository.kt   # GuerrillaMail & Mail.tm HTTP engine
│   │   │   │       └── StorageRepository.kt    # Vault, settings & 10-item FIFO copied passwords
│   │   │   ├── domain/
│   │   │   │   ├── PasswordGenerator.kt        # CSPRNG, Diceware, PIN, Entropy & Fortifier
│   │   │   │   ├── TotpEngine.kt               # RFC 6238 Base32 & HMAC-SHA1 30s token calculator
│   │   │   │   └── OtpExtractor.kt             # 4-8 digit OTP regex parser
│   │   │   └── ui/
│   │   │       ├── theme/                      # Glassmorphic Dark Obsidian theme
│   │   │       ├── components/                 # CyberCard, CyberNavDock, AnimatedCircularCountdown
│   │   │       └── screens/
│   │   │           ├── TempMailScreen.kt       # Live inbox, domains, OTP banner & countdown
│   │   │           ├── PasswordScreen.kt       # Generator, strength meter & copied passwords list
│   │   │           └── TotpScreen.kt           # Circular countdown ring, split code & vault
│   │   └── res/                                # Launcher icons, strings & themes
│   └── build.gradle.kts
└── settings.gradle.kts
```

---

## 📄 License
This mobile project is open source under the [MIT License](../LICENSE).
