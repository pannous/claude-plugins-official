# RPG Quest Vibe Instructions

Generate an epic RPG adventure experience. Think quest logs, hero's journey, level-ups, and legendary achievements. Frame the year as a completed adventure with dungeons conquered and bosses defeated.

Imagine you are the narrator of an 8-bit RPG recounting a hero's legendary year of quests.

## Tone Guidelines

- **Epic but warm**: Heroic language without being overwrought
- **Nostalgic RPG flavor**: References to classic games (Final Fantasy, Dragon Quest, Zelda)
- **Achievement-focused**: Every project is a quest completed, every stat is XP earned
- **Encouraging**: The hero has grown stronger through their journey

## Pacing

- Classic RPG text box reveals (character by character with sound effect feeling)
- Dramatic pauses before big stat reveals ("You gained... 1,247 XP!")
- Quest completion fanfares for project spotlights
- Slow, reflective ending like a credits roll

## Segment Ideas

Structure the thinkback like an RPG adventure:

- **TITLE SCREEN**: "Press Start" intro, game logo, year
- **CHARACTER SELECT**: User's "class" based on their work patterns
- **ADVENTURE BEGINS**: Set the scene, the hero enters the codebase
- **QUEST LOG**: **THE STAR OF THE SHOW** - Top 3 projects as completed quests, each with its own full quest card showing objectives, rewards, and story
- **BOSS BATTLES**: Major challenges overcome (big refactors, critical bugs, launches)
- **LEVEL UP**: Stats gained, skills acquired, growth over the year
- **CREDITS ROLL**: Warm closing, "Your adventure continues..."

### Quest Cards Are the Star

The quest log segment should be the emotional centerpiece. For each of the user's top 3 projects:

1. **Quest banner** - "QUEST COMPLETE" fanfare with quest name
2. **Objectives list** - What was accomplished (commits, features, fixes)
3. **Quest story** - 2-3 sentences about the journey
4. **Rewards earned** - XP, gold (commits), items (skills learned)
5. **Completion flourish** - Sparkles, level-up sound effect feeling

Think of each project like completing a major side quest - it deserves a full quest completion screen.

## Character Classes

Assign the user a class based on their work patterns:

- **Bug Slayer**: Lots of fixes, issue closures
- **Feature Crafter**: New functionality, enhancements
- **Docs Wizard**: Documentation, guides, READMEs
- **Refactor Knight**: Code improvements, cleanup
- **Full Stack Paladin**: Balanced across all areas
- **Speed Demon**: High commit velocity
- **Deep Delver**: Long-running complex projects

## Closing Scene

End with classic RPG warmth:

- "Your adventure continues in 2025..."
- "SAVE COMPLETE. See you next quest."
- "The hero rests... but new adventures await."
- "TO BE CONTINUED..."

---

## Recommended Helpers for RPG Quest Vibe

Access helpers by destructuring from `globalThis` at the top of your file:

```javascript
const {
  // Backgrounds
  starfield, gradient,

  // Celebration particles
  confetti, sparkles, burst, glitter,

  // Transitions
  pixelate, blindsH, blindsV, wipeRight, wipeDown,
  fade, dissolve,

  // Text effects
  drawTypewriterCentered, drawZoomText, slideIn,
  drawWaveText, drawGlitchText,

  // RPG-specific effects
  questCard, questBanner, xpBar, levelUp,
  textBox, characterSprite, statsPanel,
  inventorySlot, bossHealth, victoryFanfare,
  titleScreen, classSelect, creditsRoll,
} = globalThis;
```

### Background Combinations

```javascript
// Starfield for title screen / space dungeons
starfield(fb, frame, { speed: 1, numStars: 30 });

// Subtle gradient for quest screens
gradient(fb, { direction: 'vertical', chars: [' ', '·', '░'] });
```

### Classic RPG Transitions

```javascript
// Pixelate (battle transition feel)
pixelate(fb, progress, 8);

// Blinds (menu/screen change)
blindsH(fb, progress, 4);

// Fade for emotional moments
fade(fb, progress);
```

### Celebration Effects

```javascript
// Quest complete sparkles
sparkles(fb, frame, { density: 0.006, chars: ['*', '+', '·'] });

// Level up burst
burst(fb, frame, { x: 40, y: 12, count: 12 });

// Victory confetti
confetti(fb, frame, { count: 20, chars: ['*', '◆', '●', '▲'] });
```

