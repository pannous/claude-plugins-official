/* eslint-disable */
/**
 * Background Effects
 * Animated backgrounds for scene atmosphere
 * All functions take (fb, frame, options)
 */
(function() {

// Seeded random for consistent patterns
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const DENSITY_CHARS = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

/**
 * Twinkling stars background
 */
function stars(fb, frame, options = {}) {
  const { density = 0.006, twinkle = true, depth = 100 } = options;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const seed = x * 31 + y * 17;
      const rand = seededRandom(seed);

      if (rand < density) {
        // Twinkle effect based on frame
        const twinkleSeed = seed + Math.floor(frame / 8);
        const isTwinkling = twinkle && seededRandom(twinkleSeed) > 0.7;
        const char = isTwinkling ? '·' : '.';
        fb.setPixel(x, y, char, depth);
      }
    }
  }
}

/**
 * 3D starfield zoom effect
 */
function starfield(fb, frame, options = {}) {
  const { speed = 1, numStars = 50, depth = 100 } = options;
  const centerX = fb.width / 2;
  const centerY = fb.height / 2;
  const aspectRatio = 2.16;

  for (let i = 0; i < numStars; i++) {
    const seed = i * 17;
    // Star position in normalized space (-1 to 1)
    const baseX = seededRandom(seed) * 2 - 1;
    const baseY = seededRandom(seed + 1) * 2 - 1;

    // Z position cycles based on frame
    const z = ((seededRandom(seed + 2) + frame * speed * 0.01) % 1);
    const scale = 1 / (z + 0.1);

    const screenX = Math.floor(centerX + baseX * scale * 20 * aspectRatio);
    const screenY = Math.floor(centerY + baseY * scale * 10);

    if (screenX >= 0 && screenX < fb.width && screenY >= 0 && screenY < fb.height) {
      // Brighter stars closer (lower z)
      const char = z < 0.3 ? '*' : z < 0.6 ? '·' : '.';
      fb.setPixel(screenX, screenY, char, depth);
    }
  }
}

/**
 * Rain effect
 */
function rain(fb, frame, options = {}) {
  const { density = 0.02, speed = 1, char = '|', depth = 100 } = options;

  for (let x = 0; x < fb.width; x++) {
    const columnSeed = x * 31;
    const columnDensity = seededRandom(columnSeed) < density * 10 ? 1 : 0;

    if (columnDensity) {
      const dropSpeed = 0.5 + seededRandom(columnSeed + 1) * speed;
      const offset = Math.floor(frame * dropSpeed);
      const startY = seededRandom(columnSeed + 2) * fb.height;

      for (let len = 0; len < 3; len++) {
        const y = Math.floor((startY + offset + len) % fb.height);
        const dropChar = len === 0 ? char : (len === 1 ? ':' : '.');
        fb.setPixel(x, y, dropChar, depth);
      }
    }
  }
}

/**
 * Snow effect
 */
function snow(fb, frame, options = {}) {
  const { density = 0.01, chars = ['*', '·', '.'], depth = 100 } = options;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const seed = x * 31 + y * 17;
      if (seededRandom(seed) < density) {
        // Gentle falling motion with slight horizontal drift
        const fallSpeed = 0.3 + seededRandom(seed + 1) * 0.3;
        const drift = Math.sin((frame + seed) * 0.1) * 2;
        const offsetY = Math.floor(frame * fallSpeed);
        const offsetX = Math.floor(drift);

        const drawY = (y + offsetY) % fb.height;
        const drawX = ((x + offsetX) % fb.width + fb.width) % fb.width;

        const charIdx = Math.floor(seededRandom(seed + 2) * chars.length);
        fb.setPixel(drawX, drawY, chars[charIdx], depth);
      }
    }
  }
}

/**
 * Fog/mist effect
 */
function fog(fb, frame, options = {}) {
  const { density = 0.3, speed = 0.5, depth = 100 } = options;
  const fogChars = ['.', ':', '.', ' '];

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const seed = x * 31 + y * 17;
      const noise = seededRandom(seed + Math.floor(frame * speed * 0.1));

      if (noise < density) {
        const charIdx = Math.floor(noise / density * fogChars.length);
        fb.setPixel(x, y, fogChars[charIdx], depth);
      }
    }
  }
}

/**
 * Aurora/northern lights effect
 */
function aurora(fb, frame, options = {}) {
  const { intensity = 0.5, depth = 100 } = options;
  const waveChars = ['·', ':', '=', '~', '≈'];

  // Aurora bands at different heights
  const numBands = 3;
  for (let band = 0; band < numBands; band++) {
    const baseY = 2 + band * 3;
    const phaseOffset = band * 2;

    for (let x = 0; x < fb.width; x++) {
      const wave = Math.sin((x + frame * 0.5 + phaseOffset) * 0.1) * 2;
      const y = Math.floor(baseY + wave);

      if (y >= 0 && y < fb.height) {
        const charIdx = Math.floor((Math.sin(x * 0.2 + frame * 0.1) + 1) / 2 * waveChars.length);
        if (seededRandom(x + band * 100 + frame) < intensity) {
          fb.setPixel(x, y, waveChars[charIdx], depth);
        }
      }
    }
  }
}

