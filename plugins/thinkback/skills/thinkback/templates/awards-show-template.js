/* eslint-disable */
/**
 * Thinkback - Awards Show Vibe Template
 *
 * Glamorous awards ceremony style with dramatic reveals.
 * Stats presented as award categories with envelope reveals and trophies.
 *
 * INJECTION POINTS (search for "INJECT:"):
 * - STATS object: Fill in all numeric/string values
 * - TOP_REPOS array: Fill in top 3 repos with names and commits
 */

// =============================================================================
// HELPER DESTRUCTURING
// =============================================================================

const {
  // Scene system
  SceneManager, staggeredReveal, easeInOut, easeOut, animateCounter,
  // Backgrounds
  stars, gradient,
  // Particles
  confetti, sparkles, glitter,
  // Transitions
  dissolve, circleReveal, fade, curtainReveal, spotlightReveal,
  // Text effects
  drawTypewriterCentered, slideIn, drawZoomText, drawFadeInText,
  // Claude branding
  drawThinkbackIntro, CLAUDE_ORANGE,
  // Awards effects
  trophyDisplay, awardBadge, envelopeReveal, categoryTitle,
  winnerAnnouncement, applauseMeter, standingOvation, redCarpetBorder,
  spotlightText,
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
// INJECT: TOP REPOS - Fill in top 3 repos
// =============================================================================

const TOP_REPOS = [
  { name: '', commits: 0 },    // INJECT: #1 repo name and commits
  { name: '', commits: 0 },    // INJECT: #2 repo name and commits
  { name: '', commits: 0 },    // INJECT: #3 repo name and commits
];

// =============================================================================
// SCENE DEFINITIONS (pre-configured for awards show vibe)
// =============================================================================

const SCENE_DEFINITIONS = [
  { name: 'thinkback_intro', duration: 7, hold: 2 },
  { name: 'opening_ceremony', duration: 7, hold: 2.5 },
  { name: 'best_streak', duration: 8, hold: 3 },
  { name: 'dedication_award', duration: 8, hold: 3 },
  { name: 'lifetime_achievement', duration: 8, hold: 3 },
  { name: 'finale', duration: 6, hold: 2 },
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

function renderOpeningCeremony(fb, frame, scene) {
  stars(fb, frame, { density: 0.008, twinkle: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Curtain reveal effect
    if (p < 0.4) {
      curtainReveal(fb, p / 0.4);
    }

    // Red carpet border
    if (p > 0.3) {
      redCarpetBorder(fb, Math.min(1, (p - 0.3) / 0.3));
    }

    // Welcome text
    if (p > 0.4) {
      const textP = Math.min(1, (p - 0.4) / 0.3);
      spotlightText(fb, 8, 'Welcome to the', frame, { intensity: textP });
      spotlightText(fb, 10, `${STATS.year} Claude Code Awards`, frame, { intensity: textP });
    }

    // Presenter intro
    if (p > 0.7) {
      fb.drawCenteredText(15, `Honoring ${STATS.userName}`);
    }

    // Sparkles
    if (p > 0.5) {
      glitter(fb, frame, { density: 0.003 });
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    spotlightReveal(fb, 1 - scene.transitionProgress);
  }
}

function renderBestStreak(fb, frame, scene) {
  stars(fb, frame, { density: 0.005 });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Category title
    if (p > 0.1) {
      categoryTitle(fb, 5, 'BEST STREAK AWARD', Math.min(1, (p - 0.1) / 0.2), frame);
    }

    // Envelope reveal
    if (p > 0.3 && p < 0.7) {
      const envelopeP = (p - 0.3) / 0.4;
      envelopeReveal(fb, `${STATS.longestStreak} Days`, envelopeP, frame, {
        y: 12,
      });
    }

    // Winner announcement
    if (p > 0.7) {
      const winP = Math.min(1, (p - 0.7) / 0.2);
      const count = animateCounter(STATS.longestStreak, winP);
      fb.drawCenteredText(12, `${count} consecutive days!`);

      if (winP > 0.5) {
        fb.drawCenteredText(15, 'of showing up');
      }

      // Trophy
      if (winP > 0.3) {
        trophyDisplay(fb, Math.floor(fb.width / 2), 20, {
          style: 'simple',
          label: 'STREAK',
        }, winP, frame);
      }

      // Applause
      applauseMeter(fb, fb.height - 5, winP, frame);
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderDedicationAward(fb, frame, scene) {
  stars(fb, frame, { density: 0.005 });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Category title
    if (p > 0.1) {
      categoryTitle(fb, 5, 'DEDICATION AWARD', Math.min(1, (p - 0.1) / 0.2), frame);
    }

    // Stats reveal
    if (p > 0.3) {
      const reveal = staggeredReveal(3, 0.4);

      const stats = [
        `${STATS.totalActiveDays} active days`,
        `${STATS.totalSessions.toLocaleString()} sessions`,
        `${STATS.totalMessages.toLocaleString()} messages`,
      ];

      stats.forEach((stat, i) => {
        const itemP = reveal(p - 0.3, i);
        if (itemP > 0) {
          const y = 11 + i * 2;
          awardBadge(fb, Math.floor(fb.width / 2) - 25, y, {
            label: stat,
            style: i === 0 ? 'gold' : 'silver',
          }, itemP);
        }
      });
    }

    // Marathon days highlight
    if (p > 0.7 && STATS.marathonDays > 0) {
      const marathonP = Math.min(1, (p - 0.7) / 0.2);
      fb.drawCenteredText(20, `${STATS.marathonDays} marathon days (100+ messages)`);

      if (marathonP > 0.5) {
        sparkles(fb, frame, { density: 0.005 });
      }
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderLifetimeAchievement(fb, frame, scene) {
  stars(fb, frame, { density: 0.006, twinkle: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Grand category title
    if (p > 0.1) {
      categoryTitle(fb, 4, 'LIFETIME ACHIEVEMENT', Math.min(1, (p - 0.1) / 0.2), frame, {
        style: 'grand',
      });
    }

    // Grand trophy
    if (p > 0.3) {
      const trophyP = Math.min(1, (p - 0.3) / 0.3);
      trophyDisplay(fb, Math.floor(fb.width / 2), 10, {
        style: 'grand',
        label: STATS.year.toString(),
      }, trophyP, frame);
    }

    // Winner name with spotlight
    if (p > 0.6) {
      const nameP = Math.min(1, (p - 0.6) / 0.2);
      winnerAnnouncement(fb, STATS.userName, nameP, frame, {
        y: 22,
      });
    }

    // Summary stats
    if (p > 0.8) {
      fb.drawCenteredText(28, `${STATS.totalCommits} commits across ${STATS.repoCount} projects`);
    }

    // Celebration
    if (p > 0.7) {
      glitter(fb, frame, { density: 0.004 });
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderFinale(fb, frame, scene) {
  stars(fb, frame, { density: 0.01, twinkle: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Standing ovation effect
    if (p > 0.2) {
      standingOvation(fb, frame, { intensity: Math.min(1, (p - 0.2) / 0.3) });
    }

    // Thank you message
    if (p > 0.3) {
      spotlightText(fb, Math.floor(fb.height / 2) - 2, 'Thank you for an amazing year!', frame);
    }

    if (p > 0.6) {
      fb.drawCenteredText(Math.floor(fb.height / 2) + 2, 'See you at next year\'s ceremony!');
    }

    // Confetti celebration
    if (p > 0.4) {
      confetti(fb, frame, { count: 20 });
    }
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
  opening_ceremony: renderOpeningCeremony,
  best_streak: renderBestStreak,
  dedication_award: renderDedicationAward,
  lifetime_achievement: renderLifetimeAchievement,
  finale: renderFinale,
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
    opening_ceremony: 'Opening',
    best_streak: 'Best Streak',
    dedication_award: 'Dedication',
    lifetime_achievement: 'Lifetime',
    finale: 'Finale',
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
