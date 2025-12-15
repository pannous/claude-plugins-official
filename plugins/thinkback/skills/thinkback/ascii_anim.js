/* eslint-disable */
/**
 * ASCII Art Animation Library
 * A library for creating ASCII art animations with primitives and framebuffer rendering
 */

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class FrameBuffer {
  // Density characters from light to dark
  static DENSITY_CHARS = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

  // Large text font (3x5 characters, accounting for aspect ratio)
  static FIGLET_FONT = {
    'A': ['  #  ', ' # # ', '#####', '#   #', '#   #'],
    'B': ['#### ', '#   #', '#### ', '#   #', '#### '],
    'C': [' ### ', '#   #', '#    ', '#   #', ' ### '],
    'D': ['#### ', '#   #', '#   #', '#   #', '#### '],
    'E': ['#####', '#    ', '#### ', '#    ', '#####'],
    'F': ['#####', '#    ', '#### ', '#    ', '#    '],
    'G': [' ### ', '#    ', '#  ##', '#   #', ' ### '],
    'H': ['#   #', '#   #', '#####', '#   #', '#   #'],
    'I': ['#####', '  #  ', '  #  ', '  #  ', '#####'],
    'J': ['#####', '    #', '    #', '#   #', ' ### '],
    'K': ['#   #', '#  # ', '###  ', '#  # ', '#   #'],
    'L': ['#    ', '#    ', '#    ', '#    ', '#####'],
    'M': ['#   #', '## ##', '# # #', '#   #', '#   #'],
    'N': ['#   #', '##  #', '# # #', '#  ##', '#   #'],
    'O': [' ### ', '#   #', '#   #', '#   #', ' ### '],
    'P': ['#### ', '#   #', '#### ', '#    ', '#    '],
    'Q': [' ### ', '#   #', '#   #', '#  ##', ' ####'],
    'R': ['#### ', '#   #', '#### ', '#  # ', '#   #'],
    'S': [' ####', '#    ', ' ### ', '    #', '#### '],
    'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
    'U': ['#   #', '#   #', '#   #', '#   #', ' ### '],
    'V': ['#   #', '#   #', '#   #', ' # # ', '  #  '],
    'W': ['#   #', '#   #', '# # #', '## ##', '#   #'],
    'X': ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
    'Y': ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
    'Z': ['#####', '   # ', '  #  ', ' #   ', '#####'],
    '0': [' ### ', '#   #', '#   #', '#   #', ' ### '],
    '1': ['  #  ', ' ##  ', '  #  ', '  #  ', '#####'],
    '2': [' ### ', '#   #', '   # ', '  #  ', '#####'],
    '3': [' ### ', '#   #', '  ## ', '#   #', ' ### '],
    '4': ['#   #', '#   #', '#####', '    #', '    #'],
    '5': ['#####', '#    ', '#### ', '    #', '#### '],
    '6': [' ### ', '#    ', '#### ', '#   #', ' ### '],
    '7': ['#####', '    #', '   # ', '  #  ', '  #  '],
    '8': [' ### ', '#   #', ' ### ', '#   #', ' ### '],
    '9': [' ### ', '#   #', ' ####', '    #', ' ### '],
    ' ': ['     ', '     ', '     ', '     ', '     '],
    '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  '],
    '?': [' ### ', '#   #', '   # ', '     ', '  #  '],
    '.': ['     ', '     ', '     ', '     ', '  #  '],
    ',': ['     ', '     ', '     ', '  #  ', ' #   '],
    ':': ['     ', '  #  ', '     ', '  #  ', '     '],
    "'": ['  #  ', '  #  ', '     ', '     ', '     '],
    '-': ['     ', '     ', '#####', '     ', '     '],
    '+': ['     ', '  #  ', '#####', '  #  ', '     '],
    '=': ['     ', '#####', '     ', '#####', '     '],
    '*': ['     ', '# # #', ' ### ', '# # #', '     '],
    '/': ['    #', '   # ', '  #  ', ' #   ', '#    '],
    '(': ['  ## ', ' #   ', ' #   ', ' #   ', '  ## '],
    ')': ['##   ', '   # ', '   # ', '   # ', '##   '],
    '<': ['   # ', '  #  ', ' #   ', '  #  ', '   # '],
    '>': [' #   ', '  #  ', '   # ', '  #  ', ' #   '],
  };

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.clear();
  }

  clear(char = ' ') {
    this.buffer = Array(this.height).fill(null).map(() => Array(this.width).fill(char));
    this.colorBuffer = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
    this.depthBuffer = Array(this.height).fill(null).map(() => Array(this.width).fill(Infinity));
  }

  // Convert hex color to ANSI true color escape sequence
  hexToAnsi(hex) {
    if (!hex || typeof hex !== 'string') return null;
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return null;
    const r = parseInt(match[1], 16);
    const g = parseInt(match[2], 16);
    const b = parseInt(match[3], 16);
    return `\x1b[38;2;${r};${g};${b}m`;
  }

  setPixel(x, y, char, depth = 0, color = null) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      if (depth <= this.depthBuffer[y][x]) {
        this.buffer[y][x] = char;
        this.colorBuffer[y][x] = color;
        this.depthBuffer[y][x] = depth;
      }
    }
  }

  getPixel(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.buffer[y][x];
    }
    return ' ';
  }

  drawLine(x1, y1, x2, y2, char = '#', depth = 0) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;
    while (true) {
      this.setPixel(x, y, char, depth);
      if (x === x2 && y === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  drawHorizontalLine(x, y, length, char = '-', depth = 0) {
    for (let i = 0; i < length; i++) {
      this.setPixel(x + i, y, char, depth);
    }
  }

  drawVerticalLine(x, y, length, char = '|', depth = 0) {
    for (let i = 0; i < length; i++) {
      this.setPixel(x, y + i, char, depth);
    }
  }

  drawBox(x, y, width, height, char = '#', filled = false, depth = 0) {
    if (filled) {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          this.setPixel(x + dx, y + dy, char, depth);
        }
      }
    } else {
      // Top and bottom
      this.drawHorizontalLine(x, y, width, char, depth);
      this.drawHorizontalLine(x, y + height - 1, width, char, depth);
      // Left and right
      this.drawVerticalLine(x, y, height, char, depth);
      this.drawVerticalLine(x + width - 1, y, height, char, depth);
    }
  }

  drawCircle(cx, cy, radius, char = 'o', filled = false, depth = 0) {
    if (filled) {
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          if (x * x + y * y <= radius * radius) {
            this.setPixel(cx + x, cy + y, char, depth);
          }
        }
      }
    } else {
      let x = radius;
      let y = 0;
      let err = 0;

      while (x >= y) {
        this.setPixel(cx + x, cy + y, char, depth);
        this.setPixel(cx + y, cy + x, char, depth);
        this.setPixel(cx - y, cy + x, char, depth);
        this.setPixel(cx - x, cy + y, char, depth);
        this.setPixel(cx - x, cy - y, char, depth);
        this.setPixel(cx - y, cy - x, char, depth);
        this.setPixel(cx + y, cy - x, char, depth);
        this.setPixel(cx + x, cy - y, char, depth);

        if (err <= 0) {
          y += 1;
          err += 2 * y + 1;
        }
        if (err > 0) {
          x -= 1;
          err -= 2 * x + 1;
        }
      }
    }
  }

  drawText(x, y, text, colorOrDepth = null, color = null) {
    // Support both (x, y, text, color) and (x, y, text, depth, color) signatures
    let depth = 0;
    let actualColor = null;

    if (typeof colorOrDepth === 'string') {
      // Called as (x, y, text, color) - color passed as third arg
      actualColor = colorOrDepth;
    } else if (typeof colorOrDepth === 'number') {
      // Called as (x, y, text, depth, color)
      depth = colorOrDepth;
      actualColor = color;
    }

    for (let i = 0; i < text.length; i++) {
      this.setPixel(x + i, y, text[i], depth, actualColor);
    }
  }

  drawCenteredText(y, text, colorOrDepth = null, color = null) {
    const x = Math.floor((this.width - text.length) / 2);
    this.drawText(x, y, text, colorOrDepth, color);
  }

  drawGradientBox(x, y, width, height, startDensity = 0, endDensity = 9, depth = 0) {
    for (let dy = 0; dy < height; dy++) {
      let densityIdx = Math.floor(startDensity + (endDensity - startDensity) * dy / height);
      densityIdx = Math.max(0, Math.min(9, densityIdx));
      const char = FrameBuffer.DENSITY_CHARS[densityIdx];
      for (let dx = 0; dx < width; dx++) {
        this.setPixel(x + dx, y + dy, char, depth);
      }
    }
  }

  drawStar(x, y, char = '*', depth = 0) {
    this.setPixel(x, y, char, depth);
  }

  drawParticles(particles, depth = 0) {
    for (const [px, py, char] of particles) {
      this.setPixel(px, py, char, depth);
    }
  }

  fillCanvas(char = '#', depth = 0) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setPixel(x, y, char, depth);
      }
    }
  }

  clearBox(x, y, width, height, char = ' ') {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if (x + dx >= 0 && x + dx < this.width && y + dy >= 0 && y + dy < this.height) {
          this.buffer[y + dy][x + dx] = char;
          this.depthBuffer[y + dy][x + dx] = Infinity;
        }
      }
    }
  }

  fillExceptBox(excludeX, excludeY, excludeWidth, excludeHeight, char = '#', depth = 0) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (x >= excludeX && x < excludeX + excludeWidth &&
            y >= excludeY && y < excludeY + excludeHeight) {
          continue;
        }
        this.setPixel(x, y, char, depth);
      }
    }
  }

  fillExceptCircle(cx, cy, radius, char = '#', depth = 0) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const dx = (x - cx) * 2.16; // 13/6 aspect ratio correction
        const dy = y - cy;
        if (dx * dx + dy * dy <= radius * radius) {
          continue;
        }
        this.setPixel(x, y, char, depth);
      }
    }
  }

  drawLargeText(x, y, text, depth = 0) {
    text = text.toUpperCase();
    let xOffset = 0;

    for (const char of text) {
      const charToUse = FrameBuffer.FIGLET_FONT[char] ? char : ' ';
      const charLines = FrameBuffer.FIGLET_FONT[charToUse];

      for (let rowIdx = 0; rowIdx < charLines.length; rowIdx++) {
        const line = charLines[rowIdx];
        for (let colIdx = 0; colIdx < line.length; colIdx++) {
          if (line[colIdx] !== ' ') {
            this.setPixel(x + xOffset + colIdx, y + rowIdx, line[colIdx], depth);
          }
        }
      }

      xOffset += 6; // 5 character width + 1 space
    }
  }

  drawLargeTextCentered(y, text, depth = 0) {
    const textWidth = text.length * 6;
    const x = Math.floor((this.width - textWidth) / 2);
    this.drawLargeText(x, y, text, depth);
  }

  blit() {
    // Move cursor to top-left
    process.stdout.write('\x1b[H');

    // Write the buffer with colors
    const RESET = '\x1b[0m';
    for (let y = 0; y < this.height; y++) {
      let line = '';
      let currentColor = null;
      for (let x = 0; x < this.width; x++) {
        const char = this.buffer[y][x];
        const color = this.colorBuffer[y][x];

        if (color !== currentColor) {
          if (color) {
            const ansi = this.hexToAnsi(color);
            if (ansi) {
              line += ansi;
            }
          } else if (currentColor) {
            line += RESET;
          }
          currentColor = color;
        }
        line += char;
      }
      if (currentColor) {
        line += RESET;
      }
      process.stdout.write(line + '\n');
    }
  }

  getFrameString() {
    return this.buffer.map(row => row.join('')).join('\n');
  }
}

