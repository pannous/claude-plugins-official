/* eslint-disable */
/**
 * Thinkback - Cozy Vibe Template
 *
 * Warm, gentle, and comforting. Like a bedtime story.
 * Stats are revealed softly with typewriter effects and gentle backgrounds.
 *
 * INJECTION POINTS (search for "INJECT:"):
 * - STATS object: Fill in all numeric/string values
 */

// =============================================================================
// HELPER DESTRUCTURING
// =============================================================================

const {
  // Scene system
  SceneManager, staggeredReveal, easeInOut, easeOut, animateCounter,
  // Backgrounds
  stars, fireflies, dust,
  // Particles
  floatingParticles, sparkles,
  // Transitions
  dissolve, circleReveal, fade,
  // Text effects
  drawTypewriterCentered, drawFadeInText,
  // Claude branding
  drawThinkbackIntro, CLAUDE_ORANGE,
} = globalThis;

// =============================================================================
// INJECT: STATS - Fill in all values below
// =============================================================================

const STATS = {
  userName: '',                // INJECT: User's name
  year: 2025,
  totalCommits: 0,             // INJECT: Total commits
  totalSessions: 0,            // INJECT: Total sessions
  totalMessages: 0,            // INJECT: Total messages
  repoCount: 0,                // INJECT: Number of repos
  peakHour: '',                // INJECT: e.g., '12am', '3pm'
  peakDay: '',                 // INJECT: e.g., 'Wed', 'Mon'
  nightOwlPercent: 0,          // INJECT: Percentage (0-100)
  earlyBirdPercent: 0,         // INJECT: Percentage (0-100)
  weekendPercent: 0,           // INJECT: Percentage (0-100)
  longestStreak: 0,            // INJECT: Days
  currentStreak: 0,            // INJECT: Days
  totalActiveDays: 0,          // INJECT: Days
  marathonDays: 0,             // INJECT: Days with 100+ messages
  longestSessionMessages: 0,   // INJECT: Messages in longest session
  firstSessionDate: '',        // INJECT: 'YYYY-MM-DD'
  busiestWeek: '',             // INJECT: e.g., 'Nov 24-30, 2025'
};

// =============================================================================
// SCENE DEFINITIONS (pre-configured for cozy vibe)
// =============================================================================

const SCENE_DEFINITIONS = [
  { name: 'thinkback_intro', duration: 7, hold: 2 },
  { name: 'your_rhythm', duration: 8, hold: 3 },
  { name: 'the_streak', duration: 7, hold: 2.5 },
  { name: 'quiet_moments', duration: 6, hold: 2 },
  { name: 'closing', duration: 5, hold: 2 },
];

const sceneManager = new SceneManager(SCENE_DEFINITIONS);
const TOTAL_FRAMES = sceneManager.getTotalFrames();

// =============================================================================
// USER INTRO
// =============================================================================

const USER_INTRO = {
  userName: STATS.userName,
  year: STATS.year,
  tagline: 'your year with Claude Code',
};

// =============================================================================
// SCENE RENDERERS
// =============================================================================

