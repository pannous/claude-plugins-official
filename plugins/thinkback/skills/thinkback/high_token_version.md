# High Token Version - Deep Dive Generation

This mode creates a deeply personalized Thinkback by analyzing the user's projects, commits, and conversations.

## Narrative Philosophy

Each animation is deeply personalized to the user. While it is informed by stats it is not ABOUT stats.
It is instead about telling a story about the user.
It is structured in scenes with an opening that draws the user and a closing that wraps it up nicely.

### Narrative Principles

1. **Stats are evidence, not the story** - Don't just show "106 commits in October." Ask: *What was happening in October? What were they building? Why did it matter?*

2. **Find the defining moments & accomplishments** - Look for:
   - Their first moment with Claude code
   - A major feature or PR that shipped
   - A problem they solved repeatedly
   - A shift in what they worked on (new repo, new area)
   - Patterns that reveal personality (night owl, weekend warrior, refactor-then-ship)

3. **Create emotional beats** - Each scene should make the user feel something:
   - Opening: Anticipation, curiosity
   - Middle: Recognition ("that's so me"), pride, humor
   - Closing: Gratitude, momentum for next year

4. **Connect the dots** - The best narratives link scenes:
   - "You started the year exploring... but by October, you were building"
   - "42 commits at midnight - burning the midnight oil"

### Scene Types to Include

- **Origin moment**: How/when they started with Claude Code
- **Signature move**: What they do most (debug? refactor? prototype?)
- **Growth arc**: How their usage evolved
- **Defining projects**: The projects that mattered most or unique accomplishments

---

## Step 1: Extract Statistics

Run the stats script from the skill folder root:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/skills/thinkback && node scripts/get_all_stats.js --markdown
```

The `--markdown` flag also generates `activity-report.md` with:
- Every repo with Claude co-authored commits
- Recent commits per repo (up to 10)
- Recent user messages per project (up to 5)

## Step 2: Read the Activity Report

Read `activity-report.md` for narrative inspiration - specific projects, commit messages, and conversation snippets that make the thinkback personal.

## Step 3: Spin off Subagents

Spin off subagents to read individual repos with instructions to: understand what the repo is, and then read the commits by the user to understand major accomplishments and projects that the user did.
Each subagent should return this information with the projects, what they are about and the user's accomplishments.

Also spin off an explore subagent to read the users transcripts at `~/.claude/projects` and look for specific keywords to indicate a big accomplishment or something the user was very happy about.

## Step 4: Generate year_in_review.js

Write the customized file to this skill folder as `year_in_review.js`.

**CRITICAL: SCENE_DEFINITIONS use SECONDS, not frames:**
```javascript
// CORRECT - durations in seconds:
const SCENE_DEFINITIONS = [
  { name: 'INTRO', duration: 7.5 },
  { name: 'FIRST_SPARK', duration: 7.5 },
  { name: 'THE_JOURNEY', duration: 8.5 },
  // ... etc
];

// WRONG - DO NOT use frames:
const SCENE_DEFINITIONS = [
  { name: 'INTRO', frames: 180 },  // WRONG
];
```

## Step 5: Validate the Animation

**IMPORTANT: Always run validation after generating year_in_review.js to catch common errors.**

```bash
cd ${CLAUDE_PLUGIN_ROOT}/skills/thinkback && node scripts/validate.js
```

The validator checks for:
- Missing exports (YearInReviewScenes, TOTAL_FRAMES, mainAnimation)
- **Scene names being undefined** (using `id` instead of `name` in SCENE_DEFINITIONS)
- Render function errors at various frames
- Frame coverage gaps

**If validation fails, fix the errors and re-run validation until it passes.**

Common errors and fixes:
| Error | Fix |
|-------|-----|
| "scenes have undefined names" | Change `{ id: 'SCENE_NAME' }` to `{ name: 'SCENE_NAME' }` in SCENE_DEFINITIONS |
| "Render error at frame X" | Check the switch statement cases match the scene names exactly |
| "TOTAL_FRAMES is invalid" or "TOTAL_FRAMES = NaN" | Use `getScene()` correctly - it returns `{ sceneId, progress }`, NOT `{ sceneId, sceneFrame, sceneLength }` |
| Progress `p` is NaN | Wrong API: use `const { sceneId, progress } = sceneManager.getScene(frame); const p = progress;` |
| animateCounter not working | Only 2 args: `animateCounter(target, progress)` NOT `animateCounter(0, target, progress)` |
| Scenes using `frames` instead of `duration` | SCENE_DEFINITIONS use **seconds**, not frames. Use `{ name: 'SCENE', duration: 7.5 }` NOT `{ name: 'SCENE', frames: 180 }` |

## Step 6: Signal Completion

After validation passes, tell the user their animation is ready and ask them to run `/thinkback` again to play it.

---

## Required Intro Scene

**IMPORTANT: Every Thinkback animation MUST begin with a consistent intro scene.**

The intro scene uses `drawThinkbackIntro()` to display:
1. **Clawd** (the Claude mascot) at the top
2. **Claude Code** logo in large ASCII art
3. **"Think Back on..."** text with typewriter effect
4. **"your year with Claude Code"** subtitle
5. **Year** at the bottom

---

## Animation Helpers Reference

**IMPORTANT: DO NOT use ES module `import` statements in `year_in_review.js`.**

The file is loaded as a regular `<script>` tag in the browser, not as a module. All helpers are set on `globalThis` by the helper scripts that load before `year_in_review.js`.

**CRITICAL: Destructure helpers BEFORE using SceneManager.**

The `SceneManager` class must be destructured from `globalThis` before you can use `new SceneManager(...)`. Place the destructuring block at the very top of your file, before scene definitions:

```javascript
// =============================================================================
// HELPER DESTRUCTURING (must come FIRST, before SceneManager usage)
// =============================================================================