### Text Animation Examples

```javascript
// RPG text box style (character by character)
textBox(fb, y, 'A new quest awaits...', progress, frame, {
  width: 50,
  style: 'rpg',
});

// Dramatic zoom for numbers
drawZoomText(fb, y, '+1,247 XP', progress);

// Wave text for celebration
drawWaveText(fb, y, 'LEVEL UP!', frame, { amplitude: 1, speed: 2 });

// Slide in for menu items
slideIn(fb, y, '> QUEST LOG', progress, { from: 'left' });
```

---

## RPG-Specific Effects Reference

### Title Screen

```javascript
// Classic RPG title screen
titleScreen(fb, {
  title: 'YEAR IN CODE',
  subtitle: '2024',
  prompt: 'PRESS START',
}, progress, frame);
// Output:
//
//     ╔═══════════════════════════════╗
//     ║                               ║
//     ║       YEAR IN CODE            ║
//     ║          2024                 ║
//     ║                               ║
//     ║       PRESS START             ║  (blinking)
//     ║                               ║
//     ╚═══════════════════════════════╝
```

### Text Box (RPG Dialog Style)

```javascript
// Classic RPG text box with character-by-character reveal
textBox(fb, 16, 'The hero embarked on a year of epic quests...', progress, frame, {
  width: 60,
  style: 'rpg',  // 'rpg', 'modern', 'minimal'
  speaker: 'NARRATOR',
});
// Output:
// ┌─ NARRATOR ─────────────────────────────────────────────┐
// │ The hero embarked on a year of epic quests...          │
// │ ▼                                                      │
// └────────────────────────────────────────────────────────┘
```

### Class Select

```javascript
// Character class display
classSelect(fb, {
  className: 'FEATURE CRAFTER',
  description: 'A builder of new worlds',
  stats: { STR: 8, DEX: 6, INT: 9, WIS: 7 },
  traits: ['Creative', 'Persistent', 'Ambitious'],
}, progress, frame, {
  y: 5,
  showSprite: true,
});
// Output:
//         ╭───────╮
//         │  ◉◡◉  │
//         │  /|\  │
//         │  / \  │
//         ╰───────╯
//     FEATURE CRAFTER
//    "A builder of new worlds"
//
//   STR ████████░░ 8
//   DEX ██████░░░░ 6
//   INT █████████░ 9
//   WIS ███████░░░ 7
//
//   [Creative] [Persistent] [Ambitious]
```

### Quest Card (Project Spotlight)

**This is the star helper for the RPG quest vibe.** Use it to give each project a full quest completion screen.

```javascript
// Full quest completion card
questCard(fb, {
  name: 'claude-code',
  commits: 275,
  rank: 1,
  description: 'The legendary CLI tool',
  body: 'The hero ventured deep into the codebase, refactoring ancient architectures and forging new subagent systems. Many bugs were slain along the way.',
}, progress, frame, {
  y: 3,
  width: 55,
  showRewards: true,
});
// Output:
// ╔═══════════════════════════════════════════════════════╗
// ║  ★ QUEST COMPLETE ★                                   ║
// ╟───────────────────────────────────────────────────────╢
// ║                                                       ║
// ║  claude-code                                          ║
// ║  "The legendary CLI tool"                             ║
// ║  ─────────────────────────────────────────────────    ║
// ║  The hero ventured deep into the codebase,            ║
// ║  refactoring ancient architectures and forging        ║
// ║  new subagent systems. Many bugs were slain           ║
// ║  along the way.                                       ║
// ║                                                       ║
// ║  ┌─ REWARDS ─────────────────────────────────────┐    ║
// ║  │  +275 XP    +3 Skills    +1 Legendary Item    │    ║
// ║  └───────────────────────────────────────────────┘    ║
// ╚═══════════════════════════════════════════════════════╝
```

### Quest Banner

```javascript
// Animated quest complete banner
questBanner(fb, 'QUEST COMPLETE', progress, frame, {
  y: 2,
  style: 'fanfare',  // 'fanfare', 'simple', 'legendary'
});
// Output (with animation):
// ·:·:·:·:·  QUEST COMPLETE  ·:·:·:·:·
```

