/* eslint-disable */
/**
 * Thinkback - RPG Quest Vibe Template
 *
 * Epic RPG adventure experience with quest logs, level-ups, and legendary achievements.
 * Stats presented as XP gained, skills acquired, and character class reveal.
 *
 * INJECTION POINTS (search for "INJECT:"):
 * - STATS object: Fill in all numeric/string values
 * - TOP_REPOS array: Fill in top 3 repos with names and commits
 * - CHARACTER_CLASS: Fill in based on user's work patterns
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
  dissolve, pixelate, blindsH, fade,
  // Text effects
  drawTypewriterCentered, slideIn, drawZoomText,
  // Claude branding
  drawThinkbackIntro, CLAUDE_ORANGE,
  // RPG-specific effects
  titleScreen, textBox, classSelect, questCard, questBanner,
  xpBar, levelUp, statsPanel, creditsRoll, victoryFanfare,
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
// INJECT: CHARACTER CLASS - Based on user's work patterns
// =============================================================================

// Choose based on user's activity patterns:
// - 'BUG_SLAYER': Lots of fixes
// - 'FEATURE_CRAFTER': New functionality focused
// - 'DOCS_WIZARD': Documentation heavy
// - 'REFACTOR_KNIGHT': Code improvements
// - 'FULL_STACK_PALADIN': Balanced across all areas
// - 'SPEED_DEMON': High commit velocity
// - 'DEEP_DELVER': Long, complex sessions

const CHARACTER_CLASS = '';     // INJECT: e.g., 'FEATURE_CRAFTER'
const CLASS_DESCRIPTION = '';   // INJECT: e.g., 'A builder of new worlds'

// =============================================================================
// SCENE DEFINITIONS (pre-configured for RPG quest vibe)
// =============================================================================

const SCENE_DEFINITIONS = [
  { name: 'thinkback_intro', duration: 7, hold: 2 },
  { name: 'title_screen', duration: 6, hold: 2 },
  { name: 'class_reveal', duration: 8, hold: 3 },
  { name: 'quest_log', duration: 8, hold: 3 },
  { name: 'level_up', duration: 7, hold: 2.5 },
  { name: 'credits', duration: 6, hold: 2 },
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
// DERIVED STATS (computed from STATS for RPG presentation)
// =============================================================================

// Calculate "level" based on total activity
function calculateLevel() {
  const xp = STATS.totalCommits * 10 + STATS.totalMessages + STATS.totalActiveDays * 50;
  return Math.min(99, Math.floor(Math.log2(xp / 100) + 1)) || 1;
}

// Generate character stats based on activity patterns
function getCharacterStats() {
  const stats = {};

  // STR = commit intensity
  stats.STR = Math.min(10, Math.floor(STATS.totalCommits / 100) + 3);

  // DEX = session frequency
  stats.DEX = Math.min(10, Math.floor(STATS.totalSessions / 50) + 2);

  // INT = message depth
  stats.INT = Math.min(10, Math.floor(STATS.totalMessages / 500) + 3);

  // WIS = consistency (streak-based)
  stats.WIS = Math.min(10, Math.floor(STATS.longestStreak / 10) + 2);

  return stats;
}

// Generate character traits based on patterns
function getCharacterTraits() {
  const traits = [];

  if (STATS.nightOwlPercent > 30) traits.push('Night Owl');
  if (STATS.earlyBirdPercent > 20) traits.push('Early Riser');
  if (STATS.weekendPercent > 30) traits.push('Weekend Warrior');
  if (STATS.longestStreak > 14) traits.push('Persistent');
  if (STATS.marathonDays > 5) traits.push('Enduring');
  if (STATS.totalCommits > 500) traits.push('Prolific');

  // Return top 3 traits
  return traits.slice(0, 3);
}

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
    pixelate(fb, scene.transitionProgress, 8);
  }
}

function renderTitleScreen(fb, frame, scene) {
  stars(fb, frame, { density: 0.008, twinkle: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    titleScreen(fb, {
      title: 'YEAR IN CODE',
      subtitle: STATS.year.toString(),
      prompt: 'PRESS START',
    }, p, frame);
  }

  if (scene.phase === 'TRANSITION_OUT') {
    pixelate(fb, scene.transitionProgress, 6);
  }
}

function renderClassReveal(fb, frame, scene) {
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Build up text
    if (p < 0.3) {
      textBox(fb, 18, 'Your deeds have defined you...', p / 0.3, frame, {
        width: 45,
        style: 'rpg',
      });
    }

    // Class reveal
    if (p >= 0.3) {
      const classP = (p - 0.3) / 0.7;

      const className = CHARACTER_CLASS.replace(/_/g, ' ') || 'ADVENTURER';
      const description = CLASS_DESCRIPTION || 'A brave soul';

      classSelect(fb, {
        className,
        description,
        stats: getCharacterStats(),
        traits: getCharacterTraits(),
      }, classP, frame, {
        y: 4,
        showSprite: true,
      });

      if (classP > 0.5) {
        sparkles(fb, frame, { density: 0.004 });
      }
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    blindsH(fb, scene.transitionProgress, 6);
  }
}

function renderQuestLog(fb, frame, scene) {
  gradient(fb, { direction: 'vertical', chars: [' ', '░'] });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Quest log header
    if (p < 0.15) {
      questBanner(fb, 'QUEST LOG', p / 0.15, frame, { y: 2, style: 'simple' });
    }

    // Cycle through completed quests (repos)
    if (p >= 0.15) {
      const questP = (p - 0.15) / 0.85;
      const validRepos = TOP_REPOS.filter(r => r.name);
      const numQuests = validRepos.length || 1;

      const questIdx = Math.min(numQuests - 1, Math.floor(questP * numQuests));
      const questLocalP = (questP * numQuests) % 1;

      if (validRepos.length > 0) {
        const repo = validRepos[questIdx];

        // Quest complete banner
        if (questLocalP < 0.25) {
          questBanner(fb, 'QUEST COMPLETE', questLocalP / 0.25, frame, {
            y: 3,
            style: 'fanfare',
          });
        }

        // Quest card (simplified - no body/description)
        if (questLocalP >= 0.25) {
          const cardP = (questLocalP - 0.25) / 0.75;
          questCard(fb, {
            name: repo.name,
            commits: repo.commits,
            rank: questIdx + 1,
          }, cardP, frame, {
            y: 5,
            width: 50,
            showRewards: true,
          });

          // Victory sparkles
          if (cardP > 0.4) {
            sparkles(fb, frame, { density: 0.005 });
          }
        }

        // Progress indicator
        if (numQuests > 1) {
          const indicator = `${questIdx + 1}/${numQuests}`;
          fb.drawText(fb.width - indicator.length - 2, 2, indicator);
        }
      } else {
        // Fallback if no repos
        fb.drawCenteredText(12, 'Your quests await...');
      }
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderLevelUp(fb, frame, scene) {
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    // Dramatic build
    if (p < 0.3) {
      textBox(fb, 10, 'Your journey has made you stronger...', p / 0.3, frame, {
        width: 45,
        style: 'rpg',
      });
    }

    // Level up reveal
    if (p >= 0.3) {
      const lvlP = (p - 0.3) / 0.7;

      levelUp(fb, {
        level: calculateLevel(),
        stats: [
          { name: 'COMMITS', gained: `+${STATS.totalCommits.toLocaleString()}` },
          { name: 'QUESTS', gained: `+${STATS.repoCount}` },
          { name: 'ACTIVE DAYS', gained: `+${STATS.totalActiveDays}` },
        ],
      }, lvlP, frame, {
        y: 6,
      });

      // Celebration
      if (lvlP > 0.3) {
        victoryFanfare(fb, frame, { intensity: lvlP });
      }
    }
  }

  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
}

function renderCredits(fb, frame, scene) {
  stars(fb, frame, { density: 0.006, twinkle: true });

  if (scene.phase !== 'TRANSITION_IN') {
    const p = scene.contentProgress;

    creditsRoll(fb, [
      { type: 'header', text: 'ADVENTURE COMPLETE' },
      { type: 'spacer' },
      { type: 'stat', label: 'Total XP', value: (STATS.totalCommits * 10 + STATS.totalMessages).toLocaleString() },
      { type: 'stat', label: 'Quests Completed', value: STATS.repoCount.toString() },
      { type: 'stat', label: 'Days Adventured', value: STATS.totalActiveDays.toString() },
      { type: 'stat', label: 'Longest Streak', value: `${STATS.longestStreak} days` },
      { type: 'spacer' },
      { type: 'spacer' },
      { type: 'text', text: 'Your adventure continues...' },
      { type: 'spacer' },
      { type: 'header', text: (STATS.year + 1).toString() },
    ], p, frame, {
      speed: 0.4,
    });
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
  title_screen: renderTitleScreen,
  class_reveal: renderClassReveal,
  quest_log: renderQuestLog,
  level_up: renderLevelUp,
  credits: renderCredits,
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
    title_screen: 'Title Screen',
    class_reveal: 'Class Reveal',
    quest_log: 'Quest Log',
    level_up: 'Level Up',
    credits: 'Credits',
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