const {
  // Scene system (REQUIRED - must be destructured before use)
  SceneManager, staggeredReveal, easeInOut, easeOut, animateCounter,
  // ... other helpers
} = globalThis;

// NOW you can use SceneManager
const SCENE_DEFINITIONS = [...];
const sceneManager = new SceneManager(SCENE_DEFINITIONS);  // This works!
```

Access helpers by destructuring from `globalThis` at the top of your file:

```javascript
const {
  // Transitions
  wipeLeft, wipeRight, wipeDown, wipeUp,
  circleReveal, circleClose, irisIn, irisOut,
  blindsH, blindsV, checkerboard, diagonalWipe,
  dissolve, pixelate, fade,
  supernova, spiral, shatter, tornado,  // Creative transitions

  // Backgrounds
  stars, starfield, rain, snow, fog, aurora,
  waves, gradient, ripples, fireflies, clouds,

  // Particles
  confetti, sparkles, burst, bubbles, hearts,
  musicNotes, leaves, embers, dust, floatingParticles,
  orbit, shootingStars, glitter,

  // Text effects
  typewriter, drawTypewriter, drawTypewriterCentered,
  drawWaveText, drawGlitchText, slideIn, slideOut,
  drawZoomText, drawFadeInText, drawScatterText,

  // Claude branding & intro
  CLAUDE_MASCOT, CLAUDE_MASCOT_WIDTH, drawClaudeMascot,
  CLAUDE_CODE_LOGO, CLAUDE_CODE_LOGO_WIDTH, CLAUDE_CODE_LOGO_HEIGHT,
  CLAUDE_ORANGE, drawClaudeCodeLogo, drawThinkbackIntro,

  // News broadcast effects (for morning news vibe)
  lowerThird, tickerTape, breakingBanner, liveIndicator,
  segmentTitle, statCounter, forecastBar, splitWipe,
  pushTransition, headlineCrawl, countdownReveal,

  // Awards show effects (for awards show vibe)
  trophyDisplay, awardBadge, envelopeReveal, categoryTitle,
  acceptanceSpeech, nomineeCard, winnerAnnouncement, applauseMeter,
  standingOvation, redCarpetBorder, spotlightText, spotlightReveal,
  curtainReveal, awardsStatue,

  // RPG quest effects (for rpg quest vibe)
  characterSprite, titleScreen, textBox, classSelect,
  questCard, questBanner, xpBar, levelUp,
  statsPanel, bossHealth, victoryFanfare, creditsRoll, inventorySlot,
} = globalThis;
```

### Transitions

Transitions mask/reveal content. Apply after drawing your scene content.

```javascript
// Circular reveal from center (0-1 progress)
circleReveal(fb, progress);

// Wipe from left to right
wipeRight(fb, progress, '█');

// Diagonal wipe from top-left corner
diagonalWipe(fb, progress, 'tl');

// Venetian blinds effect (horizontal)
blindsH(fb, progress, 8);

// Random dissolve
dissolve(fb, progress, seed);

// Iris in/out (classic film transition)
irisIn(fb, progress);
irisOut(fb, progress);

// Creative transitions
supernova(fb, progress);   // Explosive burst from center
spiral(fb, progress);      // Spinning vortex clear
shatter(fb, progress);     // Breaking glass effect
tornado(fb, progress);     // Swirling funnel clear
```

### Backgrounds

Draw backgrounds first, before scene content.

```javascript
// Twinkling stars (cozy, slow twinkle)
stars(fb, frame, { density: 0.006, twinkle: true });

// 3D starfield zoom effect
starfield(fb, frame, { speed: 1, numStars: 50 });

// Fireflies (warm, cozy)
fireflies(fb, frame, { count: 8 });

// Snow falling
snow(fb, frame, { density: 0.01 });

// Aurora / northern lights
aurora(fb, frame, { intensity: 0.5 });

// Gradient background
gradient(fb, { direction: 'vertical', invert: false });

// Concentric ripples from center
ripples(fb, frame, { speed: 1, char: '·' });
```

### Particles

Particles add atmosphere and celebration.

```javascript
// Gentle floating particles
floatingParticles(fb, frame, { count: 12, char: '◇' });

