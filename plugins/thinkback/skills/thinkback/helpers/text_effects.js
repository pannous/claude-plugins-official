/* eslint-disable */
/**
 * Text Animation Effects
 * Utilities for animating text in various ways
 */
(function() {

// Seeded random for consistent effects
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Easing function
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Typewriter effect - returns substring of text
 * @returns The portion of text to display
 */
function typewriter(text, progress) {
  const numChars = Math.floor(progress * text.length);
  return text.slice(0, numChars);
}

/**
 * Fade text by letter using density characters
 * @returns Array of { char, opacity } for each character
 */
function fadeByLetter(text, progress) {
  const densityChars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

  return text.split('').map((char, i) => {
    const charProgress = Math.max(0, Math.min(1, progress * text.length - i));
    if (char === ' ') return { char: ' ', opacity: 1 };
    const densityIdx = Math.floor(charProgress * (densityChars.length - 1));
    return { char: densityChars[densityIdx], opacity: charProgress };
  });
}

/**
 * Wave position modifier - returns y offset for bouncing effect
 * @param index - Character index for phase offset
 */
function wave(frame, options = {}) {
  const { amplitude = 1, frequency = 0.2, index = 0, speed = 1 } = options;
  return Math.round(Math.sin((frame * speed + index) * frequency) * amplitude);
}

/**
 * Bounce position modifier - returns y offset for bounce effect
 */
function bounce(frame, options = {}) {
  const { amplitude = 2, speed = 1 } = options;
  const t = (frame * speed * 0.1) % (Math.PI * 2);
  return Math.round(Math.abs(Math.sin(t)) * amplitude);
}

/**
 * Shake position modifier - returns {x, y} offset for trembling
 */
function shake(frame, options = {}) {
  const { intensity = 1 } = options;
  return {
    x: Math.round((seededRandom(frame * 7) - 0.5) * 2 * intensity),
    y: Math.round((seededRandom(frame * 13) - 0.5) * 2 * intensity)
  };
}

/**
 * Float position modifier - gentle up/down drift
 */
function float(frame, options = {}) {
  const { amplitude = 0.5, speed = 0.5 } = options;
  return Math.round(Math.sin(frame * speed * 0.1) * amplitude);
}

/**
 * Draw text with typewriter effect
 */
function drawTypewriter(fb, x, y, text, progress, options = {}) {
  const { cursor = '▌', depth = 0 } = options;
  const visibleText = typewriter(text, progress);

  fb.drawText(x, y, visibleText, depth);

  // Draw blinking cursor
  if (progress < 1) {
    const cursorX = x + visibleText.length;
    fb.setPixel(cursorX, y, cursor, depth);
  }
}

/**
 * Draw centered text with typewriter effect
 */
function drawTypewriterCentered(fb, y, text, progress, options = {}) {
  const x = Math.floor((fb.width - text.length) / 2);
  drawTypewriter(fb, x, y, text, progress, options);
}

/**
 * Draw text with wave effect (each character bobs up/down)
 */
function drawWaveText(fb, y, text, frame, options = {}) {
  const { amplitude = 1, frequency = 0.3, speed = 1, depth = 0 } = options;
  const x = Math.floor((fb.width - text.length) / 2);

  for (let i = 0; i < text.length; i++) {
    const offsetY = wave(frame, { amplitude, frequency, index: i, speed });
    fb.setPixel(x + i, y + offsetY, text[i], depth);
  }
}

/**
 * Draw text with glitch effect
 */
function drawGlitchText(fb, x, y, text, frame, options = {}) {
  const { intensity = 0.1, depth = 0 } = options;
  const glitchChars = '#@$%&*!?░▒▓';

  for (let i = 0; i < text.length; i++) {
    const seed = i * 17 + frame * 7;
    const shouldGlitch = seededRandom(seed) < intensity;

    if (shouldGlitch) {
      const glitchIdx = Math.floor(seededRandom(seed + 1) * glitchChars.length);
      fb.setPixel(x + i, y, glitchChars[glitchIdx], depth);
    } else {
      fb.setPixel(x + i, y, text[i], depth);
    }
  }
}

/**
 * Draw centered text with glitch effect
 */
function drawGlitchTextCentered(fb, y, text, frame, options = {}) {
  const x = Math.floor((fb.width - text.length) / 2);
  drawGlitchText(fb, x, y, text, frame, options);
}

/**
 * Draw text that scatters then reassembles
 */
function drawScatterText(fb, text, progress, options = {}) {
  const { cx = null, cy = null, depth = 0 } = options;
  const centerX = cx !== null ? cx : fb.width / 2;
  const centerY = cy !== null ? cy : fb.height / 2;
  const finalX = Math.floor(centerX - text.length / 2);
  const finalY = Math.floor(centerY);

  const easedProgress = easeOut(progress);

  for (let i = 0; i < text.length; i++) {
    const seed = i * 31;
    // Random scattered position
    const scatterX = seededRandom(seed) * fb.width;
    const scatterY = seededRandom(seed + 1) * fb.height;

    // Interpolate between scattered and final position
    const x = Math.floor(scatterX + (finalX + i - scatterX) * easedProgress);
    const y = Math.floor(scatterY + (finalY - scatterY) * easedProgress);

    if (x >= 0 && x < fb.width && y >= 0 && y < fb.height) {
      fb.setPixel(x, y, text[i], depth);
    }
  }
}

/**
 * Slide text in from edge
 */
function slideIn(fb, y, text, progress, options = {}) {
  const { from = 'left', depth = 0 } = options;
  const finalX = Math.floor((fb.width - text.length) / 2);
  const easedProgress = easeOut(progress);

  let startX;
  switch (from) {
    case 'right':
      startX = fb.width;
      break;
    case 'left':
    default:
      startX = -text.length;
  }

  const x = Math.floor(startX + (finalX - startX) * easedProgress);

  for (let i = 0; i < text.length; i++) {
    const charX = x + i;
    if (charX >= 0 && charX < fb.width) {
      fb.setPixel(charX, y, text[i], depth);
    }
  }
}

/**
 * Slide text out to edge
 */
function slideOut(fb, y, text, progress, options = {}) {
  const { to = 'right', depth = 0 } = options;
  const startX = Math.floor((fb.width - text.length) / 2);
  const easedProgress = easeOut(progress);

  let endX;
  switch (to) {
    case 'left':
      endX = -text.length;
      break;
    case 'right':
    default:
      endX = fb.width;
  }

  const x = Math.floor(startX + (endX - startX) * easedProgress);

  for (let i = 0; i < text.length; i++) {
    const charX = x + i;
    if (charX >= 0 && charX < fb.width) {
      fb.setPixel(charX, y, text[i], depth);
    }
  }
}

/**
 * Draw text with zoom effect (characters expand from center)
 */
function drawZoomText(fb, y, text, progress, options = {}) {
  const { depth = 0 } = options;
  const centerX = fb.width / 2;
  const textWidth = text.length;
  const easedProgress = easeOut(progress);

  for (let i = 0; i < text.length; i++) {
    // Start from center, expand to final position
    const finalOffset = i - textWidth / 2;
    const offset = finalOffset * easedProgress;
    const x = Math.floor(centerX + offset);

    if (x >= 0 && x < fb.width) {
      fb.setPixel(x, y, text[i], depth);
    }
  }
}

/**
 * Draw text character by character with fade
 */
function drawFadeInText(fb, y, text, progress, options = {}) {
  const { depth = 0 } = options;
  const x = Math.floor((fb.width - text.length) / 2);
  const chars = fadeByLetter(text, progress);

  for (let i = 0; i < chars.length; i++) {
    if (chars[i].opacity > 0.9) {
      fb.setPixel(x + i, y, text[i], depth);
    } else if (chars[i].opacity > 0) {
      fb.setPixel(x + i, y, chars[i].char, depth);
    }
  }
}

/**
 * Rainbow cycling through density characters
 * (Monochrome version using different characters)
 */
function drawRainbowText(fb, y, text, frame, options = {}) {
  const { depth = 0, chars = ['·', '*', '◆', '●', '■'] } = options;
  const x = Math.floor((fb.width - text.length) / 2);

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ' ') {
      const cycleIdx = (i + Math.floor(frame / 4)) % chars.length;
      // Keep the original character but could swap for effect chars
      fb.setPixel(x + i, y, text[i], depth);
    } else {
      fb.setPixel(x + i, y, ' ', depth);
    }
  }
}

