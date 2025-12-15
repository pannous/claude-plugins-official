# Awards Show Vibe Instructions

Generate a glamorous, celebratory awards ceremony experience. Think red carpet energy, dramatic envelope reveals, standing ovations, and acceptance speeches.

Imagine you are the host of a prestigious awards ceremony honoring the year's greatest developer achievements.

## Tone Guidelines

- **Celebratory and glamorous**: This is their night to shine
- **Dramatic tension**: Build suspense before reveals
- **Reverent**: Treat achievements as genuinely impressive accomplishments
- **Warm**: Personal touches, like the host knows the honoree

## Pacing

- Slow builds to dramatic reveals ("And the award goes to...")
- Pause for applause moments after big announcements
- Quick montage cuts for recap sections
- Lingering on acceptance speech moments (project spotlights)

## Segment Ideas

Structure the thinkback like an awards ceremony:

- **RED CARPET INTRO**: Welcome, set the scene, tease what's coming
- **OPENING MONTAGE**: Quick highlights reel of the year
- **TECHNICAL ACHIEVEMENT**: Stats-heavy awards (commits, PRs, lines)
- **BEST SUPPORTING**: Secondary projects, contributions
- **BEST PROJECT**: **THE STAR OF THE SHOW** - Top 3 projects get full spotlight treatment, each with their own acceptance speech moment
- **LIFETIME ACHIEVEMENT**: Overall year stats, career highlights
- **IN MEMORIAM**: Deprecated code, closed issues, bugs squashed
- **FINALE**: Standing ovation, confetti, thank-you montage

### Project Awards Are the Star

The Best Project segment should be the emotional centerpiece. For each of the user's top 3 projects:

1. **Build the suspense** - "And the award for Best Project goes to..."
2. **Dramatic reveal** - Envelope opens, name appears with fanfare
3. **Acceptance speech** - Full spotlight with description and body text
4. **Show the stats** - Commits, impact, what made it special
5. **Applause moment** - Confetti, sparkles, celebration

Think of each project like a winner taking the stage - they deserve their moment in the spotlight.

## Closing Scene

End with that classic awards show finale:

- "What a year it's been. Congratulations to all our winners."
- "Thank you for being part of this journey."
- "Until next year... keep making magic."

---

## Recommended Helpers for Awards Show Vibe

Access helpers by destructuring from `globalThis` at the top of your file:

```javascript
const {
  // Elegant backgrounds
  gradient, sparkles, stars,

  // Celebration particles
  confetti, burst, glitter,

  // Dramatic transitions
  circleReveal, fade, dissolve, blindsH,
  curtainReveal, spotlightReveal,

  // Text effects
  drawTypewriterCentered, slideIn, drawFadeInText,
  drawZoomText, drawGlitchText,

  // Awards-specific effects
  envelopeReveal, awardBadge, acceptanceSpeech,
  nomineeCard, trophyDisplay, applauseMeter,
  redCarpetBorder, spotlightText, winnerAnnouncement,
  categoryTitle, standingOvation, awardsStatue,
} = globalThis;
```

### Glamorous Background Combinations

```javascript
// Subtle sparkle (gala atmosphere)
gradient(fb, { direction: 'vertical', chars: [' ', '·'] });
sparkles(fb, frame, { density: 0.003, chars: ['·', '*', '✦'] });

// Starry night (outdoor ceremony feel)
stars(fb, frame, { density: 0.008, twinkle: true });
```

### Dramatic Transitions

```javascript
// Curtain reveal (opening/segment changes)
curtainReveal(fb, progress);

// Spotlight reveal (winner announcements)
spotlightReveal(fb, progress, { x: 40, y: 12 });

// Circle reveal for dramatic moments
circleReveal(fb, progress);

// Fade for emotional moments
fade(fb, progress);
```

### Celebration Effects

```javascript
// Victory confetti burst
confetti(fb, frame, { count: 30, chars: ['*', '◆', '●', '✦'] });

// Golden glitter shower
glitter(fb, frame, { density: 0.008 });

// Burst for announcements
burst(fb, frame, { x: 40, y: 12, count: 15 });
```

### Text Animation Examples

