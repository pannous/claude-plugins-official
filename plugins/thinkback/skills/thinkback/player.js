#!/usr/bin/env node
/* eslint-disable */
/**
 * 2025 Year in Review - ASCII Animation (Terminal Version)
 * A celebration of collaboration between Thariq and Claude Code
 */

import { AnimationEngine } from './ascii_anim.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { access } from 'fs/promises';
import { constants } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to safely import optional modules
async function safeImport(modulePath, description) {
  const fullPath = join(__dirname, modulePath);
  try {
    await access(fullPath, constants.F_OK);
    await import(modulePath);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ENOENT') {
      // Module doesn't exist, skip it silently (it's optional)
      return;
    }
    console.error(`Error loading ${description} (${modulePath}):`, err.message);
  }
}

// Helper to require import modules
async function requireImport(modulePath, description) {
  try {
    await import(modulePath);
  } catch (err) {
    console.error(`\nFailed to load ${description}:`);
    console.error(`  File: ${modulePath}`);
    console.error(`  Error: ${err.message}`);
    if (err.stack) {
      // Show a few lines of stack trace for context
      const stackLines = err.stack.split('\n').slice(1, 4);
      console.error('  Stack:', stackLines.join('\n        '));
    }
    throw err;
  }
}

// Load dependencies first (they set globalThis)
try {
  await requireImport('./helpers/index.js', 'animation helpers');
} catch (err) {
  console.error('\nAnimation helpers failed to load. Cannot continue.');
  process.exit(1);
}

// Optional vibe-specific helpers (may not exist depending on vibe choice)
await safeImport('./rpg_class.js', 'RPG class helpers');
await safeImport('./tarot.js', 'tarot helpers');

// Check if year_in_review.js exists
const yearInReviewPath = join(__dirname, 'year_in_review.js');
try {
  await access(yearInReviewPath, constants.F_OK);
} catch (err) {
  console.error('\nError: year_in_review.js not found!');
  console.error('Please run the /thinkback command first to generate your thinkback animation.');
  process.exit(1);
}

// Load generated animation data (reads from globalThis, sets globalThis.YearInReviewScenes)
try {
  await import('./year_in_review.js');
} catch (err) {
  console.error('\nFailed to load year_in_review.js:');
  console.error(`  Error: ${err.message}`);
  if (err.stack) {
    const stackLines = err.stack.split('\n').slice(1, 6);
    console.error('  Stack:\n   ', stackLines.join('\n    '));
  }
  process.exit(1);
}

// Validate that required exports exist
if (!globalThis.YearInReviewScenes) {
  console.error('\nError: year_in_review.js did not export YearInReviewScenes!');
  console.error('Make sure the file ends with:');
  console.error('  globalThis.YearInReviewScenes = { TOTAL_FRAMES, mainAnimation, ... }');
  process.exit(1);
}

const { mainAnimation, TOTAL_FRAMES } = globalThis.YearInReviewScenes;

if (!mainAnimation || typeof mainAnimation !== 'function') {
  console.error('\nError: mainAnimation is not defined or not a function!');
  console.error('Check that year_in_review.js exports a valid mainAnimation function.');
  process.exit(1);
}

if (!TOTAL_FRAMES || typeof TOTAL_FRAMES !== 'number' || TOTAL_FRAMES <= 0) {
  console.error('\nError: TOTAL_FRAMES is not defined or invalid!');
  console.error(`  Got: ${TOTAL_FRAMES} (type: ${typeof TOTAL_FRAMES})`);
  process.exit(1);
}

async function main() {
  const engine = new AnimationEngine();

  // Handle Ctrl+C immediately so user can exit at any time
  process.on('SIGINT', () => {
    engine.showCursor();
    console.log("\n\nThanks for watching! Happy New Year!\n");
    process.exit(0);
  });

  // Listen for ESC key to exit
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
      // ESC key is \x1b (27)
      if (key[0] === 0x1b && key.length === 1) {
        engine.showCursor();
        console.log("\n\nThanks for watching! Happy New Year!\n");
        process.exit(0);
      }
      // Also handle Ctrl+C in raw mode
      if (key[0] === 0x03) {
        engine.showCursor();
        console.log("\n\nThanks for watching! Happy New Year!\n");
        process.exit(0);
      }
    });
  }

  try {
    await engine.playAnimation(mainAnimation, TOTAL_FRAMES, 24);
  } catch (err) {
    engine.showCursor();
    console.error("\n" + "=".repeat(60));
    console.error("  ANIMATION PLAYBACK ERROR");
    console.error("=".repeat(60));
    console.error(`\nError: ${err.message}`);
    if (err.stack) {
      console.error('\nStack trace:');
      const stackLines = err.stack.split('\n').slice(1, 10);
      stackLines.forEach(line => console.error('  ' + line.trim()));
    }
    console.error("\nThis error occurred during animation playback.");
    console.error("Tip: Run 'node validate.js' in the thinkback folder to check your animation.");
    process.exit(1);
  }

  // Hold final frame
  engine.showCursor();
  console.log("\n\n" + "=".repeat(60));
  console.log("  That's a wrap on 2025!");
  console.log("=".repeat(60) + "\n");
}

main().catch(err => {
  console.error("\n" + "=".repeat(60));
  console.error("  ERROR RUNNING ANIMATION");
  console.error("=".repeat(60));
  console.error(`\nError: ${err.message}`);
  if (err.stack) {
    console.error('\nStack trace:');
    const stackLines = err.stack.split('\n').slice(1, 8);
    stackLines.forEach(line => console.error('  ' + line.trim()));
  }
  console.error("\nTip: Run 'node validate.js' in the thinkback folder to check for common issues.");
  console.error("");
  process.exit(1);
});
