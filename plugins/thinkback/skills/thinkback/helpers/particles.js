/* eslint-disable */
/**
 * Particle System Effects
 * Various particle effects for celebrations, atmosphere, etc.
 * All functions take (fb, frame, options)
 */
(function() {

// Seeded random for consistent patterns
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Confetti celebration effect
 */
function confetti(fb, frame, options = {}) {
  const { count = 20, chars = ['■', '◆', '●', '▲', '★'], depth = 50, speed = 1 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 31;
    // Random starting position
    const startX = seededRandom(seed) * fb.width;
    const startY = -seededRandom(seed + 1) * fb.height;

    // Fall with some horizontal drift
    const fallSpeed = 0.3 + seededRandom(seed + 2) * 0.5 * speed;
    const drift = Math.sin((frame + seed) * 0.1) * 2;

    const y = (startY + frame * fallSpeed) % (fb.height + 10);
    const x = Math.floor((startX + drift + fb.width) % fb.width);

    if (y >= 0 && y < fb.height) {
      const charIdx = Math.floor(seededRandom(seed + 3) * chars.length);
      fb.setPixel(x, Math.floor(y), chars[charIdx], depth);
    }
  }
}

/**
 * Sparkle effect - random twinkling lights
 */
function sparkles(fb, frame, options = {}) {
  const { density = 0.005, chars = ['✦', '*', '·', '+'], depth = 50 } = options;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const seed = x * 31 + y * 17;
      // Sparkle appears and disappears
      const sparklePhase = (frame + seed) % 20;
      if (sparklePhase < 5 && seededRandom(seed) < density) {
        const charIdx = Math.floor(sparklePhase / 5 * chars.length);
        fb.setPixel(x, y, chars[charIdx], depth);
      }
    }
  }
}

/**
 * Burst effect - particles exploding from a point
 */
function burst(fb, frame, options = {}) {
  const { cx = null, cy = null, count = 12, startFrame = 0, char = '*', depth = 50, duration = 30 } = options;
  const centerX = cx !== null ? cx : fb.width / 2;
  const centerY = cy !== null ? cy : fb.height / 2;

  const elapsed = frame - startFrame;
  if (elapsed < 0 || elapsed > duration) return;

  const progress = elapsed / duration;
  const radius = progress * Math.max(fb.width, fb.height) / 2;
  const fade = 1 - progress;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.floor(centerX + Math.cos(angle) * radius * 2.16); // Aspect ratio
    const y = Math.floor(centerY + Math.sin(angle) * radius);

    if (x >= 0 && x < fb.width && y >= 0 && y < fb.height && fade > 0.3) {
      fb.setPixel(x, y, char, depth);
    }
  }
}

/**
 * Bubbles rising effect
 */
function bubbles(fb, frame, options = {}) {
  const { count = 10, chars = ['○', '◯', 'O', 'o'], depth = 50, speed = 1 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 47;
    const baseX = seededRandom(seed) * fb.width;
    const riseSpeed = 0.2 + seededRandom(seed + 1) * 0.3 * speed;

    // Bubbles rise from bottom
    const y = fb.height - (frame * riseSpeed + seededRandom(seed + 2) * fb.height) % (fb.height + 5);

    // Slight horizontal wobble
    const wobble = Math.sin((frame + seed) * 0.15) * 1.5;
    const x = Math.floor((baseX + wobble + fb.width) % fb.width);

    if (y >= 0 && y < fb.height) {
      const charIdx = Math.floor(seededRandom(seed + 3) * chars.length);
      fb.setPixel(x, Math.floor(y), chars[charIdx], depth);
    }
  }
}

/**
 * Floating hearts
 */
