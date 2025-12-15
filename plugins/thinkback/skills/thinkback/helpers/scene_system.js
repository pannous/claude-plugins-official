/* eslint-disable */
/**
 * Deterministic Scene System with Seconds-Based Timing
 *
 * This system guarantees:
 * 1. Scenes are defined in SECONDS, not frames - no hallucinated timing
 * 2. Each scene has guaranteed phases: transition in, content reveal, hold, transition out
 * 3. Content is NEVER shown during transitions
 * 4. Hold time ensures viewers can absorb content before it disappears (default 2s)
 * 5. Total animation duration is computed automatically from scene definitions
 *
 * Scene Phases:
 * - TRANSITION_IN: Content hidden, transition effect plays (~0.5s)
 * - CONTENT: Content animates in with normalized progress (0-1)
 * - HOLD: Content fully visible, guaranteed reading time (default 2s)
 * - TRANSITION_OUT: Fade/transition out begins (~0.5s)
 *
 * Usage:
 *   const SCENE_DEFINITIONS = [
 *     { name: 'opening', duration: 5 },              // 2s default hold
 *     { name: 'tarot', duration: 7.5, hold: 3 },     // 3s hold for dense content
 *     { name: 'closing', duration: 4, hold: 1.5 },   // 1.5s hold
 *   ];
 */
