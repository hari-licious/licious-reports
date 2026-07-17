@AGENTS.md

## AI Chatbot WoW dashboard (`data/ai-chatbot-wow/raw.json`)

Rows are written by `ai-gh-chatbot/scripts/generate_wow_json.py` after each WoW run.

**Partial-week rows** are labelled with an asterisk (e.g. `"W7 Jul14-15*"`) when the script runs mid-week. When the week completes, the next run produces a full-week row with the same `weekShort` (e.g. `"W7 Jul14-20"`).

**If both coexist in raw.json the dashboard breaks** — `WEEKS` order determines `lastWeek`, so a stale partial row appended after the full row will make the KPI cards and charts show the wrong week.

`generate_wow_json.py` deduplicates by `(weekShort, variant, bucket)`, preferring the completed (no-asterisk) row. If you ever edit raw.json manually, ensure only one row exists per `(weekShort, variant, bucket)` combination.
