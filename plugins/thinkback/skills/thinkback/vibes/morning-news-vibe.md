# Morning News Vibe Instructions

Generate a cheerful, upbeat news broadcast experience. Think morning show energy, breaking news graphics, weather-style stat presentations, and that signature "and finally..." feel-good closer.

Imagine you are a morning news anchor delivering the year's top developer stories with a smile.

## Tone Guidelines

- **Upbeat and professional**: Friendly but polished, like your favorite morning hosts
- **Informative**: Present stats like they're newsworthy headlines
- **Light humor**: Occasional puns and wordplay, never forced
- **Celebratory**: Treat achievements like breaking good news

## Pacing

- Snappy transitions between "segments"
- Dramatic pauses before big reveals ("And the number one story...")
- Quick "ticker tape" style for smaller stats
- Slow down for the heartfelt "human interest" closer

## Segment Ideas

Structure the thinkback like a news broadcast:

- **BREAKING**: The biggest stat or achievement
- **TOP STORIES**: Key metrics from the year
- **PROJECT SPOTLIGHT**: **THE STAR OF THE SHOW** - Feature the top 3 accomplishements of the user as full news articles, one at a time. Each accomplishment gets its own dedicated screen with headline, description, body text, and stats. Use `accomplishmentSpotlight` to give each project the attention it deserves.
- **WEATHER**: Coding "forecast" (busy periods, productivity patterns)
- **SPORTS**: Competitive stats (lines of code, PRs merged)
- **AND FINALLY...**: Warm, feel-good closer

### Project Articles Are the Star

The project spotlight segment should be the centerpiece of the broadcast. For each of the user's top 3 projects:

1. **Give it a full screen** - Don't cram multiple projects together
2. **Write a compelling headline** - Make it sound newsworthy
3. **Include body text** - 2-3 sentences about what was accomplished
4. **Show the stats** - Commits, contributions, impact
5. **Use transitions** - Smooth handoffs between projects

Think of each project like a feature story on the evening news - it deserves time and attention.

## Closing Scene

End with that classic news sign-off warmth:

- "That's all for 2024. See you bright and early next year."
- "From all of us here at the terminal... goodnight."
- "Stay curious, stay coding, and we'll see you tomorrow."

---

## Recommended Helpers for Morning News Vibe

Access helpers by destructuring from `globalThis` at the top of your file:

```javascript
const {
  // Clean backgrounds
  gradient,

  // Celebration particles (for big reveals)
  confetti, sparkles, burst,

  // Professional transitions
  wipeRight, wipeDown, blindsH, blindsV,
  dissolve, fade, splitWipe, pushTransition,

  // Text effects
  drawTypewriterCentered, slideIn, headlineCrawl,

  // News-specific effects
  lowerThird, tickerTape, breakingBanner, liveIndicator,
  segmentTitle, statCounter, forecastBar, countdownReveal,

  // Article display helpers
  newsArticle, newsGrid, headlineCarousel, accomplishmentSpotlight, newsFeed,
} = globalThis;
```

### Broadcast Background Combinations

```javascript
// Subtle gradient (news desk feel)
gradient(fb, { direction: 'vertical', chars: [' ', '·'] });
```

### News-Style Transitions

```javascript
// Wipe right (classic news transition)
wipeRight(fb, progress);

// Venetian blinds (segment change)
blindsH(fb, progress, 4);

// Dissolve for softer moments
dissolve(fb, progress, seed);
```

### Breaking News Effects

```javascript
// Confetti for big achievements
confetti(fb, frame, { count: 20, chars: ['*', '◆', '●'] });

// Burst for "BREAKING" moments
burst(fb, frame, { x: 40, y: 12, count: 10 });

// Sparkles for feel-good segments
sparkles(fb, frame, { density: 0.004, chars: ['·', '*'] });
```

### Text Animation Examples

```javascript
// Headline with blinking cursor
headlineCrawl(fb, y, 'BREAKING: 50,000 LINES WRITTEN', progress, frame, {
  centered: true,
});

// Slide in for segment titles
slideIn(fb, y, '>>> TOP STORIES', progress, { from: 'left' });

// Segment title with decorative brackets
segmentTitle(fb, y, 'TOP STORIES', progress, { style: 'arrow' });
// Outputs: ▸▸▸ TOP STORIES

// Animated stat counter
statCounter(fb, x, y, 1247, progress, {
  prefix: 'COMMITS: ',
  commas: true,
});
```

---