class AnimationEngine {
  constructor(width = null, height = null) {
    if (width === null || height === null) {
      this.width = width || process.stdout.columns || 80;
      this.height = height || (process.stdout.rows || 24) - 2;
    } else {
      this.width = width;
      this.height = height;
    }

    this.fb = new FrameBuffer(this.width, this.height);
    this.frameCount = 0;
  }

  clearScreen() {
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[H');
  }

  hideCursor() {
    process.stdout.write('\x1b[?25l');
  }

  showCursor() {
    process.stdout.write('\x1b[?25h');
  }

  renderFrame(frameFunc, frameNum, fps = 24) {
    this.fb.clear();
    frameFunc(this.fb, frameNum);
    this.fb.blit();
    return new Promise(resolve => setTimeout(resolve, 1000 / fps));
  }

  async playAnimation(frameFunc, numFrames, fps = 24) {
    this.clearScreen();
    this.hideCursor();

    try {
      for (let i = 0; i < numFrames; i++) {
        await this.renderFrame(frameFunc, i, fps);
        this.frameCount++;
      }
    } finally {
      this.showCursor();
    }
  }
}

// Utility functions for common patterns
function interpolate(start, end, t) {
  return start + (end - start) * t;
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function rotatePoint(x, y, cx, cy, angle) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const dx = x - cx;
  const dy = y - cy;
  return [
    cx + dx * cosA - dy * sinA,
    cy + dx * sinA + dy * cosA
  ];
}

export {
  Point,
  FrameBuffer,
  AnimationEngine,
  interpolate,
  easeInOut,
  rotatePoint
};