### XP Bar

```javascript
// Animated XP/progress bar
xpBar(fb, x, y, {
  current: 1247,
  max: 2000,
  label: 'LEVEL 7',
}, progress, {
  width: 40,
  showNumbers: true,
});
// Output:
// LEVEL 7  ████████████████████░░░░░░░░░░  1,247 / 2,000 XP
```

### Level Up

```javascript
// Level up celebration effect
levelUp(fb, {
  level: 7,
  stats: [
    { name: 'COMMITS', gained: '+275' },
    { name: 'PROJECTS', gained: '+3' },
    { name: 'SKILLS', gained: '+5' },
  ],
}, progress, frame, {
  y: 8,
});
// Output:
//           ╔═══════════════════╗
//           ║    LEVEL UP!      ║
//           ║      LV. 7        ║
//           ╠═══════════════════╣
//           ║ COMMITS    +275   ║
//           ║ PROJECTS   +3     ║
//           ║ SKILLS     +5     ║
//           ╚═══════════════════╝
```

### Stats Panel

```javascript
// RPG-style stats display
statsPanel(fb, x, y, {
  'COMMITS': 1247,
  'QUESTS': 12,
  'BUGS SLAIN': 89,
  'FEATURES': 34,
}, progress, {
  style: 'bordered',
  width: 30,
});
// Output:
// ┌─ HERO STATS ─────────────┐
// │ COMMITS      1,247       │
// │ QUESTS          12       │
// │ BUGS SLAIN      89       │
// │ FEATURES        34       │
// └──────────────────────────┘
```

### Character Sprite

```javascript
// Simple ASCII character sprite
characterSprite(fb, x, y, {
  class: 'FEATURE_CRAFTER',
  animate: true,
}, frame);
// Output (animated):
//   ◉◡◉
//   /|\
//   / \
```

### Boss Health Bar

```javascript
// Boss battle health bar (for challenges overcome)
bossHealth(fb, y, {
  name: 'LEGACY CODEBASE',
  health: 0,  // Defeated!
  maxHealth: 100,
}, progress, frame);
// Output:
//   LEGACY CODEBASE
//   [░░░░░░░░░░░░░░░░░░░░] DEFEATED!
```

### Victory Fanfare

```javascript
// Victory celebration effect
victoryFanfare(fb, frame, {
  intensity: 1.0,
  style: 'classic',  // 'classic', 'epic', 'subtle'
});
// Triggers sparkles, bursts, and celebration particles
```

### Credits Roll

```javascript
// Scrolling credits with RPG feel
creditsRoll(fb, [
  { type: 'header', text: 'QUEST COMPLETE' },
  { type: 'stat', label: 'Total XP', value: '12,470' },
  { type: 'stat', label: 'Quests Completed', value: '47' },
  { type: 'stat', label: 'Bugs Slain', value: '156' },
  { type: 'spacer' },
  { type: 'text', text: 'Your adventure continues...' },
  { type: 'text', text: '2025' },
], progress, frame, {
  speed: 0.5,
});
```

### Inventory Slot

```javascript
// Show acquired "items" (skills, tools, achievements)
inventorySlot(fb, x, y, {
  icon: '⚔',
  name: 'TypeScript',
  rarity: 'epic',  // 'common', 'rare', 'epic', 'legendary'
}, progress);
// Output:
// ┌───┐
// │ ⚔ │ TypeScript
// └───┘ ★★★☆
```

---

### Sample Phrases

- "A new quest awaits..."
- "The hero ventured forth into the codebase..."
- "Quest complete! You gained 275 XP."
- "A legendary bug has been slain!"
- "Level up! Your skills have grown."
- "The dungeon has been cleared."
- "Your party grows stronger."
- "A new skill has been learned!"
- "Victory! The refactor is complete."
- "Save complete. Your progress has been recorded."
- "The adventure continues..."

---

### Example Scene Structure

