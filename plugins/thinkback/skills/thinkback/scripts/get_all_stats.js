#!/usr/bin/env node
/* eslint-disable custom-rules/no-console-new-code, custom-rules/no-process-exit, custom-rules/no-top-level-side-effects */
/**
 * Unified statistics extraction for Thinkback
 *
 * Consolidates git commits, session data, and time patterns into a single
 * narrative-friendly JSON output. Designed to work on any user's machine.
 *
 * Usage:
 *   node get_all_stats.js              # Full output as JSON
 *   node get_all_stats.js --git-only   # Just git stats
 *   node get_all_stats.js --recent-only # Just session stats (recent ~30 days)
 *   node get_all_stats.js --markdown   # Also write detailed markdown report
 *   node get_all_stats.js --markdown-path=/path/to/output.md
 *   node get_all_stats.js --help
 */

import { execFile, execFileSync } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

// =============================================================================
// ARGUMENT PARSING
// =============================================================================

function parseArgs(argv) {
  const args = {
    mode: 'all',
    help: false,
    markdown: false,
    markdownPath: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--markdown-path=')) {
      args.markdown = true;
      args.markdownPath = arg.slice('--markdown-path='.length);
    } else {
      switch (arg) {
        case '--git-only':
          args.mode = 'git';
          break;
        case '--recent-only':
          args.mode = 'recent';
          break;
        case '--markdown':
          args.markdown = true;
          break;
        case '--help':
        case '-h':
          args.help = true;
          break;
      }
    }
  }

  return args;
}

// =============================================================================
// GIT USER IDENTITY
// =============================================================================

function getGitUser() {
  try {
    const name = execFileSync('git', ['config', 'user.name'], { encoding: 'utf-8' }).trim();
    const email = execFileSync('git', ['config', 'user.email'], { encoding: 'utf-8' }).trim();
    return { name, email };
  } catch {
    return { name: null, email: null };
  }
}

// =============================================================================
// REPO DISCOVERY (from ~/.claude/projects/ folder names)
// =============================================================================

function pathExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function folderNameToPath(folderName) {
  if (!folderName.startsWith('-')) {
    return folderName.replace(/-/g, '/');
  }

  const parts = folderName.slice(1).split('-');
  let currentPath = '';
  let i = 0;

  while (i < parts.length) {
    let found = false;
    for (let len = parts.length - i; len >= 1; len--) {
      const segment = parts.slice(i, i + len).join('-');
      const testPath = currentPath + '/' + segment;
      if (pathExists(testPath)) {
        currentPath = testPath;
        i += len;
        found = true;
        break;
      }
    }
    if (!found) {
      currentPath += '/' + parts[i];
      i++;
    }
  }

  return currentPath;
}

function findGitRoot(dirPath) {
  // Resolve to absolute path to avoid infinite loops with relative paths
  let current = path.resolve(dirPath);
  const root = path.parse(current).root;

  while (current !== root) {
    const gitPath = path.join(current, '.git');
    try {
      if (fs.existsSync(gitPath)) {
        return current;
      }
    } catch {
      // Permission denied
    }
    const parent = path.dirname(current);
    // Safety check: stop if we're not making progress
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}

function discoverReposFromProjects() {
  const claudeProjectsDir = path.join(os.homedir(), '.claude', 'projects');

  if (!fs.existsSync(claudeProjectsDir)) {
    return [];
  }

  const folderNames = fs.readdirSync(claudeProjectsDir);
  const gitRepos = new Set();

  for (const folderName of folderNames) {
    const decodedPath = folderNameToPath(folderName);
    if (!pathExists(decodedPath)) continue;

    const gitRoot = findGitRoot(decodedPath);
    if (gitRoot) {
      gitRepos.add(gitRoot);
    }
  }

  return [...gitRepos].sort();
}

// Fallback: scan ~/code for git repos
function findGitReposInPath(searchPath) {
  const repos = [];

  function walk(dir, depth = 0) {
    if (depth > 5) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.') && entry.name !== '.git') continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.name === '.git') {
          repos.push(dir);
          return;
        }

        if (['node_modules', 'vendor', 'dist', 'build', '.next'].includes(entry.name)) {
          continue;
        }

        walk(fullPath, depth + 1);
      }
    } catch {
      // Permission denied
    }
  }

  walk(searchPath);
  return repos;
}

