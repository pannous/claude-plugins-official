/* eslint-disable */
/**
 * News Broadcast Effects
 * Specialized effects for the morning news vibe
 */
(function() {

// Seeded random for consistent effects
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Easing functions
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================================================
// LOWER THIRD - News-style stat display bar
// ============================================================================

/**
 * Draw a "lower third" graphics bar (news-style info bar)
 * @param fb - Framebuffer
 * @param y - Y position (typically near bottom)
 * @param label - Left side label (e.g., "COMMITS THIS YEAR")
 * @param value - Right side value (e.g., "1,247")
 * @param progress - Animation progress 0-1 (for reveal)
 * @param options - { style: 'single'|'double'|'heavy', depth: number }
 */
function lowerThird(fb, y, label, value, progress, options = {}) {
  const { style = 'heavy', depth = 5, accentChar = '▌' } = options;

  const totalWidth = Math.min(fb.width - 4, 50);
  const x = Math.floor((fb.width - totalWidth) / 2);

  // Animate width based on progress
  const visibleWidth = Math.floor(easeOut(progress) * totalWidth);
  if (visibleWidth < 3) return;

  const BORDERS = {
    single: { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' },
    double: { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝' },
    heavy: { h: '━', v: '┃', tl: '┏', tr: '┓', bl: '┗', br: '┛' },
  };
  const chars = BORDERS[style] || BORDERS.heavy;

  const startX = Math.floor((fb.width - visibleWidth) / 2);

  // Top border
  fb.setPixel(startX, y, chars.tl, depth);
  for (let i = 1; i < visibleWidth - 1; i++) {
    fb.setPixel(startX + i, y, chars.h, depth);
  }
  fb.setPixel(startX + visibleWidth - 1, y, chars.tr, depth);

  // Content line with accent bar
  fb.setPixel(startX, y + 1, chars.v, depth);
  fb.setPixel(startX + 1, y + 1, accentChar, depth);
  fb.setPixel(startX + 2, y + 1, ' ', depth);

  // Draw label (left-aligned after accent)
  const maxLabelLen = visibleWidth - value.length - 6;
  const displayLabel = label.slice(0, Math.max(0, maxLabelLen));
  for (let i = 0; i < displayLabel.length; i++) {
    fb.setPixel(startX + 3 + i, y + 1, displayLabel[i], depth);
  }

  // Draw value (right-aligned)
  const valueStart = startX + visibleWidth - value.length - 2;
  for (let i = 0; i < value.length; i++) {
    if (valueStart + i > startX + 3 + displayLabel.length) {
      fb.setPixel(valueStart + i, y + 1, value[i], depth);
    }
  }

  fb.setPixel(startX + visibleWidth - 1, y + 1, chars.v, depth);

  // Bottom border
  fb.setPixel(startX, y + 2, chars.bl, depth);
  for (let i = 1; i < visibleWidth - 1; i++) {
    fb.setPixel(startX + i, y + 2, chars.h, depth);
  }
  fb.setPixel(startX + visibleWidth - 1, y + 2, chars.br, depth);
}

// ============================================================================
// TICKER TAPE - Scrolling news ticker
// ============================================================================

/**
 * Draw a scrolling ticker tape at bottom of screen
 * @param fb - Framebuffer
 * @param y - Y position
 * @param items - Array of strings to scroll
 * @param frame - Current frame for animation
 * @param options - { separator: string, speed: number, depth: number }
 */
function tickerTape(fb, y, items, frame, options = {}) {
  const { separator = ' ▸ ', speed = 0.5, depth = 5 } = options;

  // Build full ticker string
  const tickerText = items.join(separator) + separator;
  const doubledText = tickerText + tickerText; // Double for seamless loop

  // Calculate scroll offset
  const offset = Math.floor(frame * speed) % tickerText.length;

  // Draw ticker background line
  for (let x = 0; x < fb.width; x++) {
    const charIdx = (x + offset) % doubledText.length;
    fb.setPixel(x, y, doubledText[charIdx], depth);
  }
}

// ============================================================================
// BREAKING NEWS BANNER
// ============================================================================

/**
 * Draw a breaking news banner with optional flash effect
 * @param fb - Framebuffer
 * @param y - Y position
 * @param text - Breaking news text
 * @param frame - Current frame for flash effect
 * @param options - { flash: boolean, depth: number }
 */
function breakingBanner(fb, y, text, frame, options = {}) {
  const { flash = true, depth = 10 } = options;

  const totalWidth = text.length + 8;
  const x = Math.floor((fb.width - totalWidth) / 2);

  // Flash effect - alternate between filled and empty style
  const isFlash = flash && Math.floor(frame / 8) % 2 === 0;

  // Top border
  fb.setPixel(x, y, '╔', depth);
  for (let i = 1; i < totalWidth - 1; i++) {
    fb.setPixel(x + i, y, '═', depth);
  }
  fb.setPixel(x + totalWidth - 1, y, '╗', depth);

  // Content line
  fb.setPixel(x, y + 1, '║', depth);

  // Flashing indicator
  const indicator = isFlash ? ' ⚡ ' : '   ';
  for (let i = 0; i < 3; i++) {
    fb.setPixel(x + 1 + i, y + 1, indicator[i], depth);
  }

  // Text
  for (let i = 0; i < text.length; i++) {
    fb.setPixel(x + 4 + i, y + 1, text[i], depth);
  }

  // Flashing indicator (end)
  for (let i = 0; i < 3; i++) {
    fb.setPixel(x + 4 + text.length + i, y + 1, indicator[2 - i], depth);
  }

  fb.setPixel(x + totalWidth - 1, y + 1, '║', depth);

  // Bottom border
  fb.setPixel(x, y + 2, '╚', depth);
  for (let i = 1; i < totalWidth - 1; i++) {
    fb.setPixel(x + i, y + 2, '═', depth);
  }
  fb.setPixel(x + totalWidth - 1, y + 2, '╝', depth);
}

// ============================================================================
// LIVE INDICATOR - Blinking "LIVE" badge
// ============================================================================

/**
 * Draw a blinking LIVE indicator
 * @param fb - Framebuffer
 * @param x - X position
 * @param y - Y position
 * @param frame - Current frame for blink effect
 * @param options - { speed: number, depth: number }
 */
function liveIndicator(fb, x, y, frame, options = {}) {
  const { speed = 0.3, depth = 10 } = options;

  // Blink the dot
  const showDot = Math.sin(frame * speed) > 0;
  const dot = showDot ? '●' : '○';

  const text = `${dot} LIVE`;
  for (let i = 0; i < text.length; i++) {
    fb.setPixel(x + i, y, text[i], depth);
  }
}

// ============================================================================
// SEGMENT TITLE - News segment header
// ============================================================================

/**
 * Draw a segment title with decorative elements
 * @param fb - Framebuffer
 * @param y - Y position
 * @param title - Segment title (e.g., "TOP STORIES")
 * @param progress - Animation progress 0-1
 * @param options - { style: 'bracket'|'arrow'|'box', depth: number }
 */
function segmentTitle(fb, y, title, progress, options = {}) {
  const { style = 'arrow', depth = 5 } = options;

  const easedProgress = easeOut(progress);
  const visibleChars = Math.floor(easedProgress * title.length);
  const visibleTitle = title.slice(0, visibleChars);

  let fullText;
  switch (style) {
    case 'bracket':
      fullText = `【 ${visibleTitle} 】`;
      break;
    case 'box':
      fullText = `┃ ${visibleTitle} ┃`;
      break;
    case 'arrow':
    default:
      fullText = `▸▸▸ ${visibleTitle}`;
  }

  const x = Math.floor((fb.width - fullText.length) / 2);

  for (let i = 0; i < fullText.length; i++) {
    fb.setPixel(x + i, y, fullText[i], depth);
  }
}

// ============================================================================
// STAT COUNTER - Animated number reveal
// ============================================================================

/**
 * Animate a number counting up
 * @param fb - Framebuffer
 * @param x - X position
 * @param y - Y position
 * @param targetValue - Final number to display
 * @param progress - Animation progress 0-1
 * @param options - { prefix: string, suffix: string, depth: number }
 */
function statCounter(fb, x, y, targetValue, progress, options = {}) {
  const { prefix = '', suffix = '', depth = 5, commas = true } = options;

  const easedProgress = easeOut(progress);
  const currentValue = Math.floor(easedProgress * targetValue);

  // Format with commas if requested
  let valueStr = currentValue.toString();
  if (commas && currentValue >= 1000) {
    valueStr = currentValue.toLocaleString();
  }

  const fullText = `${prefix}${valueStr}${suffix}`;

  for (let i = 0; i < fullText.length; i++) {
    fb.setPixel(x + i, y, fullText[i], depth);
  }
}

// ============================================================================
// WEATHER FORECAST STYLE - Bar chart display
// ============================================================================

/**
 * Draw a horizontal bar chart (weather forecast style)
 * @param fb - Framebuffer
 * @param x - X position
 * @param y - Y position
 * @param label - Label for this bar
 * @param value - Value (0-1 for percentage)
 * @param maxWidth - Maximum width of bar
 * @param progress - Animation progress 0-1
 * @param options - { char: string, depth: number }
 */
function forecastBar(fb, x, y, label, value, maxWidth, progress, options = {}) {
  const { char = '█', emptyChar = '░', depth = 5 } = options;

  const labelWidth = 12;
  const barWidth = maxWidth - labelWidth - 2;

  // Draw label (right-aligned in label area)
  const paddedLabel = label.slice(0, labelWidth).padStart(labelWidth);
  for (let i = 0; i < paddedLabel.length; i++) {
    fb.setPixel(x + i, y, paddedLabel[i], depth);
  }

  // Separator
  fb.setPixel(x + labelWidth, y, ' ', depth);

  // Draw bar
  const animatedValue = value * easeOut(progress);
  const filledWidth = Math.floor(animatedValue * barWidth);

  for (let i = 0; i < barWidth; i++) {
    const barChar = i < filledWidth ? char : emptyChar;
    fb.setPixel(x + labelWidth + 1 + i, y, barChar, depth);
  }
}

// ============================================================================
// SPLIT WIPE TRANSITION - News-style double wipe
// ============================================================================

/**
 * Split wipe from center outward (news transition style)
 * @param fb - Framebuffer
 * @param progress - Transition progress 0-1
 */
function splitWipe(fb, progress) {
  const centerY = Math.floor(fb.height / 2);
  const halfHeight = fb.height / 2;
  const wipeDistance = Math.floor(easeOut(progress) * halfHeight);

  // Wipe from center upward
  for (let y = centerY - wipeDistance; y >= 0; y--) {
    for (let x = 0; x < fb.width; x++) {
      if (centerY - y > wipeDistance) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }

  // Wipe from center downward
  for (let y = centerY + wipeDistance; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      if (y - centerY > wipeDistance) {
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

// ============================================================================
// PUSH TRANSITION - Content pushes off screen
// ============================================================================

/**
 * Push transition - old content slides out as new slides in
 * @param fb - Framebuffer
 * @param progress - Transition progress 0-1
 * @param direction - 'left', 'right', 'up', 'down'
 */
function pushTransition(fb, progress, direction = 'left') {
  const easedProgress = easeOut(progress);

  if (direction === 'left' || direction === 'right') {
    const offset = Math.floor(easedProgress * fb.width);
    const dir = direction === 'left' ? 1 : -1;

    // Clear the area being pushed into
    for (let y = 0; y < fb.height; y++) {
      for (let i = 0; i < offset; i++) {
        const x = direction === 'left' ? fb.width - 1 - i : i;
        fb.setPixel(x, y, ' ', -100);
      }
    }
  } else {
    const offset = Math.floor(easedProgress * fb.height);

    for (let x = 0; x < fb.width; x++) {
      for (let i = 0; i < offset; i++) {
        const y = direction === 'up' ? fb.height - 1 - i : i;
        fb.setPixel(x, y, ' ', -100);
      }
    }
  }
}

// ============================================================================
// HEADLINE CRAWL - Typewriter with cursor flash
// ============================================================================

/**
 * Draw headline with news-style typewriter and blinking cursor
 * @param fb - Framebuffer
 * @param y - Y position
 * @param text - Headline text
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for cursor blink
 * @param options - { depth: number }
 */
function headlineCrawl(fb, y, text, progress, frame, options = {}) {
  const { depth = 5, centered = true } = options;

  const visibleChars = Math.floor(progress * text.length);
  const visibleText = text.slice(0, visibleChars);

  const x = centered
    ? Math.floor((fb.width - text.length) / 2)
    : 2;

  // Draw visible text
  for (let i = 0; i < visibleText.length; i++) {
    fb.setPixel(x + i, y, visibleText[i], depth);
  }

  // Blinking block cursor at end
  if (progress < 1) {
    const cursorChar = Math.floor(frame / 6) % 2 === 0 ? '█' : ' ';
    fb.setPixel(x + visibleChars, y, cursorChar, depth);
  }
}

// ============================================================================
// COUNTDOWN REVEAL - "3... 2... 1..." style countdown
// ============================================================================

/**
 * Draw a dramatic countdown
 * @param fb - Framebuffer
 * @param progress - Animation progress 0-1
 * @param options - { numbers: array, depth: number }
 */
function countdownReveal(fb, progress, options = {}) {
  const { numbers = ['3', '2', '1', 'GO!'], depth = 10 } = options;

  const numIdx = Math.floor(progress * numbers.length);
  if (numIdx >= numbers.length) return;

  const current = numbers[numIdx];
  const phaseProgress = (progress * numbers.length) % 1;

  // Scale effect
  const scale = 1 + (1 - phaseProgress) * 0.5;

  const x = Math.floor((fb.width - current.length) / 2);
  const y = Math.floor(fb.height / 2);

  for (let i = 0; i < current.length; i++) {
    fb.setPixel(x + i, y, current[i], depth);
  }
}

// ============================================================================
// NEWS ARTICLE - Full article card display
// ============================================================================

/**
 * Draw a news article card (like a newspaper article)
 * @param fb - Framebuffer
 * @param x - X position (left edge)
 * @param y - Y position (top edge)
 * @param article - { headline, subhead?, body?, stat?, statLabel?, category? }
 * @param progress - Animation progress 0-1
 * @param options - { width, style, depth }
 */
function newsArticle(fb, x, y, article, progress, options = {}) {
  const {
    width = 40,
    style = 'boxed', // 'boxed', 'minimal', 'breaking'
    depth = 5,
  } = options;

  const {
    headline = '',
    subhead = '',
    body = '',
    stat = '',
    statLabel = '',
    category = '',
  } = article;

  const easedProgress = easeOut(progress);
  if (easedProgress < 0.05) return;

  let currentY = y;

  // Calculate visible width for animation
  const visibleWidth = Math.floor(easedProgress * width);
  if (visibleWidth < 5) return;

  // Draw box border if boxed style
  if (style === 'boxed' || style === 'breaking') {
    const borderChar = style === 'breaking' ? '═' : '─';
    const cornerTL = style === 'breaking' ? '╔' : '┌';
    const cornerTR = style === 'breaking' ? '╗' : '┐';

    // Top border
    fb.setPixel(x, currentY, cornerTL, depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, borderChar, depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, cornerTR, depth);
    currentY++;
  }

  // Category tag
  if (category && easedProgress > 0.2) {
    const catText = ` ${category} `;
    const catStart = x + 2;
    for (let i = 0; i < catText.length && catStart + i < x + visibleWidth - 1; i++) {
      fb.setPixel(catStart + i, currentY, catText[i], depth + 1);
    }
    currentY++;
  }

  // Headline
  if (headline && easedProgress > 0.3) {
    const headlineProgress = Math.min(1, (easedProgress - 0.3) / 0.3);
    const visibleHeadline = headline.slice(0, Math.floor(headlineProgress * headline.length));
    const headStart = x + 2;
    for (let i = 0; i < visibleHeadline.length && headStart + i < x + visibleWidth - 2; i++) {
      fb.setPixel(headStart + i, currentY, visibleHeadline[i], depth + 2);
    }
    currentY++;
  }

  // Subhead
  if (subhead && easedProgress > 0.5) {
    const subStart = x + 2;
    const displaySub = subhead.slice(0, visibleWidth - 4);
    for (let i = 0; i < displaySub.length; i++) {
      fb.setPixel(subStart + i, currentY, displaySub[i], depth);
    }
    currentY++;
  }

  // Divider line
  if ((body || stat) && easedProgress > 0.55) {
    for (let i = 2; i < Math.min(visibleWidth - 2, 15); i++) {
      fb.setPixel(x + i, currentY, '·', depth);
    }
    currentY++;
  }

  // Body text (wrap if needed)
  if (body && easedProgress > 0.6) {
    const bodyProgress = Math.min(1, (easedProgress - 0.6) / 0.3);
    const maxBodyWidth = visibleWidth - 4;
    const words = body.split(' ');
    let line = '';
    let lineCount = 0;
    const maxLines = 3;

    for (const word of words) {
      if ((line + ' ' + word).length > maxBodyWidth) {
        // Draw current line
        const visibleLine = line.slice(0, Math.floor(bodyProgress * line.length));
        for (let i = 0; i < visibleLine.length; i++) {
          fb.setPixel(x + 2 + i, currentY, visibleLine[i], depth);
        }
        currentY++;
        lineCount++;
        if (lineCount >= maxLines) break;
        line = word;
      } else {
        line = line ? line + ' ' + word : word;
      }
    }
    // Draw remaining line
    if (line && lineCount < maxLines) {
      const visibleLine = line.slice(0, Math.floor(bodyProgress * line.length));
      for (let i = 0; i < visibleLine.length; i++) {
        fb.setPixel(x + 2 + i, currentY, visibleLine[i], depth);
      }
      currentY++;
    }
  }

  // Big stat display
  if (stat && easedProgress > 0.7) {
    const statProgress = Math.min(1, (easedProgress - 0.7) / 0.2);
    const statStr = typeof stat === 'number'
      ? Math.floor(statProgress * stat).toLocaleString()
      : stat;
    const statStart = x + 2;
    for (let i = 0; i < statStr.length && statStart + i < x + visibleWidth - 2; i++) {
      fb.setPixel(statStart + i, currentY, statStr[i], depth + 3);
    }
    currentY++;

    if (statLabel) {
      for (let i = 0; i < statLabel.length && statStart + i < x + visibleWidth - 2; i++) {
        fb.setPixel(statStart + i, currentY, statLabel[i], depth);
      }
      currentY++;
    }
  }

  // Bottom border
  if (style === 'boxed' || style === 'breaking') {
    const borderChar = style === 'breaking' ? '═' : '─';
    const cornerBL = style === 'breaking' ? '╚' : '└';
    const cornerBR = style === 'breaking' ? '╝' : '┘';

    fb.setPixel(x, currentY, cornerBL, depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, borderChar, depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, cornerBR, depth);
  }

  return currentY - y + 1; // Return height
}

// ============================================================================
// NEWS GRID - Multiple articles in a grid layout
// ============================================================================

/**
 * Draw multiple news articles in a grid
 * @param fb - Framebuffer
 * @param articles - Array of article objects
 * @param progress - Overall animation progress 0-1
 * @param options - { columns, startY, spacing, articleWidth, staggerDelay }
 */
function newsGrid(fb, articles, progress, options = {}) {
  const {
    columns = 2,
    startY = 4,
    startX = 2,
    spacing = 2,
    articleWidth = 35,
    staggerDelay = 0.15,
    style = 'boxed',
  } = options;

  let currentY = startY;
  let maxHeightInRow = 0;

  articles.forEach((article, idx) => {
    const col = idx % columns;
    const row = Math.floor(idx / columns);

    // Calculate staggered progress for this article
    const articleProgress = Math.max(0, Math.min(1,
      (progress - idx * staggerDelay) / (1 - (articles.length - 1) * staggerDelay)
    ));

    if (articleProgress <= 0) return;

    const x = startX + col * (articleWidth + spacing);

    // Reset Y for new row
    if (col === 0 && row > 0) {
      currentY += maxHeightInRow + spacing;
      maxHeightInRow = 0;
    }

    const height = newsArticle(fb, x, currentY, article, articleProgress, {
      width: articleWidth,
      style,
    });

    maxHeightInRow = Math.max(maxHeightInRow, height || 0);
  });
}

// ============================================================================
// HEADLINE CAROUSEL - Rotating headlines
// ============================================================================

/**
 * Show headlines one at a time with transitions
 * @param fb - Framebuffer
 * @param headlines - Array of headline strings or article objects
 * @param progress - Animation progress 0-1 (cycles through all headlines)
 * @param frame - Current frame for effects
 * @param options - { y, style }
 */
function headlineCarousel(fb, headlines, progress, frame, options = {}) {
  const { y = 10, style = 'crawl', depth = 5 } = options;

  const numHeadlines = headlines.length;
  const headlineIdx = Math.floor(progress * numHeadlines) % numHeadlines;
  const headlineProgress = (progress * numHeadlines) % 1;

  const headline = headlines[headlineIdx];
  const text = typeof headline === 'string' ? headline : headline.headline;

  if (style === 'crawl') {
    headlineCrawl(fb, y, text, headlineProgress, frame, { depth });
  } else if (style === 'slide') {
    if (headlineProgress < 0.2) {
      // Slide in
      const slideP = headlineProgress / 0.2;
      slideIn(fb, y, text, slideP, { from: 'right' });
    } else if (headlineProgress > 0.8) {
      // Slide out
      const slideP = (headlineProgress - 0.8) / 0.2;
      slideOut(fb, y, text, slideP, { to: 'left' });
    } else {
      // Static
      fb.drawCenteredText(y, text);
    }
  } else {
    // Fade style
    const opacity = headlineProgress < 0.2 ? headlineProgress / 0.2
      : headlineProgress > 0.8 ? 1 - (headlineProgress - 0.8) / 0.2
      : 1;
    if (opacity > 0.5) {
      fb.drawCenteredText(y, text);
    }
  }
}

// Helper for slideIn/slideOut (if not already available)
function slideIn(fb, y, text, progress, options = {}) {
  const { from = 'left', depth = 5 } = options;
  const x = from === 'left'
    ? Math.floor(-text.length + easeOut(progress) * (fb.width / 2 + text.length / 2))
    : Math.floor(fb.width - easeOut(progress) * (fb.width / 2 + text.length / 2));

  for (let i = 0; i < text.length; i++) {
    if (x + i >= 0 && x + i < fb.width) {
      fb.setPixel(x + i, y, text[i], depth);
    }
  }
}

function slideOut(fb, y, text, progress, options = {}) {
  const { to = 'left', depth = 5 } = options;
  const centerX = Math.floor((fb.width - text.length) / 2);
  const offset = Math.floor(easeOut(progress) * (fb.width / 2 + text.length));
  const x = to === 'left' ? centerX - offset : centerX + offset;

  for (let i = 0; i < text.length; i++) {
    if (x + i >= 0 && x + i < fb.width) {
      fb.setPixel(x + i, y, text[i], depth);
    }
  }
}

// ============================================================================
// PROJECT SPOTLIGHT - Dedicated project article display
// ============================================================================

/**
 * Draw a featured project as a full news article
 * @param fb - Framebuffer
 * @param project - { name, commits, description?, body?, rank? }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 * @param options - { centered, width }
 */
function accomplishmentSpotlight(fb, project, progress, frame, options = {}) {
  const {
    centered = true,
    width = 50,
    y = 5,
    depth = 5,
    showRank = true,
  } = options;

  const { name, commits, description, body, rank } = project;

  const x = centered ? Math.floor((fb.width - width) / 2) : 2;
  const easedProgress = easeOut(progress);

  if (easedProgress < 0.1) return;

  // Box border with double lines for emphasis
  const visibleWidth = Math.floor(easedProgress * width);
  let currentY = y;

  // Helper to draw a row with side borders
  function drawRow(text, textDepth = depth) {
    fb.setPixel(x, currentY, '║', depth);
    for (let i = 0; i < text.length && i < visibleWidth - 2; i++) {
      fb.setPixel(x + 1 + i, currentY, text[i], textDepth);
    }
    // Fill remaining space
    for (let i = text.length; i < visibleWidth - 2; i++) {
      fb.setPixel(x + 1 + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '║', depth);
    currentY++;
  }

  // Top border
  fb.setPixel(x, currentY, '╔', depth);
  for (let i = 1; i < visibleWidth - 1; i++) {
    fb.setPixel(x + i, currentY, '═', depth);
  }
  if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '╗', depth);
  currentY++;

  // Rank badge
  if (showRank && rank && easedProgress > 0.15) {
    drawRow(`  #${rank} PROJECT`, depth + 1);
  }

  // Project name
  if (easedProgress > 0.25) {
    const nameProgress = Math.min(1, (easedProgress - 0.25) / 0.15);
    const visibleName = name.slice(0, Math.floor(nameProgress * name.length));
    drawRow(`  ${visibleName}`, depth + 2);
  }

  // Divider after name
  if (easedProgress > 0.35) {
    fb.setPixel(x, currentY, '╟', depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, '─', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '╢', depth);
    currentY++;
  }

  // Commits stat with animated counter
  if (easedProgress > 0.4) {
    const counterProgress = Math.min(1, (easedProgress - 0.4) / 0.15);
    const displayCommits = Math.floor(counterProgress * commits);
    drawRow(`  ${displayCommits.toLocaleString()} COMMITS`, depth + 3);
  }

  // Description (short tagline)
  if (description && easedProgress > 0.5) {
    const descProgress = Math.min(1, (easedProgress - 0.5) / 0.1);
    const maxDesc = visibleWidth - 4;
    const displayDesc = description.slice(0, Math.min(maxDesc, Math.floor(descProgress * description.length)));
    drawRow(`  ${displayDesc}`, depth);
  }

  // Body text (longer description with word wrap)
  if (body && easedProgress > 0.55) {
    // Add a small divider
    fb.setPixel(x, currentY, '║', depth);
    for (let i = 1; i < Math.min(visibleWidth - 1, 20); i++) {
      fb.setPixel(x + i, currentY, '·', depth);
    }
    for (let i = 20; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '║', depth);
    currentY++;

    // Word-wrap the body text
    const bodyProgress = Math.min(1, (easedProgress - 0.55) / 0.25);
    const maxLineWidth = visibleWidth - 6;
    const words = body.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length > maxLineWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw visible portion of body
    const totalChars = lines.join('').length;
    let charsDrawn = 0;
    const charsToShow = Math.floor(bodyProgress * totalChars);

    for (const line of lines) {
      if (charsDrawn >= charsToShow) break;
      const lineCharsToShow = Math.min(line.length, charsToShow - charsDrawn);
      const visibleLine = line.slice(0, lineCharsToShow);
      drawRow(`  ${visibleLine}`, depth);
      charsDrawn += line.length;
    }
  }

  // Bottom border
  if (easedProgress > 0.85) {
    fb.setPixel(x, currentY, '╚', depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, '═', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '╝', depth);
  }
}

// ============================================================================
// SCROLLING NEWS FEED - Vertical scrolling headlines
// ============================================================================

/**
 * Draw a vertically scrolling news feed
 * @param fb - Framebuffer
 * @param items - Array of { headline, category?, time? }
 * @param frame - Current frame for scroll animation
 * @param options - { x, y, width, height, speed }
 */
function newsFeed(fb, items, frame, options = {}) {
  const {
    x = 2,
    y = 4,
    width = 40,
    height = 15,
    speed = 0.1,
    depth = 5,
  } = options;

  const lineHeight = 3;
  const totalHeight = items.length * lineHeight;
  const scrollOffset = (frame * speed) % totalHeight;

  // Draw border
  fb.setPixel(x, y - 1, '┌', depth);
  for (let i = 1; i < width - 1; i++) {
    fb.setPixel(x + i, y - 1, '─', depth);
  }
  fb.setPixel(x + width - 1, y - 1, '┐', depth);

  items.forEach((item, idx) => {
    const itemY = y + idx * lineHeight - Math.floor(scrollOffset);

    // Only draw if within visible area
    if (itemY >= y && itemY < y + height) {
      // Category/time
      if (item.category) {
        const catText = `[${item.category}]`;
        for (let i = 0; i < catText.length && x + 1 + i < x + width - 1; i++) {
          fb.setPixel(x + 1 + i, itemY, catText[i], depth);
        }
      }

      // Headline
      const headY = itemY + 1;
      if (headY < y + height) {
        const maxLen = width - 3;
        const headline = item.headline.slice(0, maxLen);
        for (let i = 0; i < headline.length; i++) {
          fb.setPixel(x + 2 + i, headY, headline[i], depth + 1);
        }
      }
    }
  });

  // Bottom border
  fb.setPixel(x, y + height, '└', depth);
  for (let i = 1; i < width - 1; i++) {
    fb.setPixel(x + i, y + height, '─', depth);
  }
  fb.setPixel(x + width - 1, y + height, '┘', depth);
}

// Make available globally for browser script tag usage
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    lowerThird,
    tickerTape,
    breakingBanner,
    liveIndicator,
    segmentTitle,
    statCounter,
    forecastBar,
    splitWipe,
    pushTransition,
    headlineCrawl,
    countdownReveal,
    // New article helpers
    newsArticle,
    newsGrid,
    headlineCarousel,
    accomplishmentSpotlight,
    newsFeed,
  });
}
})();