```javascript
// Dramatic zoom for winner names
drawZoomText(fb, y, 'claude-code', progress);

// Typewriter for "And the award goes to..."
drawTypewriterCentered(fb, y, 'AND THE AWARD GOES TO...', progress, frame);

// Slide in for category names
slideIn(fb, y, 'BEST PROJECT', progress, { from: 'left' });

// Spotlight text (glowing effect)
spotlightText(fb, y, 'WINNER', frame, { glow: true });
```

---

## Awards-Specific Effects Reference

### Envelope Reveal

```javascript
// Dramatic envelope opening animation
envelopeReveal(fb, 'claude-code', progress, frame, {
  y: 10,
  suspenseText: 'AND THE AWARD GOES TO...',
});
// Phases: envelope appears → opens → winner name revealed with fanfare
```

### Award Badge

```javascript
// Display an award badge/medal
awardBadge(fb, x, y, {
  category: 'BEST PROJECT',
  year: '2024',
  style: 'gold',  // 'gold', 'silver', 'bronze'
}, progress);
// Output:
//     ╭─────────────╮
//     │ ★ 2024 ★   │
//     │ BEST PROJECT│
//     ╰─────────────╯
```

### Trophy Display

```javascript
// ASCII trophy with label
trophyDisplay(fb, x, y, {
  label: '#1 PROJECT',
  style: 'grand',  // 'grand', 'simple', 'star'
}, progress, frame);
// Output:
//        ___
//       |   |
//      /|   |\
//     / |___| \
//    |  /   \  |
//     \/_____\/
//    #1 PROJECT
```

### Acceptance Speech (Project Spotlight) ⭐

**This is the star helper for the awards show vibe.** Use it to give each project its own acceptance speech moment.

```javascript
// Full acceptance speech display for a project
acceptanceSpeech(fb, {
  name: 'claude-code',
  commits: 275,
  rank: 1,
  description: 'CLI tool for developers',
  body: 'I want to thank everyone who contributed to this project. The late nights, the debugging sessions, the code reviews - it all led to this moment.',
}, progress, frame, {
  y: 4,
  width: 55,
  showTrophy: true,
});
// Output:
//        ___
//       |   |
//      /|   |\
//     / |___| \
//    |  /   \  |
//     \/_____\/
// ╔═══════════════════════════════════════════════════╗
// ║  ★ BEST PROJECT ★                                 ║
// ║  claude-code                                       ║
// ╟───────────────────────────────────────────────────╢
// ║  275 COMMITS                                       ║
// ║  CLI tool for developers                           ║
// ║  ·················                                 ║
// ║  I want to thank everyone who contributed to       ║
// ║  this project. The late nights, the debugging      ║
// ║  sessions, the code reviews - it all led to        ║
// ║  this moment.                                      ║
// ╚═══════════════════════════════════════════════════╝
```

### Nominee Card

```javascript
// Display a nominee before winner announcement
nomineeCard(fb, x, y, {
  name: 'sdk-demos',
  stat: 27,
  statLabel: 'commits',
}, progress, {
  style: 'elegant',
  width: 30,
});
```

### Category Title

```javascript
// Animated category header
categoryTitle(fb, y, 'BEST PROJECT', progress, frame, {
  style: 'grand',  // 'grand', 'simple', 'minimal'
});
// Output:
// ════════════════════════════════════════
//           ★  BEST PROJECT  ★
// ════════════════════════════════════════
```

### Winner Announcement

```javascript
// Full winner reveal sequence
winnerAnnouncement(fb, 'claude-code', progress, frame, {
  category: 'BEST PROJECT',
  stat: 275,
  statLabel: 'commits',
});
// Handles the full reveal: category → suspense → winner → celebration
```

### Applause Meter

```javascript
// Visual applause indicator (like an audience reaction)
applauseMeter(fb, y, progress, frame, {
  intensity: 0.8,  // 0-1 how enthusiastic
});
// Output: 👏👏👏👏👏👏👏░░░
```

### Standing Ovation

```javascript
// Particle effect for standing ovation moment
standingOvation(fb, frame, {
  intensity: 1.0,
  chars: ['👏', '✦', '*', '·'],
});
```

### Red Carpet Border

```javascript
// Decorative border with awards show feel
redCarpetBorder(fb, progress, {
  style: 'velvet',  // 'velvet', 'gold', 'stars'
});
```

