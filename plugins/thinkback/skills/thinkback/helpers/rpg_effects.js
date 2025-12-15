/* eslint-disable */
/**
 * RPG Quest Effects
 * Specialized effects for the RPG quest vibe
 */
(function() {

// Easing functions
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Seeded random for consistent effects
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// ============================================================================
// CHARACTER SPRITES - Simple ASCII character art
// ============================================================================

const SPRITES = {
  FEATURE_CRAFTER: [
    ' ◉◡◉ ',
    ' /|\\ ',
    ' / \\ ',
  ],
  BUG_SLAYER: [
    ' ⚔◡⚔ ',
    '</|\\>',
    ' / \\ ',
  ],
  DOCS_WIZARD: [
    ' ◉_◉ ',
    '(|☆|)',
    ' /|\\ ',
  ],
  REFACTOR_KNIGHT: [
    ' [◡] ',
    '╔|█|╗',
    ' / \\ ',
  ],
  FULL_STACK_PALADIN: [
    ' ✧◡✧ ',
    '⌐|█|¬',
    ' ╱ ╲ ',
  ],
  SPEED_DEMON: [
    ' ≫◡≪ ',
    '»/|\\«',
    ' » « ',
  ],
  DEEP_DELVER: [
    ' ◎_◎ ',
    ' \\|/ ',
    ' _╱╲_',
  ],
};

const IDLE_FRAMES = [
  [' ◉◡◉ ', ' /|\\ ', ' / \\ '],
  [' ◉◡◉ ', ' /|\\/', ' / \\ '],
  [' ◉◡◉ ', '\\/|\\ ', ' / \\ '],
];

/**
 * Draw a character sprite
 * @param fb - Framebuffer
 * @param x - X position (center)
 * @param y - Y position (top)
 * @param options - { class, animate }
 * @param frame - Current frame for animation
 */
function characterSprite(fb, x, y, options, frame) {
  const { class: charClass = 'FEATURE_CRAFTER', animate = false, depth = 5 } = options;

  let sprite = SPRITES[charClass] || SPRITES.FEATURE_CRAFTER;

  // Simple idle animation
  if (animate) {
    const animFrame = Math.floor(frame / 10) % IDLE_FRAMES.length;
    sprite = IDLE_FRAMES[animFrame];
  }

  const spriteWidth = Math.max(...sprite.map(line => line.length));
  const startX = x - Math.floor(spriteWidth / 2);

  for (let i = 0; i < sprite.length; i++) {
    const line = sprite[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] !== ' ') {
        fb.setPixel(startX + j, y + i, line[j], depth + 2);
      }
    }
  }

  return sprite.length;
}

// ============================================================================
// TITLE SCREEN - Classic RPG title
// ============================================================================

/**
 * Draw a classic RPG title screen
 * @param fb - Framebuffer
 * @param options - { title, subtitle, prompt }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for blink effect
 */
function titleScreen(fb, options, progress, frame) {
  const { title = 'ADVENTURE', subtitle = '2024', prompt = 'PRESS START', depth = 5 } = options;

  const centerX = Math.floor(fb.width / 2);
  const centerY = Math.floor(fb.height / 2);
  const easedProgress = easeOut(progress);

  // Draw decorative box
  const boxWidth = Math.max(title.length, subtitle.length, prompt.length) + 10;
  const boxHeight = 9;
  const boxX = centerX - Math.floor(boxWidth / 2);
  const boxY = centerY - Math.floor(boxHeight / 2);

  if (easedProgress > 0.1) {
    const visibleWidth = Math.floor(((easedProgress - 0.1) / 0.3) * boxWidth);

    // Top border
    fb.setPixel(boxX, boxY, '╔', depth);
    for (let i = 1; i < Math.min(visibleWidth - 1, boxWidth - 1); i++) {
      fb.setPixel(boxX + i, boxY, '═', depth);
    }
    if (visibleWidth >= boxWidth) fb.setPixel(boxX + boxWidth - 1, boxY, '╗', depth);

    // Sides
    for (let row = 1; row < boxHeight - 1; row++) {
      fb.setPixel(boxX, boxY + row, '║', depth);
      if (visibleWidth >= boxWidth) fb.setPixel(boxX + boxWidth - 1, boxY + row, '║', depth);
    }

    // Bottom border
    if (easedProgress > 0.4) {
      fb.setPixel(boxX, boxY + boxHeight - 1, '╚', depth);
      for (let i = 1; i < boxWidth - 1; i++) {
        fb.setPixel(boxX + i, boxY + boxHeight - 1, '═', depth);
      }
      fb.setPixel(boxX + boxWidth - 1, boxY + boxHeight - 1, '╝', depth);
    }
  }

  // Title text
  if (easedProgress > 0.3) {
    const titleProgress = Math.min(1, (easedProgress - 0.3) / 0.2);
    const visibleTitle = title.slice(0, Math.floor(titleProgress * title.length));
    const titleX = centerX - Math.floor(title.length / 2);

    for (let i = 0; i < visibleTitle.length; i++) {
      fb.setPixel(titleX + i, centerY - 2, visibleTitle[i], depth + 3);
    }
  }

  // Subtitle
  if (easedProgress > 0.5) {
    const subProgress = Math.min(1, (easedProgress - 0.5) / 0.15);
    const visibleSub = subtitle.slice(0, Math.floor(subProgress * subtitle.length));
    const subX = centerX - Math.floor(subtitle.length / 2);

    for (let i = 0; i < visibleSub.length; i++) {
      fb.setPixel(subX + i, centerY, visibleSub[i], depth + 2);
    }
  }

  // Blinking prompt
  if (easedProgress > 0.7) {
    const showPrompt = Math.floor(frame / 20) % 2 === 0;
    if (showPrompt) {
      const promptX = centerX - Math.floor(prompt.length / 2);
      for (let i = 0; i < prompt.length; i++) {
        fb.setPixel(promptX + i, centerY + 3, prompt[i], depth + 1);
      }
    }
  }
}

