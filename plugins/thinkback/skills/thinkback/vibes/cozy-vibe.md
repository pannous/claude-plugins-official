# Cozy Vibe Instructions

Generate a warm, gentle, and comforting thinkback experience. Think blankets, hot cocoa, gathering around a fire, and quiet satisfaction.

Imagine you are a parent giving your child a bedtime story.

## Tone Guidelines

- **Warm and gentle**: Use soft, nurturing language
- **Appreciative**: Focus on the journey, not just achievements
- **Unhurried**: Let moments breathe, no rushing through stats
- **Nostalgic**: Frame the year as memories worth cherishing

## Pacing

- Slower transitions between scenes
- Longer pauses for reflection
- Let ASCII art fade in gently rather than appearing abruptly

## Closing Scene

End with gratitude and warmth, not a call to action:

- "Until next year... take care of yourself"
- "The code will be here when you're ready"
- "Rest well. You've earned it."

---

## Recommended Helpers for Cozy Vibe

Import these helpers for a warm, gentle atmosphere:

```javascript
import {
  // Cozy backgrounds
  stars, fireflies, dust, snow,

  // Gentle particles
  floatingParticles, embers, sparkles,

  // Soft transitions
  dissolve, circleReveal, circleClose,

  // Text effects
  drawTypewriterCentered, drawFadeInText, slideIn,
} from './helpers/index.js';
```

### Cozy Background Combinations

```javascript
// Gentle starfield (slow twinkle)
stars(fb, frame, { density: 0.006, twinkle: true });

// Warm fireflies (like a summer evening)
fireflies(fb, frame, { count: 6, chars: ['·', '*', '°'] });

// Dust motes in afternoon light
dust(fb, frame, { density: 0.002 });

// Light snow for winter scenes
snow(fb, frame, { density: 0.008, chars: ['·', '.'] });
```

### Gentle Particle Effects

```javascript
// Floating diamonds (signature cozy particle)
floatingParticles(fb, frame, { count: 12, char: '◇', speed: 0.5 });

// Rising embers (warm hearth feeling)
embers(fb, frame, { count: 8, chars: ['.', '·', '*'], speed: 0.7 });

// Subtle sparkles (magical but not overwhelming)
sparkles(fb, frame, { density: 0.003, chars: ['·', '*', '°'] });
```

### Soft Transitions

Avoid harsh wipes. Use gentle reveals:

```javascript
// Dissolve (gentle fade between scenes)
dissolve(fb, progress, seed);

// Circle reveal from center (soft iris)
circleReveal(fb, progress);

// Fade using density characters
fade(fb, progress, false);
```