function renderThinkbackIntro(fb, frame, scene) {
  stars(fb, frame, { density: 0.012, twinkle: true });

  let p = 0;
  if (scene.phase === 'TRANSITION_IN') {
    p = scene.transitionProgress * 0.1;
  } else if (scene.phase === 'CONTENT') {
    p = 0.1 + scene.contentProgress * 0.7;
  } else {
    p = 1;
  }

  drawThinkbackIntro(fb, frame, p, USER_INTRO);

  if (scene.phase === 'HOLD' || scene.phase === 'TRANSITION_OUT') {
    sparkles(fb, frame, { density: 0.004 });
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderYourRhythm(fb, frame, scene) {
  stars(fb, frame, { density: 0.006, twinkle: true });
  floatingParticles(fb, frame, { count: 8, char: '◇', speed: 0.5 });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Title
    if (p > 0.1) {
      drawTypewriterCentered(fb, 5, '~ Your Rhythm ~', Math.min(1, (p - 0.1) / 0.2));
    }

    // Time stats - dynamically built based on available data
    const reveal = staggeredReveal(4, 0.4);

    const timeStats = [
      `You were most active at ${STATS.peakHour}`,
      `${STATS.peakDay}s were your favorite coding day`,
      STATS.nightOwlPercent > 15 ? `Night owl: ${STATS.nightOwlPercent.toFixed(1)}% of sessions after 10pm` : null,
      STATS.earlyBirdPercent > 10 ? `Early bird: ${STATS.earlyBirdPercent.toFixed(1)}% of sessions before 8am` : null,
    ].filter(Boolean);

    timeStats.forEach((stat, i) => {
      const itemP = reveal(p, i);
      if (itemP > 0) {
        const y = 10 + i * 2;
        const visibleChars = Math.floor(stat.length * itemP);
        fb.drawCenteredText(y, stat.slice(0, visibleChars));
      }
    });
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderTheStreak(fb, frame, scene) {
  stars(fb, frame, { density: 0.004 });
  fireflies(fb, frame, { count: 6 });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    if (p > 0.1) {
      const titleP = Math.min(1, (p - 0.1) / 0.2);
      drawTypewriterCentered(fb, 5, '~ The Streak ~', titleP);
    }

    if (p > 0.3 && STATS.longestStreak > 0) {
      const streakP = Math.min(1, (p - 0.3) / 0.3);
      const streakCount = animateCounter(STATS.longestStreak, streakP);
      fb.drawCenteredText(9, `${streakCount} days in a row`);

      if (streakP > 0.5) {
        fb.drawCenteredText(11, 'you showed up');
      }
    }

    if (p > 0.6) {
      const msgP = Math.min(1, (p - 0.6) / 0.3);
      const msg = 'take a moment to appreciate that';
      const visibleChars = Math.floor(msg.length * msgP);
      fb.drawCenteredText(15, msg.slice(0, visibleChars));
    }

    if (STATS.currentStreak > 0 && p > 0.8) {
      fb.drawCenteredText(18, `(current streak: ${STATS.currentStreak} days)`);
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderQuietMoments(fb, frame, scene) {
  stars(fb, frame, { density: 0.008, twinkle: true });
  dust(fb, frame, { density: 0.002 });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    if (p > 0.1) {
      drawTypewriterCentered(fb, 5, '~ Quiet Moments ~', Math.min(1, (p - 0.1) / 0.2));
    }

    const reveal = staggeredReveal(3, 0.5);

    const moments = [
      `${STATS.totalActiveDays} days you chose to build`,
      `${STATS.totalMessages.toLocaleString()} messages exchanged`,
      `across ${STATS.repoCount} projects`,
    ];

    moments.forEach((moment, i) => {
      const itemP = reveal(p, i);
      if (itemP > 0) {
        const y = 10 + i * 2;
        fb.drawCenteredText(y, moment, 0, itemP < 1 ? '#666666' : undefined);
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
      fb.drawCenteredText(Math.floor(fb.height / 2) - 3, 'Thank you for this year');
    }

    if (p > 0.5) {
      fb.drawCenteredText(Math.floor(fb.height / 2) + 1, 'Rest well. You\'ve earned it.');
    }

    sparkles(fb, frame, { density: 0.005 });
  }

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

// =============================================================================
// SCENE MAPPING
// =============================================================================

const SCENE_RENDERERS = {
  thinkback_intro: renderThinkbackIntro,
  your_rhythm: renderYourRhythm,
  the_streak: renderTheStreak,
  quiet_moments: renderQuietMoments,
  closing: renderClosing,
};

// =============================================================================
// MAIN ANIMATION
// =============================================================================

function mainAnimation(fb, frame) {
  const scene = sceneManager.getSceneAt(frame);

  if (!scene) {
    fb.drawCenteredText(Math.floor(fb.height / 2), 'Animation complete');
    return;
  }

  const renderer = SCENE_RENDERERS[scene.name];
  if (renderer) {
    renderer(fb, frame, scene);
  }
}

function getSceneName(frame) {
  const scene = sceneManager.getSceneAt(frame);
  if (!scene) return 'Complete';

  const names = {
    thinkback_intro: 'Think Back',
    your_rhythm: 'Your Rhythm',
    the_streak: 'The Streak',
    quiet_moments: 'Quiet Moments',
    closing: 'Closing',
  };

  return names[scene.name] || scene.name;
}

// =============================================================================
// EXPORTS
// =============================================================================

globalThis.YearInReviewScenes = {
  TOTAL_FRAMES,
  mainAnimation,
  getSceneName,
  sceneManager,
};
