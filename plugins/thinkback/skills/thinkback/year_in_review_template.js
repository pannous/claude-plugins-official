/* eslint-disable */
/**
 * Year in Review Animation Template
 *
 * This template uses the SceneManager for guaranteed timing:
 * - Scenes are defined in SECONDS (not frames)
 * - Each scene has automatic transition in/out phases (~0.5s each)
 * - Content is guaranteed time to be absorbed (HOLD phase, default 2s)
 * - Total duration is computed automatically
 *
 * Scene timing breakdown (for a 5s scene with default 2s hold):
 * - 0.0s - 0.5s: TRANSITION_IN (content hidden)
 * - 0.5s - 2.5s: CONTENT (content animates in, contentProgress 0→1)
 * - 2.5s - 4.5s: HOLD (content fully visible, time to read)
 * - 4.5s - 5.0s: TRANSITION_OUT (fade out)
 *
 * Save the customized version as year_in_review.js in this folder.
 *
 * IMPORTANT: DO NOT USE ES MODULE IMPORTS (import/export statements)
 * This file is loaded as a regular <script> tag in year_in_review.html, not as a module.
 * All helper functions are available on globalThis from scripts loaded before this one.
 *
 * To use helper functions, destructure from globalThis at the top of your file:
 *
 *   const {
 *     // Scene system (REQUIRED)
 *     SceneManager, staggeredReveal, easeInOut, easeOut, animateCounter,
 *     // Backgrounds
 *     stars, fireflies, dust, snow, fog, aurora, waves, rain,
 *     // Particles
 *     floatingParticles, embers, sparkles, confetti, hearts,
 *     // Transitions
 *     dissolve, circleReveal, circleClose, fade, wipeLeft, wipeRight, irisOut,
 *     // Text effects
 *     drawTypewriterCentered, drawFadeInText, slideIn, drawGlitchText,
 *   } = globalThis;
 *
 * See helpers/index.js for the complete list of available functions.
 */

// =============================================================================
// HELPER DESTRUCTURING (must come BEFORE SceneManager usage)
// =============================================================================

// Get helpers from globalThis - SceneManager MUST be destructured before use
const {
  // Scene system (REQUIRED - must be first)
  SceneManager, staggeredReveal, easeInOut, easeOut, animateCounter,
  // Backgrounds
  stars, fireflies, dust, snow, fog, aurora, waves, rain,
  // Particles
  floatingParticles, embers, sparkles, confetti, hearts,
  // Transitions
  dissolve, circleReveal, circleClose, fade, wipeLeft, wipeRight, irisOut,
  // Text effects
  drawTypewriterCentered, drawFadeInText, slideIn, drawGlitchText,
  // Claude branding & intro (REQUIRED for intro scene)
  drawThinkbackIntro, CLAUDE_ORANGE,
} = globalThis;

// =============================================================================
// SCENE DEFINITIONS (in seconds)
// =============================================================================

// Define your scenes with durations in SECONDS
// The SceneManager will compute frame ranges automatically
//
// Each scene has:
// - duration: Total scene length in seconds
// - hold: (optional) Time content stays fully visible before transition out (default: 2s)
//
// The system guarantees:
// - ~0.5s transition in
// - Content animation phase (remaining time after transitions and hold)
// - Your specified hold time (default 2s)
// - ~0.5s transition out
//
// IMPORTANT: The first scene MUST be 'thinkback_intro' using drawThinkbackIntro()
const SCENE_DEFINITIONS = [
  { name: 'thinkback_intro', duration: 7, hold: 2 }, // REQUIRED: Branded intro with Clawd & logo
  { name: 'stats', duration: 6, hold: 2.5 },         // 2.5s hold for more stats
  { name: 'projects', duration: 6, hold: 2.5 },      // Project showcase scene
  { name: 'closing', duration: 4, hold: 1.5 },       // 1.5s hold (shorter scene)
];

// =============================================================================
// USER PERSONALIZATION (customize these based on stats analysis)
// =============================================================================

// Personalization for the intro scene - customize based on user's stats!
// Examples:
//   - Night owl: { userName: 'the midnight coder', tagline: 'burning the midnight oil' }
//   - Prolific: { userName: 'the prolific builder', tagline: '1,234 commits and counting' }
//   - Explorer: { userName: '@username', tagline: 'your year across the codebase' }
const USER_INTRO = {
  userName: 'you',                    // Replace with user's name or creative handle
  year: 2025,                         // Year being reviewed
  tagline: 'your year with Claude',   // Optional tagline based on their story
};

// Create the scene manager - this computes TOTAL_FRAMES automatically
const sceneManager = new SceneManager(SCENE_DEFINITIONS);
const TOTAL_FRAMES = sceneManager.getTotalFrames();

// =============================================================================
// ANIMATION UTILITIES (provided by scene_system.js)
// =============================================================================