(function() {

const FPS = 24; // Standard frame rate

// Default timing in seconds
const DEFAULT_TRANSITION_IN_SECONDS = 0.5;   // 0.5s transition in
const DEFAULT_TRANSITION_OUT_SECONDS = 0.5;  // 0.5s transition out
const DEFAULT_HOLD_SECONDS = 2;              // 2s hold before transition out

// Minimum content time to prevent scenes that are all transitions
const MIN_CONTENT_SECONDS = 0.5;

/**
 * Calculate phase percentages from seconds-based timing
 *
 * @param {number} durationSeconds - Total scene duration in seconds
 * @param {number} holdSeconds - Hold time in seconds
 * @param {number} transitionInSeconds - Transition in time in seconds
 * @param {number} transitionOutSeconds - Transition out time in seconds
 * @returns {object} Phase percentages { TRANSITION_IN, CONTENT, HOLD, TRANSITION_OUT }
 */
function calculatePhases(durationSeconds, holdSeconds, transitionInSeconds, transitionOutSeconds) {
  // Validate: ensure we have enough time for all phases
  const fixedTime = transitionInSeconds + holdSeconds + transitionOutSeconds;

  if (fixedTime >= durationSeconds) {
    // Not enough time - scale down proportionally but keep minimum content time
    const availableForFixed = durationSeconds - MIN_CONTENT_SECONDS;
    const scale = availableForFixed / fixedTime;

    transitionInSeconds *= scale;
    holdSeconds *= scale;
    transitionOutSeconds *= scale;
  }

  // Calculate percentages
  const transitionIn = transitionInSeconds / durationSeconds;
  const transitionOut = transitionOutSeconds / durationSeconds;
  const hold = holdSeconds / durationSeconds;
  const content = 1 - transitionIn - hold - transitionOut;

  return {
    TRANSITION_IN: transitionIn,
    CONTENT: content,
    HOLD: hold,
    TRANSITION_OUT: transitionOut,
  };
}

/**
 * SceneManager - The main class for managing scene-based animations
 *
 * Usage:
 *   const manager = new SceneManager([
 *     { name: 'intro', duration: 5 },           // 5 seconds, 2s default hold
 *     { name: 'stats', duration: 8, hold: 3 },  // 8 seconds, 3s hold
 *     { name: 'closing', duration: 4 },         // 4 seconds, 2s default hold
 *   ]);
 *
 *   // In your animation:
 *   const scene = manager.getSceneAt(frame);
 *   // scene = { name: 'intro', phase: 'CONTENT', contentProgress: 0.6, ... }
 */
class SceneManager {
  constructor(sceneDefinitions, options = {}) {
    this.fps = options.fps || FPS;
    this.defaultHold = options.defaultHold ?? DEFAULT_HOLD_SECONDS;
    this.defaultTransitionIn = options.defaultTransitionIn ?? DEFAULT_TRANSITION_IN_SECONDS;
    this.defaultTransitionOut = options.defaultTransitionOut ?? DEFAULT_TRANSITION_OUT_SECONDS;

    // Build scene list with computed frame ranges
    this.scenes = [];
    let currentFrame = 0;

    for (const def of sceneDefinitions) {
      const durationFrames = Math.round(def.duration * this.fps);

      // Get timing values (seconds)
      const holdSeconds = def.hold ?? this.defaultHold;
      const transitionInSeconds = def.transitionIn ?? this.defaultTransitionIn;
      const transitionOutSeconds = def.transitionOut ?? this.defaultTransitionOut;

      // Calculate phase percentages from seconds
      const phases = calculatePhases(
        def.duration,
        holdSeconds,
        transitionInSeconds,
        transitionOutSeconds
      );

      this.scenes.push({
        name: def.name,
        duration: def.duration,
        startFrame: currentFrame,
        endFrame: currentFrame + durationFrames,
        durationFrames,
        phases,
        // Store timing info for debugging
        timing: {
          hold: holdSeconds,
          transitionIn: transitionInSeconds,
          transitionOut: transitionOutSeconds,
        },
        // Store any custom data
        data: def.data || {},
      });

      currentFrame += durationFrames;
    }

    this.totalFrames = currentFrame;
    this.totalDuration = currentFrame / this.fps;
  }

  /**
   * Get the current scene and progress at a given frame
   *
   * @param {number} frame - Current frame number
   * @returns {object} Scene info with phase, progress, etc.
   */
  getSceneAt(frame) {
    // Find which scene we're in
    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i];
      if (frame >= scene.startFrame && frame < scene.endFrame) {
        const rawProgress = (frame - scene.startFrame) / scene.durationFrames;
        const phaseInfo = getScenePhase(rawProgress, scene.phases);

        return {
          name: scene.name,
          index: i,
          frame: frame - scene.startFrame, // Frame within this scene
          rawProgress,
          ...phaseInfo,
          data: scene.data,
          isFirst: i === 0,
          isLast: i === this.scenes.length - 1,
        };
      }
    }

    // Past the end - return last scene at 100%
    if (this.scenes.length > 0) {
      const lastScene = this.scenes[this.scenes.length - 1];
      return {
        name: lastScene.name,
        index: this.scenes.length - 1,
        frame: lastScene.durationFrames,
        rawProgress: 1,
        phase: 'TRANSITION_OUT',
        contentProgress: 1,
        transitionProgress: 0,
        data: lastScene.data,
        isFirst: false,
        isLast: true,
      };
    }

    return null;
  }

  /**
   * Get scene by name
   */
  getSceneByName(name) {
    return this.scenes.find(s => s.name === name);
  }

  /**
   * Get total frames (useful for TOTAL_FRAMES export)
   */
  getTotalFrames() {
    return this.totalFrames;
  }

  /**
   * Get total duration in seconds
   */
  getTotalDuration() {
    return this.totalDuration;
  }

  /**
   * Get scene names in order
   */
  getSceneNames() {
    return this.scenes.map(s => s.name);
  }

  /**
   * Simplified scene getter that returns { sceneId, progress }
   * This is a convenience wrapper around getSceneAt for simpler animations
   *
   * @param {number} frame - Current frame number
   * @returns {object} { sceneId, progress } where progress is 0-1
   */
  getScene(frame) {
    const info = this.getSceneAt(frame);
    if (!info) {
      return { sceneId: null, progress: 1 };
    }
    return {
      sceneId: info.name,
      progress: info.rawProgress,
    };
  }

  /**
   * Debug: Print scene timing info
   */
  debugTiming() {
    console.log('Scene Timing:');
    console.log('=============');
    for (const scene of this.scenes) {
      const { phases, timing } = scene;
      console.log(`${scene.name} (${scene.duration}s):`);
      console.log(`  Transition In:  ${(phases.TRANSITION_IN * 100).toFixed(1)}% (${timing.transitionIn}s)`);
      console.log(`  Content:        ${(phases.CONTENT * 100).toFixed(1)}% (${(phases.CONTENT * scene.duration).toFixed(1)}s)`);
      console.log(`  Hold:           ${(phases.HOLD * 100).toFixed(1)}% (${timing.hold}s)`);
      console.log(`  Transition Out: ${(phases.TRANSITION_OUT * 100).toFixed(1)}% (${timing.transitionOut}s)`);
    }
    console.log(`\nTotal: ${this.totalDuration}s (${this.totalFrames} frames)`);
  }
}

/**
 * Calculate which phase we're in and the progress within that phase
 *
 * @param {number} rawProgress - Scene progress 0-1
 * @param {object} phases - Phase durations as percentages
 * @returns {object} { phase, contentProgress, transitionProgress }
 */