// =============================================================================
// GIT COMMIT EXTRACTION
// =============================================================================

async function getClaudeCommitsFromRepo(repoPath, author) {
  const gitArgs = [
    '-C', repoPath,
    'log', '--all',
    '--grep=Co-Authored-By: Claude',
    '--format=%H|%ai|%aI|%s',
  ];

  if (author) {
    gitArgs.push(`--author=${author}`);
  }

  try {
    const { stdout } = await execFileAsync('git', gitArgs, { maxBuffer: 10 * 1024 * 1024 });
    const lines = stdout.trim().split('\n').filter(line => line);

    return lines.map(line => {
      const [hash, dateStr, isoDate, ...subjectParts] = line.split('|');
      const subject = subjectParts.join('|');
      const date = new Date(isoDate);
      return {
        hash,
        date,
        dateStr,
        subject,
        repo: path.basename(repoPath),
        repoPath,
      };
    });
  } catch {
    return [];
  }
}

function aggregateGitStats(commits) {
  if (commits.length === 0) {
    return {
      totalCommits: 0,
      firstCommit: null,
      lastCommit: null,
      repos: {},
      repoCount: 0,
      byMonth: {},
      byDayOfWeek: { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 },
      byHour: {},
      peakHour: null,
      peakDay: null,
      topRepos: [],
    };
  }

  // Dedupe commits by hash (worktrees share commits)
  const seenHashes = new Set();
  const uniqueCommits = [];
  for (const commit of commits) {
    if (!seenHashes.has(commit.hash)) {
      seenHashes.add(commit.hash);
      uniqueCommits.push(commit);
    }
  }

  uniqueCommits.sort((a, b) => a.date - b.date);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const repos = {};
  const byMonth = {};
  const byDayOfWeek = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const byHour = {};

  for (const commit of uniqueCommits) {
    repos[commit.repo] = (repos[commit.repo] || 0) + 1;

    const month = commit.date.toISOString().slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;

    const day = dayNames[commit.date.getDay()];
    byDayOfWeek[day]++;

    const hour = commit.date.getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;
  }

  // Sort repos by count
  const sortedRepos = Object.fromEntries(
    Object.entries(repos).sort((a, b) => b[1] - a[1])
  );

  // Find peak hour
  let peakHour = null;
  let maxHourCount = 0;
  for (const [hour, count] of Object.entries(byHour)) {
    if (count > maxHourCount) {
      maxHourCount = count;
      peakHour = { hour: parseInt(hour), count, label: formatHour(parseInt(hour)) };
    }
  }

  // Find peak day
  let peakDay = null;
  let maxDayCount = 0;
  for (const [day, count] of Object.entries(byDayOfWeek)) {
    if (count > maxDayCount) {
      maxDayCount = count;
      peakDay = { day, count };
    }
  }

  // Top 5 repos
  const topRepos = Object.entries(sortedRepos)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    totalCommits: uniqueCommits.length,
    firstCommit: {
      date: uniqueCommits[0].dateStr,
      repo: uniqueCommits[0].repo,
      subject: uniqueCommits[0].subject,
    },
    lastCommit: {
      date: uniqueCommits[uniqueCommits.length - 1].dateStr,
      repo: uniqueCommits[uniqueCommits.length - 1].repo,
      subject: uniqueCommits[uniqueCommits.length - 1].subject,
    },
    repos: sortedRepos,
    repoCount: Object.keys(repos).length,
    byMonth,
    byDayOfWeek,
    byHour,
    peakHour,
    peakDay,
    topRepos,
  };
}

// =============================================================================
// SESSION FILE PROCESSING (No tool uses - per user request)
// =============================================================================

function findSessionFiles() {
  const claudeDir = path.join(os.homedir(), '.claude', 'projects');
  const sessionFiles = [];

  if (!fs.existsSync(claudeDir)) {
    return sessionFiles;
  }

  const projects = fs.readdirSync(claudeDir);

  for (const project of projects) {
    const projectDir = path.join(claudeDir, project);
    const stat = fs.statSync(projectDir);
    if (!stat.isDirectory()) continue;

    const files = fs.readdirSync(projectDir);
    for (const file of files) {
      if (file.endsWith('.jsonl')) {
        sessionFiles.push({
          project,
          path: path.join(projectDir, file),
          filename: file,
        });
      }
    }
  }

  return sessionFiles;
}

