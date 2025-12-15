/* eslint-disable */
/**
 * Thinkback - Morning News Vibe Template
 *
 * Upbeat, professional news broadcast style.
 * Stats revealed as "breaking news" with tickers and dramatic counters.
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
  confetti, sparkles, burst,
  // Transitions
  dissolve, wipeRight, wipeLeft, wipeDown, blindsH,
  // Text effects
  drawTypewriterCentered, slideIn,
  // Claude branding
  drawThinkbackIntro, CLAUDE_ORANGE,
  // News effects
  lowerThird, tickerTape, breakingBanner, liveIndicator,
  segmentTitle, statCounter, forecastBar, splitWipe,
  headlineCrawl, countdownReveal,
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
// SCENE DEFINITIONS (pre-configured for morning news vibe)
// =============================================================================

const SCENE_DEFINITIONS = [
  { name: 'thinkback_intro', duration: 7, hold: 2 },
  { name: 'breaking_news', duration: 8, hold: 2.5 },
  { name: 'headline_stats', duration: 8, hold: 3 },
  { name: 'coding_forecast', duration: 7, hold: 2.5 },
  { name: 'top_stories', duration: 7, hold: 2.5 },
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

function renderBreakingNews(fb, frame, scene) {
  // Dark gradient background
  gradient(fb, { direction: 'vertical', invert: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Breaking banner at top
    if (p > 0.1) {
      breakingBanner(fb, 3, 'BREAKING NEWS', frame, {
        flash: true,
        width: 50,
      });
    }

    // Live indicator
    if (p > 0.2) {
      liveIndicator(fb, 70, 3, frame, { blink: true });
    }

    // Main headline - biggest stat
    if (p > 0.3) {
      const headlineP = Math.min(1, (p - 0.3) / 0.3);
      segmentTitle(fb, 10, `${STATS.userName}'s Year in Review`, headlineP, {
        style: 'double',
      });
    }

    // Big stat counter
    if (p > 0.5) {
      const statP = Math.min(1, (p - 0.5) / 0.3);
      const count = animateCounter(STATS.totalMessages, statP);
      fb.drawCenteredText(15, `${count.toLocaleString()}`);
      if (statP > 0.5) {
        fb.drawCenteredText(17, 'messages exchanged');
      }
    }

    // Ticker at bottom
    if (p > 0.4) {
      const tickerItems = [
        `${STATS.totalCommits} commits`,
        `${STATS.repoCount} projects`,
        `${STATS.totalActiveDays} active days`,
        `Peak hour: ${STATS.peakHour}`,
      ];
      tickerTape(fb, fb.height - 3, tickerItems, frame, { speed: 0.5 });
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    wipeRight(fb, scene.transitionProgress, '░');
  }
}

function renderHeadlineStats(fb, frame, scene) {
  gradient(fb, { direction: 'vertical', invert: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Section header
    if (p > 0.1) {
      segmentTitle(fb, 3, 'TOP HEADLINES', Math.min(1, (p - 0.1) / 0.2), {
        style: 'single',
      });
    }

    // Stats as lower thirds
    const reveal = staggeredReveal(4, 0.3);

    const headlines = [
      { label: 'TOTAL SESSIONS', value: STATS.totalSessions.toLocaleString() },
      { label: 'LONGEST STREAK', value: `${STATS.longestStreak} days` },
      { label: 'MARATHON DAYS', value: STATS.marathonDays.toString() },
      { label: 'BUSIEST WEEK', value: STATS.busiestWeek },
    ];

    headlines.forEach((item, i) => {
      const itemP = reveal(p, i);
      if (itemP > 0) {
        const y = 8 + i * 4;
        lowerThird(fb, y, item.label, item.value, itemP, {
          width: 50,
          centered: true,
        });
      }
    });

    // Ticker
    if (p > 0.3) {
      tickerTape(fb, fb.height - 3, [
        'More stats after the break...',
        `First session: ${STATS.firstSessionDate}`,
      ], frame);
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    blindsH(fb, scene.transitionProgress, 6);
  }
}

function renderCodingForecast(fb, frame, scene) {
  gradient(fb, { direction: 'vertical', invert: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Section header
    if (p > 0.1) {
      segmentTitle(fb, 3, 'CODING FORECAST', Math.min(1, (p - 0.1) / 0.2));
    }

    // Time patterns as forecast bars
    const reveal = staggeredReveal(3, 0.4);

    if (p > 0.3) {
      const forecastP = reveal(p, 0);
      if (forecastP > 0) {
        fb.drawCenteredText(9, `Peak activity: ${STATS.peakHour} on ${STATS.peakDay}s`);
      }
    }

    if (p > 0.4) {
      const nightP = reveal(p, 1);
      if (nightP > 0 && STATS.nightOwlPercent > 5) {
        forecastBar(fb, 15, 13, 'Night Owl', STATS.nightOwlPercent, 40, nightP, {
          char: '█',
        });
      }
    }

    if (p > 0.5) {
      const earlyP = reveal(p, 2);
      if (earlyP > 0 && STATS.earlyBirdPercent > 5) {
        forecastBar(fb, 15, 16, 'Early Bird', STATS.earlyBirdPercent, 40, earlyP, {
          char: '█',
        });
      }
    }

    if (p > 0.6) {
      const weekendP = Math.min(1, (p - 0.6) / 0.3);
      if (weekendP > 0) {
        forecastBar(fb, 15, 19, 'Weekend', STATS.weekendPercent, 40, weekendP, {
          char: '█',
        });
      }
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    wipeDown(fb, scene.transitionProgress, '░');
  }
}

function renderTopStories(fb, frame, scene) {
  gradient(fb, { direction: 'vertical', invert: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Section header
    if (p > 0.1) {
      segmentTitle(fb, 3, 'TOP REPOSITORIES', Math.min(1, (p - 0.1) / 0.2));
    }

    // Top repos as headlines
    const reveal = staggeredReveal(3, 0.4);

    TOP_REPOS.forEach((repo, i) => {
      if (repo.name) {
        const itemP = reveal(p, i);
        if (itemP > 0) {
          const y = 9 + i * 4;
          const rank = i + 1;
          lowerThird(fb, y, `#${rank}`, `${repo.name} (${repo.commits} commits)`, itemP, {
            width: 55,
            centered: true,
          });
        }
      }
    });

    // Celebration sparkles when fully revealed
    if (p > 0.8) {
      sparkles(fb, frame, { density: 0.003 });
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderClosing(fb, frame, scene) {
  gradient(fb, { direction: 'vertical', invert: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    if (p > 0.2) {
      segmentTitle(fb, 8, 'THAT\'S A WRAP', Math.min(1, (p - 0.2) / 0.3));
    }

    if (p > 0.4) {
      fb.drawCenteredText(14, `Thanks for tuning in, ${STATS.userName}!`);
    }

    if (p > 0.6) {
      fb.drawCenteredText(17, 'See you next year!');
    }

    // Celebration
    if (p > 0.5) {
      confetti(fb, frame, { count: 15 });
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
  breaking_news: renderBreakingNews,
  headline_stats: renderHeadlineStats,
  coding_forecast: renderCodingForecast,
  top_stories: renderTopStories,
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
    breaking_news: 'Breaking News',
    headline_stats: 'Headlines',
    coding_forecast: 'Forecast',
    top_stories: 'Top Stories',
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