function getScenePhase(rawProgress, phases) {
  const p = Math.max(0, Math.min(1, rawProgress));

  // Phase 1: TRANSITION_IN
  if (p < phases.TRANSITION_IN) {
    return {
      phase: 'TRANSITION_IN',
      contentProgress: 0,  // Content NOT visible yet
      transitionProgress: p / phases.TRANSITION_IN,
    };
  }

  // Phase 2: CONTENT
  const contentStart = phases.TRANSITION_IN;
  const contentEnd = 1 - phases.HOLD - phases.TRANSITION_OUT;

  if (p < contentEnd) {
    return {
      phase: 'CONTENT',
      contentProgress: (p - contentStart) / (contentEnd - contentStart),
      transitionProgress: 1,  // Transition complete
    };
  }

  // Phase 3: HOLD
  const holdEnd = 1 - phases.TRANSITION_OUT;
  if (p < holdEnd) {
    return {
      phase: 'HOLD',
      contentProgress: 1,  // Content fully revealed
      transitionProgress: 1,
    };
  }

  // Phase 4: TRANSITION_OUT
  return {
    phase: 'TRANSITION_OUT',
    contentProgress: 1,  // Content stays visible during fade
    transitionProgress: (1 - p) / phases.TRANSITION_OUT,
  };
}

/**
 * Render a scene with automatic transition handling
 *
 * @param {object} fb - Framebuffer
 * @param {number} frame - Current frame number
 * @param {number} rawProgress - Scene progress 0-1
 * @param {object} config - Scene configuration
 * @param {function} config.background - Background renderer (fb, frame)
 * @param {function} config.content - Content renderer (fb, frame, contentProgress)
 * @param {function} config.transitionIn - Transition in effect (fb, progress, frame)
 * @param {function} config.transitionOut - Transition out effect (fb, progress, frame)
 * @param {object} config.phases - Optional custom phase durations
 */
function renderScene(fb, frame, rawProgress, config) {
  const phases = config.phases;
  const { phase, contentProgress, transitionProgress } = getScenePhase(rawProgress, phases);

  // Always render background first (visible through transitions)
  if (config.background) {
    config.background(fb, frame);
  }

  // Only render content after transition-in completes
  if (phase !== 'TRANSITION_IN' && config.content) {
    config.content(fb, frame, contentProgress);
  }

  // Apply transition-in effect (masks/reveals content)
  if (phase === 'TRANSITION_IN' && config.transitionIn) {
    config.transitionIn(fb, transitionProgress, frame);
  }

  // Apply transition-out effect (fades/masks content)
  if (phase === 'TRANSITION_OUT' && config.transitionOut) {
    // transitionProgress goes from 1 to 0 during TRANSITION_OUT
    // Most transition functions expect 0-1 for "amount visible"
    config.transitionOut(fb, transitionProgress, frame);
  }
}

/**
 * Create a scene config helper for common patterns
 */
function createScene(options) {
  return {
    background: options.background || null,
    content: options.content || null,
    transitionIn: options.transitionIn || null,
    transitionOut: options.transitionOut || null,
    phases: options.phases,
  };
}

/**
 * Helper: Create staggered reveal timing for multiple items
 *
 * Returns a function that takes contentProgress and item index,
 * and returns the item's individual progress (0-1).
 *
 * @param {number} itemCount - Number of items to stagger
 * @param {number} overlap - How much items overlap (0 = sequential, 1 = all at once)
 * @returns {function} (contentProgress, itemIndex) => itemProgress
 */
function staggeredReveal(itemCount, overlap = 0.5) {
  return (contentProgress, itemIndex) => {
    if (itemCount <= 1) return contentProgress;

    const itemDuration = 1 / (1 + (itemCount - 1) * (1 - overlap));
    const itemStart = itemIndex * itemDuration * (1 - overlap);
    const itemEnd = itemStart + itemDuration;

    if (contentProgress < itemStart) return 0;
    if (contentProgress >= itemEnd) return 1;
    return (contentProgress - itemStart) / itemDuration;
  };
}

/**
 * Helper: Ease in/out function
 */
function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Helper: Ease out function (fast start, slow end)
 */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Helper: Animate a counter from 0 to target
 */
function animateCounter(target, progress) {
  return Math.floor(target * easeOut(progress));
}

// Export to globalThis for browser usage
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    SceneManager,
    getScenePhase,
    renderScene,
    createScene,
    staggeredReveal,
    easeInOut,
    easeOut,
    animateCounter,
    ANIMATION_FPS: FPS,
    DEFAULT_HOLD_SECONDS,
    DEFAULT_TRANSITION_IN_SECONDS,
    DEFAULT_TRANSITION_OUT_SECONDS,
  });
}

})();