function hearts(fb, frame, options = {}) {
  const { count = 6, char = '♥', depth = 50, speed = 1 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 23;
    const baseX = seededRandom(seed) * fb.width;
    const floatSpeed = 0.15 + seededRandom(seed + 1) * 0.2 * speed;

    // Hearts rise gently
    const y = fb.height - (frame * floatSpeed + seededRandom(seed + 2) * fb.height) % (fb.height + 5);

    // Gentle sway
    const sway = Math.sin((frame + seed) * 0.08) * 2;
    const x = Math.floor((baseX + sway + fb.width) % fb.width);

    if (y >= 0 && y < fb.height) {
      fb.setPixel(x, Math.floor(y), char, depth);
    }
  }
}

/**
 * Music notes floating
 */
function musicNotes(fb, frame, options = {}) {
  const { count = 8, chars = ['♪', '♫', '♬', '♩'], depth = 50, speed = 1 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 37;
    const baseX = seededRandom(seed) * fb.width;
    const floatSpeed = 0.2 + seededRandom(seed + 1) * 0.3 * speed;

    // Notes rise and sway
    const y = fb.height - (frame * floatSpeed + seededRandom(seed + 2) * fb.height) % (fb.height + 5);
    const sway = Math.sin((frame + seed) * 0.1) * 3;
    const x = Math.floor((baseX + sway + fb.width) % fb.width);

    if (y >= 0 && y < fb.height) {
      const charIdx = Math.floor(seededRandom(seed + 3) * chars.length);
      fb.setPixel(x, Math.floor(y), chars[charIdx], depth);
    }
  }
}

/**
 * Falling leaves
 */
function leaves(fb, frame, options = {}) {
  const { count = 8, chars = ['*', '✿', '❀', '◇'], depth = 50, speed = 1 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 29;
    const baseX = seededRandom(seed) * fb.width;
    const fallSpeed = 0.15 + seededRandom(seed + 1) * 0.2 * speed;

    // Leaves fall slowly with horizontal drift
    const y = (frame * fallSpeed + seededRandom(seed + 2) * fb.height) % (fb.height + 5);
    const drift = Math.sin((frame + seed) * 0.07) * 4;
    const x = Math.floor((baseX + drift + frame * 0.1 + fb.width) % fb.width);

    if (y >= 0 && y < fb.height) {
      const charIdx = Math.floor(seededRandom(seed + 3) * chars.length);
      fb.setPixel(x, Math.floor(y), chars[charIdx], depth);
    }
  }
}

/**
 * Rising embers/sparks
 */
function embers(fb, frame, options = {}) {
  const { count = 10, chars = ['.', '·', '*'], depth = 50, speed = 1 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 41;
    const baseX = seededRandom(seed) * fb.width;
    const riseSpeed = 0.3 + seededRandom(seed + 1) * 0.4 * speed;

    // Embers rise from bottom
    const y = fb.height - (frame * riseSpeed + seededRandom(seed + 2) * fb.height) % (fb.height + 5);

    // Slight random drift
    const drift = Math.sin((frame * 0.5 + seed) * 0.2) * 2;
    const x = Math.floor((baseX + drift + fb.width) % fb.width);

    // Fade as they rise
    const fadeProgress = 1 - y / fb.height;
    const charIdx = Math.floor(fadeProgress * (chars.length - 1));

    if (y >= 0 && y < fb.height) {
      fb.setPixel(x, Math.floor(y), chars[charIdx], depth);
    }
  }
}

/**
 * Dust motes floating in light
 */
function dust(fb, frame, options = {}) {
  const { density = 0.003, char = '·', depth = 100 } = options;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const seed = x * 31 + y * 17;
      if (seededRandom(seed) < density) {
        // Slow floating motion
        const floatX = Math.sin((frame * 0.05 + seed) * 0.3) * 2;
        const floatY = Math.cos((frame * 0.05 + seed * 2) * 0.2) * 1;

        const drawX = Math.floor((x + floatX + fb.width) % fb.width);
        const drawY = Math.floor((y + floatY + fb.height) % fb.height);

        // Occasional visibility toggle
        const visible = ((frame + seed) % 40) < 30;
        if (visible) {
          fb.setPixel(drawX, drawY, char, depth);
        }
      }
    }
  }
}

