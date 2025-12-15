/* eslint-disable */
/**
 * Scene Transition Effects
 * All functions take (fb, progress, options) where progress is 0-1
 */
(function() {

// Seeded random for consistent dissolve patterns
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Wipe from right to left (reveals content as wipe passes)
 */
function wipeLeft(fb, progress, char = '█') {
  const edge = Math.floor((1 - progress) * fb.width);
  for (let y = 0; y < fb.height; y++) {
    for (let x = edge; x < fb.width; x++) {
      fb.setPixel(x, y, char, -100);
    }
  }
}

/**
 * Wipe from left to right
 */
function wipeRight(fb, progress, char = '█') {
  const edge = Math.floor(progress * fb.width);
  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < edge; x++) {
      fb.setPixel(x, y, char, -100);
    }
  }
}

/**
 * Wipe from top to bottom
 */
function wipeDown(fb, progress, char = '█') {
  const edge = Math.floor(progress * fb.height);
  for (let y = 0; y < edge; y++) {
    for (let x = 0; x < fb.width; x++) {
      fb.setPixel(x, y, char, -100);
    }
  }
}

/**
 * Wipe from bottom to top
 */
function wipeUp(fb, progress, char = '█') {
  const edge = Math.floor((1 - progress) * fb.height);
  for (let y = edge; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      fb.setPixel(x, y, char, -100);
    }
  }
}

/**
 * Circular reveal expanding from center
 * Uses aspect ratio correction for circular appearance
 */
function circleReveal(fb, progress, cx = null, cy = null) {
  const centerX = cx !== null ? cx : fb.width / 2;
  const centerY = cy !== null ? cy : fb.height / 2;
  const maxRadius = Math.sqrt(fb.width * fb.width + fb.height * fb.height);
  const radius = progress * maxRadius;
  const aspectRatio = 2.16; // Terminal character aspect ratio

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const dx = (x - centerX) / aspectRatio;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

/**
 * Circular close - shrinks to center
 */
function circleClose(fb, progress, cx = null, cy = null) {
  circleReveal(fb, 1 - progress, cx, cy);
}

/**
 * Classic iris-in effect (circle reveals from center)
 */
function irisIn(fb, progress) {
  circleReveal(fb, progress);
}

/**
 * Classic iris-out effect (circle closes to center)
 */
function irisOut(fb, progress) {
  circleClose(fb, progress);
}

/**
 * Horizontal venetian blinds effect
 */
function blindsH(fb, progress, numBlinds = 8) {
  const blindHeight = Math.ceil(fb.height / numBlinds);
  const revealHeight = Math.floor(progress * blindHeight);

  for (let blind = 0; blind < numBlinds; blind++) {
    const blindStart = blind * blindHeight;
    for (let dy = revealHeight; dy < blindHeight; dy++) {
      const y = blindStart + dy;
      if (y < fb.height) {
        for (let x = 0; x < fb.width; x++) {
          fb.setPixel(x, y, ' ', -100);
        }
      }
    }
  }
}

/**
 * Vertical blinds effect
 */
function blindsV(fb, progress, numBlinds = 12) {
  const blindWidth = Math.ceil(fb.width / numBlinds);
  const revealWidth = Math.floor(progress * blindWidth);

  for (let blind = 0; blind < numBlinds; blind++) {
    const blindStart = blind * blindWidth;
    for (let dx = revealWidth; dx < blindWidth; dx++) {
      const x = blindStart + dx;
      if (x < fb.width) {
        for (let y = 0; y < fb.height; y++) {
          fb.setPixel(x, y, ' ', -100);
        }
      }
    }
  }
}

/**
 * Checkerboard dissolve pattern
 */
function checkerboard(fb, progress, size = 4) {
  const numCellsX = Math.ceil(fb.width / size);
  const numCellsY = Math.ceil(fb.height / size);
  const totalCells = numCellsX * numCellsY;
  const revealedCells = Math.floor(progress * totalCells);

  // Create ordered reveal pattern (checkerboard pattern)
  const cells = [];
  for (let cy = 0; cy < numCellsY; cy++) {
    for (let cx = 0; cx < numCellsX; cx++) {
      const phase = (cx + cy) % 2;
      cells.push({ cx, cy, order: phase * totalCells / 2 + cy * numCellsX + cx });
    }
  }
  cells.sort((a, b) => a.order - b.order);

  // Cover unrevealed cells
  for (let i = revealedCells; i < cells.length; i++) {
    const { cx, cy } = cells[i];
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const x = cx * size + dx;
        const y = cy * size + dy;
        if (x < fb.width && y < fb.height) {
          fb.setPixel(x, y, ' ', -100);
        }
      }
    }
  }
}