// Confetti celebration
confetti(fb, frame, { count: 20 });

// Sparkles twinkling
sparkles(fb, frame, { density: 0.005 });

// Rising embers
embers(fb, frame, { count: 10 });

// Floating hearts
hearts(fb, frame, { count: 6 });

// Dust motes in light
dust(fb, frame, { density: 0.003 });

// Orbiting particles around center
orbit(fb, frame, { cx: 40, cy: 12, radius: 5, count: 4 });
```

### Text Effects

Text animations for revealing and emphasizing text.

```javascript
// Typewriter effect (returns partial text)
const visibleText = typewriter('Hello World', progress);

// Draw with typewriter + cursor
drawTypewriterCentered(fb, y, 'Hello World', progress);

// Slide text in from edge
slideIn(fb, y, 'Welcome', progress, { from: 'left' });

// Wave effect (each character bobs)
drawWaveText(fb, y, 'Wavy Text', frame, { amplitude: 1 });

// Zoom text from center
drawZoomText(fb, y, 'Zoom!', progress);

// Fade in character by character
drawFadeInText(fb, y, 'Fading in', progress);

// Scatter then reassemble
drawScatterText(fb, 'Scatter', progress);
```

### Claude Mascot (Clawd)

The Claude mascot "Clawd" is a small ASCII art logo that can be used in opener/closer scenes.

```javascript
// Draw Claude mascot centered at position
// CLAUDE_MASCOT is an array of 3 lines
// CLAUDE_MASCOT_WIDTH is 10 characters
drawClaudeMascot(fb, fb.width / 2, 5, CLAUDE_ORANGE);

// The mascot looks like:
//  ▐▛███▜▌
// ▝▜█████▛▘
//   ▘▘ ▝▝
```

### Claude Code Logo

Large ASCII art logo for the Claude Code branding.

```javascript
// Draw the full Claude Code logo (12 lines tall, 50 chars wide)
drawClaudeCodeLogo(fb, fb.width / 2, 5, CLAUDE_ORANGE);

// The logo displays:
//    ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
//   ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
//   ██║     ██║     ███████║██║   ██║██║  ██║█████╗
//   ██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝
//   ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
//    ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
//                  ██████╗ ██████╗ ██████╗ ███████╗
//                 ██╔════╝██╔═══██╗██╔══██╗██╔════╝
//                 ██║     ██║   ██║██║  ██║█████╗
//                 ██║     ██║   ██║██║  ██║██╔══╝
//                 ╚██████╗╚██████╔╝██████╔╝███████╗
//                  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
```

### Thinkback Intro Scene (REQUIRED)

**Every animation MUST use this as the first scene.** It provides a consistent, branded intro experience.

```javascript
// In your intro scene renderer:
case 'INTRO': {
  // Add a starfield background
  stars(fb, frame, { density: 0.008, twinkle: true });

  // Draw the complete intro scene with Clawd, logo, and standard text
  drawThinkbackIntro(fb, frame, p);

  // Handle transition out
  if (scene.phase === 'TRANSITION_OUT') {
    dissolve(fb, scene.transitionProgress, frame);
  }
  break;
}
```

The intro displays:
- Clawd mascot fading in
- Claude Code logo with dissolve effect
- "Think Back on..." with typewriter effect
- "your year with Claude Code" subtitle
- Year at the bottom

### Example Scene with Helpers

```javascript
case 'OPENING': {
  // Background: twinkling stars
  stars(fb, frame, { density: 0.008, twinkle: true });

  // Particles: gentle floating diamonds
  floatingParticles(fb, frame, { count: 15, char: '◇' });

  // Text: typewriter reveal
  const title = 'Your Year in Review';
  if (p < 0.6) {
    drawTypewriterCentered(fb, 10, title, p / 0.6);
  } else {
    fb.drawCenteredText(10, title);
  }

  // Transition: iris out at end of scene
  if (p > 0.85) {
    irisOut(fb, (p - 0.85) / 0.15);
  }
  break;
}
```

## Critical Export Format

**IMPORTANT: The generated `year_in_review.js` MUST export in this exact format for the HTML to work:**

```javascript
// =============================================================================
// EXPORTS - MUST match what year_in_review.html expects
// =============================================================================

globalThis.YearInReviewScenes = {
  TOTAL_FRAMES: sceneManager.getTotalFrames(),
  mainAnimation: render,  // Your main render function
  getSceneName: (frame) => {
    const { sceneId } = sceneManager.getScene(frame);
    return sceneId || 'Complete';
  },
  sceneManager,
};
```

**DO NOT use these incorrect patterns:**
```javascript
// WRONG - will cause "YearInReviewScenes not loaded" error
globalThis.render = render;
globalThis.TOTAL_FRAMES = sceneManager.getTotalFrames();

// WRONG - using ES module exports (not supported in browser script tag)
export { render, TOTAL_FRAMES };
```

The `year_in_review.html` file specifically checks for `globalThis.YearInReviewScenes` and calls `mainAnimation` from it.
