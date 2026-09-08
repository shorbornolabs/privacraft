/**
 * PrivaCraft - Password Strength & Cryptographic Entropy Analyzer
 */

/**
 * Calculates theoretical information entropy in bits.
 */
function calculateEntropy(password, mode = "password", options = {}) {
  if (!password || password.length === 0) {
    return 0;
  }

  if (mode === "passphrase") {
    const words = password.split(/[-_.\s/]/).filter(Boolean);
    const wordCount = words.length || options.wordsCount || 4;
    const generator = window.PrivaCraftGenerator || window.PassCraftGenerator;
    const dictionarySize = generator?.WORD_LIST_SIZE || 600;
    let entropy = wordCount * Math.log2(dictionarySize);

    if (/\d/.test(password)) {
      entropy += Math.log2(90); // 2-digit number added
    }
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
      entropy += wordCount * 1.0; // Case variation per word
    }
    return Math.round(entropy * 10) / 10;
  }

  if (mode === "pin") {
    return Math.round(password.length * Math.log2(10) * 10) / 10;
  }

  // Password mode: determine effective character pool
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) poolSize = 26;

  const entropy = password.length * Math.log2(poolSize);
  return Math.round(entropy * 10) / 10;
}

/**
 * Estimates brute-force crack time against a high-speed GPU cluster (100 Billion hashes/sec).
 */
function estimateCrackTime(entropy) {
  if (entropy <= 0) return "Instant";
  if (entropy < 28) return "Instant";

  // Average guesses needed = 2^(entropy - 1)
  // Hashes per second for an offline brute-force rig = 10^11
  const HASHES_PER_SEC = 1e11;
  const seconds = Math.pow(2, entropy - 1) / HASHES_PER_SEC;

  if (seconds < 0.01) return "Instant";
  if (seconds < 1) return "< 1 second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 86400 * 30) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / (86400 * 30))} months`;

  const years = seconds / (86400 * 365.25);
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${Math.round(years / 1000).toLocaleString()} thousand years`;
  if (years < 1e9) return `${Math.round(years / 1e6).toLocaleString()} million years`;
  if (years < 1e12) return `${Math.round(years / 1e9).toLocaleString()} billion years`;
  return "Centuries (Unbreakable)";
}

/**
 * Returns overall strength score (0-100), visual tier, description, and checklist.
 */
function analyzeStrength(password, mode = "password", options = {}) {
  const entropy = calculateEntropy(password, mode, options);
  const crackTime = estimateCrackTime(entropy);

  // Normalized score 0-100 based on target threshold of 96 bits for maximum strength
  let score = Math.min(100, Math.round((entropy / 96) * 100));

  let tier = "very-weak";
  let label = "Very Weak";
  let color = "#ef4444"; // Red

  if (entropy >= 88) {
    tier = "unbreakable";
    label = "Unbreakable";
    color = "#8b5cf6"; // Violet / Cyber Purple
  } else if (entropy >= 68) {
    tier = "strong";
    label = "Very Strong";
    color = "#10b981"; // Emerald Green
  } else if (entropy >= 50) {
    tier = "moderate";
    label = "Moderate";
    color = "#f59e0b"; // Amber
  } else if (entropy >= 34) {
    tier = "weak";
    label = "Weak";
    color = "#f97316"; // Orange
  }

  // Common weak patterns
  const COMMON_WEAK = [
    "password", "123456", "12345678", "qwerty", "admin", "welcome", "login",
    "iloveyou", "abc123", "secret", "monkey", "dragon", "football", "master"
  ];
  const lowerPwd = password.toLowerCase();
  const isCommon = COMMON_WEAK.some(weak => lowerPwd.includes(weak));
  const hasRepeats = /(.)\1{2,}/.test(password);
  const hasSequence = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i.test(password);

  if (isCommon || hasRepeats || (hasSequence && password.length < 12)) {
    score = Math.max(10, Math.round(score * 0.65));
    if (score < 34) {
      tier = "very-weak";
      label = "Compromised / Weak";
      color = "#ef4444";
    }
  }

  // Criteria checklist
  const criteria = {
    length: password.length >= 14,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^a-zA-Z0-9]/.test(password),
    noRepeats: !hasRepeats,
    noSequence: !hasSequence,
    notCommon: !isCommon
  };

  return {
    entropy,
    crackTime,
    score,
    tier,
    label,
    color,
    criteria
  };
}

/**
 * Transforms a weak password into a fortified, unbreakable version.
 */
function improvePassword(password) {
  const generator = window.PrivaCraftGenerator || window.PassCraftGenerator;
  if (!password) {
    return generator.generatePassword({ length: 18 });
  }

  // Inject symbols and numbers
  const symbols = "!@#$%&*?";
  const randSym = () => symbols[Math.floor(Math.random() * symbols.length)];
  const randNum = () => Math.floor(Math.random() * 90) + 10;

  let enhanced = password;
  // Capitalize first or random letter
  enhanced = enhanced.replace(/^[a-z]/, (c) => c.toUpperCase());

  // Add random symbol and number
  enhanced = `${enhanced}${randSym()}${randNum()}`;

  // If still too short, add a random 4-letter salt
  if (enhanced.length < 16) {
    const salt = generator.generatePassword({
      length: 18 - enhanced.length,
      symbols: true,
      numbers: true
    });
    enhanced = `${enhanced}-${salt}`;
  }

  return enhanced;
}

window.PrivaCraftStrength = {
  calculateEntropy,
  estimateCrackTime,
  analyzeStrength,
  improvePassword
};
window.PassCraftStrength = window.PrivaCraftStrength;