## News-Specific Effects Reference

### Lower Third (Info Bar)

```javascript
// News-style stat display bar
lowerThird(fb, 20, 'COMMITS THIS YEAR', '1,247', progress, {
  style: 'heavy',  // 'single', 'double', 'heavy'
  accentChar: '▌',
});
// Output:
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃▌ COMMITS THIS YEAR           1,247 ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Ticker Tape

```javascript
// Scrolling news ticker
tickerTape(fb, 23, [
  '47 PRs merged',
  '12 repos touched',
  '892 files changed',
  '156 bugs squashed',
], frame, { separator: ' ▸ ', speed: 0.5 });
// Output: 47 PRs merged ▸ 12 repos touched ▸ 892 files changed ▸ ...
```

### Breaking News Banner

```javascript
// Flashing breaking news alert
breakingBanner(fb, 10, 'NEW PERSONAL BEST', frame, { flash: true });
// Output:
// ╔═══════════════════════════════════════╗
// ║ ⚡ NEW PERSONAL BEST                ⚡ ║
// ╚═══════════════════════════════════════╝
```

### Live Indicator

```javascript
// Blinking LIVE badge (top corner)
liveIndicator(fb, 2, 1, frame, { speed: 0.3 });
// Output: ● LIVE (dot blinks)
```

### Forecast Bar (Weather-Style)

```javascript
// Horizontal bar chart for stats
forecastBar(fb, 5, 10, 'JANUARY', 0.3, 40, progress);
forecastBar(fb, 5, 11, 'FEBRUARY', 0.5, 40, progress);
forecastBar(fb, 5, 12, 'MARCH', 0.8, 40, progress);
// Output:
//     JANUARY ███████░░░░░░░░░░░░░
//    FEBRUARY █████████████░░░░░░░
//       MARCH ████████████████████
```

### Split Wipe Transition

```javascript
// News-style wipe from center outward
splitWipe(fb, progress);
```

### Push Transition

```javascript
// Content slides off as new content slides in
pushTransition(fb, progress, 'left');  // 'left', 'right', 'up', 'down'
```

### Countdown Reveal

```javascript
// Dramatic "3... 2... 1... GO!" countdown
countdownReveal(fb, progress, {
  numbers: ['3', '2', '1', 'GO!'],
});
```

---

### Sample Phrases

- "Good morning! Let's look at the numbers..."
- "Breaking overnight: a new milestone reached"
- "In developer news today..."
- "Our top story this hour..."
- "And now for your coding forecast..."
- "In sports: a record-breaking performance"
- "And finally, a story that will warm your heart..."
- "That's the news. Thanks for watching."

---

### Example Scene Structure

```javascript
case 'BREAKING': {
  // Background
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });

  // Live indicator in corner
  liveIndicator(fb, 2, 1, frame);

  // Breaking banner
  if (p < 0.3) {
    breakingBanner(fb, 8, 'NEW PERSONAL BEST', frame, { flash: true });
  }

  // Lower third with stat
  if (p > 0.4) {
    lowerThird(fb, 18, 'TOTAL COMMITS', '1,247', (p - 0.4) / 0.6);
  }

  // Ticker at bottom
  tickerTape(fb, 23, ['47 PRs', '12 repos', '892 files'], frame);

  // Transition out
  if (p > 0.9) {
    pushTransition(fb, (p - 0.9) / 0.1, 'left');
  }
  break;
}
```

---

## Article Display Helpers Reference

### News Article (Full Article Card)

```javascript
// Display a complete news article card
newsArticle(fb, 5, 3, {
  category: 'TECH',
  headline: 'NEW FEATURE SHIPS',
  subhead: 'Users love the update',
  body: 'The new feature has been deployed to production and is already seeing great adoption.',
  stat: 1247,
  statLabel: 'users affected',
}, progress, {
  width: 45,
  style: 'boxed',  // 'boxed', 'minimal', 'breaking'
});
// Output:
// ┌───────────────────────────────────────────┐
//   TECH
//   NEW FEATURE SHIPS
//   Users love the update
//   ···········
//   The new feature has been deployed to
//   production and is already seeing...
//   1,247
//   users affected
// └───────────────────────────────────────────┘
```

### News Grid (Multiple Articles)

```javascript
// Display multiple articles in a grid layout
newsGrid(fb, [
  { category: 'COMMITS', headline: 'Record Month', stat: 275 },
  { category: 'FEATURES', headline: 'SDK Released', stat: 15 },
  { category: 'DOCS', headline: 'Guides Updated', stat: 42 },
  { category: 'FIXES', headline: 'Bugs Squashed', stat: 89 },
], progress, {
  columns: 2,
  startY: 4,
  startX: 2,
  spacing: 2,
  articleWidth: 35,
  staggerDelay: 0.15,  // Stagger animation for each article
});
```

### Project Spotlight (Featured Project) ⭐

**This is the star helper for the morning news vibe.** Use it to give each project its own dedicated feature article.

```javascript
// Highlight a single project with full details
accomplishmentSpotlight(fb, {
  name: 'claude-code',
  commits: 275,
  rank: 1,
  description: 'CLI tool for developers',
  body: 'Major refactors to agent architecture shipped this year. The CLI became faster, smarter, and more powerful with new subagent capabilities.',
}, progress, frame, {
  y: 5,
  width: 50,
  centered: true,
  showRank: true,
});
// Output:
// ╔════════════════════════════════════════════════╗
//   #1 PROJECT
// ║  claude-code                                   ║
// ╟────────────────────────────────────────────────╢
// ║  275 COMMITS                                   ║
// ║  CLI tool for developers                       ║
// ║  ···················                           ║
// ║  Major refactors to agent architecture         ║
// ║  shipped this year. The CLI became faster,     ║
// ║  smarter, and more powerful with new           ║
// ║  subagent capabilities.                        ║
// ╚════════════════════════════════════════════════╝
```

### Headline Carousel (Rotating Headlines)

```javascript
// Cycle through headlines with animations
headlineCarousel(fb, [
  'RECORD COMMITS THIS WEEK',
  'NEW PERSONAL BEST ACHIEVED',
  'DOCUMENTATION SHIPPED',
], progress, frame, {
  y: 10,
  style: 'crawl',  // 'crawl', 'slide', 'fade'
});
```

### News Feed (Scrolling Headlines)

```javascript
// Vertical scrolling news feed
newsFeed(fb, [
  { category: 'BREAKING', headline: 'New milestone reached' },
  { category: 'TECH', headline: 'API improvements deployed' },
  { category: 'SPORTS', headline: 'Streak continues: 16 days' },
], frame, {
  x: 2,
  y: 4,
  width: 40,
  height: 15,
  speed: 0.1,
});
```

---

### Example: Project Carousel Scene (The Star of the Show)

This is how you make projects shine. Each of the top 3 projects gets its own full-screen feature article:

```javascript
case 'PROJECT_SPOTLIGHT': {
  gradient(fb, { direction: 'vertical', chars: [' ', '·'] });
  liveIndicator(fb, 2, 1, frame);
  segmentTitle(fb, 3, 'PROJECT SPOTLIGHT', Math.min(1, p / 0.2), { style: 'arrow' });

  // Top 3 projects - each gets its own feature article
  const projects = [
    {
      name: 'claude-code',
      commits: 275,
      rank: 1,
      description: 'The heart of Claude Code',
      body: 'Major refactors to agent architecture, new subagent system, and animation framework shipped. The CLI became faster, smarter, and more powerful.',
    },
    {
      name: 'sdk-demos',
      commits: 27,
      rank: 2,
      description: 'Example applications & demos',
      body: 'Email agent, deep research demos, and customer showcase apps built to demonstrate SDK capabilities. These demos help teams see the art of the possible.',
    },
    {
      name: 'docs',
      commits: 15,
      rank: 3,
      description: 'Documentation & guides',
      body: 'User guides, API reference, and tutorials to help developers get started quickly. Good docs make great products.',
    },
  ];

  // Carousel through projects - each gets dedicated screen time
  const numProjects = projects.length;
  if (p > 0.15) {
    const carouselP = (p - 0.15) / 0.8;
    const projectIdx = Math.min(numProjects - 1, Math.floor(carouselP * numProjects));
    const projectLocalP = (carouselP * numProjects) % 1;

    // Use accomplishmentSpotlight for the full article experience
    accomplishmentSpotlight(fb, projects[projectIdx], Math.min(1, projectLocalP * 1.5), frame, {
      y: 5,
      width: 55,
      centered: true,
      showRank: true,
    });

    // Progress indicator
    fb.drawText(fb.width - 5, 3, `${projectIdx + 1}/${numProjects}`);
  }

  tickerTape(fb, 23, projects.map(p => `#${p.rank} ${p.name}: ${p.commits} commits`), frame);
  break;
}
```