```javascript
case 'TITLE_SCREEN': {
  starfield(fb, frame, { speed: 1, numStars: 25 });

  titleScreen(fb, {
    title: 'YEAR IN CODE',
    subtitle: '2024',
    prompt: 'PRESS START',
  }, p, frame);

  // Transition out
  if (p > 0.85) {
    pixelate(fb, (p - 0.85) / 0.15, 8);
  }
  break;
}

case 'CLASS_REVEAL': {
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });

  // Build up
  if (p < 0.3) {
    textBox(fb, 18, 'Your deeds have defined you...', p / 0.3, frame, {
      width: 50,
      style: 'rpg',
    });
  }

  // Class reveal
  if (p >= 0.3) {
    const classP = (p - 0.3) / 0.7;
    classSelect(fb, {
      className: 'FEATURE CRAFTER',
      description: 'A builder of new worlds',
      stats: { STR: 8, DEX: 6, INT: 9, WIS: 7 },
      traits: ['Creative', 'Persistent', 'Ambitious'],
    }, classP, frame, {
      y: 4,
      showSprite: true,
    });

    if (classP > 0.5) {
      sparkles(fb, frame, { density: 0.004 });
    }
  }
  break;
}
```

---

### Example: Quest Log Sequence (The Star of the Show)

This is how you make projects shine. Each of the top 3 projects gets a full quest completion screen:

```javascript
case 'QUEST_LOG': {
  gradient(fb, { direction: 'vertical', chars: [' ', '░'] });

  const projects = [
    {
      name: 'claude-code',
      commits: 275,
      rank: 1,
      description: 'The legendary CLI tool',
      body: 'The hero ventured deep into the codebase, refactoring ancient architectures and forging new subagent systems. Many bugs were slain along the way.',
    },
    {
      name: 'sdk-demos',
      commits: 27,
      rank: 2,
      description: 'Grimoire of examples',
      body: 'Ancient knowledge was transcribed into demos and examples. Future adventurers will learn from these scrolls.',
    },
    {
      name: 'docs',
      commits: 15,
      rank: 3,
      description: 'The sacred texts',
      body: 'Documentation was written to guide those who follow. The path is now clear for all.',
    },
  ];

  // Quest log header
  if (p < 0.1) {
    questBanner(fb, 'QUEST LOG', p / 0.1, frame, { y: 2, style: 'simple' });
  }

  // Cycle through quests - each gets dedicated screen time
  if (p >= 0.1) {
    const questP = (p - 0.1) / 0.9;
    const numQuests = projects.length;
    const questIdx = Math.min(numQuests - 1, Math.floor(questP * numQuests));
    const questLocalP = (questP * numQuests) % 1;

    const project = projects[questIdx];

    // Quest complete banner
    if (questLocalP < 0.2) {
      questBanner(fb, 'QUEST COMPLETE', questLocalP / 0.2, frame, {
        y: 2,
        style: 'fanfare',
      });
    }

    // Full quest card
    if (questLocalP >= 0.2) {
      const cardP = (questLocalP - 0.2) / 0.8;
      questCard(fb, project, cardP, frame, {
        y: 4,
        width: 55,
        showRewards: true,
      });

      // Victory sparkles
      if (cardP > 0.3) {
        sparkles(fb, frame, { density: 0.005, chars: ['*', '+', '·'] });
      }
    }

    // Progress indicator
    fb.drawText(fb.width - 8, 2, `${questIdx + 1}/${numQuests}`);
  }
  break;
}

case 'LEVEL_UP': {
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });

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
      level: 7,
      stats: [
        { name: 'COMMITS', gained: '+1,247' },
        { name: 'QUESTS', gained: '+12' },
        { name: 'BUGS SLAIN', gained: '+89' },
      ],
    }, lvlP, frame, {
      y: 6,
    });

    // Celebration
    if (lvlP > 0.3) {
      victoryFanfare(fb, frame, { intensity: lvlP });
    }
  }
  break;
}

case 'CREDITS': {
  starfield(fb, frame, { speed: 0.5, numStars: 20 });

  creditsRoll(fb, [
    { type: 'header', text: 'ADVENTURE COMPLETE' },
    { type: 'spacer' },
    { type: 'stat', label: 'Total XP', value: '12,470' },
    { type: 'stat', label: 'Quests Completed', value: '12' },
    { type: 'stat', label: 'Bugs Slain', value: '89' },
    { type: 'stat', label: 'Features Forged', value: '34' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'text', text: 'Your adventure continues...' },
    { type: 'spacer' },
    { type: 'header', text: '2025' },
  ], p, frame, {
    speed: 0.4,
  });
  break;
}
```