function parseSessionFile(filePath) {
  const stats = {
    userMessages: 0,
    assistantMessages: 0,
    timestamps: [],
    firstTimestamp: null,
    lastTimestamp: null,
  };

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return stats;
  }

  const lines = content.split('\n').filter(line => line.trim());

  for (const line of lines) {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }

    if (msg.timestamp) {
      const msgDate = new Date(msg.timestamp);
      stats.timestamps.push(msgDate);

      if (!stats.firstTimestamp || msgDate < stats.firstTimestamp) {
        stats.firstTimestamp = msgDate;
      }
      if (!stats.lastTimestamp || msgDate > stats.lastTimestamp) {
        stats.lastTimestamp = msgDate;
      }
    }

    if (msg.type === 'user') {
      stats.userMessages++;
    } else if (msg.type === 'assistant') {
      stats.assistantMessages++;
    }
  }

  return stats;
}

// =============================================================================
// DETAILED SESSION MESSAGE EXTRACTION (for markdown report)
// =============================================================================

function extractRecentMessages(filePath, limit = 10) {
  const messages = [];

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return messages;
  }

  const lines = content.split('\n').filter(line => line.trim());

  for (const line of lines) {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }

    if (msg.type === 'user' && msg.message?.content) {
      // Extract text content from user message
      let text = '';
      if (typeof msg.message.content === 'string') {
        text = msg.message.content;
      } else if (Array.isArray(msg.message.content)) {
        text = msg.message.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join(' ');
      }

      if (text.trim()) {
        messages.push({
          type: 'user',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : null,
          text: text.slice(0, 500), // Truncate long messages
        });
      }
    }
  }

  // Return only the most recent messages
  return messages.slice(-limit);
}

function getRecentMessagesPerProject() {
  const claudeDir = path.join(os.homedir(), '.claude', 'projects');
  const projectMessages = {};

  if (!fs.existsSync(claudeDir)) {
    return projectMessages;
  }

  const projects = fs.readdirSync(claudeDir);

  for (const project of projects) {
    const projectDir = path.join(claudeDir, project);
    try {
      const stat = fs.statSync(projectDir);
      if (!stat.isDirectory()) continue;
    } catch {
      continue;
    }

    const files = fs.readdirSync(projectDir);
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));

    // Get the most recent session file
    let mostRecentFile = null;
    let mostRecentTime = 0;

    for (const file of jsonlFiles) {
      const filePath = path.join(projectDir, file);
      try {
        const fileStat = fs.statSync(filePath);
        if (fileStat.mtimeMs > mostRecentTime) {
          mostRecentTime = fileStat.mtimeMs;
          mostRecentFile = filePath;
        }
      } catch {
        continue;
      }
    }

    if (mostRecentFile) {
      const decodedProject = decodeProjectName(project);
      const messages = extractRecentMessages(mostRecentFile, 5);
      if (messages.length > 0) {
        projectMessages[decodedProject] = {
          encodedName: project,
          messages,
          lastActive: new Date(mostRecentTime),
        };
      }
    }
  }

  return projectMessages;
}

// =============================================================================
// TIME PATTERN HELPERS
// =============================================================================