/**
 * Diagonal wipe from corner to corner
 * @param dir - 'tl' (top-left), 'tr', 'bl', 'br'
 */
function diagonalWipe(fb, progress, dir = 'tl') {
  const maxDist = fb.width + fb.height;
  const threshold = progress * maxDist;

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      let dist;
      switch (dir) {
        case 'tl': dist = x + y; break;
        case 'tr': dist = (fb.width - x) + y; break;
        case 'bl': dist = x + (fb.height - y); break;
        case 'br': dist = (fb.width - x) + (fb.height - y); break;
        default: dist = x + y;
      }
      if (dist > threshold) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

/**
 * Random pixel dissolve effect
 */
function dissolve(fb, progress, seed = 0) {
  const totalPixels = fb.width * fb.height;
  const visiblePixels = Math.floor(progress * totalPixels);

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const pixelSeed = seed + x * 31 + y * 17;
      const rand = seededRandom(pixelSeed);
      if (rand > progress) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

/**
 * Pixelation effect - content becomes less pixelated over time
 */
function pixelate(fb, progress, maxSize = 8) {
  if (progress >= 1) return;

  const blockSize = Math.max(1, Math.floor((1 - progress) * maxSize));
  if (blockSize <= 1) return;

  // Sample and replicate blocks
  for (let by = 0; by < fb.height; by += blockSize) {
    for (let bx = 0; bx < fb.width; bx += blockSize) {
      // Get center pixel of block
      const sampleX = Math.min(bx + Math.floor(blockSize / 2), fb.width - 1);
      const sampleY = Math.min(by + Math.floor(blockSize / 2), fb.height - 1);
      const char = fb.getPixel(sampleX, sampleY);

      // Fill block with sampled character
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const x = bx + dx;
          const y = by + dy;
          if (x < fb.width && y < fb.height) {
            fb.setPixel(x, y, char, -50);
          }
        }
      }
    }
  }
}

/**
 * Matrix rain transition effect
 */
function matrixRain(fb, frame, progress, density = 0.1) {
  const chars = '01';
  const visibleColumns = Math.floor(progress * fb.width);

  for (let x = 0; x < visibleColumns; x++) {
    const columnSeed = x * 17;
    const speed = 0.5 + seededRandom(columnSeed) * 0.5;
    const offset = Math.floor(frame * speed + seededRandom(columnSeed + 1) * fb.height);

    for (let y = 0; y < fb.height; y++) {
      const charSeed = columnSeed + y * 31 + frame;
      if (seededRandom(charSeed) < density) {
        const trailPos = (y + offset) % fb.height;
        const charIdx = Math.floor(seededRandom(charSeed + 7) * chars.length);
        fb.setPixel(x, trailPos, chars[charIdx], -80);
      }
    }
  }
}

/**
 * Slide offset calculator - returns offset for sliding content
 * Use text_effects.js slideIn/slideOut for drawing text
 */
function getSlideOffset(progress, from = 'left', width, height) {
  const offset = Math.floor((1 - progress) * (from === 'left' || from === 'right' ? width : height));

  return {
    x: from === 'left' ? -offset : from === 'right' ? offset : 0,
    y: from === 'top' ? -offset : from === 'bottom' ? offset : 0
  };
}

/**
 * Fade using density characters
 */
function fade(fb, progress, invert = false) {
  const densityChars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
  const p = invert ? 1 - progress : progress;
  const charIdx = Math.floor(p * (densityChars.length - 1));
  const fadeChar = densityChars[charIdx];

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const current = fb.getPixel(x, y);
      if (current !== ' ') {
        fb.setPixel(x, y, fadeChar, -90);
      }
    }
  }
}

