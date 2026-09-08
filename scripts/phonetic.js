/**
 * PrivaCraft - NATO & Universal Phonetic Translation Engine
 * Translates passwords into clear phonetic dictation terms.
 */

const PHONETIC_MAP = {
  // Uppercase
  A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo",
  F: "Foxtrot", G: "Golf", H: "Hotel", I: "India", J: "Juliett",
  K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar",
  P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango",
  U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee", Z: "Zulu",

  // Lowercase (differentiated for clear reading)
  a: "alpha", b: "bravo", c: "charlie", d: "delta", e: "echo",
  f: "foxtrot", g: "golf", h: "hotel", i: "india", j: "juliett",
  k: "kilo", l: "lima", m: "mike", n: "november", o: "oscar",
  p: "papa", q: "quebec", r: "romeo", s: "sierra", t: "tango",
  u: "uniform", v: "victor", w: "whiskey", x: "x-ray", y: "yankee", z: "zulu",

  // Digits
  "0": "Zero", "1": "One", "2": "Two", "3": "Three", "4": "Four",
  "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine",

  // Special Characters
  "!": "Exclamation (!)",
  "@": "At (@)",
  "#": "Hash / Pound (#)",
  "$": "Dollar ($)",
  "%": "Percent (%)",
  "^": "Caret (^)",
  "&": "Ampersand (&)",
  "*": "Asterisk (*)",
  "(": "Open Paren ( )",
  ")": "Close Paren ( )",
  "-": "Hyphen / Minus (-)",
  "_": "Underscore (_)",
  "=": "Equals (=)",
  "+": "Plus (+)",
  "[": "Open Bracket [",
  "]": "Close Bracket ]",
  "{": "Open Brace {",
  "}": "Close Brace }",
  "|": "Pipe (|)",
  "\\": "Backslash (\\)",
  "/": "Slash (/)",
  ":": "Colon (:)",
  ";": "Semicolon (;)",
  "\"": "Quote (\")",
  "'": "Apostrophe (')",
  "<": "Less-than (<)",
  ">": "Greater-than (>)",
  ",": "Comma (,)",
  ".": "Dot / Period (.)",
  "?": "Question mark (?)",
  "~": "Tilde (~)",
  "`": "Backtick (`)"
};

/**
 * Returns an array of objects: { char, phonetic, type: 'upper'|'lower'|'digit'|'symbol' }
 */
function getPhoneticBreakdown(password) {
  if (!password) return [];
  const result = [];

  for (let i = 0; i < password.length; i++) {
    const char = password[i];
    let type = "symbol";
    if (/[A-Z]/.test(char)) type = "upper";
    else if (/[a-z]/.test(char)) type = "lower";
    else if (/[0-9]/.test(char)) type = "digit";

    const phonetic = PHONETIC_MAP[char] || char;
    result.push({
      char,
      phonetic,
      type
    });
  }

  return result;
}

/**
 * Formats phonetic breakdown as a readable dictation string.
 */
function getPhoneticDictationString(password) {
  const breakdown = getPhoneticBreakdown(password);
  return breakdown.map(item => {
    if (item.type === "upper") return `UPPER-${item.phonetic}`;
    return item.phonetic;
  }).join(" • ");
}

window.PrivaCraftPhonetic = {
  getPhoneticBreakdown,
  getPhoneticDictationString
};
window.PassCraftPhonetic = window.PrivaCraftPhonetic;
