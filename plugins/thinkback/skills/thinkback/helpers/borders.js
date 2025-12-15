/* eslint-disable */
/**
 * Border and Frame Effects
 * Decorative borders for framing content
 */
(function() {

// Border character sets
const BORDERS = {
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  heavy: { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  ascii: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  dotted: { tl: '·', tr: '·', bl: '·', br: '·', h: '·', v: '·' },
};

// Seeded random for animation consistency
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Draw a box border
 */
function boxBorder(fb, options = {}) {
  const { x = 0, y = 0, width = fb.width, height = fb.height, style = 'single', depth = 0 } = options;
  const chars = BORDERS[style] || BORDERS.single;

  // Corners
  fb.setPixel(x, y, chars.tl, depth);
  fb.setPixel(x + width - 1, y, chars.tr, depth);
  fb.setPixel(x, y + height - 1, chars.bl, depth);
  fb.setPixel(x + width - 1, y + height - 1, chars.br, depth);

  // Horizontal lines
  for (let dx = 1; dx < width - 1; dx++) {
    fb.setPixel(x + dx, y, chars.h, depth);
    fb.setPixel(x + dx, y + height - 1, chars.h, depth);
  }

  // Vertical lines
  for (let dy = 1; dy < height - 1; dy++) {
    fb.setPixel(x, y + dy, chars.v, depth);
    fb.setPixel(x + width - 1, y + dy, chars.v, depth);
  }
}

/**
 * Draw a fullscreen border with padding
 */
function fullscreenBorder(fb, options = {}) {
  const { style = 'single', padding = 1, depth = 0 } = options;
  boxBorder(fb, {
    x: padding,
    y: padding,
    width: fb.width - padding * 2,
    height: fb.height - padding * 2,
    style,
    depth
  });
}

/**
 * Draw only corner decorations
 */
function cornerDecor(fb, options = {}) {
  const { style = 'flourish', padding = 1, size = 3, depth = 0 } = options;

  const flourishCorners = {
    tl: ['╔', '═', '═', '║', ' ', ' ', '║', ' ', ' '],
    tr: ['═', '═', '╗', ' ', ' ', '║', ' ', ' ', '║'],
    bl: ['║', ' ', ' ', '║', ' ', ' ', '╚', '═', '═'],
    br: [' ', ' ', '║', ' ', ' ', '║', '═', '═', '╝'],
  };

  const simpleCorners = {
    tl: ['┌', '─', ' ', '│', ' ', ' ', ' ', ' ', ' '],
    tr: [' ', '─', '┐', ' ', ' ', '│', ' ', ' ', ' '],
    bl: [' ', ' ', ' ', '│', ' ', ' ', '└', '─', ' '],
    br: [' ', ' ', ' ', ' ', ' ', '│', ' ', '─', '┘'],
  };

  const corners = style === 'flourish' ? flourishCorners : simpleCorners;

  // Draw each corner
  const positions = [
    { corner: 'tl', x: padding, y: padding },
    { corner: 'tr', x: fb.width - padding - size, y: padding },
    { corner: 'bl', x: padding, y: fb.height - padding - size },
    { corner: 'br', x: fb.width - padding - size, y: fb.height - padding - size },
  ];

  for (const pos of positions) {
    const chars = corners[pos.corner];
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const char = chars[dy * 3 + dx];
        if (char !== ' ') {
          fb.setPixel(pos.x + dx, pos.y + dy, char, depth);
        }
      }
    }
  }
}

/**
 * Marching ants animated border
 */
function marchingAnts(fb, frame, options = {}) {
  const { x = 0, y = 0, width = fb.width, height = fb.height, speed = 1, depth = 0 } = options;
  const pattern = ['─', '·', '─', '·'];
  const offset = Math.floor(frame * speed) % pattern.length;

  // Top edge
  for (let dx = 0; dx < width; dx++) {
    const char = pattern[(dx + offset) % pattern.length];
    fb.setPixel(x + dx, y, char, depth);
  }

  // Bottom edge
  for (let dx = 0; dx < width; dx++) {
    const char = pattern[(dx - offset + pattern.length * 100) % pattern.length];
    fb.setPixel(x + dx, y + height - 1, char, depth);
  }

  // Left edge
  for (let dy = 1; dy < height - 1; dy++) {
    const char = pattern[(dy - offset + pattern.length * 100) % pattern.length] === '─' ? '│' : '·';
    fb.setPixel(x, y + dy, char, depth);
  }

  // Right edge
  for (let dy = 1; dy < height - 1; dy++) {
    const char = pattern[(dy + offset) % pattern.length] === '─' ? '│' : '·';
    fb.setPixel(x + width - 1, y + dy, char, depth);
  }
}

/**
 * Pulsing border effect
 */
function pulseBorder(fb, frame, options = {}) {
  const { x = 1, y = 1, width = null, height = null, depth = 0 } = options;
  const w = width || fb.width - 2;
  const h = height || fb.height - 2;

  // Cycle through border styles
  const styles = ['dotted', 'single', 'heavy', 'double', 'heavy', 'single'];
  const styleIdx = Math.floor(frame / 10) % styles.length;

  boxBorder(fb, { x, y, width: w, height: h, style: styles[styleIdx], depth });
}

/**
 * Growing border animation
 */
function growBorder(fb, progress, options = {}) {
  const { x = 0, y = 0, width = fb.width, height = fb.height, style = 'single', depth = 0 } = options;
  const chars = BORDERS[style] || BORDERS.single;

  // Calculate how much of the border to draw
  const perimeter = 2 * (width + height) - 4;
  const drawn = Math.floor(progress * perimeter);

  let count = 0;

  // Top edge (left to right)
  for (let dx = 0; dx < width && count < drawn; dx++, count++) {
    const char = dx === 0 ? chars.tl : (dx === width - 1 ? chars.tr : chars.h);
    fb.setPixel(x + dx, y, char, depth);
  }

  // Right edge (top to bottom, excluding top corner)
  for (let dy = 1; dy < height && count < drawn; dy++, count++) {
    const char = dy === height - 1 ? chars.br : chars.v;
    fb.setPixel(x + width - 1, y + dy, char, depth);
  }

  // Bottom edge (right to left, excluding right corner)
  for (let dx = width - 2; dx >= 0 && count < drawn; dx--, count++) {
    const char = dx === 0 ? chars.bl : chars.h;
    fb.setPixel(x + dx, y + height - 1, char, depth);
  }

  // Left edge (bottom to top, excluding corners)
  for (let dy = height - 2; dy > 0 && count < drawn; dy--, count++) {
    fb.setPixel(x, y + dy, chars.v, depth);
  }
}

/**
 * Draw a border with a title
 */
function framedTitle(fb, y, title, options = {}) {
  const { style = 'single', padding = 2, depth = 0 } = options;
  const chars = BORDERS[style] || BORDERS.single;

  const totalWidth = title.length + padding * 2 + 4; // 4 for border chars and spacing
  const x = Math.floor((fb.width - totalWidth) / 2);

  // Left side: ┌───
  fb.setPixel(x, y, chars.tl, depth);
  for (let i = 1; i <= padding; i++) {
    fb.setPixel(x + i, y, chars.h, depth);
  }

  // Space before title
  fb.setPixel(x + padding + 1, y, ' ', depth);

  // Title
  for (let i = 0; i < title.length; i++) {
    fb.setPixel(x + padding + 2 + i, y, title[i], depth);
  }

  // Space after title
  fb.setPixel(x + padding + 2 + title.length, y, ' ', depth);

  // Right side: ───┐
  for (let i = 1; i <= padding; i++) {
    fb.setPixel(x + padding + 3 + title.length + i - 1, y, chars.h, depth);
  }
  fb.setPixel(x + totalWidth - 1, y, chars.tr, depth);
}

/**
 * Gradient border using density characters
 */
function gradientBorder(fb, frame, options = {}) {
  const { x = 1, y = 1, width = null, height = null, depth = 0 } = options;
  const w = width || fb.width - 2;
  const h = height || fb.height - 2;
  const densityChars = ['.', ':', '-', '=', '+', '*', '#', '%', '@'];

  const perimeter = 2 * (w + h) - 4;

  let pos = 0;

  // Top edge
  for (let dx = 0; dx < w; dx++, pos++) {
    const charIdx = Math.floor(((pos + frame) % perimeter) / perimeter * densityChars.length);
    fb.setPixel(x + dx, y, densityChars[charIdx], depth);
  }

  // Right edge
  for (let dy = 1; dy < h; dy++, pos++) {
    const charIdx = Math.floor(((pos + frame) % perimeter) / perimeter * densityChars.length);
    fb.setPixel(x + w - 1, y + dy, densityChars[charIdx], depth);
  }

  // Bottom edge
  for (let dx = w - 2; dx >= 0; dx--, pos++) {
    const charIdx = Math.floor(((pos + frame) % perimeter) / perimeter * densityChars.length);
    fb.setPixel(x + dx, y + h - 1, densityChars[charIdx], depth);
  }

  // Left edge
  for (let dy = h - 2; dy > 0; dy--, pos++) {
    const charIdx = Math.floor(((pos + frame) % perimeter) / perimeter * densityChars.length);
    fb.setPixel(x, y + dy, densityChars[charIdx], depth);
  }
}

/**
 * Decorative divider line
 */
function divider(fb, y, options = {}) {
  const { style = 'single', padding = 2, depth = 0 } = options;
  const chars = BORDERS[style] || BORDERS.single;

  for (let x = padding; x < fb.width - padding; x++) {
    fb.setPixel(x, y, chars.h, depth);
  }
}

/**
 * Decorative divider with center text
 */
function dividerWithText(fb, y, text, options = {}) {
  const { style = 'single', depth = 0 } = options;
  const chars = BORDERS[style] || BORDERS.single;

  const textStart = Math.floor((fb.width - text.length) / 2) - 1;
  const textEnd = textStart + text.length + 1;

  // Left line
  for (let x = 2; x < textStart; x++) {
    fb.setPixel(x, y, chars.h, depth);
  }

  // Text with spacing
  fb.setPixel(textStart, y, ' ', depth);
  for (let i = 0; i < text.length; i++) {
    fb.setPixel(textStart + 1 + i, y, text[i], depth);
  }
  fb.setPixel(textEnd, y, ' ', depth);

  // Right line
  for (let x = textEnd + 1; x < fb.width - 2; x++) {
    fb.setPixel(x, y, chars.h, depth);
  }
}

// Make available globally for browser script tag usage
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, {
    BORDERS, boxBorder, fullscreenBorder, cornerDecor,
    marchingAnts, pulseBorder, growBorder, framedTitle,
    gradientBorder, divider, dividerWithText
  });
}
})();
