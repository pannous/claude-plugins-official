/* eslint-disable */
/**
 * Thinkback Animation Helpers
 * Re-exports all helper modules for easy importing
 */

// Import files to execute them and populate globalThis
import './transitions.js';
import './backgrounds.js';
import './text_effects.js';
import './particles.js';
import './borders.js';
import './scene_system.js';
import './news_effects.js';
import './awards_effects.js';
import './rpg_effects.js';

// Re-export from globalThis for ES module consumers
export const {
  // transitions
  wipeLeft, wipeRight, wipeDown, wipeUp,
  circleReveal, circleClose, irisIn, irisOut,
  blindsH, blindsV, checkerboard, diagonalWipe,
  dissolve, pixelate, matrixRain, getSlideOffset, fade,
  supernova, spiral, shatter, tornado,
  // backgrounds
  stars, starfield, rain, snow, fog, aurora, waves,
  gradient, staticNoise, ripples, fireflies, clouds,
  // text_effects
  typewriter, fadeByLetter, wave, bounce, shake, float,
  drawTypewriter, drawTypewriterCentered, drawWaveText,
  drawGlitchText, drawGlitchTextCentered, drawScatterText,
  slideIn, slideOut, drawZoomText, drawFadeInText,
  drawRainbowText, drawWipeReveal,
  // Claude branding
  CLAUDE_MASCOT, CLAUDE_MASCOT_WIDTH, drawClaudeMascot,
  CLAUDE_CODE_LOGO, CLAUDE_CODE_LOGO_WIDTH, CLAUDE_CODE_LOGO_HEIGHT,
  CLAUDE_ORANGE, drawClaudeCodeLogo, drawThinkbackIntro,
  // particles
  confetti, sparkles, burst, bubbles, hearts, musicNotes,
  leaves, embers, dust, floatingParticles, trail, orbit,
  shootingStars, glitter,
  // borders
  BORDERS, boxBorder, fullscreenBorder, cornerDecor,
  marchingAnts, pulseBorder, growBorder, framedTitle,
  gradientBorder, divider, dividerWithText,
  // scene system
  SceneManager, getScenePhase, renderScene, createScene,
  staggeredReveal, easeInOut, easeOut, animateCounter,
  ANIMATION_FPS, DEFAULT_HOLD_SECONDS,
  DEFAULT_TRANSITION_IN_SECONDS, DEFAULT_TRANSITION_OUT_SECONDS,
  // news effects
  lowerThird, tickerTape, breakingBanner, liveIndicator,
  segmentTitle, statCounter, forecastBar, splitWipe,
  pushTransition, headlineCrawl, countdownReveal,
  newsArticle, newsGrid, headlineCarousel, accomplishmentSpotlight, newsFeed,
  // awards effects
  trophyDisplay, awardBadge, envelopeReveal, categoryTitle,
  acceptanceSpeech, nomineeCard, winnerAnnouncement, applauseMeter,
  standingOvation, redCarpetBorder, spotlightText, spotlightReveal,
  curtainReveal, awardsStatue,
  // rpg effects
  characterSprite, titleScreen, textBox, classSelect,
  questCard, questBanner, xpBar, levelUp,
  statsPanel, bossHealth, victoryFanfare, creditsRoll, inventorySlot,
} = globalThis;
