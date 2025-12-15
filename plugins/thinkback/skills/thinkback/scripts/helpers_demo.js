/* eslint-disable */
/**
 * Helpers Demo Animation
 * Showcases all the animation helpers in action
 *
 * Run with: node helpers_demo.js
 */

import { FrameBuffer, AnimationEngine } from '../ascii_anim.js';
import {
  // Transitions
  wipeRight, wipeLeft, circleReveal, circleClose, blindsH, blindsV,
  diagonalWipe, dissolve, checkerboard,
  // Backgrounds
  stars, starfield, rain, snow, aurora, waves, fireflies, ripples, staticNoise,
  // Text effects
  drawTypewriter, drawWaveText, drawGlitchText, drawScatterText,
  slideIn, slideOut, drawZoomText, drawFadeInText,
  // Particles
  confetti, sparkles, burst, bubbles, hearts, musicNotes, leaves, embers, floatingParticles,
  // Borders
  boxBorder, fullscreenBorder, marchingAnts, growBorder, framedTitle, dividerWithText,
} from '../helpers/index.js';

// Scene definitions with timing
const FPS = 24;
const SCENES = {
  // Intro
  INTRO_FADE:    { start: 0,    end: 48 },    // 2s - stars fade in
  TITLE:         { start: 48,   end: 144 },   // 4s - title with effects

  // Transition showcase
  TRANS_WIPE:    { start: 144,  end: 216 },   // 3s - wipe transitions
  TRANS_CIRCLE:  { start: 216,  end: 288 },   // 3s - circle reveal
  TRANS_BLINDS:  { start: 288,  end: 360 },   // 3s - blinds effect

  // Background showcase
  BG_WEATHER:    { start: 360,  end: 456 },   // 4s - rain/snow
  BG_CELESTIAL:  { start: 456,  end: 552 },   // 4s - aurora/starfield
  BG_PATTERNS:   { start: 552,  end: 624 },   // 3s - waves/ripples

  // Text effects showcase
  TEXT_TYPE:     { start: 624,  end: 720 },   // 4s - typewriter
  TEXT_WAVE:     { start: 720,  end: 816 },   // 4s - wave text
  TEXT_GLITCH:   { start: 816,  end: 888 },   // 3s - glitch effect
  TEXT_SCATTER:  { start: 888,  end: 984 },   // 4s - scatter/assemble

  // Particles showcase
  PART_CONFETTI: { start: 984,  end: 1080 },  // 4s - confetti celebration
  PART_NATURE:   { start: 1080, end: 1176 },  // 4s - leaves/embers
  PART_LOVE:     { start: 1176, end: 1248 },  // 3s - hearts/music

  // Borders showcase
  BORDER_GROW:   { start: 1248, end: 1344 },  // 4s - growing border
  BORDER_MARCH:  { start: 1344, end: 1416 },  // 3s - marching ants

  // Finale
  FINALE:        { start: 1416, end: 1560 },  // 6s - everything together
  OUTRO:         { start: 1560, end: 1632 },  // 3s - fade out
};

const TOTAL_FRAMES = 1632; // ~68 seconds