// These are now available from globalThis:
// - easeInOut(t) - smooth ease in/out
// - easeOut(t) - fast start, slow end
// - animateCounter(target, progress) - animate a number from 0 to target
// - staggeredReveal(count, overlap) - create staggered timing for lists

// Seeded random - returns consistent values for the same seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Figlet-style font for large ASCII text (5 rows high, 5 chars wide)
const FIGLET_FONT = {
  '0': [' @@@ ', '@   @', '@   @', '@   @', ' @@@ '],
  '1': ['  @  ', ' @@  ', '  @  ', '  @  ', ' @@@ '],
  '2': [' @@@ ', '@   @', '  @@ ', ' @   ', '@@@@@'],
  '3': [' @@@ ', '@   @', '  @@ ', '@   @', ' @@@ '],
  '4': ['@   @', '@   @', '@@@@@', '    @', '    @'],
  '5': ['@@@@@', '@    ', '@@@@ ', '    @', '@@@@ '],
  '6': [' @@@ ', '@    ', '@@@@ ', '@   @', ' @@@ '],
  '7': ['@@@@@', '    @', '   @ ', '  @  ', '  @  '],
  '8': [' @@@ ', '@   @', ' @@@ ', '@   @', ' @@@ '],
  '9': [' @@@ ', '@   @', ' @@@@', '    @', ' @@@ '],
  'A': ['  @  ', ' @ @ ', '@@@@@', '@   @', '@   @'],
  'B': ['@@@@ ', '@   @', '@@@@ ', '@   @', '@@@@ '],
  'C': [' @@@@', '@    ', '@    ', '@    ', ' @@@@'],
  'D': ['@@@@ ', '@   @', '@   @', '@   @', '@@@@ '],
  'E': ['@@@@@', '@    ', '@@@@', '@    ', '@@@@@'],
  'F': ['@@@@@', '@    ', '@@@@ ', '@    ', '@    '],
  'G': [' @@@@', '@    ', '@  @@', '@   @', ' @@@ '],
  'H': ['@   @', '@   @', '@@@@@', '@   @', '@   @'],
  'I': [' @@@ ', '  @  ', '  @  ', '  @  ', ' @@@ '],
  'J': ['  @@@', '    @', '    @', '@   @', ' @@@ '],
  'K': ['@   @', '@  @ ', '@@   ', '@  @ ', '@   @'],
  'L': ['@    ', '@    ', '@    ', '@    ', '@@@@@'],
  'M': ['@   @', '@@ @@', '@ @ @', '@   @', '@   @'],
  'N': ['@   @', '@@  @', '@ @ @', '@  @@', '@   @'],
  'O': [' @@@ ', '@   @', '@   @', '@   @', ' @@@ '],
  'P': ['@@@@ ', '@   @', '@@@@ ', '@    ', '@    '],
  'Q': [' @@@ ', '@   @', '@ @ @', '@  @ ', ' @@ @'],
  'R': ['@@@@ ', '@   @', '@@@@ ', '@  @ ', '@   @'],
  'S': [' @@@@', '@    ', ' @@@ ', '    @', '@@@@ '],
  'T': ['@@@@@', '  @  ', '  @  ', '  @  ', '  @  '],
  'U': ['@   @', '@   @', '@   @', '@   @', ' @@@ '],
  'V': ['@   @', '@   @', '@   @', ' @ @ ', '  @  '],
  'W': ['@   @', '@   @', '@ @ @', '@@ @@', '@   @'],
  'X': ['@   @', ' @ @ ', '  @  ', ' @ @ ', '@   @'],
  'Y': ['@   @', ' @ @ ', '  @  ', '  @  ', '  @  '],
  'Z': ['@@@@@', '   @ ', '  @  ', ' @   ', '@@@@@'],
  ' ': ['     ', '     ', '     ', '     ', '     '],
};

// =============================================================================
// SCENE RENDERERS
// =============================================================================

/**
 * Each scene renderer receives:
 * - fb: Framebuffer with drawing methods
 * - frame: Global frame number (for animations)
 * - scene: Scene info from SceneManager:
 *   - name: Scene name
 *   - phase: 'TRANSITION_IN' | 'CONTENT' | 'HOLD' | 'TRANSITION_OUT'
 *   - contentProgress: 0-1, progress through CONTENT phase
 *   - transitionProgress: 0-1, progress through current transition
 */

/**
 * REQUIRED: Thinkback intro scene with Clawd, Claude Code logo, and personalized text.
 * This scene MUST be the first scene in every Thinkback animation.
 */