/**
 * Reveal text with a wipe effect (character by character from direction)
 */
function drawWipeReveal(fb, y, text, progress, options = {}) {
  const { direction = 'left', depth = 0 } = options;
  const x = Math.floor((fb.width - text.length) / 2);
  const numVisible = Math.floor(progress * text.length);

  for (let i = 0; i < text.length; i++) {
    const visibleIdx = direction === 'right' ? text.length - 1 - i : i;
    if (visibleIdx < numVisible) {
      fb.setPixel(x + i, y, text[i], depth);
    }
  }
}

// ============================================================================
// CLAUDE MASCOT & BRANDING
// ============================================================================

// Claude mascot ASCII art (Clawd - 3 lines, 10 chars wide)
const CLAUDE_MASCOT = [
  ' ▐▛███▜▌ ',
  '▝▜█████▛▘',
  '  ▘▘ ▝▝  ',
];
const CLAUDE_MASCOT_WIDTH = 10;

// Claude Code logo ASCII art (large block letters, left-aligned)
const CLAUDE_CODE_LOGO = [
  ' ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗',
  '██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝',
  '██║     ██║     ███████║██║   ██║██║  ██║█████╗  ',
  '██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝  ',
  '╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗',
  ' ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝',
  '                                                 ',
  ' ██████╗ ██████╗ ██████╗ ███████╗                ',
  '██╔════╝██╔═══██╗██╔══██╗██╔════╝                ',
  '██║     ██║   ██║██║  ██║█████╗                  ',
  '██║     ██║   ██║██║  ██║██╔══╝                  ',
  '╚██████╗╚██████╔╝██████╔╝███████╗                ',
  ' ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝                ',
];
const CLAUDE_CODE_LOGO_WIDTH = 48;
const CLAUDE_CODE_LOGO_HEIGHT = 13;