function formatHour(hour) {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekDateRange(isoWeek) {
  const [year, week] = isoWeek.split('-W').map(Number);
  const jan1 = new Date(year, 0, 1);
  const days = (week - 1) * 7;
  const weekStart = new Date(jan1.getTime() + days * 86400000);
  const dayOfWeek = weekStart.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + diff);
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${year}`;
}

// =============================================================================
// SESSION STATS AGGREGATION
// =============================================================================

function aggregateSessionStats(sessionFiles) {
  const sessions = [];
  const projectStats = {};
  const hourCounts = Array(24).fill(0);
  const weekdayCounts = Array(7).fill(0);
  const daySessions = {};
  const weekSessions = {};
  let totalUserMessages = 0;
  let totalAssistantMessages = 0;
  let firstTimestamp = null;
  let lastTimestamp = null;

  for (const sessionFile of sessionFiles) {
    const stats = parseSessionFile(sessionFile.path);

    if (stats.timestamps.length === 0) continue;

    const session = {
      project: sessionFile.project,
      filename: sessionFile.filename,
      messages: stats.userMessages + stats.assistantMessages,
      userMessages: stats.userMessages,
      assistantMessages: stats.assistantMessages,
      firstTimestamp: stats.firstTimestamp,
      lastTimestamp: stats.lastTimestamp,
      duration: stats.lastTimestamp - stats.firstTimestamp,
    };

    sessions.push(session);
    totalUserMessages += stats.userMessages;
    totalAssistantMessages += stats.assistantMessages;

    // Track per-project stats
    if (!projectStats[sessionFile.project]) {
      projectStats[sessionFile.project] = { sessions: 0, messages: 0 };
    }
    projectStats[sessionFile.project].sessions++;
    projectStats[sessionFile.project].messages += session.messages;

    // Track timestamps
    if (!firstTimestamp || stats.firstTimestamp < firstTimestamp) {
      firstTimestamp = stats.firstTimestamp;
    }
    if (!lastTimestamp || stats.lastTimestamp > lastTimestamp) {
      lastTimestamp = stats.lastTimestamp;
    }

    // Track hourly/weekday patterns
    const hour = stats.firstTimestamp.getHours();
    const weekday = stats.firstTimestamp.getDay();
    hourCounts[hour]++;
    weekdayCounts[weekday]++;

    // Track daily sessions
    const dateStr = formatDate(stats.firstTimestamp);
    daySessions[dateStr] = (daySessions[dateStr] || 0) + 1;

    // Track weekly sessions
    const weekStr = getISOWeek(stats.firstTimestamp);
    if (!weekSessions[weekStr]) {
      weekSessions[weekStr] = { sessions: 0, messages: 0 };
    }
    weekSessions[weekStr].sessions++;
    weekSessions[weekStr].messages += session.messages;
  }

  // Sort projects by session count and decode names
  const topProjects = Object.entries(projectStats)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, 5)
    .map(([name]) => {
      // Decode the folder name to get the actual path, then extract the last part
      const decoded = folderNameToPath(name);
      return path.basename(decoded);
    });

  return {
    sessions,
    projectStats,
    hourCounts,
    weekdayCounts,
    daySessions,
    weekSessions,
    totalUserMessages,
    totalAssistantMessages,
    firstTimestamp,
    lastTimestamp,
    topProjects,
  };
}

// =============================================================================
// PATTERN CALCULATIONS
// =============================================================================

function calculatePatterns(data) {
  const totalSessions = data.sessions.length;

  // Hourly patterns
  let peakHour = { hour: 0, label: '12am', sessions: 0 };
  let quietestHour = { hour: 0, label: '12am', sessions: Infinity };

  for (let hour = 0; hour < 24; hour++) {
    const count = data.hourCounts[hour];
    if (count > peakHour.sessions) {
      peakHour = { hour, label: formatHour(hour), sessions: count };
    }
    if (count < quietestHour.sessions) {
      quietestHour = { hour, label: formatHour(hour), sessions: count };
    }
  }

  // Weekly patterns
  let busiestDay = { name: 'Monday', sessions: 0 };
  let quietestDay = { name: 'Monday', sessions: Infinity };

  for (let day = 0; day < 7; day++) {
    const count = data.weekdayCounts[day];
    const name = getDayName(day);
    if (count > busiestDay.sessions) {
      busiestDay = { name, sessions: count };
    }
    if (count < quietestDay.sessions) {
      quietestDay = { name, sessions: count };
    }
  }

  // Night owl (10pm - 4am)
  const nightHours = [22, 23, 0, 1, 2, 3];
  const nightSessions = nightHours.reduce((sum, h) => sum + data.hourCounts[h], 0);

  let latestSession = null;
  let latestHour = -1;
  for (const session of data.sessions) {
    const hour = session.firstTimestamp.getHours();
    const nightHour = hour < 6 ? hour + 24 : hour;
    if (nightHour >= 22 && nightHour > latestHour) {
      latestHour = nightHour;
      latestSession = session;
    }
  }

  // Early bird (5am - 8am)
  const earlyHours = [5, 6, 7, 8];
  const earlySessions = earlyHours.reduce((sum, h) => sum + data.hourCounts[h], 0);

  let earliestSession = null;
  let earliestHour = 24;
  for (const session of data.sessions) {
    const hour = session.firstTimestamp.getHours();
    if (hour >= 5 && hour <= 8 && hour < earliestHour) {
      earliestHour = hour;
      earliestSession = session;
    }
  }

  // Weekend warrior
  const weekendSessions = data.weekdayCounts[6] + data.weekdayCounts[0];

  return {
    hourly: { peakHour, quietestHour },
    weekly: { busiestDay, quietestDay },
    nightOwl: {
      sessions: nightSessions,
      percentage: totalSessions > 0 ? Math.round((nightSessions / totalSessions) * 1000) / 10 : 0,
      latestTime: latestSession ? formatHour(latestSession.firstTimestamp.getHours()) : null,
    },
    earlyBird: {
      sessions: earlySessions,
      percentage: totalSessions > 0 ? Math.round((earlySessions / totalSessions) * 1000) / 10 : 0,
      earliestTime: earliestSession ? formatHour(earliestSession.firstTimestamp.getHours()) : null,
    },
    weekendWarrior: {
      percentage: totalSessions > 0 ? Math.round((weekendSessions / totalSessions) * 1000) / 10 : 0,
      saturdaySessions: data.weekdayCounts[6],
      sundaySessions: data.weekdayCounts[0],
    },
  };
}

// =============================================================================
// ACHIEVEMENTS CALCULATIONS
// =============================================================================

function calculateAchievements(data) {
  // Streaks
  const dates = Object.keys(data.daySessions).sort();
  let longestStreak = { days: 0, start: null, end: null };
  let currentStreak = { days: 0, start: null };

  if (dates.length > 0) {
    let tempStreak = { days: 1, start: dates[0], end: dates[0] };

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate - prevDate) / 86400000;

      if (diffDays === 1) {
        tempStreak.days++;
        tempStreak.end = dates[i];
      } else {
        if (tempStreak.days > longestStreak.days) {
          longestStreak = { ...tempStreak };
        }
        tempStreak = { days: 1, start: dates[i], end: dates[i] };
      }
    }

    if (tempStreak.days > longestStreak.days) {
      longestStreak = { ...tempStreak };
    }

    // Current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActiveDate = new Date(dates[dates.length - 1]);
    const daysSinceLastActive = Math.floor((today - lastActiveDate) / 86400000);

    if (daysSinceLastActive <= 1) {
      currentStreak.days = 1;
      currentStreak.start = dates[dates.length - 1];
      for (let i = dates.length - 2; i >= 0; i--) {
        const currDate = new Date(dates[i + 1]);
        const prevDate = new Date(dates[i]);
        if ((currDate - prevDate) / 86400000 === 1) {
          currentStreak.days++;
          currentStreak.start = dates[i];
        } else {
          break;
        }
      }
    }
  }

  // Marathon days (5+ sessions)
  const marathonDays = Object.entries(data.daySessions)
    .filter(([, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1]);

  // Busiest week
  let busiestWeek = null;
  const weeks = Object.entries(data.weekSessions);
  if (weeks.length > 0) {
    const busiest = weeks.reduce((max, [week, stats]) =>
      stats.sessions > (max[1]?.sessions || 0) ? [week, stats] : max, [null, { sessions: 0 }]);

    if (busiest[0]) {
      busiestWeek = {
        week: busiest[0],
        dates: getWeekDateRange(busiest[0]),
        sessions: busiest[1].sessions,
        messages: busiest[1].messages,
      };
    }
  }

  return {
    longestStreak: longestStreak.days > 0 ? longestStreak : null,
    currentStreak: currentStreak.days > 0 ? currentStreak : null,
    totalActiveDays: dates.length,
    marathonDays: {
      count: marathonDays.length,
      maxSessions: marathonDays.length > 0 ? marathonDays[0][1] : 0,
    },
    busiestWeek,
  };
}

// =============================================================================
// SUPERLATIVES
// =============================================================================

function decodeProjectName(encodedName) {
  const decoded = folderNameToPath(encodedName);
  return path.basename(decoded);
}

function calculateSuperlatives(data) {
  if (data.sessions.length === 0) {
    return {
      longestSession: null,
      firstSession: null,
      lastSession: null,
    };
  }

  const sortedByMessages = [...data.sessions].sort((a, b) => b.messages - a.messages);
  const sortedByTime = [...data.sessions].sort((a, b) => a.firstTimestamp - b.firstTimestamp);

  const longest = sortedByMessages[0];
  const first = sortedByTime[0];
  const last = sortedByTime[sortedByTime.length - 1];

  return {
    longestSession: {
      messages: longest.messages,
      date: formatDate(longest.firstTimestamp),
      project: decodeProjectName(longest.project),
    },
    firstSession: {
      date: formatDate(first.firstTimestamp),
      project: decodeProjectName(first.project),
    },
    lastSession: {
      date: formatDate(last.firstTimestamp),
      project: decodeProjectName(last.project),
    },
  };
}

// =============================================================================
// MARKDOWN GENERATION
// =============================================================================

async function getDetailedRepoData(repos, author) {
  // Run git log on all repos in parallel
  const results = await Promise.all(
    repos.map(async (repoPath) => {
      const repoName = path.basename(repoPath);

      // Get recent commits with Claude co-authoring
      const gitArgs = [
        '-C', repoPath,
        'log', '--all',
        '--grep=Co-Authored-By: Claude',
        '--format=%H|%ai|%s',
        '-n', '10', // Last 10 commits
      ];

      if (author) {
        gitArgs.push(`--author=${author}`);
      }

      try {
        const { stdout } = await execFileAsync('git', gitArgs, { maxBuffer: 10 * 1024 * 1024 });
        const lines = stdout.trim().split('\n').filter(line => line);

        const commits = lines.map(line => {
          const [hash, dateStr, ...subjectParts] = line.split('|');
          return {
            hash: hash.slice(0, 7),
            date: dateStr,
            subject: subjectParts.join('|'),
          };
        });

        if (commits.length > 0) {
          return [repoName, { path: repoPath, commits }];
        }
      } catch {
        // Skip repos with errors
      }
      return null;
    })
  );

  return Object.fromEntries(results.filter(Boolean));
}

function generateMarkdownReport(repoData, projectMessages, user) {
  const lines = [];

  lines.push('# Claude Code Activity Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  if (user.name) {
    lines.push(`User: ${user.name} <${user.email || 'no email'}>`);
  }
  lines.push('');

  // Repos and commits section
  lines.push('## Repositories with Claude Commits');
  lines.push('');

  const repoNames = Object.keys(repoData).sort();

  if (repoNames.length === 0) {
    lines.push('*No repositories found with Claude co-authored commits.*');
    lines.push('');
  } else {
    for (const repoName of repoNames) {
      const repo = repoData[repoName];
      lines.push(`### ${repoName}`);
      lines.push('');
      lines.push(`**Path:** \`${repo.path}\``);
      lines.push('');
      lines.push('**Recent commits with Claude:**');
      lines.push('');

      for (const commit of repo.commits) {
        lines.push(`- \`${commit.hash}\` (${commit.date.split(' ')[0]}): ${commit.subject}`);
      }
      lines.push('');
    }
  }

  // Session messages section
  lines.push('## Recent Session Messages by Project');
  lines.push('');

  const projectNames = Object.keys(projectMessages).sort();

  if (projectNames.length === 0) {
    lines.push('*No recent session messages found.*');
    lines.push('');
  } else {
    for (const projectName of projectNames) {
      const project = projectMessages[projectName];
      lines.push(`### ${projectName}`);
      lines.push('');
      lines.push(`**Last active:** ${project.lastActive.toISOString().split('T')[0]}`);
      lines.push('');
      lines.push('**Recent user messages:**');
      lines.push('');

      for (const msg of project.messages) {
        const dateStr = msg.timestamp ? msg.timestamp.toISOString().split('T')[0] : 'unknown';
        const truncatedText = msg.text.length > 200
          ? msg.text.slice(0, 200) + '…'
          : msg.text;
        // Escape any markdown-sensitive characters and format as blockquote
        const escapedText = truncatedText.replace(/\n/g, ' ').replace(/>/g, '\\>');
        lines.push(`- (${dateStr}) "${escapedText}"`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function writeMarkdownReport(outputPath) {
  const user = getGitUser();

  // Discover repos
  let repos = discoverReposFromProjects();
  if (repos.length === 0) {
    const defaultPath = path.join(os.homedir(), 'code');
    if (fs.existsSync(defaultPath)) {
      repos = findGitReposInPath(defaultPath);
    }
  }

  // Get detailed repo data
  const repoData = await getDetailedRepoData(repos, user.name);

  // Get recent messages per project
  const projectMessages = getRecentMessagesPerProject();

  // Generate markdown
  const markdown = generateMarkdownReport(repoData, projectMessages, user);

  // Determine output path - default to skill folder
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const finalPath = outputPath || path.join(scriptDir, 'activity-report.md');

  // Ensure directory exists
  const dir = path.dirname(finalPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(finalPath, markdown, 'utf-8');

  return finalPath;
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

async function getGitStats() {
  const user = getGitUser();

  // Try to discover repos from Claude projects first (faster)
  let repos = discoverReposFromProjects();

  // Fallback to filesystem scan if no repos found
  if (repos.length === 0) {
    const defaultPath = path.join(os.homedir(), 'code');
    if (fs.existsSync(defaultPath)) {
      repos = findGitReposInPath(defaultPath);
    }
  }

  // Fetch commits from all repos in parallel
  const commitArrays = await Promise.all(
    repos.map(repo => getClaudeCommitsFromRepo(repo, user.name))
  );

  const allCommits = commitArrays.flat();
  const stats = aggregateGitStats(allCommits);

  return {
    ...stats,
    reposScanned: repos.length,
  };
}

function getSessionStats() {
  const sessionFiles = findSessionFiles();
  const data = aggregateSessionStats(sessionFiles);

  return {
    totalSessions: data.sessions.length,
    totalProjects: Object.keys(data.projectStats).length,
    userMessages: data.totalUserMessages,
    assistantMessages: data.totalAssistantMessages,
    dateRange: {
      first: data.firstTimestamp ? formatDate(data.firstTimestamp) : null,
      last: data.lastTimestamp ? formatDate(data.lastTimestamp) : null,
    },
    topProjects: data.topProjects,
    patterns: calculatePatterns(data),
    achievements: calculateAchievements(data),
    superlatives: calculateSuperlatives(data),
    sessionFilesProcessed: sessionFiles.length,
  };
}

async function getAllStats() {
  const user = getGitUser();
  const gitStats = await getGitStats();
  const sessionStats = getSessionStats();

  return {
    user,
    git: gitStats,
    sessions: {
      totalSessions: sessionStats.totalSessions,
      totalProjects: sessionStats.totalProjects,
      userMessages: sessionStats.userMessages,
      assistantMessages: sessionStats.assistantMessages,
      dateRange: sessionStats.dateRange,
      topProjects: sessionStats.topProjects,
    },
    patterns: sessionStats.patterns,
    achievements: sessionStats.achievements,
    superlatives: sessionStats.superlatives,
    meta: {
      generatedAt: new Date().toISOString(),
      gitReposScanned: gitStats.reposScanned,
      sessionFilesProcessed: sessionStats.sessionFilesProcessed,
    },
  };
}

// =============================================================================
// CLI
// =============================================================================

function showHelp() {
  console.log(`
Unified statistics extraction for Thinkback

Consolidates git commits, session data, and time patterns into a single
narrative-friendly JSON output. Works on any user's machine.

Usage:
  node get_all_stats.js              # Full output as JSON
  node get_all_stats.js --git-only   # Just git stats (long-term)
  node get_all_stats.js --recent-only # Just session stats (recent ~30 days)
  node get_all_stats.js --markdown   # Also write markdown report to skill folder
  node get_all_stats.js --markdown-path=/path/to/output.md  # Write markdown to custom path
  node get_all_stats.js --help

Output includes:
  - User identity (git config)
  - Git stats: commits with Claude, repos, time patterns
  - Session stats: messages, projects (recent ~30 days)
  - Time patterns: night owl, early bird, weekend warrior
  - Achievements: streaks, marathon days, busiest week
  - Superlatives: longest session, first/last session

Markdown report includes:
  - Every repo with Claude co-authored commits
  - Recent commits per repo (up to 10)
  - Recent user messages per project (up to 5)
`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  let output;

  switch (args.mode) {
    case 'git':
      output = { user: getGitUser(), git: await getGitStats() };
      break;
    case 'recent':
      output = { user: getGitUser(), ...getSessionStats() };
      break;
    case 'all':
    default:
      output = await getAllStats();
      break;
  }

  console.log(JSON.stringify(output, null, 2));

  // Generate markdown report if requested
  if (args.markdown) {
    const reportPath = await writeMarkdownReport(args.markdownPath);
    console.error(`\nMarkdown report written to: ${reportPath}`);
  }
}

// Run CLI if executed directly
const isMain = process.argv[1]?.endsWith('get_all_stats.js');
if (isMain) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export { getAllStats, getGitStats, getSessionStats, getGitUser, writeMarkdownReport };
