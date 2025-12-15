#!/usr/bin/env node
/* eslint-disable */
/**
 * Validates thinkback animation files for common issues
 * Run with: node validate.js
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let hasErrors = false;

function error(msg) {
  console.error(`❌ ${msg}`);
  hasErrors = true;
}

function success(msg) {
  console.log(`✓ ${msg}`);
}

async function validate() {
  console.log('Validating thinkback animation files...\n');

  // Load helpers first
  await import('../helpers/index.js');

  // Load the animation
  await import('../year_in_review.js');

  const { YearInReviewScenes } = globalThis;

  // Check 1: YearInReviewScenes exists
  if (!YearInReviewScenes) {
    error('YearInReviewScenes not exported to globalThis');
    return;
  }
  success('YearInReviewScenes exported');

  // Check 2: Required exports exist
  const requiredExports = ['TOTAL_FRAMES', 'mainAnimation', 'sceneManager'];
  for (const key of requiredExports) {
    if (!(key in YearInReviewScenes)) {
      error(`Missing export: ${key}`);
    } else {
      success(`Export exists: ${key}`);
    }
  }

  // Check 3: TOTAL_FRAMES is reasonable
  const { TOTAL_FRAMES, sceneManager } = YearInReviewScenes;
  if (typeof TOTAL_FRAMES !== 'number' || TOTAL_FRAMES < 24) {
    error(`TOTAL_FRAMES is invalid: ${TOTAL_FRAMES} (expected >= 24)`);
  } else {
    success(`TOTAL_FRAMES = ${TOTAL_FRAMES} (${(TOTAL_FRAMES / 24).toFixed(1)}s at 24fps)`);
  }

  // Check 4: Scene names are defined (not undefined)
  if (sceneManager && sceneManager.scenes) {
    const undefinedScenes = sceneManager.scenes.filter(s => !s.name);
    if (undefinedScenes.length > 0) {
      error(`${undefinedScenes.length} scenes have undefined names - did you use 'id' instead of 'name' in SCENE_DEFINITIONS?`);
    } else {
      success(`All ${sceneManager.scenes.length} scenes have valid names`);
    }

    // List scene names for reference
    console.log('\n  Scenes:');
    for (const scene of sceneManager.scenes) {
      console.log(`    - ${scene.name} (${scene.duration}s, frames ${scene.startFrame}-${scene.endFrame})`);
    }
  }

  // Check 5: Test render function with a few frames
  const { mainAnimation } = YearInReviewScenes;
  if (typeof mainAnimation === 'function') {
    // Create a mock framebuffer
    const mockFb = {
      width: 80,
      height: 24,
      drawText: () => {},
      drawCenteredText: () => {},
      drawLargeText: () => {},
      drawLargeTextCentered: () => {},
      setPixel: () => {},
      drawBox: () => {},
      drawCircle: () => {},
      clear: () => {},
      getPixel: () => ' ',
    };

    const testFrames = [0, Math.floor(TOTAL_FRAMES / 2), TOTAL_FRAMES - 1];
    let renderErrors = [];

    for (const frame of testFrames) {
      try {
        mainAnimation(mockFb, frame);
      } catch (e) {
        renderErrors.push({ frame, error: e.message });
      }
    }

    if (renderErrors.length > 0) {
      for (const { frame, error: msg } of renderErrors) {
        error(`Render error at frame ${frame}: ${msg}`);
      }
    } else {
      success(`Render function executes without errors`);
    }
  }

  // Check 6: Verify scene transitions cover all frames
  if (sceneManager) {
    let coveredFrames = 0;
    for (const scene of sceneManager.scenes) {
      coveredFrames += scene.durationFrames;
    }
    if (coveredFrames !== TOTAL_FRAMES) {
      error(`Scene frames (${coveredFrames}) don't match TOTAL_FRAMES (${TOTAL_FRAMES})`);
    } else {
      success(`All frames are covered by scenes`);
    }
  }

  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ Validation FAILED - fix errors above');
    process.exit(1);
  } else {
    console.log('✓ Validation PASSED');
    process.exit(0);
  }
}

validate().catch(err => {
  error(`Validation crashed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
