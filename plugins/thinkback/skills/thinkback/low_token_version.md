# Low Token Version - Template-Based Generation

This mode uses pre-built templates for fast, token-efficient generation. Templates handle all scene structure, timing, and visual effects - you just inject the user's stats.

## Step 1: Extract Statistics

Run the stats script:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/skills/thinkback && node scripts/get_all_stats.js
```

Save the output - you'll need these values for the template.

## Step 2: Choose Template

Based on the user's vibe selection, use:

| Vibe | Template File |
|------|---------------|
| Cozy | `templates/cozy-template.js` |
| Awards show | `templates/awards-show-template.js` |
| Morning news | `templates/morning-news-template.js` |
| RPG Quest | `templates/rpg-quest-template.js` |

## Step 3: Read the Template

Read the chosen template file. Each template has injection points marked with `// INJECT:` comments.

## Step 4: Fill Injection Points

Search for `// INJECT:` comments and fill in values from the stats output.

### Common STATS Object

All templates have a STATS object to fill:

```javascript
const STATS = {
  userName: '',                // User's name from stats
  year: 2025,
  totalCommits: 0,             // Total commits
  totalSessions: 0,            // Total sessions
  totalMessages: 0,            // Total messages
  repoCount: 0,                // Number of repos
  peakHour: '',                // e.g., '12am', '3pm'
  peakDay: '',                 // e.g., 'Wed', 'Mon'
  nightOwlPercent: 0,          // Percentage (0-100)
  earlyBirdPercent: 0,         // Percentage (0-100)
  weekendPercent: 0,           // Percentage (0-100)
  longestStreak: 0,            // Days
  currentStreak: 0,            // Days
  totalActiveDays: 0,          // Days
  marathonDays: 0,             // Days with 100+ messages
  longestSessionMessages: 0,   // Messages in longest session
  firstSessionDate: '',        // 'YYYY-MM-DD'
  busiestWeek: '',             // e.g., 'Nov 24-30, 2025'
};
```

### Template-Specific Injection Points

**RPG Quest template** also needs:
```javascript
const CHARACTER_CLASS = '';    // INJECT: Based on work patterns
// Options: 'Code Knight', 'Debug Wizard', 'Refactor Monk', 'Feature Bard'
```

**Awards Show template** also needs:
```javascript
const TOP_REPOS = [
  { name: '', commits: 0 },    // INJECT: Top repo
  { name: '', commits: 0 },    // INJECT: 2nd repo
  { name: '', commits: 0 },    // INJECT: 3rd repo
];
```

## Step 5: Write to year_in_review.js

Write the filled template to `year_in_review.js` in this skill folder.

## Step 6: Validate

Run validation to ensure no errors:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/skills/thinkback && node scripts/validate.js
```

If validation fails, check:
- All STATS values are filled (no empty strings for required fields)
- Numbers are actual numbers, not strings
- Arrays have the expected structure

## Step 7: Signal Completion

Tell the user their animation is ready and ask them to run `/thinkback` again to play it.

---

## Quick Reference: Stats Output to STATS Mapping

The `get_all_stats.js` output maps to STATS like this:

| Stats Output | STATS Field |
|--------------|-------------|
| `commits.total` | `totalCommits` |
| `sessions.total` | `totalSessions` |
| `messages.total` | `totalMessages` |
| `repos` array length | `repoCount` |
| `timing.peakHour` | `peakHour` |
| `timing.peakDay` | `peakDay` |
| `timing.nightOwlPercent` | `nightOwlPercent` |
| `timing.earlyBirdPercent` | `earlyBirdPercent` |
| `timing.weekendPercent` | `weekendPercent` |
| `streaks.longest` | `longestStreak` |
| `streaks.current` | `currentStreak` |
| `activity.activeDays` | `totalActiveDays` |
| `activity.marathonDays` | `marathonDays` |
| `sessions.longestMessages` | `longestSessionMessages` |
| `firstSession.date` | `firstSessionDate` |
| `activity.busiestWeek` | `busiestWeek` |

---

## Tips for Fast Generation

1. **Don't modify scene structure** - Templates have pre-tuned timing and transitions
2. **Keep STATS simple** - Just copy numbers from the stats output
3. **Skip narrative analysis** - Templates have generic but polished narratives built-in
4. **Validate immediately** - Catch typos before signaling completion