function getScene(frame) {
  for (const [name, timing] of Object.entries(SCENES)) {
    if (frame >= timing.start && frame < timing.end) {
      return {
        name,
        progress: (frame - timing.start) / (timing.end - timing.start),
        localFrame: frame - timing.start,
        duration: timing.end - timing.start
      };
    }
  }
  return { name: 'DONE', progress: 1, localFrame: 0, duration: 0 };
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function renderFrame(fb, frame) {
  const scene = getScene(frame);
  const { name, progress: p, localFrame } = scene;
  const centerY = Math.floor(fb.height / 2);
  const centerX = Math.floor(fb.width / 2);

  switch (name) {
    // ========== INTRO ==========
    case 'INTRO_FADE': {
      stars(fb, frame, { density: p * 0.008, twinkle: true });
      if (p > 0.5) {
        const fadeP = (p - 0.5) * 2;
        drawFadeInText(fb, centerY, "✦ HELPERS DEMO ✦", fadeP);
      }
      break;
    }

    case 'TITLE': {
      starfield(fb, frame, { speed: 0.3, numStars: 40 });

      // Animated border
      if (p < 0.3) {
        growBorder(fb, p / 0.3, { x: 5, y: 3, width: fb.width - 10, height: fb.height - 6, style: 'double' });
      } else {
        boxBorder(fb, { x: 5, y: 3, width: fb.width - 10, height: fb.height - 6, style: 'double' });
      }

      drawWaveText(fb, centerY - 2, "Animation Helpers", frame, { amplitude: 1 });
      fb.drawCenteredText(centerY + 1, "Transitions · Backgrounds · Text · Particles · Borders");

      sparkles(fb, frame, { density: 0.003 });
      break;
    }

    // ========== TRANSITIONS ==========
    case 'TRANS_WIPE': {
      stars(fb, frame, { density: 0.005 });

      fb.drawCenteredText(3, "─── TRANSITIONS ───");

      if (p < 0.25) {
        fb.drawCenteredText(centerY, "Wipe Right →");
        wipeRight(fb, p * 4, '░');
      } else if (p < 0.5) {
        fb.drawCenteredText(centerY, "← Wipe Left");
        wipeLeft(fb, (p - 0.25) * 4, '▒');
      } else if (p < 0.75) {
        fb.drawCenteredText(centerY, "Diagonal Wipe ↘");
        diagonalWipe(fb, (p - 0.5) * 4, 'tl');
      } else {
        fb.drawCenteredText(centerY, "Dissolve Effect");
        dissolve(fb, (p - 0.75) * 4);
      }
      break;
    }

    case 'TRANS_CIRCLE': {
      fireflies(fb, frame, { count: 6 });

      fb.drawCenteredText(3, "─── CIRCLE TRANSITIONS ───");
      fb.drawCenteredText(centerY - 1, "Circle Reveal");
      fb.drawCenteredText(centerY + 1, "Classic Iris Effect");

      if (p < 0.5) {
        circleReveal(fb, easeOut(p * 2));
      } else {
        circleClose(fb, easeOut((p - 0.5) * 2));
      }
      break;
    }

    case 'TRANS_BLINDS': {
      aurora(fb, frame, { intensity: 0.3 });

      fb.drawCenteredText(3, "─── BLINDS TRANSITIONS ───");

      if (p < 0.33) {
        fb.drawCenteredText(centerY, "Horizontal Blinds");
        blindsH(fb, p * 3, 6);
      } else if (p < 0.66) {
        fb.drawCenteredText(centerY, "Vertical Blinds");
        blindsV(fb, (p - 0.33) * 3, 10);
      } else {
        fb.drawCenteredText(centerY, "Checkerboard Dissolve");
        checkerboard(fb, (p - 0.66) * 3, 3);
      }
      break;
    }

    // ========== BACKGROUNDS ==========
    case 'BG_WEATHER': {
      fb.drawCenteredText(2, "─── WEATHER EFFECTS ───");

      if (p < 0.5) {
        rain(fb, frame, { density: 0.03, speed: 1.5 });
        fb.drawCenteredText(centerY, "☔ Rain Effect");
      } else {
        snow(fb, frame, { density: 0.015 });
        fb.drawCenteredText(centerY, "❄ Snow Effect");
      }
      break;
    }

    case 'BG_CELESTIAL': {
      fb.drawCenteredText(2, "─── CELESTIAL EFFECTS ───");

      if (p < 0.5) {
        starfield(fb, frame, { speed: 1, numStars: 60 });
        fb.drawCenteredText(centerY, "✦ 3D Starfield");
      } else {
        stars(fb, frame, { density: 0.004 });
        aurora(fb, frame, { intensity: 0.6 });
        fb.drawCenteredText(centerY, "Northern Lights");
      }
      break;
    }

    case 'BG_PATTERNS': {
      fb.drawCenteredText(2, "─── PATTERN EFFECTS ───");

      if (p < 0.5) {
        waves(fb, frame, { amplitude: 3, frequency: 0.08, char: '~', baseY: centerY + 5 });
        waves(fb, frame, { amplitude: 2, frequency: 0.1, char: '≈', baseY: centerY + 3 });
        fb.drawCenteredText(centerY - 2, "Ocean Waves");
      } else {
        ripples(fb, frame, { speed: 0.8 });
        fb.drawCenteredText(centerY, "Ripple Effect");
      }
      break;
    }

    // ========== TEXT EFFECTS ==========
    case 'TEXT_TYPE': {
      stars(fb, frame, { density: 0.003 });
      boxBorder(fb, { x: 10, y: 5, width: fb.width - 20, height: fb.height - 10, style: 'rounded' });

      fb.drawCenteredText(7, "─ Typewriter Effect ─");
      drawTypewriter(fb, 15, centerY, "Characters appear one by one...", p, { cursor: '▌' });
      break;
    }

    case 'TEXT_WAVE': {
      floatingParticles(fb, frame, { count: 8, char: '·' });

      fb.drawCenteredText(5, "─ Wave Text Effect ─");
      drawWaveText(fb, centerY - 1, "Text that flows like water", frame, { amplitude: 2, frequency: 0.25 });
      drawWaveText(fb, centerY + 2, "Each letter bobs up and down", frame, { amplitude: 1.5, frequency: 0.3 });
      break;
    }

    case 'TEXT_GLITCH': {
      staticNoise(fb, frame, { density: 0.02 });

      fb.drawCenteredText(5, "─ Glitch Effect ─");
      drawGlitchText(fb, centerX - 12, centerY - 1, "SYSTEM MALFUNCTION", frame, { intensity: 0.15 });
      drawGlitchText(fb, centerX - 10, centerY + 1, "ERROR: REALITY", frame, { intensity: 0.2 });
      break;
    }

    case 'TEXT_SCATTER': {
      stars(fb, frame, { density: 0.004 });

      fb.drawCenteredText(5, "─ Scatter & Assemble ─");

      if (p < 0.5) {
        drawScatterText(fb, "LETTERS FLY IN", p * 2, { cy: centerY });
      } else {
        fb.drawCenteredText(centerY, "LETTERS FLY IN");
        sparkles(fb, frame, { density: 0.01 });
      }
      break;
    }

    // ========== PARTICLES ==========
    case 'PART_CONFETTI': {
      fb.drawCenteredText(3, "─── CELEBRATION! ───");
      fb.drawCenteredText(centerY, "🎉 CONFETTI & SPARKLES 🎉");

      confetti(fb, frame, { count: 25 });
      sparkles(fb, frame, { density: 0.008 });

      // Burst in middle
      if (localFrame > 24 && localFrame < 60) {
        burst(fb, frame, { cx: centerX, cy: centerY, count: 16, startFrame: scene.start + 24 });
      }
      break;
    }

    case 'PART_NATURE': {
      fb.drawCenteredText(3, "─── NATURE PARTICLES ───");

      if (p < 0.5) {
        leaves(fb, frame, { count: 12 });
        fb.drawCenteredText(centerY, "🍂 Falling Leaves");
      } else {
        embers(fb, frame, { count: 15 });
        fb.drawCenteredText(centerY, "🔥 Rising Embers");
      }
      break;
    }

    case 'PART_LOVE': {
      stars(fb, frame, { density: 0.003 });

      fb.drawCenteredText(3, "─── FLOATING SYMBOLS ───");

      if (p < 0.5) {
        hearts(fb, frame, { count: 10 });
        fb.drawCenteredText(centerY, "♥ Floating Hearts ♥");
      } else {
        musicNotes(fb, frame, { count: 12 });
        fb.drawCenteredText(centerY, "♪ Music Notes ♫");
      }
      break;
    }

    // ========== BORDERS ==========
    case 'BORDER_GROW': {
      fireflies(fb, frame, { count: 5 });

      fb.drawCenteredText(centerY, "Watch the border grow...");

      growBorder(fb, easeInOut(p), {
        x: 8, y: 4,
        width: fb.width - 16, height: fb.height - 8,
        style: 'double'
      });
      break;
    }

    case 'BORDER_MARCH': {
      stars(fb, frame, { density: 0.003 });

      marchingAnts(fb, frame, { x: 5, y: 3, width: fb.width - 10, height: fb.height - 6, speed: 0.5 });

      framedTitle(fb, 3, " Marching Ants ", { style: 'single' });
      fb.drawCenteredText(centerY, "Animated border pattern");
      dividerWithText(fb, fb.height - 4, " borders.js ");
      break;
    }

    // ========== FINALE ==========
    case 'FINALE': {
      // Layer everything together
      starfield(fb, frame, { speed: 0.5, numStars: 30 });
      aurora(fb, frame, { intensity: 0.3 });

      // Border
      if (p < 0.2) {
        growBorder(fb, p * 5, { x: 3, y: 2, width: fb.width - 6, height: fb.height - 4, style: 'double' });
      } else {
        boxBorder(fb, { x: 3, y: 2, width: fb.width - 6, height: fb.height - 4, style: 'double' });
      }

      // Title
      framedTitle(fb, 2, " HELPERS DEMO ", { style: 'double' });

      // Animated text
      drawWaveText(fb, centerY - 3, "All Effects Combined!", frame, { amplitude: 1 });

      // Stats
      fb.drawCenteredText(centerY, "69 Effects Available");
      fb.drawCenteredText(centerY + 2, "transitions · backgrounds · text · particles · borders");

      // Particles
      confetti(fb, frame, { count: 10 });
      sparkles(fb, frame, { density: 0.004 });
      floatingParticles(fb, frame, { count: 6, char: '◇' });
      break;
    }

    case 'OUTRO': {
      stars(fb, frame, { density: 0.006 * (1 - p) });

      if (p < 0.7) {
        fb.drawCenteredText(centerY - 1, "Thanks for watching!");
        fb.drawCenteredText(centerY + 1, "import from './helpers/index.js'");
      }

      // Fade out with circle close
      if (p > 0.5) {
        circleClose(fb, (p - 0.5) * 2);
      }
      break;
    }

    default:
      fb.drawCenteredText(centerY, "Demo Complete!");
  }
}

// Main execution
async function main() {
  const engine = new AnimationEngine();

  console.log('Starting Helpers Demo...');
  console.log(`Duration: ${Math.round(TOTAL_FRAMES / FPS)}s (${TOTAL_FRAMES} frames @ ${FPS}fps)`);
  console.log('Press Ctrl+C to exit\n');

  await engine.playAnimation(renderFrame, TOTAL_FRAMES, FPS);

  console.log('\nDemo complete!');
}

main().catch(console.error);