// Claude orange color
const CLAUDE_ORANGE = '#D97757';

/**
 * Draw Claude mascot (Clawd) centered at position
 * @param fb - Framebuffer
 * @param centerX - X center position
 * @param y - Top Y position
 * @param color - Color for the mascot (default: Anthropic orange)
 */
function drawClaudeMascot(fb, centerX, y, color = CLAUDE_ORANGE) {
  const startX = Math.floor(centerX - CLAUDE_MASCOT_WIDTH / 2);
  for (let i = 0; i < CLAUDE_MASCOT.length; i++) {
    const line = CLAUDE_MASCOT[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] !== ' ') {
        // Use setPixel with depth=0 and color for HTML, terminal ignores color
        fb.setPixel(startX + j, y + i, line[j], 0, color);
      }
    }
  }
}

/**
 * Draw Claude Code logo centered at position
 * @param fb - Framebuffer
 * @param centerX - X center position
 * @param y - Top Y position
 * @param color - Color for the logo (default: Claude orange)
 */
function drawClaudeCodeLogo(fb, centerX, y, color = CLAUDE_ORANGE) {
  const startX = Math.floor(centerX - CLAUDE_CODE_LOGO_WIDTH / 2);
  for (let i = 0; i < CLAUDE_CODE_LOGO.length; i++) {
    const line = CLAUDE_CODE_LOGO[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] !== ' ') {
        fb.setPixel(startX + j, y + i, line[j], 0, color);
      }
    }
  }
}

/**
 * Draw the Thinkback intro scene with Clawd, Claude Code logo, and standard text
 * This creates a consistent opening experience for all Thinkback animations.
 *
 * @param fb - Framebuffer
 * @param frame - Current frame number
 * @param progress - Scene progress (0-1)
 * @param options - Configuration options
 * @param options.year - Year to display (default: 2025)
 * @param options.static - If true, render everything fully visible (for thumbnails/stills)
 * @param options.staticFrame - Frame number to render as static (default: 0)
 *
 * @example
 * drawThinkbackIntro(fb, frame, progress);
 * // For a still frame:
 * drawThinkbackIntro(fb, 0, 1, { static: true });
 */
