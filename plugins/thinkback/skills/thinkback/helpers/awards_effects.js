/* eslint-disable */
/**
 * Awards Show Effects
 * Specialized effects for the awards show vibe
 */
(function() {

// Easing functions
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================================================
// TROPHY DISPLAY - ASCII trophy art
// ============================================================================

const TROPHY_GRAND = [
  '       ___       ',
  '      |   |      ',
  '     /|   |\\     ',
  '    / |___| \\    ',
  '   |  /   \\  |   ',
  '    \\/_____\\/    ',
  '       | |       ',
  '      /   \\      ',
  '     /_____\\     ',
];

const TROPHY_SIMPLE = [
  '    \\___/',
  '    |   |',
  '    |___|',
  '     | | ',
  '    /___\\',
];

const TROPHY_STAR = [
  '      *      ',
  '     ***     ',
  '    *****    ',
  '   *******   ',
  '     ***     ',
  '     | |     ',
  '    /___\\    ',
];

/**
 * Draw a trophy display
 * @param fb - Framebuffer
 * @param x - X position (center)
 * @param y - Y position (top)
 * @param options - { label, style, centered }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 */
function trophyDisplay(fb, x, y, options, progress, frame) {
  const { label = '', style = 'grand', centered = true, depth = 5 } = options;

  const trophy = style === 'simple' ? TROPHY_SIMPLE
    : style === 'star' ? TROPHY_STAR
    : TROPHY_GRAND;

  const easedProgress = easeOut(progress);
  const visibleLines = Math.floor(easedProgress * trophy.length);

  const trophyWidth = Math.max(...trophy.map(line => line.length));
  const startX = centered ? x - Math.floor(trophyWidth / 2) : x;

  // Draw trophy lines
  for (let i = 0; i < visibleLines; i++) {
    const line = trophy[i];
    const lineX = startX + Math.floor((trophyWidth - line.length) / 2);
    for (let j = 0; j < line.length; j++) {
      if (line[j] !== ' ') {
        fb.setPixel(lineX + j, y + i, line[j], depth + 2);
      }
    }
  }

  // Draw label below trophy
  if (label && easedProgress > 0.8) {
    const labelProgress = (easedProgress - 0.8) / 0.2;
    const visibleLabel = label.slice(0, Math.floor(labelProgress * label.length));
    const labelX = centered ? x - Math.floor(visibleLabel.length / 2) : x;
    for (let i = 0; i < visibleLabel.length; i++) {
      fb.setPixel(labelX + i, y + trophy.length + 1, visibleLabel[i], depth + 1);
    }
  }

  return trophy.length + 2;
}

// ============================================================================
// AWARD BADGE - Medal/badge display
// ============================================================================

/**
 * Draw an award badge/medal
 * @param fb - Framebuffer
 * @param x - X position (center)
 * @param y - Y position (top)
 * @param options - { category, year, style }
 * @param progress - Animation progress 0-1
 */
function awardBadge(fb, x, y, options, progress) {
  const { category = 'AWARD', year = '2024', style = 'gold', depth = 5 } = options;

  const easedProgress = easeOut(progress);
  if (easedProgress < 0.1) return;

  const starChar = style === 'gold' ? '★' : style === 'silver' ? '☆' : '✦';
  const borderH = style === 'gold' ? '═' : '─';
  const cornerTL = style === 'gold' ? '╔' : '┌';
  const cornerTR = style === 'gold' ? '╗' : '┐';
  const cornerBL = style === 'gold' ? '╚' : '└';
  const cornerBR = style === 'gold' ? '╝' : '┘';
  const sideV = style === 'gold' ? '║' : '│';

  const yearLine = ` ${starChar} ${year} ${starChar} `;
  const catLine = ` ${category} `;
  const width = Math.max(yearLine.length, catLine.length) + 2;

  const startX = x - Math.floor(width / 2);
  const visibleWidth = Math.floor(easedProgress * width);

  // Top border
  fb.setPixel(startX, y, cornerTL, depth);
  for (let i = 1; i < Math.min(visibleWidth - 1, width - 1); i++) {
    fb.setPixel(startX + i, y, borderH, depth);
  }
  if (visibleWidth >= width) fb.setPixel(startX + width - 1, y, cornerTR, depth);

  // Year line
  if (easedProgress > 0.3) {
    fb.setPixel(startX, y + 1, sideV, depth);
    const yearProgress = Math.min(1, (easedProgress - 0.3) / 0.3);
    const yearPadded = yearLine.padStart(Math.floor((width - 2 + yearLine.length) / 2)).padEnd(width - 2);
    const visibleYear = yearPadded.slice(0, Math.floor(yearProgress * yearPadded.length));
    for (let i = 0; i < visibleYear.length; i++) {
      fb.setPixel(startX + 1 + i, y + 1, visibleYear[i], depth + 1);
    }
    fb.setPixel(startX + width - 1, y + 1, sideV, depth);
  }

  // Category line
  if (easedProgress > 0.5) {
    fb.setPixel(startX, y + 2, sideV, depth);
    const catProgress = Math.min(1, (easedProgress - 0.5) / 0.3);
    const catPadded = catLine.padStart(Math.floor((width - 2 + catLine.length) / 2)).padEnd(width - 2);
    const visibleCat = catPadded.slice(0, Math.floor(catProgress * catPadded.length));
    for (let i = 0; i < visibleCat.length; i++) {
      fb.setPixel(startX + 1 + i, y + 2, visibleCat[i], depth + 2);
    }
    fb.setPixel(startX + width - 1, y + 2, sideV, depth);
  }

  // Bottom border
  if (easedProgress > 0.8) {
    fb.setPixel(startX, y + 3, cornerBL, depth);
    for (let i = 1; i < width - 1; i++) {
      fb.setPixel(startX + i, y + 3, borderH, depth);
    }
    fb.setPixel(startX + width - 1, y + 3, cornerBR, depth);
  }

  return 4;
}

// ============================================================================
// ENVELOPE REVEAL - Dramatic envelope opening
// ============================================================================

/**
 * Draw envelope reveal animation
 * @param fb - Framebuffer
 * @param winnerName - Name to reveal
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 * @param options - { y, suspenseText }
 */
function envelopeReveal(fb, winnerName, progress, frame, options = {}) {
  const {
    y = 10,
    suspenseText = 'AND THE AWARD GOES TO...',
    depth = 5,
  } = options;

  const easedProgress = easeOut(progress);
  const centerX = Math.floor(fb.width / 2);

  // Phase 1: Suspense text (0-0.4)
  if (progress < 0.4) {
    const textProgress = progress / 0.4;
    const visibleChars = Math.floor(textProgress * suspenseText.length);
    const visibleText = suspenseText.slice(0, visibleChars);
    const textX = centerX - Math.floor(suspenseText.length / 2);

    for (let i = 0; i < visibleText.length; i++) {
      fb.setPixel(textX + i, y, visibleText[i], depth);
    }

    // Blinking cursor
    if (textProgress < 1) {
      const cursorChar = Math.floor(frame / 6) % 2 === 0 ? '█' : ' ';
      fb.setPixel(textX + visibleChars, y, cursorChar, depth);
    }
  }

  // Phase 2: Envelope appears and opens (0.4-0.7)
  if (progress >= 0.4 && progress < 0.7) {
    const envProgress = (progress - 0.4) / 0.3;

    // Draw envelope
    const envWidth = 30;
    const envX = centerX - Math.floor(envWidth / 2);
    const envY = y + 2;

    // Envelope body
    const envHeight = 5;
    for (let row = 0; row < envHeight; row++) {
      fb.setPixel(envX, envY + row, row === 0 ? '╭' : row === envHeight - 1 ? '╰' : '│', depth);
      for (let col = 1; col < envWidth - 1; col++) {
        if (row === 0) {
          fb.setPixel(envX + col, envY + row, '─', depth);
        } else if (row === envHeight - 1) {
          fb.setPixel(envX + col, envY + row, '─', depth);
        } else {
          fb.setPixel(envX + col, envY + row, ' ', depth);
        }
      }
      fb.setPixel(envX + envWidth - 1, envY + row, row === 0 ? '╮' : row === envHeight - 1 ? '╯' : '│', depth);
    }

    // Opening flap animation
    if (envProgress > 0.5) {
      const flapProgress = (envProgress - 0.5) / 0.5;
      const flapChars = ['▔', '▀', '█'];
      const flapIdx = Math.min(flapChars.length - 1, Math.floor(flapProgress * flapChars.length));

      for (let col = 1; col < envWidth - 1; col++) {
        fb.setPixel(envX + col, envY, flapChars[flapIdx], depth + 1);
      }
    }
  }

  // Phase 3: Winner name reveal (0.7-1.0)
  if (progress >= 0.7) {
    const nameProgress = (progress - 0.7) / 0.3;
    const easedNameProgress = easeOut(nameProgress);

    // Winner name with dramatic reveal
    const nameY = y + 4;
    const nameX = centerX - Math.floor(winnerName.length / 2);

    // Reveal from center outward
    const halfLen = Math.ceil(winnerName.length / 2);
    const visibleFromCenter = Math.floor(easedNameProgress * halfLen);

    for (let i = 0; i < winnerName.length; i++) {
      const distFromCenter = Math.abs(i - Math.floor(winnerName.length / 2));
      if (distFromCenter <= visibleFromCenter) {
        fb.setPixel(nameX + i, nameY, winnerName[i], depth + 3);
      }
    }

    // Decorative sparkles
    if (nameProgress > 0.5) {
      const sparkleChars = ['✦', '*', '·'];
      const sparkleX1 = nameX - 3;
      const sparkleX2 = nameX + winnerName.length + 2;
      const sparkleIdx = Math.floor(frame / 4) % sparkleChars.length;
      fb.setPixel(sparkleX1, nameY, sparkleChars[sparkleIdx], depth + 1);
      fb.setPixel(sparkleX2, nameY, sparkleChars[sparkleIdx], depth + 1);
    }
  }
}

// ============================================================================
// CATEGORY TITLE - Animated category header
// ============================================================================

/**
 * Draw a category title header
 * @param fb - Framebuffer
 * @param y - Y position
 * @param title - Category title
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 * @param options - { style }
 */
function categoryTitle(fb, y, title, progress, frame, options = {}) {
  const { style = 'grand', depth = 5 } = options;

  const easedProgress = easeOut(progress);
  const centerX = Math.floor(fb.width / 2);

  if (style === 'grand') {
    // Top decorative line
    const lineWidth = Math.floor(easedProgress * 40);
    const lineX = centerX - Math.floor(lineWidth / 2);

    if (lineWidth > 0) {
      for (let i = 0; i < lineWidth; i++) {
        fb.setPixel(lineX + i, y, '═', depth);
      }
    }

    // Title with stars
    if (easedProgress > 0.3) {
      const titleProgress = (easedProgress - 0.3) / 0.5;
      const fullTitle = `★  ${title}  ★`;
      const visibleTitle = fullTitle.slice(0, Math.floor(titleProgress * fullTitle.length));
      const titleX = centerX - Math.floor(fullTitle.length / 2);

      for (let i = 0; i < visibleTitle.length; i++) {
        fb.setPixel(titleX + i, y + 1, visibleTitle[i], depth + 2);
      }
    }

    // Bottom decorative line
    if (easedProgress > 0.6) {
      const bottomProgress = (easedProgress - 0.6) / 0.4;
      const bottomWidth = Math.floor(bottomProgress * 40);
      const bottomX = centerX - Math.floor(bottomWidth / 2);

      for (let i = 0; i < bottomWidth; i++) {
        fb.setPixel(bottomX + i, y + 2, '═', depth);
      }
    }
  } else if (style === 'simple') {
    const titleX = centerX - Math.floor(title.length / 2);
    const visibleTitle = title.slice(0, Math.floor(easedProgress * title.length));

    for (let i = 0; i < visibleTitle.length; i++) {
      fb.setPixel(titleX + i, y, visibleTitle[i], depth + 1);
    }
  } else {
    // minimal
    const fullTitle = `[ ${title} ]`;
    const titleX = centerX - Math.floor(fullTitle.length / 2);
    const visibleTitle = fullTitle.slice(0, Math.floor(easedProgress * fullTitle.length));

    for (let i = 0; i < visibleTitle.length; i++) {
      fb.setPixel(titleX + i, y, visibleTitle[i], depth);
    }
  }
}

// ============================================================================
// ACCEPTANCE SPEECH - Full project spotlight for awards
// ============================================================================

/**
 * Draw a full acceptance speech display for a project
 * @param fb - Framebuffer
 * @param project - { name, commits, description?, body?, rank? }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 * @param options - { y, width, showTrophy }
 */
function acceptanceSpeech(fb, project, progress, frame, options = {}) {
  const {
    y = 4,
    width = 50,
    showTrophy = true,
    depth = 5,
    centered = true,
  } = options;

  const { name, commits, description, body, rank } = project;
  const easedProgress = easeOut(progress);

  if (easedProgress < 0.05) return;

  const centerX = Math.floor(fb.width / 2);
  const boxX = centered ? centerX - Math.floor(width / 2) : 2;

  let currentY = y;

  // Draw trophy above the box
  if (showTrophy && easedProgress > 0.05) {
    const trophyProgress = Math.min(1, (easedProgress - 0.05) / 0.2);
    trophyDisplay(fb, centerX, currentY, {
      label: '',
      style: rank === 1 ? 'grand' : rank === 2 ? 'simple' : 'star',
    }, trophyProgress, frame);
    currentY += rank === 1 ? 10 : 6;
  }

  // Calculate visible width for animation
  const visibleWidth = Math.floor(Math.min(1, (easedProgress - 0.2) / 0.3) * width);
  if (visibleWidth < 5) return;

  // Helper to draw a row with side borders
  function drawRow(text, textDepth = depth) {
    fb.setPixel(boxX, currentY, '║', depth);
    for (let i = 0; i < text.length && i < visibleWidth - 2; i++) {
      fb.setPixel(boxX + 1 + i, currentY, text[i], textDepth);
    }
    // Fill remaining space
    for (let i = text.length; i < visibleWidth - 2; i++) {
      fb.setPixel(boxX + 1 + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(boxX + visibleWidth - 1, currentY, '║', depth);
    currentY++;
  }

  // Top border with flair
  if (easedProgress > 0.25) {
    fb.setPixel(boxX, currentY, '╔', depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(boxX + i, currentY, '═', depth);
    }
    if (visibleWidth > 1) fb.setPixel(boxX + visibleWidth - 1, currentY, '╗', depth);
    currentY++;
  }

  // Award category line
  if (rank && easedProgress > 0.3) {
    const rankLabel = rank === 1 ? '★ BEST PROJECT ★' : rank === 2 ? '☆ RUNNER UP ☆' : '✦ HONORABLE MENTION ✦';
    drawRow(`  ${rankLabel}`, depth + 1);
  }

  // Project name
  if (easedProgress > 0.4) {
    const nameProgress = Math.min(1, (easedProgress - 0.4) / 0.15);
    const visibleName = name.slice(0, Math.floor(nameProgress * name.length));
    drawRow(`  ${visibleName}`, depth + 3);
  }

  // Divider after name
  if (easedProgress > 0.5) {
    fb.setPixel(boxX, currentY, '╟', depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(boxX + i, currentY, '─', depth);
    }
    if (visibleWidth > 1) fb.setPixel(boxX + visibleWidth - 1, currentY, '╢', depth);
    currentY++;
  }

  // Commits stat with animated counter
  if (easedProgress > 0.55) {
    const counterProgress = Math.min(1, (easedProgress - 0.55) / 0.1);
    const displayCommits = Math.floor(counterProgress * commits);
    drawRow(`  ${displayCommits.toLocaleString()} COMMITS`, depth + 2);
  }

  // Description
  if (description && easedProgress > 0.6) {
    const descProgress = Math.min(1, (easedProgress - 0.6) / 0.1);
    const maxDesc = visibleWidth - 4;
    const displayDesc = description.slice(0, Math.min(maxDesc, Math.floor(descProgress * description.length)));
    drawRow(`  ${displayDesc}`, depth);
  }

  // Divider before body
  if (body && easedProgress > 0.65) {
    fb.setPixel(boxX, currentY, '║', depth);
    for (let i = 1; i < Math.min(visibleWidth - 1, 20); i++) {
      fb.setPixel(boxX + i, currentY, '·', depth);
    }
    for (let i = 20; i < visibleWidth - 1; i++) {
      fb.setPixel(boxX + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(boxX + visibleWidth - 1, currentY, '║', depth);
    currentY++;
  }

  // Body text (acceptance speech content)
  if (body && easedProgress > 0.7) {
    const bodyProgress = Math.min(1, (easedProgress - 0.7) / 0.25);
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
  if (easedProgress > 0.9) {
    fb.setPixel(boxX, currentY, '╚', depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(boxX + i, currentY, '═', depth);
    }
    if (visibleWidth > 1) fb.setPixel(boxX + visibleWidth - 1, currentY, '╝', depth);
  }
}

// ============================================================================
// NOMINEE CARD - Display a nominee before winner announcement
// ============================================================================

/**
 * Draw a nominee card
 * @param fb - Framebuffer
 * @param x - X position
 * @param y - Y position
 * @param nominee - { name, stat, statLabel }
 * @param progress - Animation progress 0-1
 * @param options - { style, width }
 */
function nomineeCard(fb, x, y, nominee, progress, options = {}) {
  const { style = 'elegant', width = 25, depth = 5 } = options;
  const { name, stat, statLabel } = nominee;

  const easedProgress = easeOut(progress);
  if (easedProgress < 0.1) return;

  const visibleWidth = Math.floor(easedProgress * width);
  if (visibleWidth < 5) return;

  let currentY = y;

  // Border top
  const borderH = style === 'elegant' ? '─' : '═';
  const cornerTL = style === 'elegant' ? '╭' : '╔';
  const cornerTR = style === 'elegant' ? '╮' : '╗';
  const cornerBL = style === 'elegant' ? '╰' : '╚';
  const cornerBR = style === 'elegant' ? '╯' : '╝';
  const sideV = style === 'elegant' ? '│' : '║';

  fb.setPixel(x, currentY, cornerTL, depth);
  for (let i = 1; i < visibleWidth - 1; i++) {
    fb.setPixel(x + i, currentY, borderH, depth);
  }
  if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, cornerTR, depth);
  currentY++;

  // Name
  if (easedProgress > 0.3) {
    fb.setPixel(x, currentY, sideV, depth);
    const displayName = name.slice(0, visibleWidth - 4);
    for (let i = 0; i < displayName.length; i++) {
      fb.setPixel(x + 2 + i, currentY, displayName[i], depth + 2);
    }
    fb.setPixel(x + visibleWidth - 1, currentY, sideV, depth);
    currentY++;
  }

  // Stat
  if (stat && easedProgress > 0.5) {
    fb.setPixel(x, currentY, sideV, depth);
    const statStr = typeof stat === 'number' ? stat.toLocaleString() : stat;
    const statText = statLabel ? `${statStr} ${statLabel}` : statStr;
    for (let i = 0; i < statText.length && i < visibleWidth - 4; i++) {
      fb.setPixel(x + 2 + i, currentY, statText[i], depth + 1);
    }
    fb.setPixel(x + visibleWidth - 1, currentY, sideV, depth);
    currentY++;
  }

  // Border bottom
  if (easedProgress > 0.7) {
    fb.setPixel(x, currentY, cornerBL, depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, borderH, depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, cornerBR, depth);
  }
}

// ============================================================================
// WINNER ANNOUNCEMENT - Full reveal sequence
// ============================================================================

/**
 * Draw a complete winner announcement sequence
 * @param fb - Framebuffer
 * @param winnerName - Winner name
 * @param progress - Animation progress 0-1
 * @param frame - Current frame
 * @param options - { category, stat, statLabel }
 */
function winnerAnnouncement(fb, winnerName, progress, frame, options = {}) {
  const { category = 'WINNER', stat, statLabel, depth = 5 } = options;

  const centerX = Math.floor(fb.width / 2);
  const centerY = Math.floor(fb.height / 2);

  // Phase 1: Category reveal (0-0.25)
  if (progress < 0.25) {
    categoryTitle(fb, centerY - 4, category, progress / 0.25, frame, { style: 'grand' });
  }

  // Phase 2: Envelope reveal (0.25-0.6)
  if (progress >= 0.25 && progress < 0.6) {
    const envProgress = (progress - 0.25) / 0.35;
    envelopeReveal(fb, winnerName, envProgress, frame, { y: centerY - 2 });
  }

  // Phase 3: Winner celebration (0.6-1.0)
  if (progress >= 0.6) {
    const celebProgress = (progress - 0.6) / 0.4;

    // Winner name with glow effect
    const nameX = centerX - Math.floor(winnerName.length / 2);
    for (let i = 0; i < winnerName.length; i++) {
      fb.setPixel(nameX + i, centerY, winnerName[i], depth + 5);
    }

    // Sparkle effects around name
    if (celebProgress > 0.2) {
      const sparkleChars = ['✦', '*', '·', '★'];
      const sparklePositions = [
        { x: nameX - 4, y: centerY },
        { x: nameX + winnerName.length + 3, y: centerY },
        { x: nameX - 2, y: centerY - 1 },
        { x: nameX + winnerName.length + 1, y: centerY - 1 },
        { x: nameX - 2, y: centerY + 1 },
        { x: nameX + winnerName.length + 1, y: centerY + 1 },
      ];

      sparklePositions.forEach((pos, idx) => {
        const sparkleIdx = (Math.floor(frame / 4) + idx) % sparkleChars.length;
        fb.setPixel(pos.x, pos.y, sparkleChars[sparkleIdx], depth + 1);
      });
    }

    // Stat below name
    if (stat && celebProgress > 0.4) {
      const statProgress = (celebProgress - 0.4) / 0.4;
      const statStr = typeof stat === 'number'
        ? Math.floor(statProgress * stat).toLocaleString()
        : stat;
      const statText = statLabel ? `${statStr} ${statLabel}` : statStr;
      const statX = centerX - Math.floor(statText.length / 2);

      for (let i = 0; i < statText.length; i++) {
        fb.setPixel(statX + i, centerY + 2, statText[i], depth + 2);
      }
    }
  }
}

// ============================================================================
// APPLAUSE METER - Visual audience reaction
// ============================================================================

/**
 * Draw an applause meter
 * @param fb - Framebuffer
 * @param y - Y position
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for animation
 * @param options - { intensity }
 */
function applauseMeter(fb, y, progress, frame, options = {}) {
  const { intensity = 0.8, depth = 5 } = options;

  const width = 30;
  const centerX = Math.floor(fb.width / 2);
  const startX = centerX - Math.floor(width / 2);

  const easedProgress = easeOut(progress);
  const filledWidth = Math.floor(easedProgress * intensity * width);

  // Animated applause chars
  const applauseChars = ['👏', '✋', '🙌', '✨'];
  const activeChar = applauseChars[Math.floor(frame / 6) % applauseChars.length];

  // Draw the meter
  for (let i = 0; i < width; i++) {
    if (i < filledWidth) {
      // Filled portion - wave effect
      const waveOffset = Math.sin((frame * 0.3) + (i * 0.5)) * 0.3;
      const charIdx = Math.floor((i + frame * 0.2) % applauseChars.length);
      fb.setPixel(startX + i, y, applauseChars[charIdx], depth + 2);
    } else {
      fb.setPixel(startX + i, y, '░', depth);
    }
  }
}

// ============================================================================
// STANDING OVATION - Celebration particle effect
// ============================================================================

/**
 * Standing ovation particle effect
 * @param fb - Framebuffer
 * @param frame - Current frame
 * @param options - { intensity, chars }
 */
function standingOvation(fb, frame, options = {}) {
  const {
    intensity = 1.0,
    chars = ['✦', '*', '·', '★', '✧'],
    depth = 3,
  } = options;

  const particleCount = Math.floor(intensity * 20);

  for (let i = 0; i < particleCount; i++) {
    // Rising particles
    const seed = i * 12.345 + frame * 0.02;
    const x = Math.floor((Math.sin(seed * 7.89) * 0.5 + 0.5) * fb.width);
    const baseY = fb.height - 1 - ((frame * 0.3 + i * 3) % fb.height);
    const y = Math.floor(baseY + Math.sin(seed * 2.34) * 2);

    if (y >= 0 && y < fb.height && x >= 0 && x < fb.width) {
      const charIdx = Math.floor((seed * 100) % chars.length);
      fb.setPixel(x, y, chars[charIdx], depth);
    }
  }
}

// ============================================================================
// RED CARPET BORDER - Decorative border
// ============================================================================

/**
 * Draw a red carpet style border
 * @param fb - Framebuffer
 * @param progress - Animation progress 0-1
 * @param options - { style }
 */
function redCarpetBorder(fb, progress, options = {}) {
  const { style = 'velvet', depth = 2 } = options;

  const easedProgress = easeOut(progress);

  const topY = 0;
  const bottomY = fb.height - 1;
  const leftX = 0;
  const rightX = fb.width - 1;

  const chars = style === 'velvet' ? { h: '═', v: '║', corner: '◆' }
    : style === 'gold' ? { h: '─', v: '│', corner: '★' }
    : { h: '·', v: '·', corner: '✦' };

  // Animate from corners
  const visibleH = Math.floor(easedProgress * fb.width / 2);
  const visibleV = Math.floor(easedProgress * fb.height / 2);

  // Corners
  fb.setPixel(leftX, topY, chars.corner, depth + 1);
  fb.setPixel(rightX, topY, chars.corner, depth + 1);
  fb.setPixel(leftX, bottomY, chars.corner, depth + 1);
  fb.setPixel(rightX, bottomY, chars.corner, depth + 1);

  // Top and bottom borders
  for (let i = 1; i <= visibleH; i++) {
    fb.setPixel(leftX + i, topY, chars.h, depth);
    fb.setPixel(rightX - i, topY, chars.h, depth);
    fb.setPixel(leftX + i, bottomY, chars.h, depth);
    fb.setPixel(rightX - i, bottomY, chars.h, depth);
  }

  // Left and right borders
  for (let i = 1; i <= visibleV; i++) {
    fb.setPixel(leftX, topY + i, chars.v, depth);
    fb.setPixel(leftX, bottomY - i, chars.v, depth);
    fb.setPixel(rightX, topY + i, chars.v, depth);
    fb.setPixel(rightX, bottomY - i, chars.v, depth);
  }
}

// ============================================================================
// SPOTLIGHT TEXT - Glowing text effect
// ============================================================================

/**
 * Draw text with spotlight/glow effect
 * @param fb - Framebuffer
 * @param y - Y position
 * @param text - Text to display
 * @param frame - Current frame for animation
 * @param options - { glow, centered }
 */
function spotlightText(fb, y, text, frame, options = {}) {
  const { glow = true, centered = true, depth = 5 } = options;

  const x = centered ? Math.floor((fb.width - text.length) / 2) : 2;

  // Draw main text
  for (let i = 0; i < text.length; i++) {
    fb.setPixel(x + i, y, text[i], depth + 3);
  }

  // Glow effect - subtle sparkles around text
  if (glow) {
    const glowChars = ['·', '*', '✦'];
    const glowPositions = [
      { dx: -1, dy: 0 },
      { dx: text.length, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: text.length - 1, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: text.length - 1, dy: 1 },
    ];

    glowPositions.forEach((pos, idx) => {
      const glowX = x + pos.dx;
      const glowY = y + pos.dy;
      if (glowX >= 0 && glowX < fb.width && glowY >= 0 && glowY < fb.height) {
        const charIdx = (Math.floor(frame / 5) + idx) % glowChars.length;
        fb.setPixel(glowX, glowY, glowChars[charIdx], depth);
      }
    });
  }
}

// ============================================================================
// SPOTLIGHT REVEAL - Circle reveal from center with spotlight feel
// ============================================================================

/**
 * Spotlight reveal transition
 * @param fb - Framebuffer
 * @param progress - Transition progress 0-1
 * @param options - { x, y } center point
 */
function spotlightReveal(fb, progress, options = {}) {
  const {
    x = Math.floor(fb.width / 2),
    y = Math.floor(fb.height / 2),
  } = options;

  const maxRadius = Math.sqrt(fb.width * fb.width + fb.height * fb.height);
  const radius = easeOut(progress) * maxRadius;

  for (let py = 0; py < fb.height; py++) {
    for (let px = 0; px < fb.width; px++) {
      const dist = Math.sqrt((px - x) ** 2 + ((py - y) * 2) ** 2);
      if (dist > radius) {
        fb.setPixel(px, py, ' ', -100);
      }
    }
  }
}

// ============================================================================
// CURTAIN REVEAL - Theater curtain opening
// ============================================================================

/**
 * Curtain reveal transition
 * @param fb - Framebuffer
 * @param progress - Transition progress 0-1
 */
function curtainReveal(fb, progress) {
  const easedProgress = easeOut(progress);
  const centerX = Math.floor(fb.width / 2);
  const openWidth = Math.floor(easedProgress * centerX);

  // Clear areas outside the "opening"
  for (let y = 0; y < fb.height; y++) {
    for (let x = 0; x < fb.width; x++) {
      if (x < centerX - openWidth || x > centerX + openWidth) {
        fb.setPixel(x, y, '█', -50);
      }
    }

    // Curtain edge effect
    if (openWidth > 0 && openWidth < centerX) {
      const edgeChars = ['│', '┃', '║'];
      const leftEdge = centerX - openWidth;
      const rightEdge = centerX + openWidth;

      if (leftEdge >= 0) fb.setPixel(leftEdge, y, edgeChars[1], -40);
      if (rightEdge < fb.width) fb.setPixel(rightEdge, y, edgeChars[1], -40);
    }
  }
}

// ============================================================================
// AWARDS STATUE - Large decorative trophy ASCII art
// ============================================================================

const OSCAR_STATUE = [
  '        ▄▄        ',
  '       ████       ',
  '       ████       ',
  '      ██████      ',
  '     ████████     ',
  '    ██████████    ',
  '    ██  ██  ██    ',
  '        ██        ',
  '       ████       ',
  '      ██████      ',
  '     ████████     ',
  '        ██        ',
  '      ██████      ',
  '     ████████     ',
  '    ██████████    ',
];

const GLOBE_STATUE = [
  '      ╭────╮      ',
  '    ╭─┤    ├─╮    ',
  '   │  ╰────╯  │   ',
  '   │  ╭────╮  │   ',
  '    ╰─┤    ├─╯    ',
  '      ╰────╯      ',
  '        ││        ',
  '      ╭────╮      ',
  '     ╭──────╮     ',
  '    ╭────────╮    ',
];

const STAR_STATUE = [
  '        ★         ',
  '       ★★★        ',
  '      ★★★★★       ',
  '     ★★★★★★★      ',
  '    ★★★★★★★★★     ',
  '      ★★★★★       ',
  '       ★★★        ',
  '        ★         ',
  '       ███        ',
  '      █████       ',
  '     ███████      ',
];

/**
 * Draw a large awards statue
 * @param fb - Framebuffer
 * @param x - X position (center)
 * @param y - Y position (top)
 * @param progress - Animation progress 0-1
 * @param options - { style }
 */
function awardsStatue(fb, x, y, progress, options = {}) {
  const { style = 'oscar', depth = 5 } = options;

  const statue = style === 'globe' ? GLOBE_STATUE
    : style === 'star' ? STAR_STATUE
    : OSCAR_STATUE;

  if (!statue || !statue.length) return;

  const easedProgress = easeOut(Math.min(1, progress));
  const visibleLines = Math.min(statue.length, Math.floor(easedProgress * statue.length));

  const statueWidth = Math.max(...statue.map(line => line.length));
  const startX = x - Math.floor(statueWidth / 2);

  for (let i = 0; i < visibleLines; i++) {
    const line = statue[i];
    if (!line) continue;
    const lineX = startX + Math.floor((statueWidth - line.length) / 2);

    for (let j = 0; j < line.length; j++) {
      if (line[j] !== ' ') {
        fb.setPixel(lineX + j, y + i, line[j], depth + 2);
      }
    }
  }
}

// Make available globally
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    trophyDisplay,
    awardBadge,
    envelopeReveal,
    categoryTitle,
    acceptanceSpeech,
    nomineeCard,
    winnerAnnouncement,
    applauseMeter,
    standingOvation,
    redCarpetBorder,
    spotlightText,
    spotlightReveal,
    curtainReveal,
    awardsStatue,
  });
}
})();