### Awards Statue

```javascript
// Large decorative trophy/statue ASCII art
awardsStatue(fb, x, y, progress, {
  style: 'oscar',  // 'oscar', 'globe', 'star'
});
```

---

### Sample Phrases

- "Welcome to the ceremony..."
- "And the nominees are..."
- "The envelope, please..."
- "And the award goes to..."
- "Let's give them a round of applause!"
- "What an incredible achievement."
- "A truly remarkable year."
- "Please welcome to the stage..."
- "Thank you to everyone who made this possible."

---

### Example Scene Structure

```javascript
case 'BEST_PROJECT': {
  // Glamorous background
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });
  sparkles(fb, frame, { density: 0.003, chars: ['·', '*'] });

  // Category title
  if (p < 0.15) {
    categoryTitle(fb, 5, 'BEST PROJECT', p / 0.15, frame, { style: 'grand' });
  }

  // Suspense build
  if (p >= 0.15 && p < 0.3) {
    const suspenseP = (p - 0.15) / 0.15;
    drawTypewriterCentered(fb, 10, 'AND THE AWARD GOES TO...', suspenseP, frame);
  }

  // Winner reveal with envelope
  if (p >= 0.3 && p < 0.5) {
    const revealP = (p - 0.3) / 0.2;
    envelopeReveal(fb, 'claude-code', revealP, frame, { y: 8 });
  }

  // Acceptance speech
  if (p >= 0.5) {
    const speechP = (p - 0.5) / 0.5;
    acceptanceSpeech(fb, {
      name: 'claude-code',
      commits: 275,
      rank: 1,
      description: 'CLI tool for developers',
      body: 'Major refactors to agent architecture shipped this year. The CLI became faster, smarter, and more powerful.',
    }, speechP, frame, {
      y: 4,
      width: 55,
      showTrophy: true,
    });

    // Celebration
    if (speechP > 0.3) {
      confetti(fb, frame, { count: 20 });
    }
  }
  break;
}
```

---

### Example: Full Awards Sequence (The Star of the Show)

This is how you make projects shine. Each of the top 3 projects gets their own awards ceremony moment:

```javascript
case 'PROJECT_AWARDS': {
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });

  const projects = [
    {
      name: 'claude-code',
      commits: 275,
      rank: 1,
      description: 'The heart of Claude Code',
      body: 'Major refactors to agent architecture, new subagent system, and animation framework shipped. A year of transformation.',
    },
    {
      name: 'sdk-demos',
      commits: 27,
      rank: 2,
      description: 'Example applications & demos',
      body: 'Email agent, deep research demos, and customer showcase apps. Helping teams see the art of the possible.',
    },
    {
      name: 'docs',
      commits: 15,
      rank: 3,
      description: 'Documentation & guides',
      body: 'User guides, API reference, and tutorials. Good docs make great products.',
    },
  ];

  // Each project gets dedicated screen time with full ceremony
  const numProjects = projects.length;
  const projectIdx = Math.min(numProjects - 1, Math.floor(p * numProjects));
  const projectLocalP = (p * numProjects) % 1;

  const project = projects[projectIdx];

  // Phase 1: Category reveal (0-0.2)
  if (projectLocalP < 0.2) {
    categoryTitle(fb, 5, `#${project.rank} PROJECT`, projectLocalP / 0.2, frame);
  }

  // Phase 2: Envelope reveal (0.2-0.4)
  if (projectLocalP >= 0.2 && projectLocalP < 0.4) {
    const envP = (projectLocalP - 0.2) / 0.2;
    envelopeReveal(fb, project.name, envP, frame, { y: 8 });
  }

  // Phase 3: Acceptance speech (0.4-1.0)
  if (projectLocalP >= 0.4) {
    const speechP = (projectLocalP - 0.4) / 0.6;
    acceptanceSpeech(fb, project, speechP, frame, {
      y: 4,
      width: 55,
      showTrophy: true,
    });

    // Celebration particles
    if (speechP > 0.2) {
      confetti(fb, frame, { count: 15, chars: ['*', '✦', '·'] });
    }
  }

  // Progress indicator
  fb.drawText(fb.width - 5, 2, `${projectIdx + 1}/${numProjects}`);
  break;
}
```