/**
 * Wave pattern effect
 */
function waves(fb, frame, options = {}) {
  const { amplitude = 2, frequency = 0.1, char = '~', baseY = null, depth = 100 } = options;
  const waveY = baseY !== null ? baseY : Math.floor(fb.height / 2);

  for (let x = 0; x < fb.width; x++) {
    const y = Math.floor(waveY + Math.sin((x + frame) * frequency) * amplitude);
    if (y >= 0 && y < fb.height) {
      fb.setPixel(x, y, char, depth);
    }
  }
}

/**
 * Gradient fill (vertical, horizontal, or radial)
 */
function gradient(fb, options = {}) {
  const { direction = 'vertical', chars = DENSITY_CHARS, depth = 100, invert = false } = options;
  const centerX = fb.width / 2;
  const centerY = fb.height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      let t;
      switch (direction) {
        case 'horizontal':
          t = x / fb.width;
          break;
        case 'radial':
          const dx = x - centerX;
          const dy = y - centerY;
          t = Math.sqrt(dx * dx + dy * dy) / maxDist;
          break;
        case 'vertical':
        default:
          t = y / fb.height;
      }

      if (invert) t = 1 - t;
      const charIdx = Math.floor(t * (chars.length - 1));
      fb.setPixel(x, y, chars[charIdx], depth);
    }
  }
}

/**
 * TV static noise effect
 */
function staticNoise(fb, frame, options = {}) {
  const { density = 0.1, chars = ['.', ':', '#'], depth = 100 } = options;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const seed = x * 31 + y * 17 + frame * 7;
      if (seededRandom(seed) < density) {
        const charIdx = Math.floor(seededRandom(seed + 1) * chars.length);
        fb.setPixel(x, y, chars[charIdx], depth);
      }
    }
  }
}

/**
 * Concentric ripples effect
 */
function ripples(fb, frame, options = {}) {
  const { cx = null, cy = null, speed = 1, char = '·', depth = 100 } = options;
  const centerX = cx !== null ? cx : fb.width / 2;
  const centerY = cy !== null ? cy : fb.height / 2;
  const aspectRatio = 2.16;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const dx = (x - centerX) / aspectRatio;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Ripple pattern
      const ripple = Math.sin(dist - frame * speed * 0.5);
      if (ripple > 0.8) {
        fb.setPixel(x, y, char, depth);
      }
    }
  }
}

/**
 * Fireflies effect
 */
function fireflies(fb, frame, options = {}) {
  const { count = 8, chars = ['·', '*', '°'], depth = 50 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 31;
    // Random base position
    const baseX = seededRandom(seed) * fb.width;
    const baseY = seededRandom(seed + 1) * fb.height;

    // Gentle floating motion
    const floatX = Math.sin((frame + seed) * 0.05) * 3;
    const floatY = Math.cos((frame + seed * 2) * 0.03) * 2;

    const x = Math.floor((baseX + floatX + fb.width) % fb.width);
    const y = Math.floor((baseY + floatY + fb.height) % fb.height);

    // Blink effect
    const blinkPhase = (frame + seed * 7) % 60;
    if (blinkPhase < 30) {
      const brightness = blinkPhase < 15 ? blinkPhase / 15 : (30 - blinkPhase) / 15;
      const charIdx = Math.floor(brightness * (chars.length - 1));
      fb.setPixel(x, y, chars[charIdx], depth);
    }
  }
}

/**
 * Drifting clouds effect
 */
function clouds(fb, frame, options = {}) {
  const { count = 3, speed = 0.5, depth = 100 } = options;
  const cloudChars = ['░', '▒', '▓'];

  for (let i = 0; i < count; i++) {
    const seed = i * 47;
    const baseY = 2 + Math.floor(seededRandom(seed) * (fb.height / 3));
    const baseX = seededRandom(seed + 1) * fb.width;
    const cloudWidth = 8 + Math.floor(seededRandom(seed + 2) * 12);

    const x = Math.floor((baseX + frame * speed) % (fb.width + cloudWidth)) - cloudWidth;

    // Draw cloud shape
    for (let dx = 0; dx < cloudWidth; dx++) {
      const cloudX = x + dx;
      if (cloudX >= 0 && cloudX < fb.width) {
        // Cloud density varies across width
        const density = 1 - Math.abs(dx - cloudWidth / 2) / (cloudWidth / 2);
        const charIdx = Math.floor(density * (cloudChars.length - 1));
        fb.setPixel(cloudX, baseY, cloudChars[charIdx], depth);

        // Add some height variation
        if (density > 0.5 && baseY > 0) {
          fb.setPixel(cloudX, baseY - 1, cloudChars[0], depth);
        }
      }
    }
  }
}

// Make available globally for browser script tag usage
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    stars, starfield, rain, snow, fog, aurora, waves,
    gradient, staticNoise, ripples, fireflies, clouds
  });
}
})();