function renderThinkbackIntro(fb, frame, scene) {
  // Starfield background
  stars(fb, frame, { density: 0.012, twinkle: true });

  // Calculate overall progress including hold phase
  let p = 0;
  if (scene.phase === 'TRANSITION_IN') {
    p = scene.transitionProgress * 0.1; // Start slowly during transition in
  } else if (scene.phase === 'CONTENT') {
    p = 0.1 + scene.contentProgress * 0.7; // Main content animation
  } else if (scene.phase === 'HOLD' || scene.phase === 'TRANSITION_OUT') {
    p = 1; // Fully visible during hold
  }

  // Draw the branded intro with all elements
  drawThinkbackIntro(fb, frame, p, USER_INTRO);

  // Add sparkles during hold and transition out for celebration
  if (scene.phase === 'HOLD' || scene.phase === 'TRANSITION_OUT') {
    sparkles(fb, frame, { density: 0.004 });
  }

  // Transition out
  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderStats(fb, frame, scene) {
  stars(fb, frame, { density: 0.003 });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    fb.drawCenteredText(6, '=== Your Stats ===');

    // Use staggered reveal for list items
    const reveal = globalThis.staggeredReveal(3, 0.5);

    const stats = [
      { label: 'Commits', value: 100 },
      { label: 'Sessions', value: 500 },
      { label: 'Messages', value: 2000 },
    ];

    stats.forEach((stat, i) => {
      const itemP = reveal(p, i);
      if (itemP > 0) {
        const count = globalThis.animateCounter(stat.value, itemP);
        fb.drawCenteredText(10 + i * 3, `${stat.label}: ${count.toLocaleString()}`);
      }
    });
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

/**
 * Example scene showing project highlights
 */
function renderProjects(fb, frame, scene) {
  stars(fb, frame, { density: 0.003 });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    fb.drawCenteredText(6, '=== Your Projects ===');

    // Example project list - in real usage, this would be populated from stats
    const projects = [
      { name: 'claude-code', commits: 42 },
      { name: 'awesome-project', commits: 28 },
      { name: 'open-source-lib', commits: 15 },
      { name: 'side-project', commits: 8 },
    ];

    const reveal = globalThis.staggeredReveal(projects.length, 0.4);

    projects.forEach((project, i) => {
      const itemP = reveal(p, i);
      if (itemP > 0) {
        const y = 10 + i * 2;
        const text = `• ${project.name} (${project.commits} commits)`;
        fb.drawCenteredText(y, text);
      }
    });
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderClosing(fb, frame, scene) {
  stars(fb, frame, { density: 0.01, twinkle: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    if (p > 0.2) {
      fb.drawCenteredText(Math.floor(fb.height / 2) - 2, 'Thank you');
    }

    if (p > 0.5) {
      fb.drawCenteredText(Math.floor(fb.height / 2) + 2, 'See you next year!');
    }

    sparkles(fb, frame, { density: 0.006 });
  }

  // Final fade to black
  if (scene.phase === 'TRANSITION_OUT') {
    const fadeP = 1 - scene.transitionProgress;
    for (let y = 0; y < fb.height; y++) {
      for (let x = 0; x < fb.width; x++) {
        if (Math.random() < fadeP * 0.5) {
          fb.setPixel(x, y, ' ', -100);
        }
      }
    }
  }
}

// Map scene names to renderers
const SCENE_RENDERERS = {
  thinkback_intro: renderThinkbackIntro,
  stats: renderStats,
  projects: renderProjects,
  closing: renderClosing,
};

// =============================================================================
// MAIN ANIMATION FUNCTION
// =============================================================================

/**
 * Main animation function - called once per frame
 *
 * @param {Object} fb - Framebuffer with drawing methods
 * @param {number} frame - Current frame number (0 to TOTAL_FRAMES-1)
 */
function mainAnimation(fb, frame) {
  // Get current scene info from the manager
  const scene = sceneManager.getSceneAt(frame);

  if (!scene) {
    fb.drawCenteredText(Math.floor(fb.height / 2), 'Animation complete');
    return;
  }

  // Call the appropriate scene renderer
  const renderer = SCENE_RENDERERS[scene.name];
  if (renderer) {
    renderer(fb, frame, scene);
  }
}

/**
 * Returns the name of the current scene (shown in player UI)
 */
function getSceneName(frame) {
  const scene = sceneManager.getSceneAt(frame);
  if (!scene) return 'Complete';

  const names = {
    thinkback_intro: 'Think Back',
    stats: 'The Stats',
    projects: 'Your Projects',
    closing: 'Closing',
  };

  return names[scene.name] || scene.name;
}

// =============================================================================
// EXPORTS - CRITICAL: Must use this exact format!
// =============================================================================
// The year_in_review.html expects globalThis.YearInReviewScenes with mainAnimation.
// DO NOT use: globalThis.render = render; globalThis.TOTAL_FRAMES = ...;
// That pattern will cause "YearInReviewScenes not loaded" errors.

globalThis.YearInReviewScenes = {
  TOTAL_FRAMES,
  FIGLET_FONT,
  easeInOut: globalThis.easeInOut,
  seededRandom,
  mainAnimation,
  getSceneName,
  // Export scene manager for debugging
  sceneManager,
};
