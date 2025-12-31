# Playwright Plugin Update Protection

## Problem
Plugin updates from `claude-plugins-official` can overwrite your custom Playwright configuration, breaking:
- Custom user-data-dir (your Chromium profile)
- Custom launch script with privacy flags
- Mode switching (launch vs connect)

## Solution

### Quick Fix After Update
If a plugin update breaks your Playwright config, run:
```bash
~/.claude/plugins/playwright-config-lock.sh
```

Then restart Claude Code.

## What Got Fixed

### 1. Playwright Mode Restored
**Before (broken)**: Connect mode - tries to connect to port 9222
```json
{
  "playwright": {
    "args": ["--browser", "chromium", "--connect-over-cdp", "http://localhost:9222"]
  }
}
```

**After (fixed)**: Launch mode - uses your custom script
```json
{
  "playwright": {
    "args": ["--executable-path", "~/Library/Application Support/Chromium/scripts/chromium-degoogled.sh",
             "--user-data-dir", "~/Library/Application Support/Chromium"]
  }
}
```

### 2. Custom Script Enhanced
Your script at `~/Library/Application Support/Chromium/scripts/chromium-degoogled.sh` now includes:

**Added Privacy Flags:**
- ✅ `--fingerprinting-canvas-image-data-noise`
- ✅ `--fingerprinting-canvas-measuretext-noise`
- ✅ `--fingerprinting-client-rects-noise`
- ✅ `--force-punycode-hostnames`
- ✅ `--webrtc-ip-handling-policy=disable_non_proxied_udp`
- ✅ `--enable-features=NoReferrers,ReducedSystemInfo,RemoveClientHints,SpoofWebGLInfo`

**Preserved Settings:**
- ✅ `--user-data-dir="$HOME/Library/Application Support/Chromium"` (your profile)
- ✅ `--remote-debugging-port=9222` (for debugging)
- ✅ All your original privacy flags

## Prevention for Future Updates

### Method 1: Git Track Your Config
```bash
cd ~/.claude/plugins/cache/claude-plugins-official/playwright
git init
git add .
git commit -m "Custom Playwright config"
```

When updates happen:
```bash
cd ~/.claude/plugins/cache/claude-plugins-official/playwright
git status  # See what changed
git diff    # Review changes
git checkout -- .mcp.json  # Restore if needed
```

### Method 2: Create Symlink (Advanced)
```bash
# Backup your config
cp ~/.claude/plugins/cache/claude-plugins-official/playwright/abe5cc9eae37/.mcp.json \
   ~/.claude/playwright-config-backup.json

# After update, create symlink
ln -sf ~/.claude/playwright-config-backup.json \
       ~/.claude/plugins/cache/claude-plugins-official/playwright/*/\.mcp.json
```

### Method 3: Fork the Plugin
Fork https://github.com/pannous/claude-plugins-official and:
1. Make your changes in the fork
2. Update CLAUDE.md to use your fork
3. Pull updates manually and merge

## Why This Happened

Plugin updates pull from `claude-plugins-official` repository, which:
1. May switch between connect/launch modes
2. May update default configurations
3. Doesn't preserve local customizations

The `.mcp.json.launch` and `.mcp.json.connect` files are templates, but the active `.mcp.json` gets overwritten.

## Verification

Check if your config is correct:
```bash
cat ~/.claude/plugins/cache/claude-plugins-official/playwright/*/\.mcp.json
```

Should show:
```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest",
      "--executable-path", "/Users/me/Library/Application Support/Chromium/scripts/chromium-degoogled.sh",
      "--user-data-dir", "/Users/me/Library/Application Support/Chromium"]
  }
}
```

Check your script:
```bash
cat ~/Library/Application\ Support/Chromium/scripts/chromium-degoogled.sh
```

Should include anti-fingerprinting flags.

## Two Modes Explained

### Launch Mode (What You Want)
- Playwright launches Chromium using your script
- Uses your existing profile and extensions
- All your privacy flags applied
- Browser closes when Playwright finishes

**Use when**: You want Playwright to control the browser lifecycle

### Connect Mode
- You manually start Chromium first
- Playwright connects to running browser via CDP (port 9222)
- Browser stays open after Playwright finishes

**Use when**: You want to inspect browser state after automation

## Switch Modes Manually

```bash
cd ~/.claude/plugins/cache/claude-plugins-official/playwright/abe5cc9eae37

# Use launch mode (recommended)
cp .mcp.json.launch .mcp.json

# Or use connect mode
cp .mcp.json.connect .mcp.json
```

Then restart Claude Code.

## Custom Script Location

Your custom script: `~/Library/Application Support/Chromium/scripts/chromium-degoogled.sh`

This file is **safe from plugin updates** because it's in your Chromium data directory, not the plugin directory.

## Post-Update Checklist

After any plugin update, verify:
- [ ] `.mcp.json` is in launch mode
- [ ] `--executable-path` points to your script
- [ ] `--user-data-dir` points to your profile
- [ ] Custom script exists and is executable
- [ ] Custom script has anti-fingerprinting flags

Quick check:
```bash
~/.claude/plugins/playwright-config-lock.sh
```

## Merge Conflicts

To avoid merge conflicts with upstream, keep your changes in:
1. **Custom script** (`~/Library/Application Support/Chromium/scripts/chromium-degoogled.sh`)
   - This is outside the plugin directory
   - Never touched by updates

2. **Mode selection** (`.mcp.json`)
   - Use the lock script to restore after updates
   - Or manually `cp .mcp.json.launch .mcp.json`

Don't modify the plugin's JavaScript/TypeScript code directly.

## Troubleshooting

### Plugin update broke Playwright
```bash
~/.claude/plugins/playwright-config-lock.sh
# Then restart Claude Code
```

### Browser won't launch
Check script is executable:
```bash
chmod +x ~/Library/Application\ Support/Chromium/scripts/chromium-degoogled.sh
```

### Profile not loading
Verify path in .mcp.json matches:
```bash
ls -la ~/Library/Application\ Support/Chromium/
```

### Want to use connect mode instead
```bash
# Terminal 1: Start browser manually
~/Library/Application\ Support/Chromium/scripts/chromium-degoogled.sh

# Terminal 2: Switch to connect mode
cd ~/.claude/plugins/cache/claude-plugins-official/playwright/abe5cc9eae37
cp .mcp.json.connect .mcp.json

# Restart Claude Code
```

## Summary

✅ **Fixed**: Playwright now uses your custom script with full profile
✅ **Enhanced**: Added anti-fingerprinting flags to your script
✅ **Protected**: Created lock script to restore config after updates
✅ **Documented**: This guide for future reference

Run after any plugin update that breaks config:
```bash
~/.claude/plugins/playwright-config-lock.sh
```
