---
name: thinkback
description: Generate a personalized "Year in Review" ASCII animation script. Use when the user wants to create their Thinkback, year in review, or usage summary animation.
---

# Thinkback - Year in Review Generator

Generate a personalized ASCII art animation celebrating the user's year with Claude Code.

## Step 1: Determine Mode

Check if the user's request includes a mode parameter:

| Mode | Action |
|------|--------|
| `mode=generate` (default) | Continue to Step 2 |
| `mode=edit` | Read existing `./year_in_review.js`, ask what to change, make edits, then validate |
| `mode=fix` | Read existing `./year_in_review.js`, run validation, fix errors until it passes |
| `mode=regenerate` | Delete existing file, continue to Step 2 |

## Step 2: Extract Statistics

Run the stats script from the skill folder root:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/skills/thinkback && node scripts/get_all_stats.js --markdown
```

The `--markdown` flag also generates `activity-report.md` with:
- Every repo with Claude co-authored commits
- Recent commits per repo (up to 10)
- Recent user messages per project (up to 5)

## Step 3: Read the Activity Report

Read `activity-report.md` to understand the user's reposistories and what they're working on.

## Step 4: Interview the User

Use the AskUserQuestion tool to ask these questions. 
```json
  {
    "questions": [
      {
        "question": "How would you like to generate your Thinkback?",
        "header": "Generation",
        "options": [
          {
            "label": "Quick Generation (Recommended for Pro Users)",
            "description": "Uses pre-built templates with your stats injected. Faster, uses fewer tokens."
          },
          {
            "label": "Deep Ddive",
            "description": "Analyzes your projects, commits, and conversations to create a personalized narrative. Uses more tokens, takes longer."
          }
        ],
        "multiSelect": false
      },
      {
        "question": "What vibe should your Thinkback have?",
        "header": "Vibe",
        "options": [
          {
            "label": "Cozy",
            "description": "Warm and gentle, like a fireplace evening"
          },
          {
            "label": "Awards show",
            "description": "Glamorous ceremony with envelope reveals"
          },
          {
            "label": "Morning news",
            "description": "Upbeat broadcast with breaking news energy"
          },
          {
            "label": "RPG Quest",
            "description": "Epic adventure with quests and level ups"
          }
        ],
        "multiSelect": false
      },
      {
        "question": "Which projects should we include from your Thinkback? Consider if you want to share this more publicly.",
        "header": "Include - pt 1",
        "options": [
          {
            "label": "Project 1",
            "description": "Project Description"
          },
          {
            "label": "Project 2",
            "description": "Project Description"
          },
                    {
            "label": "Project 3",
            "description": "Project Description"
          },
          {
            "label": "Project 4",
            "description": "Project Description"
          },
        ],
        ],
        "multiSelect": true
      },
      {
        "question": "Which projects should we include from your Thinkback? Consider if you want to share this more publicly.",
        "header": "Include - pt 2",
        "options": [
          {
            "label": "Project 5",
            "description": "Project Description"
          },
          {
            "label": "Project 6",
            "description": "Project Description"
          },
        ],
        "multiSelect": true
      }
    ]
  }
```

Question #1 and Question #2 are the same for every user, use this wording EXACTLY.

For Question #3, select potential projects OR repos that you want to highlight but might be sensitive.
If you have more than 4 options, you can use multiple questions (e.g. have a question 4 and 5).


## Step 5: Load the Appropriate Instructions

Based on Question 2 response:

### If "Deep dive" selected:
Read and follow instructions in: `high_token_version.md`

This mode:
- Extracts detailed stats
- Reads activity reports
- Spins off subagents to analyze repos and transcripts
- Creates a deeply personalized narrative

### If "Quick generation" selected:
Read and follow instructions in: `low_token_version.md`

This mode:
- Extracts stats
- Uses pre-built templates based on vibe selection
- Injects stats into template
- Fast and token-efficient

## Vibe Reference Files

Load the appropriate vibe guide based on Question 1:
- `vibes/cozy-vibe.md` - Warm, nurturing, unhurried aesthetic
- `vibes/awards-show-vibe.md` - Glamorous ceremony, envelope reveals
- `vibes/morning-news-vibe.md` - Cheerful broadcast, breaking news
- `vibes/rpg-quest-vibe.md` - Epic adventure, quests, level ups
- `vibes/other-vibe.md` - If they enter free text input