#!/usr/bin/env node
/* eslint-disable */
/**
 * Test script for iterating on the Thinkback intro scene
 *
 * Usage:
 *   node test_intro.js              # Play intro animation
 *   node test_intro.js --loop       # Loop continuously
 *   node test_intro.js --frame 50   # Show a specific frame
 *   node test_intro.js --slow       # Play at half speed
 *   node test_intro.js --static     # Show static frame (for thumbnail/still)
 */

import { AnimationEngine, FrameBuffer } from '../ascii_anim.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load helpers
await import('../helpers/index.js');

// Get helpers from globalThis
const {
  SceneManager, stars, sparkles, dissolve,
  drawThinkbackIntro, CLAUDE_ORANGE,
} = globalThis;

// Parse command line args
const args = process.argv.slice(2);
const loop = args.includes('--loop');
const slow = args.includes('--slow');
const frameIdx = args.indexOf('--frame');
const singleFrame = frameIdx !== -1 ? parseInt(args[frameIdx + 1], 10) : null;

// Scene definition for intro only
const SCENE_DEFINITIONS = [
  { name: 'thinkback_intro', duration: 7, hold: 2 },
];

// Intro options
const INTRO_OPTIONS = {
  year: 2025,
};

const sceneManager = new SceneManager(SCENE_DEFINITIONS);
const TOTAL_FRAMES = sceneManager.getTotalFrames();

function renderIntro(fb, frame) {
  const scene = sceneManager.getSceneAt(frame);
  if (!scene) return;

  // Starfield background
  stars(fb, frame, { density: 0.012, twinkle: true });

  // Calculate overall progress including hold phase
  let p = 0;
  if (scene.phase === 'TRANSITION_IN') {
    p = scene.transitionProgress * 0.1;
  } else if (scene.phase === 'CONTENT') {
    p = 0.1 + scene.contentProgress * 0.7;
  } else if (scene.phase === 'HOLD' || scene.phase === 'TRANSITION_OUT') {
    p = 1;
  }

  // Draw the intro
  drawThinkbackIntro(fb, frame, p, INTRO_OPTIONS);

  // Add sparkles during hold
  if (scene.phase === 'HOLD' || scene.phase === 'TRANSITION_OUT') {
    sparkles(fb, frame, { density: 0.004 });
  }

  // Transition out
  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

async function main() {
  const engine = new AnimationEngine();
  const fps = slow ? 12 : 24;

  console.log("\n" + "=".repeat(60));
  console.log("  THINKBACK INTRO TEST");
  console.log("=".repeat(60));
  console.log(`\n  Total frames: ${TOTAL_FRAMES}`);
  console.log(`  FPS: ${fps}`);
  console.log(`  Duration: ${(TOTAL_FRAMES / fps).toFixed(1)}s`);
  if (loop) console.log("  Mode: LOOP (Ctrl+C to exit)");
  if (singleFrame !== null) console.log(`  Showing frame: ${singleFrame}`);
  console.log("");

  await new Promise(resolve => setTimeout(resolve, 2000));

  process.on('SIGINT', () => {
    engine.showCursor();
    console.log("\n\nExited.\n");
    process.exit(0);
  });

  try {
    if (singleFrame !== null) {
      // Show a single frame and hold
      engine.clearScreen();
      engine.hideCursor();
      const fb = new FrameBuffer(engine.width, engine.height);
      fb.clear();
      renderIntro(fb, singleFrame);
      fb.blit();

      // Show frame info
      const scene = sceneManager.getSceneAt(singleFrame);
      console.log(`\nFrame ${singleFrame}/${TOTAL_FRAMES} | Phase: ${scene?.phase || 'N/A'}`);
      console.log("Press Ctrl+C to exit");

      // Hold indefinitely
      await new Promise(() => {});
    } else {
      // Play animation
      do {
        await engine.playAnimation(renderIntro, TOTAL_FRAMES, fps);
        if (loop) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } while (loop);
    }
  } catch (err) {
    engine.showCursor();
    console.error("\nError:", err.message);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(1, 5).join('\n'));
    }
    process.exit(1);
  }

  engine.showCursor();
  console.log("\n\nDone.\n");
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