// ============================================================================
// TEXT BOX - Classic RPG dialog box
// ============================================================================

/**
 * Draw an RPG-style text box with character-by-character reveal
 * @param fb - Framebuffer
 * @param y - Y position
 * @param text - Text to display
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for cursor blink
 * @param options - { width, style, speaker }
 */
function textBox(fb, y, text, progress, frame, options = {}) {
  const {
    width = 50,
    style = 'rpg',
    speaker = '',
    depth = 5,
    centered = true,
  } = options;

  const easedProgress = easeOut(progress);
  const centerX = Math.floor(fb.width / 2);
  const x = centered ? centerX - Math.floor(width / 2) : 2;

  // Box characters based on style
  const chars = style === 'rpg'
    ? { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' }
    : style === 'modern'
    ? { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' }
    : { tl: '[', tr: ']', bl: '[', br: ']', h: '-', v: '|' };

  // Draw top border with optional speaker label
  if (speaker) {
    fb.setPixel(x, y, chars.tl, depth);
    fb.setPixel(x + 1, y, chars.h, depth);
    fb.setPixel(x + 2, y, ' ', depth);
    for (let i = 0; i < speaker.length; i++) {
      fb.setPixel(x + 3 + i, y, speaker[i], depth + 1);
    }
    fb.setPixel(x + 3 + speaker.length, y, ' ', depth);
    for (let i = 4 + speaker.length; i < width - 1; i++) {
      fb.setPixel(x + i, y, chars.h, depth);
    }
    fb.setPixel(x + width - 1, y, chars.tr, depth);
  } else {
    fb.setPixel(x, y, chars.tl, depth);
    for (let i = 1; i < width - 1; i++) {
      fb.setPixel(x + i, y, chars.h, depth);
    }
    fb.setPixel(x + width - 1, y, chars.tr, depth);
  }

  // Text area (word wrap)
  const maxTextWidth = width - 4;
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > maxTextWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Calculate visible characters
  const totalChars = lines.join('').length;
  const visibleChars = Math.floor(easedProgress * totalChars);
  let charsDrawn = 0;

  // Draw text lines
  let currentY = y + 1;
  for (const line of lines) {
    fb.setPixel(x, currentY, chars.v, depth);

    const lineCharsToShow = Math.min(line.length, visibleChars - charsDrawn);
    if (lineCharsToShow > 0) {
      const visibleLine = line.slice(0, lineCharsToShow);
      for (let i = 0; i < visibleLine.length; i++) {
        fb.setPixel(x + 2 + i, currentY, visibleLine[i], depth);
      }

      // Blinking cursor at end of visible text
      if (charsDrawn + lineCharsToShow < totalChars && easedProgress < 1) {
        const cursorChar = Math.floor(frame / 6) % 2 === 0 ? '▼' : ' ';
        fb.setPixel(x + 2 + lineCharsToShow, currentY, cursorChar, depth);
      }
    }

    // Fill rest with spaces
    for (let i = Math.max(0, lineCharsToShow) + 2; i < width - 1; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }

    fb.setPixel(x + width - 1, currentY, chars.v, depth);
    charsDrawn += line.length;
    currentY++;

    if (charsDrawn >= visibleChars) break;
  }

  // Add empty rows if we haven't filled enough
  const minRows = 2;
  while (currentY < y + 1 + minRows) {
    fb.setPixel(x, currentY, chars.v, depth);
    for (let i = 1; i < width - 1; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }
    fb.setPixel(x + width - 1, currentY, chars.v, depth);
    currentY++;
  }

  // Continuation indicator
  if (easedProgress >= 1) {
    const blinkIndicator = Math.floor(frame / 8) % 2 === 0 ? '▼' : ' ';
    fb.setPixel(x + width - 3, currentY - 1, blinkIndicator, depth);
  }

  // Bottom border
  fb.setPixel(x, currentY, chars.bl, depth);
  for (let i = 1; i < width - 1; i++) {
    fb.setPixel(x + i, currentY, chars.h, depth);
  }
  fb.setPixel(x + width - 1, currentY, chars.br, depth);

  return currentY - y + 1;
}

// ============================================================================
// CLASS SELECT - Character class display
// ============================================================================

/**
 * Draw a character class selection/display screen
 * @param fb - Framebuffer
 * @param options - { className, description, stats, traits }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for animation
 * @param displayOptions - { y, showSprite }
 */
function classSelect(fb, options, progress, frame, displayOptions = {}) {
  const {
    className = 'ADVENTURER',
    description = 'A brave soul',
    stats = {},
    traits = [],
  } = options;

  const { y = 5, showSprite = true, depth = 5 } = displayOptions;

  const centerX = Math.floor(fb.width / 2);
  const easedProgress = easeOut(progress);

  let currentY = y;

  // Draw sprite
  if (showSprite && easedProgress > 0.1) {
    const spriteProgress = Math.min(1, (easedProgress - 0.1) / 0.2);
    if (spriteProgress > 0.5) {
      // Draw a box around sprite
      const spriteBoxWidth = 11;
      const spriteBoxX = centerX - Math.floor(spriteBoxWidth / 2);

      fb.setPixel(spriteBoxX, currentY, '╭', depth);
      for (let i = 1; i < spriteBoxWidth - 1; i++) {
        fb.setPixel(spriteBoxX + i, currentY, '─', depth);
      }
      fb.setPixel(spriteBoxX + spriteBoxWidth - 1, currentY, '╮', depth);
      currentY++;

      // Sprite lines
      const spriteKey = className.replace(/ /g, '_').toUpperCase();
      const sprite = SPRITES[spriteKey] || SPRITES.FEATURE_CRAFTER;

      for (const line of sprite) {
        fb.setPixel(spriteBoxX, currentY, '│', depth);
        const lineX = spriteBoxX + Math.floor((spriteBoxWidth - line.length) / 2);
        for (let i = 0; i < line.length; i++) {
          if (line[i] !== ' ') {
            fb.setPixel(lineX + i, currentY, line[i], depth + 2);
          }
        }
        fb.setPixel(spriteBoxX + spriteBoxWidth - 1, currentY, '│', depth);
        currentY++;
      }

      fb.setPixel(spriteBoxX, currentY, '╰', depth);
      for (let i = 1; i < spriteBoxWidth - 1; i++) {
        fb.setPixel(spriteBoxX + i, currentY, '─', depth);
      }
      fb.setPixel(spriteBoxX + spriteBoxWidth - 1, currentY, '╯', depth);
      currentY += 2;
    }
  }

  // Class name
  if (easedProgress > 0.3) {
    const nameProgress = Math.min(1, (easedProgress - 0.3) / 0.15);
    const visibleName = className.slice(0, Math.floor(nameProgress * className.length));
    const nameX = centerX - Math.floor(className.length / 2);

    for (let i = 0; i < visibleName.length; i++) {
      fb.setPixel(nameX + i, currentY, visibleName[i], depth + 3);
    }
    currentY++;
  }

  // Description in quotes
  if (description && easedProgress > 0.4) {
    const descProgress = Math.min(1, (easedProgress - 0.4) / 0.15);
    const fullDesc = `"${description}"`;
    const visibleDesc = fullDesc.slice(0, Math.floor(descProgress * fullDesc.length));
    const descX = centerX - Math.floor(fullDesc.length / 2);

    for (let i = 0; i < visibleDesc.length; i++) {
      fb.setPixel(descX + i, currentY, visibleDesc[i], depth + 1);
    }
    currentY += 2;
  }

  // Stats bars
  if (stats && Object.keys(stats).length > 0 && easedProgress > 0.5) {
    const statsProgress = Math.min(1, (easedProgress - 0.5) / 0.25);
    const statEntries = Object.entries(stats);
    const maxStatWidth = 30;
    const statsX = centerX - Math.floor(maxStatWidth / 2);

    for (const [statName, statValue] of statEntries) {
      // Stat label
      const labelWidth = 4;
      const label = statName.slice(0, labelWidth).padEnd(labelWidth);
      for (let i = 0; i < label.length; i++) {
        fb.setPixel(statsX + i, currentY, label[i], depth);
      }

      // Stat bar
      const barWidth = 15;
      const maxStat = 10;
      const filledWidth = Math.floor(statsProgress * (statValue / maxStat) * barWidth);

      for (let i = 0; i < barWidth; i++) {
        const char = i < filledWidth ? '█' : '░';
        fb.setPixel(statsX + labelWidth + 1 + i, currentY, char, depth + 1);
      }

      // Stat value
      const valueStr = ` ${statValue}`;
      for (let i = 0; i < valueStr.length; i++) {
        fb.setPixel(statsX + labelWidth + 1 + barWidth + i, currentY, valueStr[i], depth);
      }

      currentY++;
    }
    currentY++;
  }

  // Traits
  if (traits && traits.length > 0 && easedProgress > 0.75) {
    const traitProgress = Math.min(1, (easedProgress - 0.75) / 0.2);
    const visibleTraits = Math.floor(traitProgress * traits.length);

    const traitStr = traits.slice(0, visibleTraits).map(t => `[${t}]`).join(' ');
    const traitX = centerX - Math.floor(traitStr.length / 2);

    for (let i = 0; i < traitStr.length; i++) {
      fb.setPixel(traitX + i, currentY, traitStr[i], depth + 1);
    }
  }
}

// ============================================================================
// QUEST CARD - Project spotlight for RPG vibe
// ============================================================================

/**
 * Draw a full quest completion card for a project
 * @param fb - Framebuffer
 * @param project - { name, commits, description?, body?, rank? }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 * @param options - { y, width, showRewards }
 */
function questCard(fb, project, progress, frame, options = {}) {
  const {
    y = 3,
    width = 55,
    showRewards = true,
    depth = 5,
    centered = true,
  } = options;

  const { name, commits, description, body, rank } = project;
  const easedProgress = easeOut(progress);

  if (easedProgress < 0.05) return;

  const centerX = Math.floor(fb.width / 2);
  const x = centered ? centerX - Math.floor(width / 2) : 2;

  let currentY = y;
  const visibleWidth = Math.floor(easedProgress * width);
  if (visibleWidth < 5) return;

  // Helper to draw a row with side borders
  function drawRow(text, textDepth = depth) {
    fb.setPixel(x, currentY, '║', depth);
    for (let i = 0; i < text.length && i < visibleWidth - 2; i++) {
      fb.setPixel(x + 1 + i, currentY, text[i], textDepth);
    }
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

  // Quest complete banner with sparkle animation
  if (easedProgress > 0.1) {
    const sparkleChars = ['★', '✦', '·', '✧'];
    const sparkleIdx = Math.floor(frame / 5) % sparkleChars.length;
    const sparkle = sparkleChars[sparkleIdx];
    drawRow(`  ${sparkle} QUEST COMPLETE ${sparkle}`, depth + 2);
  }

  // Divider
  if (easedProgress > 0.15) {
    fb.setPixel(x, currentY, '╟', depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, '─', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '╢', depth);
    currentY++;
  }

  // Empty row
  drawRow('', depth);

  // Quest/Project name
  if (easedProgress > 0.2) {
    const nameProgress = Math.min(1, (easedProgress - 0.2) / 0.15);
    const visibleName = name.slice(0, Math.floor(nameProgress * name.length));
    drawRow(`  ${visibleName}`, depth + 3);
  }

  // Description in quotes (quest flavor text)
  if (description && easedProgress > 0.35) {
    const descProgress = Math.min(1, (easedProgress - 0.35) / 0.1);
    const fullDesc = `"${description}"`;
    const visibleDesc = fullDesc.slice(0, Math.floor(descProgress * fullDesc.length));
    drawRow(`  ${visibleDesc}`, depth + 1);
  }

  // Divider line
  if (easedProgress > 0.4) {
    fb.setPixel(x, currentY, '║', depth);
    for (let i = 1; i < Math.min(visibleWidth - 1, width - 10); i++) {
      fb.setPixel(x + i, currentY, '─', depth);
    }
    for (let i = width - 10; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '║', depth);
    currentY++;
  }

  // Body text (quest story)
  if (body && easedProgress > 0.45) {
    const bodyProgress = Math.min(1, (easedProgress - 0.45) / 0.25);
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

  // Empty row before rewards
  drawRow('', depth);

  // Rewards box
  if (showRewards && easedProgress > 0.75) {
    const rewardsProgress = Math.min(1, (easedProgress - 0.75) / 0.2);

    // Rewards header
    fb.setPixel(x, currentY, '║', depth);
    fb.setPixel(x + 2, currentY, '┌', depth);
    fb.setPixel(x + 3, currentY, '─', depth);
    const rewardLabel = ' REWARDS ';
    for (let i = 0; i < rewardLabel.length; i++) {
      fb.setPixel(x + 4 + i, currentY, rewardLabel[i], depth + 1);
    }
    for (let i = 4 + rewardLabel.length; i < visibleWidth - 4; i++) {
      fb.setPixel(x + i, currentY, '─', depth);
    }
    fb.setPixel(x + visibleWidth - 3, currentY, '┐', depth);
    for (let i = visibleWidth - 2; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '║', depth);
    currentY++;

    // Rewards content
    const xpGained = Math.floor(rewardsProgress * commits);
    const skills = Math.floor(commits / 100) + 1;
    const rarity = commits > 200 ? 'Legendary' : commits > 100 ? 'Epic' : commits > 50 ? 'Rare' : 'Common';
    const itemLabel = `+1 ${rarity} Item`;

    const rewardLine = `  +${xpGained.toLocaleString()} XP    +${skills} Skills    ${itemLabel}  `;

    fb.setPixel(x, currentY, '║', depth);
    fb.setPixel(x + 2, currentY, '│', depth);
    for (let i = 0; i < rewardLine.length && i < visibleWidth - 6; i++) {
      fb.setPixel(x + 3 + i, currentY, rewardLine[i], depth + 2);
    }
    for (let i = rewardLine.length + 3; i < visibleWidth - 3; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }
    fb.setPixel(x + visibleWidth - 3, currentY, '│', depth);
    for (let i = visibleWidth - 2; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '║', depth);
    currentY++;

    // Rewards bottom
    fb.setPixel(x, currentY, '║', depth);
    fb.setPixel(x + 2, currentY, '└', depth);
    for (let i = 3; i < visibleWidth - 3; i++) {
      fb.setPixel(x + i, currentY, '─', depth);
    }
    fb.setPixel(x + visibleWidth - 3, currentY, '┘', depth);
    for (let i = visibleWidth - 2; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, ' ', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '║', depth);
    currentY++;
  }

  // Bottom border
  if (easedProgress > 0.9) {
    fb.setPixel(x, currentY, '╚', depth);
    for (let i = 1; i < visibleWidth - 1; i++) {
      fb.setPixel(x + i, currentY, '═', depth);
    }
    if (visibleWidth > 1) fb.setPixel(x + visibleWidth - 1, currentY, '╝', depth);
  }
}

// ============================================================================
// QUEST BANNER - Animated quest announcement
// ============================================================================

/**
 * Draw an animated quest banner
 * @param fb - Framebuffer
 * @param text - Banner text
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 * @param options - { y, style }
 */
function questBanner(fb, text, progress, frame, options = {}) {
  const { y = 2, style = 'fanfare', depth = 5 } = options;

  const centerX = Math.floor(fb.width / 2);
  const easedProgress = easeOut(progress);

  if (style === 'fanfare') {
    // Decorative elements that animate in
    const decorChars = ['·', ':', '·', ':', '·'];
    const decorWidth = Math.floor(easedProgress * (text.length / 2 + 5));

    // Left decoration
    for (let i = 0; i < Math.min(decorWidth, 5); i++) {
      const decX = centerX - Math.floor(text.length / 2) - 6 + i;
      fb.setPixel(decX, y, decorChars[i], depth);
    }

    // Text
    if (easedProgress > 0.3) {
      const textProgress = (easedProgress - 0.3) / 0.5;
      const visibleChars = Math.floor(textProgress * text.length);
      const textX = centerX - Math.floor(text.length / 2);

      for (let i = 0; i < visibleChars; i++) {
        fb.setPixel(textX + i, y, text[i], depth + 3);
      }
    }

    // Right decoration
    if (easedProgress > 0.5) {
      for (let i = 0; i < Math.min(decorWidth, 5); i++) {
        const decX = centerX + Math.floor(text.length / 2) + 1 + i;
        fb.setPixel(decX, y, decorChars[4 - i], depth);
      }
    }
  } else if (style === 'simple') {
    const textX = centerX - Math.floor(text.length / 2);
    const visibleChars = Math.floor(easedProgress * text.length);

    for (let i = 0; i < visibleChars; i++) {
      fb.setPixel(textX + i, y, text[i], depth + 2);
    }
  } else {
    // legendary style with sparkles
    const sparkles = ['★', '✦', '✧', '·'];
    const sparkleIdx = Math.floor(frame / 4) % sparkles.length;

    const fullText = `${sparkles[sparkleIdx]} ${text} ${sparkles[(sparkleIdx + 2) % sparkles.length]}`;
    const textX = centerX - Math.floor(fullText.length / 2);
    const visibleChars = Math.floor(easedProgress * fullText.length);

    for (let i = 0; i < visibleChars; i++) {
      fb.setPixel(textX + i, y, fullText[i], depth + 3);
    }
  }
}

// ============================================================================
// XP BAR - Animated experience bar
// ============================================================================

/**
 * Draw an XP progress bar
 * @param fb - Framebuffer
 * @param x - X position
 * @param y - Y position
 * @param options - { current, max, label }
 * @param progress - Animation progress 0-1
 * @param displayOptions - { width, showNumbers }
 */
function xpBar(fb, x, y, options, progress, displayOptions = {}) {
  const { current = 0, max = 100, label = 'LVL' } = options;
  const { width = 40, showNumbers = true, depth = 5 } = displayOptions;

  const easedProgress = easeOut(progress);

  // Draw label
  for (let i = 0; i < label.length; i++) {
    fb.setPixel(x + i, y, label[i], depth + 1);
  }

  // Draw bar
  const barStart = x + label.length + 2;
  const barWidth = width - label.length - (showNumbers ? 15 : 2);
  const fillPercent = current / max;
  const animatedFill = fillPercent * easedProgress;
  const filledWidth = Math.floor(animatedFill * barWidth);

  for (let i = 0; i < barWidth; i++) {
    const char = i < filledWidth ? '█' : '░';
    fb.setPixel(barStart + i, y, char, depth + (i < filledWidth ? 2 : 0));
  }

  // Draw numbers
  if (showNumbers) {
    const animatedCurrent = Math.floor(easedProgress * current);
    const numStr = `${animatedCurrent.toLocaleString()} / ${max.toLocaleString()} XP`;
    const numX = barStart + barWidth + 2;

    for (let i = 0; i < numStr.length; i++) {
      fb.setPixel(numX + i, y, numStr[i], depth);
    }
  }
}

// ============================================================================
// LEVEL UP - Level up celebration display
// ============================================================================

/**
 * Draw a level up celebration
 * @param fb - Framebuffer
 * @param options - { level, stats }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 * @param displayOptions - { y }
 */
function levelUp(fb, options, progress, frame, displayOptions = {}) {
  const { level = 1, stats = [] } = options;
  const { y = 8, depth = 5 } = displayOptions;

  const centerX = Math.floor(fb.width / 2);
  const easedProgress = easeOut(progress);

  const boxWidth = 25;
  const boxX = centerX - Math.floor(boxWidth / 2);
  let currentY = y;

  // Box with glow effect
  if (easedProgress > 0.1) {
    const visibleWidth = Math.floor(((easedProgress - 0.1) / 0.3) * boxWidth);

    // Top border
    fb.setPixel(boxX, currentY, '╔', depth);
    for (let i = 1; i < Math.min(visibleWidth - 1, boxWidth - 1); i++) {
      fb.setPixel(boxX + i, currentY, '═', depth);
    }
    if (visibleWidth >= boxWidth) fb.setPixel(boxX + boxWidth - 1, currentY, '╗', depth);
    currentY++;

    // Level up text
    if (easedProgress > 0.3) {
      fb.setPixel(boxX, currentY, '║', depth);
      const lvlText = 'LEVEL UP!';
      const lvlX = boxX + Math.floor((boxWidth - lvlText.length) / 2);
      for (let i = 0; i < lvlText.length; i++) {
        fb.setPixel(lvlX + i, currentY, lvlText[i], depth + 3);
      }
      fb.setPixel(boxX + boxWidth - 1, currentY, '║', depth);
      currentY++;

      // Level number with sparkle
      const sparkles = ['★', '✦', '✧', '*'];
      const sparkleIdx = Math.floor(frame / 5) % sparkles.length;
      const levelText = `${sparkles[sparkleIdx]} LV. ${level} ${sparkles[(sparkleIdx + 2) % sparkles.length]}`;
      const levelX = boxX + Math.floor((boxWidth - levelText.length) / 2);

      fb.setPixel(boxX, currentY, '║', depth);
      for (let i = 0; i < levelText.length; i++) {
        fb.setPixel(levelX + i, currentY, levelText[i], depth + 2);
      }
      fb.setPixel(boxX + boxWidth - 1, currentY, '║', depth);
      currentY++;
    }

    // Divider
    if (easedProgress > 0.5) {
      fb.setPixel(boxX, currentY, '╠', depth);
      for (let i = 1; i < boxWidth - 1; i++) {
        fb.setPixel(boxX + i, currentY, '═', depth);
      }
      fb.setPixel(boxX + boxWidth - 1, currentY, '╣', depth);
      currentY++;

      // Stats gained
      for (let i = 0; i < stats.length; i++) {
        const statProgress = Math.min(1, (easedProgress - 0.5 - i * 0.1) / 0.15);
        if (statProgress > 0) {
          fb.setPixel(boxX, currentY, '║', depth);

          const stat = stats[i];
          const statLine = `${stat.name.padEnd(12)}${stat.gained}`;
          const visibleStat = statLine.slice(0, Math.floor(statProgress * statLine.length));

          for (let j = 0; j < visibleStat.length && j < boxWidth - 4; j++) {
            fb.setPixel(boxX + 2 + j, currentY, visibleStat[j], depth + 1);
          }

          fb.setPixel(boxX + boxWidth - 1, currentY, '║', depth);
          currentY++;
        }
      }
    }

    // Bottom border
    if (easedProgress > 0.85) {
      fb.setPixel(boxX, currentY, '╚', depth);
      for (let i = 1; i < boxWidth - 1; i++) {
        fb.setPixel(boxX + i, currentY, '═', depth);
      }
      fb.setPixel(boxX + boxWidth - 1, currentY, '╝', depth);
    }
  }
}

// ============================================================================
// STATS PANEL - RPG-style stats display
// ============================================================================

/**
 * Draw an RPG stats panel
 * @param fb - Framebuffer
 * @param x - X position
 * @param y - Y position
 * @param stats - Object of stat name -> value
 * @param progress - Animation progress 0-1
 * @param options - { style, width }
 */
function statsPanel(fb, x, y, stats, progress, options = {}) {
  const { style = 'bordered', width = 30, depth = 5 } = options;

  const easedProgress = easeOut(progress);
  const statEntries = Object.entries(stats);
  let currentY = y;

  if (style === 'bordered') {
    // Header
    fb.setPixel(x, currentY, '┌', depth);
    fb.setPixel(x + 1, currentY, '─', depth);
    const headerText = ' HERO STATS ';
    for (let i = 0; i < headerText.length; i++) {
      fb.setPixel(x + 2 + i, currentY, headerText[i], depth + 1);
    }
    for (let i = 2 + headerText.length; i < width - 1; i++) {
      fb.setPixel(x + i, currentY, '─', depth);
    }
    fb.setPixel(x + width - 1, currentY, '┐', depth);
    currentY++;

    // Stats
    for (let i = 0; i < statEntries.length; i++) {
      const [statName, statValue] = statEntries[i];
      const statProgress = Math.min(1, (easedProgress - i * 0.1) / 0.2);

      if (statProgress > 0) {
        fb.setPixel(x, currentY, '│', depth);

        const valueStr = typeof statValue === 'number' ? statValue.toLocaleString() : statValue;
        const animatedValue = typeof statValue === 'number'
          ? Math.floor(statProgress * statValue).toLocaleString()
          : valueStr;

        const statLine = `${statName.padEnd(width - animatedValue.length - 4)}${animatedValue}`;

        for (let j = 0; j < statLine.length && j < width - 2; j++) {
          fb.setPixel(x + 1 + j, currentY, statLine[j], depth);
        }

        fb.setPixel(x + width - 1, currentY, '│', depth);
        currentY++;
      }
    }

    // Footer
    if (easedProgress > 0.8) {
      fb.setPixel(x, currentY, '└', depth);
      for (let i = 1; i < width - 1; i++) {
        fb.setPixel(x + i, currentY, '─', depth);
      }
      fb.setPixel(x + width - 1, currentY, '┘', depth);
    }
  }
}

// ============================================================================
// BOSS HEALTH - Boss battle health bar
// ============================================================================

/**
 * Draw a boss health bar
 * @param fb - Framebuffer
 * @param y - Y position
 * @param options - { name, health, maxHealth }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame for effects
 */
function bossHealth(fb, y, options, progress, frame) {
  const { name = 'BOSS', health = 0, maxHealth = 100, depth = 5 } = options;

  const centerX = Math.floor(fb.width / 2);
  const barWidth = 30;
  const x = centerX - Math.floor(barWidth / 2);
  const easedProgress = easeOut(progress);

  // Boss name
  const nameX = centerX - Math.floor(name.length / 2);
  for (let i = 0; i < name.length; i++) {
    fb.setPixel(nameX + i, y, name[i], depth + 2);
  }

  // Health bar
  const currentHealth = Math.floor((1 - easedProgress) * health);
  const healthPercent = currentHealth / maxHealth;
  const filledWidth = Math.floor(healthPercent * (barWidth - 2));

  fb.setPixel(x, y + 1, '[', depth);
  for (let i = 0; i < barWidth - 2; i++) {
    const char = i < filledWidth ? '█' : '░';
    fb.setPixel(x + 1 + i, y + 1, char, depth + 1);
  }
  fb.setPixel(x + barWidth - 1, y + 1, ']', depth);

  // Status text
  const statusText = currentHealth <= 0 ? 'DEFEATED!' : `${Math.floor(healthPercent * 100)}%`;
  const statusX = centerX - Math.floor(statusText.length / 2);

  if (currentHealth <= 0) {
    // Flash on defeat
    const flash = Math.floor(frame / 5) % 2 === 0;
    if (flash) {
      for (let i = 0; i < statusText.length; i++) {
        fb.setPixel(statusX + i, y + 2, statusText[i], depth + 3);
      }
    }
  } else {
    for (let i = 0; i < statusText.length; i++) {
      fb.setPixel(statusX + i, y + 2, statusText[i], depth);
    }
  }
}

// ============================================================================
// VICTORY FANFARE - Celebration effect
// ============================================================================

/**
 * Victory celebration particles
 * @param fb - Framebuffer
 * @param frame - Current frame
 * @param options - { intensity, style }
 */
function victoryFanfare(fb, frame, options = {}) {
  const { intensity = 1.0, style = 'classic', depth = 3 } = options;

  const chars = style === 'epic'
    ? ['★', '✦', '✧', '◆', '●']
    : style === 'subtle'
    ? ['·', '*', '+']
    : ['★', '*', '·', '+', '✦'];

  const particleCount = Math.floor(intensity * 15);

  for (let i = 0; i < particleCount; i++) {
    const seed = i * 9.876 + frame * 0.03;
    const x = Math.floor((Math.sin(seed * 5.43) * 0.5 + 0.5) * fb.width);
    const yBase = (frame * 0.4 + i * 4) % (fb.height + 5);
    const y = fb.height - Math.floor(yBase);

    if (y >= 0 && y < fb.height && x >= 0 && x < fb.width) {
      const charIdx = Math.floor((seed * 100) % chars.length);
      fb.setPixel(x, y, chars[charIdx], depth);
    }
  }
}

// ============================================================================
// CREDITS ROLL - Scrolling end credits
// ============================================================================

/**
 * Draw scrolling credits
 * @param fb - Framebuffer
 * @param items - Array of { type, text?, label?, value? }
 * @param progress - Animation progress 0-1
 * @param frame - Current frame
 * @param options - { speed }
 */
function creditsRoll(fb, items, progress, frame, options = {}) {
  const { speed = 0.5, depth = 5 } = options;

  const centerX = Math.floor(fb.width / 2);
  const easedProgress = easeInOut(progress);

  // Calculate total height and scroll position
  let totalHeight = 0;
  for (const item of items) {
    if (item.type === 'spacer') totalHeight += 2;
    else totalHeight += 2;
  }

  const scrollOffset = Math.floor(easedProgress * (totalHeight + fb.height));
  let currentY = fb.height - scrollOffset;

  for (const item of items) {
    if (currentY >= -2 && currentY < fb.height + 2) {
      if (item.type === 'header') {
        const text = item.text || '';
        const textX = centerX - Math.floor(text.length / 2);
        for (let i = 0; i < text.length && currentY >= 0 && currentY < fb.height; i++) {
          fb.setPixel(textX + i, currentY, text[i], depth + 3);
        }
      } else if (item.type === 'stat') {
        const line = `${item.label}: ${item.value}`;
        const lineX = centerX - Math.floor(line.length / 2);
        if (currentY >= 0 && currentY < fb.height) {
          for (let i = 0; i < line.length; i++) {
            fb.setPixel(lineX + i, currentY, line[i], depth + 1);
          }
        }
      } else if (item.type === 'text') {
        const text = item.text || '';
        const textX = centerX - Math.floor(text.length / 2);
        if (currentY >= 0 && currentY < fb.height) {
          for (let i = 0; i < text.length; i++) {
            fb.setPixel(textX + i, currentY, text[i], depth);
          }
        }
      }
    }

    currentY += item.type === 'spacer' ? 2 : 2;
  }
}

// ============================================================================
// INVENTORY SLOT - Item display
// ============================================================================

/**
 * Draw an inventory slot with item
 * @param fb - Framebuffer
 * @param x - X position
 * @param y - Y position
 * @param options - { icon, name, rarity }
 * @param progress - Animation progress 0-1
 */
function inventorySlot(fb, x, y, options, progress) {
  const { icon = '?', name = 'Item', rarity = 'common', depth = 5 } = options;

  const easedProgress = easeOut(progress);
  if (easedProgress < 0.1) return;

  // Box
  fb.setPixel(x, y, '┌', depth);
  fb.setPixel(x + 1, y, '─', depth);
  fb.setPixel(x + 2, y, '─', depth);
  fb.setPixel(x + 3, y, '─', depth);
  fb.setPixel(x + 4, y, '┐', depth);

  fb.setPixel(x, y + 1, '│', depth);
  fb.setPixel(x + 2, y + 1, icon, depth + 2);
  fb.setPixel(x + 4, y + 1, '│', depth);

  fb.setPixel(x, y + 2, '└', depth);
  fb.setPixel(x + 1, y + 2, '─', depth);
  fb.setPixel(x + 2, y + 2, '─', depth);
  fb.setPixel(x + 3, y + 2, '─', depth);
  fb.setPixel(x + 4, y + 2, '┘', depth);

  // Name
  if (easedProgress > 0.4) {
    const nameProgress = (easedProgress - 0.4) / 0.3;
    const visibleName = name.slice(0, Math.floor(nameProgress * name.length));
    for (let i = 0; i < visibleName.length; i++) {
      fb.setPixel(x + 6 + i, y + 1, visibleName[i], depth + 1);
    }
  }

  // Rarity stars
  if (easedProgress > 0.7) {
    const rarityStars = rarity === 'legendary' ? '★★★★'
      : rarity === 'epic' ? '★★★☆'
      : rarity === 'rare' ? '★★☆☆'
      : '★☆☆☆';

    for (let i = 0; i < rarityStars.length; i++) {
      fb.setPixel(x + 6 + i, y + 2, rarityStars[i], depth);
    }
  }
}

// Make available globally
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    characterSprite,
    titleScreen,
    textBox,
    classSelect,
    questCard,
    questBanner,
    xpBar,
    levelUp,
    statsPanel,
    bossHealth,
    victoryFanfare,
    creditsRoll,
    inventorySlot,
  });
}
})();
