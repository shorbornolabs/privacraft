/**
 * PrivaCraft - RFC 6238 / RFC 4226 TOTP Engine
 * 100% native Web Crypto implementation (zero external dependencies).
 */

(function () {
  // Standard RFC 4648 Base32 alphabet
  const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  /**
   * Decodes a Base32 string into a Uint8Array.
   * Handles spaces, hyphens, lowercase, and padding.
   */
  function base32ToUint8Array(base32Str) {
    if (!base32Str || typeof base32Str !== "string") {
      throw new Error("Invalid Base32 input");
    }

    // Sanitize input: remove spaces, dashes, and padding
    const cleanStr = base32Str.toUpperCase().replace(/[\s\-_=]/g, "");
    if (cleanStr.length === 0) {
      throw new Error("Empty secret key");
    }

    // Validate characters
    for (let i = 0; i < cleanStr.length; i++) {
      if (!BASE32_CHARS.includes(cleanStr[i])) {
        throw new Error(`Invalid Base32 character: ${cleanStr[i]}`);
      }
    }

    const length = cleanStr.length;
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = new Uint8Array(Math.floor((length * 5) / 8));

    for (let i = 0; i < length; i++) {
      const charIndex = BASE32_CHARS.indexOf(cleanStr[i]);
      value = (value << 5) | charIndex;
      bits += 5;

      if (bits >= 8) {
        output[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }

    return output;
  }

  /**
   * Parses otpauth:// URI or raw secret string into metadata.
   */
  function parseOtpUriOrSecret(input) {
    if (!input || typeof input !== "string") {
      return { secret: "", label: "2FA Account", issuer: "PrivaCraft", digits: 6, period: 30 };
    }

    const trimmed = input.trim();
    if (trimmed.startsWith("otpauth://totp/")) {
      try {
        const url = new URL(trimmed);
        const secret = url.searchParams.get("secret") || "";
        const issuer = url.searchParams.get("issuer") || "";
        const digits = parseInt(url.searchParams.get("digits") || "6", 10);
        const period = parseInt(url.searchParams.get("period") || "30", 10);

        // Path contains [Issuer:]Account
        let label = decodeURIComponent(url.pathname.replace(/^\/totp\/?/, ""));
        if (label.includes(":")) {
          label = label.split(":").slice(1).join(":").trim();
        }

        return {
          secret: secret.replace(/[\s\-_=]/g, "").toUpperCase(),
          label: label || issuer || "2FA Account",
          issuer: issuer || label || "2FA",
          digits: digits || 6,
          period: period || 30
        };
      } catch (err) {
        console.warn("Could not parse as URI, treating as raw secret:", err);
      }
    }

    // Treat as raw secret key
    return {
      secret: trimmed.replace(/[\s\-_=]/g, "").toUpperCase(),
      label: "Live 2FA",
      issuer: "Instant",
      digits: 6,
      period: 30
    };
  }

  /**
   * Generates a TOTP code for a given secret key and timestamp.
   * Uses Web Crypto HMAC-SHA1.
   */
  async function generateTOTP(secretInput, options = {}) {
    const { digits = 6, period = 30, timestamp = Date.now() } = options;
    const epochSeconds = Math.floor(timestamp / 1000);
    const counter = Math.floor(epochSeconds / period);
    const remainingSeconds = period - (epochSeconds % period);
    const progressPercent = ((period - remainingSeconds) / period) * 100;

    let keyBytes;
    try {
      keyBytes = base32ToUint8Array(secretInput);
    } catch (err) {
      return {
        error: err.message,
        token: "------",
        remainingSeconds,
        period,
        progressPercent
      };
    }

    if (keyBytes.length === 0) {
      return {
        error: "Empty secret key",
        token: "------",
        remainingSeconds,
        period,
        progressPercent
      };
    }

    // Build 8-byte big-endian counter buffer
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(0, Math.floor(counter / 0x100000000));
    counterView.setUint32(4, counter & 0xffffffff);

    try {
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: { name: "SHA-1" } },
        false,
        ["sign"]
      );

      const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, counterBuffer);
      const hmacResult = new Uint8Array(signature);

      // Dynamic Truncation (RFC 4226 Section 5.4)
      const offset = hmacResult[hmacResult.length - 1] & 0x0f;
      const binary =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const otp = (binary % Math.pow(10, digits)).toString().padStart(digits, "0");

      return {
        token: otp,
        remainingSeconds,
        period,
        progressPercent,
        error: null
      };
    } catch (err) {
      console.error("TOTP WebCrypto error:", err);
      return {
        error: "WebCrypto HMAC calculation failed",
        token: "------",
        remainingSeconds,
        period,
        progressPercent
      };
    }
  }

  // Export engine
  window.PrivaCraftTOTP = {
    base32ToUint8Array,
    parseOtpUriOrSecret,
    generateTOTP
  };
  window.PassCraftTOTP = window.PrivaCraftTOTP;
})();