function drawThinkbackIntro(fb, frame, progress, options = {}) {
  const { year = 2025, static: isStatic = false, staticFrame = 0 } = options;

  // Frame 0 (or specified staticFrame) is always rendered as a complete still
  // This provides a good thumbnail when converting to video
  const renderAsStatic = isStatic || frame === staticFrame;

  const centerX = fb.width / 2;

  // If static mode, skip all animations and show everything fully rendered
  const logoPhase = renderAsStatic ? 1 : Math.min(1, progress * 5);
  const textPhase = renderAsStatic ? 1 : Math.max(0, Math.min(1, (progress - 0.2) * 4));
  const subtitlePhase = renderAsStatic ? 1 : Math.max(0, Math.min(1, (progress - 0.5) * 3));
  const showYear = renderAsStatic || progress > 0.6;

  // Draw Clawd mascot at top center (no pixelation - appears immediately)
  const clawdY = 2;
  drawClaudeMascot(fb, centerX, clawdY, CLAUDE_ORANGE);

  // Draw Claude Code logo below Clawd with fast dissolve effect
  const logoY = 6;
  const startX = Math.floor(centerX - CLAUDE_CODE_LOGO_WIDTH / 2);

  for (let i = 0; i < CLAUDE_CODE_LOGO.length; i++) {
    const line = CLAUDE_CODE_LOGO[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] !== ' ') {
        // Dissolve effect - random pixels appear based on progress
        // In static mode (including frame 0), always show all pixels
        const seed = i * 100 + j;
        const threshold = seededRandom(seed);

        if (renderAsStatic || logoPhase > threshold) {
          const x = startX + j;
          if (x >= 0 && x < fb.width) {
            fb.setPixel(x, logoY + i, line[j], 0, CLAUDE_ORANGE);
          }
        }
      }
    }
  }

  // Draw "Think Back on..." text
  if (textPhase > 0 || renderAsStatic) {
    const thinkBackY = 21;
    const thinkBackText = 'Think Back on...';

    // Typewriter effect for "Think Back on..." (or full text in static mode)
    const visibleChars = renderAsStatic ? thinkBackText.length : Math.floor(textPhase * thinkBackText.length * 1.2);
    const displayText = thinkBackText.slice(0, Math.min(visibleChars, thinkBackText.length));
    const textX = Math.floor(centerX - thinkBackText.length / 2);

    for (let i = 0; i < displayText.length; i++) {
      fb.setPixel(textX + i, thinkBackY, displayText[i], 0, '#FFFFFF');
    }

    // Draw cursor while typing (not in static mode)
    if (!renderAsStatic && visibleChars < thinkBackText.length) {
      fb.setPixel(textX + displayText.length, thinkBackY, '▌', 0, '#FFFFFF');
    }
  }

  // Draw "your year with Claude Code" only after "Think Back on..." is fully typed
  if (subtitlePhase > 0 || renderAsStatic) {
    const subtitleY = 23;
    const subtitleText = 'your year with Claude Code';
    const easedSubtitle = easeOut(subtitlePhase);
    const visibleChars = renderAsStatic ? subtitleText.length : Math.floor(easedSubtitle * subtitleText.length);
    const displaySubtitle = subtitleText.slice(0, visibleChars);
    const subtitleX = Math.floor(centerX - subtitleText.length / 2);

    for (let i = 0; i < displaySubtitle.length; i++) {
      fb.setPixel(subtitleX + i, subtitleY, displaySubtitle[i], 0, CLAUDE_ORANGE);
    }

    // Draw cursor while typing (not in static mode)
    if (!renderAsStatic && visibleChars < subtitleText.length) {
      fb.setPixel(subtitleX + displaySubtitle.length, subtitleY, '▌', 0, CLAUDE_ORANGE);
    }
  }

  // Draw year at bottom
  if (showYear) {
    const yearPhase = renderAsStatic ? 1 : (progress - 0.6) / 0.4;
    const yearText = String(year);
    const yearY = fb.height - 3;
    const yearX = Math.floor(centerX - yearText.length / 2);

    // Fade in year (or show immediately in static mode)
    if (renderAsStatic || yearPhase > 0.3) {
      for (let i = 0; i < yearText.length; i++) {
        fb.setPixel(yearX + i, yearY, yearText[i], 0, '#FFD700');
      }
    }
  }
}

// Make available globally for browser script tag usage
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    typewriter, fadeByLetter, wave, bounce, shake, float,
    drawTypewriter, drawTypewriterCentered, drawWaveText,
    drawGlitchText, drawGlitchTextCentered, drawScatterText,
    slideIn, slideOut, drawZoomText, drawFadeInText,
    drawRainbowText, drawWipeReveal,
    // Claude branding
    CLAUDE_MASCOT, CLAUDE_MASCOT_WIDTH, drawClaudeMascot,
    CLAUDE_CODE_LOGO, CLAUDE_CODE_LOGO_WIDTH, CLAUDE_CODE_LOGO_HEIGHT,
    CLAUDE_ORANGE, drawClaudeCodeLogo, drawThinkbackIntro,
  });
}
})();
