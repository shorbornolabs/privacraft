/**
 * PrivaCraft - Cryptographically Secure Generation Engine
 * Uses window.crypto.getRandomValues() for all entropy sources.
 */

// Curated EFF/Diceware-inspired memorable wordlist for Passphrase mode (~600 distinct, friendly words)
const WORD_LIST = [
  "acorn", "action", "active", "actor", "admire", "adobe", "aerobic", "afford", "agile", "airport",
  "alaska", "albatross", "alchemy", "alder", "alert", "algebra", "alien", "almanac", "almond", "alpine",
  "amazon", "amber", "ambient", "amethyst", "amplify", "anchor", "android", "angel", "anthem", "antique",
  "apex", "apollo", "apricot", "aqua", "arcade", "archer", "arctic", "arena", "aria", "armor",
  "arrow", "artist", "aspen", "aster", "astral", "atlas", "atom", "aurora", "autumn", "avatar",
  "avocado", "axis", "badger", "balsam", "bamboo", "banner", "bard", "barrel", "basalt", "beacon",
  "beam", "beaver", "banyan", "beetle", "bell", "bison", "blaze", "bloom", "blossom", "blueberry",
  "bold", "bonfire", "bonsai", "boulder", "breeze", "bridge", "brisk", "bronze", "brook", "buffalo",
  "cactus", "cadence", "calm", "canyon", "canvas", "capitol", "carbon", "cardinal", "cascade", "castle",
  "cedar", "celestial", "centaur", "chalet", "champion", "channel", "charcoal", "cheetah", "cherry", "chime",
  "circuit", "citrus", "clarity", "cliff", "clover", "cobalt", "colibri", "comet", "compass", "condor",
  "copper", "coral", "corona", "cosmic", "cosmos", "crag", "crater", "crescent", "crest", "cricket",
  "crimson", "crystal", "cypress", "dancer", "daring", "dawn", "daybreak", "delta", "density", "dewdrop",
  "diamond", "diver", "dolphin", "dragon", "drift", "dynamo", "eagle", "earth", "echo", "eclipse",
  "ember", "emerald", "engine", "enigma", "epoch", "equinox", "essence", "eternal", "eureka", "everest",
  "falcon", "feather", "feline", "fern", "fiesta", "filament", "finch", "fir", "firefly", "fjord",
  "flame", "flint", "flora", "flow", "forest", "fountain", "fox", "galaxy", "galway", "garnet",
  "gateway", "gazelle", "gecko", "gemini", "genesis", "geyser", "glacier", "glade", "glimmer", "glowing",
  "gold", "granite", "gravity", "grove", "gull", "harbor", "haven", "hawk", "hazel", "helix",
  "heron", "horizon", "humming", "hunter", "hydra", "hyper", "ibex", "iceberg", "igloo", "impact",
  "indigo", "infinity", "island", "jaguar", "jasper", "javelin", "jovian", "journey", "jungle", "jupiter",
  "karma", "kepler", "kinetic", "kingdom", "kite", "kiwi", "koala", "krypton", "lagoon", "lantern",
  "lark", "laser", "laurel", "legend", "lemur", "leopard", "liberty", "lichen", "lightning", "lilac",
  "lime", "linen", "lion", "lotus", "lumen", "lunar", "lynx", "magma", "magnet", "magnolia",
  "mammoth", "mango", "mantis", "maple", "marathon", "marble", "marina", "matrix", "meadow", "melody",
  "mercury", "mesa", "meteor", "midnight", "mimosa", "mirage", "monarch", "moon", "morning", "mountain",
  "nebula", "nectar", "nemesis", "neon", "neptune", "nest", "neutron", "nexus", "night", "ninja",
  "nitrogen", "noble", "nomad", "north", "nova", "nucleus", "oasis", "obsidian", "ocean", "octave",
  "olive", "omega", "onyx", "opal", "optics", "orbit", "orchid", "orion", "osprey", "oxygen",
  "pacific", "palace", "palette", "palm", "panther", "papaya", "passage", "passport", "peak", "pebble",
  "pelican", "pendulum", "penguin", "peregrine", "phantom", "phoenix", "photon", "pinnacle", "pioneer", "planet",
  "plasma", "platinum", "plover", "polar", "polaris", "pollen", "polygon", "poplar", "portal", "prairie",
  "prism", "pulsar", "pulse", "puma", "pyramid", "quantum", "quartz", "quasar", "quest", "quiver",
  "radiant", "radon", "rainbow", "ranger", "raptor", "raven", "rayon", "realm", "relic", "resonance",
  "rhino", "ribbon", "ridge", "ripple", "river", "rocket", "rover", "ruby", "saffron", "saga",
  "sail", "sakura", "salmon", "sanctuary", "sapphire", "saturn", "savanna", "scarlet", "scenic", "scout",
  "seaweed", "sensor", "sequoia", "serene", "shadow", "shimmer", "sierra", "signal", "silver", "solstice",
  "sonar", "sparrow", "spectrum", "sphere", "sphinx", "spider", "spiral", "spirit", "spring", "spruce",
  "starlight", "stellar", "stream", "summit", "sunburst", "supernova", "surge", "swallow", "swan", "swift",
  "symmetry", "syntax", "system", "taiga", "talon", "tapestry", "tarmac", "tempo", "tensor", "terrace",
  "thermal", "thunder", "tiger", "timber", "titan", "topaz", "tornado", "torus", "trail", "transit",
  "trellis", "tropic", "tulip", "tundra", "twilight", "typhoon", "ultra", "umbra", "universe", "uranium",
  "valley", "vapor", "vector", "velocity", "venus", "verdant", "vessel", "vibrant", "vigil", "violet",
  "viper", "vision", "vortex", "voyager", "walrus", "wander", "warden", "wave", "whisper", "willow",
  "wind", "winter", "wizard", "wolf", "wombat", "wren", "xenon", "yacht", "zenith", "zephyr", "zodiac"
];

