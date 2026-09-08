/**
 * PrivaCraft - Standalone Offline QR Code Generator
 * Generates an SVG representation of standard QR Code for instant mobile scanning.
 * Zero external network calls, 100% private and CSP compliant.
 */

(function () {
  // Minimalist QR Code implementation supporting byte encoding mode
  // Ported & optimized from Nayuki's robust public domain QR Code algorithm

  function QrCode(version, errorCorrectionLevel, dataModules, isFunction) {
    this.version = version;
    this.size = version * 4 + 17;
    this.modules = [];
    this.isFunction = isFunction;

    for (let y = 0; y < this.size; y++) {
      this.modules.push(dataModules[y].slice());
    }
  }

  QrCode.prototype.getModule = function (x, y) {
    if (0 <= x && x < this.size && 0 <= y && y < this.size) {
      return this.modules[y][x];
    }
    return false;
  };

  QrCode.prototype.toSvgString = function (border = 4, lightColor = "#ffffff", darkColor = "#0f172a") {
    const sizeWithBorder = this.size + border * 2;
    let parts = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sizeWithBorder} ${sizeWithBorder}" shape-rendering="crispEdges">`);
    parts.push(`<rect width="100%" height="100%" fill="${lightColor}" rx="1"/>`);
    
    let path = "";
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.getModule(x, y)) {
          path += `M${x + border},${y + border}h1v1h-1z `;
        }
      }
    }
    parts.push(`<path d="${path}" fill="${darkColor}"/>`);
    parts.push(`</svg>`);
    return parts.join("");
  };

  // Compact encoder implementation for passwords (lengths up to 80 chars)
  // Galois Field and Reed-Solomon generator
  const GF256_EXP = new Uint8Array(512);
  const GF256_LOG = new Uint8Array(256);
  (function initGf() {
    let val = 1;
    for (let i = 0; i < 255; i++) {
      GF256_EXP[i] = val;
      GF256_EXP[i + 255] = val;
      GF256_LOG[val] = i;
      val = (val << 1) ^ (val >= 128 ? 0x11d : 0);
    }
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
  }

  function rsComputeRemainder(data, numEcWords) {
    const genPoly = [1];
    for (let i = 0; i < numEcWords; i++) {
      const root = GF256_EXP[i];
      const nextGen = new Array(genPoly.length + 1).fill(0);
      for (let j = 0; j < genPoly.length; j++) {
        nextGen[j] ^= gfMul(genPoly[j], root);
        nextGen[j + 1] ^= genPoly[j];
      }
      genPoly.splice(0, genPoly.length, ...nextGen);
    }

    const result = new Array(numEcWords).fill(0);
    for (let b of data) {
      const factor = b ^ result.shift();
      result.push(0);
      for (let i = 0; i < numEcWords; i++) {
        result[i] ^= gfMul(genPoly[i], factor);
      }
    }
    return result;
  }

  // Version table capacities for Low error correction (byte mode)
  const VERSION_CAPACITIES = [
    { version: 1, totalWords: 26, ecWords: 7, dataWords: 19 },
    { version: 2, totalWords: 44, ecWords: 10, dataWords: 34 },
    { version: 3, totalWords: 70, ecWords: 15, dataWords: 55 },
    { version: 4, totalWords: 100, ecWords: 20, dataWords: 80 },
    { version: 5, totalWords: 134, ecWords: 26, dataWords: 108 }
  ];

  function encodeQrText(text) {
    const utf8Bytes = [];
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i);
      if (code < 0x80) utf8Bytes.push(code);
      else if (code < 0x800) {
        utf8Bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else {
        utf8Bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }

    let targetVer = null;
    for (let item of VERSION_CAPACITIES) {
      // 4 bits mode + 8 bits count + data
      if (utf8Bytes.length + 2 <= item.dataWords) {
        targetVer = item;
        break;
      }
    }
    if (!targetVer) targetVer = VERSION_CAPACITIES[VERSION_CAPACITIES.length - 1];

    // Build bit buffer
    const bits = [];
    function putBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
    }

    // Byte mode indicator: 0100
    putBits(0b0100, 4);
    putBits(utf8Bytes.length, 8);
    for (let b of utf8Bytes) putBits(b, 8);

    // Terminator
    const dataCapacityBits = targetVer.dataWords * 8;
    for (let i = 0; i < 4 && bits.length < dataCapacityBits; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    // Pad bytes
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length < dataCapacityBits) {
      putBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Convert bits to data words
    const dataWords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let word = 0;
      for (let j = 0; j < 8; j++) word = (word << 1) | bits[i + j];
      dataWords.push(word);
    }

    const ecWords = rsComputeRemainder(dataWords, targetVer.ecWords);
    const finalCodewords = dataWords.concat(ecWords);

    // Build matrix
    const size = targetVer.version * 4 + 17;
    const modules = Array.from({ length: size }, () => new Array(size).fill(false));
    const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

    function setFunctionModule(x, y, isDark) {
      modules[y][x] = isDark;
      isFunction[y][x] = true;
    }

    function drawFinder(ox, oy) {
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const x = ox + dx;
          const y = oy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) {
            const dist = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
            setFunctionModule(x, y, dist !== 2 && dist <= 3);
          }
        }
      }
    }

    // Draw finder patterns
    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    // Timing patterns
    for (let i = 0; i < size; i++) {
      if (!isFunction[6][i]) setFunctionModule(i, 6, i % 2 === 0);
      if (!isFunction[i][6]) setFunctionModule(6, i, i % 2 === 0);
    }

    // Dark module
    setFunctionModule(8, size - 8, true);

    // Reserve format bits
    for (let i = 0; i < 9; i++) {
      if (!isFunction[8][i]) setFunctionModule(i, 8, false);
      if (!isFunction[i][8]) setFunctionModule(8, i, false);
    }
    for (let i = size - 8; i < size; i++) {
      if (!isFunction[8][i]) setFunctionModule(i, 8, false);
      if (!isFunction[i][8]) setFunctionModule(8, i, false);
    }

    // Populate data with mask pattern 0: (x + y) % 2 === 0
    let bitIndex = 0;
    let totalBits = finalCodewords.length * 8;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;

          if (!isFunction[y][x] && bitIndex < totalBits) {
            const byteVal = finalCodewords[Math.floor(bitIndex / 8)];
            const bit = ((byteVal >>> (7 - (bitIndex % 8))) & 1) !== 0;
            const mask = (x + y) % 2 === 0;
            modules[y][x] = bit ^ mask;
            bitIndex++;
          }
        }
      }
    }

    // Format info bits for Low Error Correction + Mask 0
    // Format codeword for L-0: 0x77c4
    const formatBits = [0,1,1,1,0,1,1,1,1,1,0,0,0,1,0];
    for (let i = 0; i < 6; i++) modules[8][i] = Boolean(formatBits[i]);
    modules[8][7] = Boolean(formatBits[6]);
    modules[8][8] = Boolean(formatBits[7]);
    modules[7][8] = Boolean(formatBits[8]);
    for (let i = 9; i < 15; i++) modules[14 - i][8] = Boolean(formatBits[i]);

    for (let i = 0; i < 8; i++) modules[size - 1 - i][8] = Boolean(formatBits[i]);
    for (let i = 8; i < 15; i++) modules[8][size - 15 + i] = Boolean(formatBits[i]);

    return new QrCode(targetVer.version, "L", modules, isFunction);
  }

  window.PrivaCraftQR = {
    generateSvg: function (text) {
      if (!text) return "";
      try {
        const qr = encodeQrText(text);
        return qr.toSvgString(3, "#ffffff", "#0b0d13");
      } catch (err) {
        console.error("QR Generation error:", err);
        return "";
      }
    }
  };
  window.PassCraftQR = window.PrivaCraftQR;
})();