/**
 * Generic floating particles (refactored from existing)
 */
function floatingParticles(fb, frame, options = {}) {
  const { count = 12, char = '◇', depth = 50, speed = 1 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 23;
    const baseX = seededRandom(seed) * fb.width;
    const baseY = seededRandom(seed + 1) * fb.height;
    const floatSpeed = 0.3 + seededRandom(seed + 2) * 0.3;

    // Upward float with some variation
    const y = (baseY - frame * floatSpeed * speed + fb.height * 2) % fb.height;
    const sway = Math.sin((frame + seed) * 0.1) * 2;
    const x = Math.floor((baseX + sway + fb.width) % fb.width);

    fb.setPixel(x, Math.floor(y), char, depth);
  }
}

/**
 * Trail effect - particles following a path
 */
function trail(fb, points, frame, options = {}) {
  const { char = '·', fade = true, depth = 50 } = options;
  const trailChars = fade ? ['@', '#', '*', '·', '.'] : [char];

  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    if (x >= 0 && x < fb.width && y >= 0 && y < fb.height) {
      const charIdx = fade ? Math.min(i, trailChars.length - 1) : 0;
      fb.setPixel(Math.floor(x), Math.floor(y), trailChars[charIdx], depth);
    }
  }
}

/**
 * Orbiting particles around a center point
 */
function orbit(fb, frame, options = {}) {
  const { cx = null, cy = null, radius = 5, count = 4, char = '*', depth = 50, speed = 1 } = options;
  const centerX = cx !== null ? cx : fb.width / 2;
  const centerY = cy !== null ? cy : fb.height / 2;
  const aspectRatio = 2.16;

  for (let i = 0; i < count; i++) {
    const angle = (frame * 0.05 * speed) + (i / count) * Math.PI * 2;
    const x = Math.floor(centerX + Math.cos(angle) * radius * aspectRatio);
    const y = Math.floor(centerY + Math.sin(angle) * radius);

    if (x >= 0 && x < fb.width && y >= 0 && y < fb.height) {
      fb.setPixel(x, y, char, depth);
    }
  }
}

/**
 * Shooting stars
 */
function shootingStars(fb, frame, options = {}) {
  const { count = 2, chars = ['★', '*', '·', '.'], depth = 50 } = options;

  for (let i = 0; i < count; i++) {
    const seed = i * 73 + Math.floor(frame / 50) * 17;
    const active = (frame % 50) < 20;

    if (active) {
      const progress = (frame % 50) / 20;
      const startX = seededRandom(seed) * fb.width * 0.8;
      const startY = seededRandom(seed + 1) * fb.height * 0.3;

      // Diagonal trajectory
      const x = Math.floor(startX + progress * 30);
      const y = Math.floor(startY + progress * 10);

      // Trail
      for (let t = 0; t < chars.length; t++) {
        const trailX = x - t * 2;
        const trailY = y - t;
        if (trailX >= 0 && trailX < fb.width && trailY >= 0 && trailY < fb.height) {
          fb.setPixel(trailX, trailY, chars[t], depth);
        }
      }
    }
  }
}

/**
 * Glitter effect - intense sparkle burst
 */
function glitter(fb, frame, options = {}) {
  const { density = 0.02, chars = ['✦', '✧', '*', '·'], depth = 40 } = options;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const seed = x * 31 + y * 17 + frame * 3;
      if (seededRandom(seed) < density) {
        const charIdx = Math.floor(seededRandom(seed + 1) * chars.length);
        fb.setPixel(x, y, chars[charIdx], depth);
      }
    }
  }
}

// Make available globally for browser script tag usage
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    confetti, sparkles, burst, bubbles, hearts, musicNotes,
    leaves, embers, dust, floatingParticles, trail, orbit,
    shootingStars, glitter
  });
}
})();