// Rainbow color helper for effects
function rainbowColor(index, offset = 0) {
  const colors = ['#9C5C5C', '#CC785C', '#B8A85C', '#5C9A5C', '#5C9A9A', '#5C7A9C', '#8C6C9C'];
  return colors[Math.abs(Math.floor(index + offset)) % colors.length];
}

// ============================================================================
// SUPERNOVA - Explosive burst from center
// ============================================================================
function supernova(fb, progress) {
  const centerX = fb.width / 2;
  const centerY = fb.height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY) * 1.2;
  const currentRadius = progress * maxRadius;
  const chars = '✦✧*·';

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const dx = (x - centerX) / 2;  // Compensate for character aspect ratio
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < currentRadius) {
        // Inside the explosion - clear
        fb.setPixel(x, y, ' ', -100);
      } else if (dist < currentRadius + 3) {
        // Edge of explosion - draw particles
        const charIdx = Math.floor(seededRandom(x * 31 + y * 17) * chars.length);
        fb.setPixel(x, y, chars[charIdx], -100);
      }
    }
  }
}

// ============================================================================
// SPIRAL - Spinning vortex clear
// ============================================================================
function spiral(fb, progress) {
  const centerX = fb.width / 2;
  const centerY = fb.height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      const dx = (x - centerX) / 2;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) + Math.PI;  // 0 to 2π

      // Spiral threshold: combines angle and distance
      const threshold = (angle / (Math.PI * 2) + dist / maxRadius) / 2;

      if (threshold < progress) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

// ============================================================================
// SHATTER - Breaking glass effect
// ============================================================================
function shatter(fb, progress) {
  const numShards = 20;

  for (let i = 0; i < numShards; i++) {
    // Each shard has a random position and falls at different speeds
    const shardX = seededRandom(i * 17) * fb.width;
    const shardY = seededRandom(i * 31) * fb.height;
    const shardSize = 3 + Math.floor(seededRandom(i * 47) * 5);
    const fallSpeed = 0.5 + seededRandom(i * 61);

    const shardProgress = Math.min(1, progress * (1 + fallSpeed));

    if (shardProgress > seededRandom(i * 73) * 0.5) {
      // Clear this shard area
      for (let dy = 0; dy < shardSize; dy++) {
        for (let dx = 0; dx < shardSize * 2; dx++) {
          const px = Math.floor(shardX + dx);
          const py = Math.floor(shardY + dy + shardProgress * 10);
          if (px >= 0 && px < fb.width && py >= 0 && py < fb.height) {
            fb.setPixel(px, py, ' ', -100);
          }
        }
      }
    }
  }

  // Ensure full clear at end
  if (progress >= 0.95) {
    for (let y = 0; y < fb.height; y++) {
      for (let x = 0; x < fb.width; x++) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

// ============================================================================
// TORNADO - Swirling funnel clear
// ============================================================================
function tornado(fb, progress) {
  const centerX = fb.width / 2;
  const rotation = progress * Math.PI * 6;  // 3 full rotations

  for (let y = 0; y < fb.height; y++) {
    // Funnel width varies with height (wider at top)
    const funnelWidth = (fb.height - y) / fb.height * fb.width * 0.4;
    const offset = Math.sin(rotation + y * 0.3) * funnelWidth * progress;

    const clearStart = Math.floor(centerX + offset - funnelWidth * progress);
    const clearEnd = Math.floor(centerX + offset + funnelWidth * progress);

    for (let x = clearStart; x < clearEnd; x++) {
      if (x >= 0 && x < fb.width) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }

  // Ensure full clear at end
  if (progress >= 0.95) {
    for (let y = 0; y < fb.height; y++) {
      for (let x = 0; x < fb.width; x++) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

// Make available globally for browser script tag usage
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    wipeLeft, wipeRight, wipeDown, wipeUp,
    circleReveal, circleClose, irisIn, irisOut,
    blindsH, blindsV, checkerboard, diagonalWipe,
    dissolve, pixelate, matrixRain, getSlideOffset, fade,
    supernova, spiral, shatter, tornado
  });
}
})();