// Character sets
const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

// Characters that look alike or are easily confused in some fonts
const AMBIGUOUS_CHARS = new Set(["1", "l", "I", "|", "0", "O", "o", "8", "B", "'", "\"", "`", ";", ":"]);

/**
 * Returns a cryptographically secure random integer in range [0, max - 1].
 * Uses rejection sampling to eliminate modulo bias.
 */
function secureRandomInt(max) {
  if (max <= 1) return 0;
  const range = 0x100000000; // 2^32
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);

  let rand;
  do {
    window.crypto.getRandomValues(buffer);
    rand = buffer[0];
  } while (rand >= limit);

  return rand % max;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm powered by CSPRNG.
 */
function secureShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates a random secure password with given criteria.
 */
function generatePassword(options = {}) {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeAmbiguous = false,
    customSymbols = ""
  } = options;

  let activeSets = [];
  let guaranteedChars = [];

  // Filter sets based on ambiguous exclusion
  const filterSet = (setStr) => {
    if (!excludeAmbiguous) return setStr;
    return setStr.split("").filter(c => !AMBIGUOUS_CHARS.has(c)).join("");
  };

  if (uppercase) {
    const s = filterSet(CHAR_SETS.uppercase);
    if (s.length > 0) {
      activeSets.push(s);
      guaranteedChars.push(s[secureRandomInt(s.length)]);
    }
  }

  if (lowercase) {
    const s = filterSet(CHAR_SETS.lowercase);
    if (s.length > 0) {
      activeSets.push(s);
      guaranteedChars.push(s[secureRandomInt(s.length)]);
    }
  }

  if (numbers) {
    const s = filterSet(CHAR_SETS.numbers);
    if (s.length > 0) {
      activeSets.push(s);
      guaranteedChars.push(s[secureRandomInt(s.length)]);
    }
  }

  if (symbols) {
    const symBase = customSymbols.trim().length > 0 ? customSymbols.trim() : CHAR_SETS.symbols;
    const s = filterSet(symBase);
    if (s.length > 0) {
      activeSets.push(s);
      guaranteedChars.push(s[secureRandomInt(s.length)]);
    }
  }

  // Fallback if everything is deselected
  if (activeSets.length === 0) {
    const fallback = CHAR_SETS.lowercase;
    activeSets.push(fallback);
    guaranteedChars.push(fallback[secureRandomInt(fallback.length)]);
  }

  const combinedPool = activeSets.join("");
  const passwordChars = [...guaranteedChars];

  // Fill remaining characters
  while (passwordChars.length < length) {
    passwordChars.push(combinedPool[secureRandomInt(combinedPool.length)]);
  }

  // Trim if requested length was shorter than number of active sets
  const sliced = passwordChars.slice(0, length);
  secureShuffle(sliced);

  return sliced.join("");
}

/**
 * Generates a memorable Diceware-style passphrase.
 */
function generatePassphrase(options = {}) {
  const {
    wordsCount = 4,
    separator = "-",
    capitalize = "title", // 'title', 'upper', 'lower'
    includeNumber = true
  } = options;

  const chosenWords = [];
  for (let i = 0; i < wordsCount; i++) {
    const word = WORD_LIST[secureRandomInt(WORD_LIST.length)];
    let formatted = word;

    if (capitalize === "title") {
      formatted = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else if (capitalize === "upper") {
      formatted = word.toUpperCase();
    } else {
      formatted = word.toLowerCase();
    }

    chosenWords.push(formatted);
  }

  if (includeNumber) {
    const num = secureRandomInt(90) + 10; // 2-digit number (10-99)
    const pos = secureRandomInt(chosenWords.length);
    chosenWords[pos] += num;
  }

  let sep = separator;
  if (separator === "space") sep = " ";
  if (separator === "none") sep = "";

  return chosenWords.join(sep);
}

/**
 * Generates a secure numeric PIN code.
 */
function generatePIN(options = {}) {
  const { length = 6 } = options;
  const digits = [];
  for (let i = 0; i < length; i++) {
    digits.push(secureRandomInt(10));
  }
  return digits.join("");
}

/**
 * Generates a batch of passwords according to mode.
 */
function generateBulk(count = 5, mode = "password", options = {}) {
  const list = [];
  for (let i = 0; i < count; i++) {
    if (mode === "passphrase") {
      list.push(generatePassphrase(options));
    } else if (mode === "pin") {
      list.push(generatePIN(options));
    } else {
      list.push(generatePassword(options));
    }
  }
  return list;
}

// Export for module or global extension use
window.PrivaCraftGenerator = {
  generatePassword,
  generatePassphrase,
  generatePIN,
  generateBulk,
  WORD_LIST_SIZE: WORD_LIST.length
};
window.PassCraftGenerator = window.PrivaCraftGenerator;
