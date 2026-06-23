"""
Run this to pull the latest analysis outputs into the dashboard data folder.
Usage: python refresh.py
"""

import glob
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # Projects/

SOURCES = {
    "ai_chatbot": {
        "chatbot_metrics.csv": ROOT / "ai-gh-chatbot/outputs/chatbot_metrics_2026-01_to_2026-06_*.csv",
        "gh_analysis.csv":     ROOT / "ai-gh-chatbot/outputs/gh_analysis_2026-04_to_2026-06_*.csv",
        "retention.csv":       ROOT / "ai-gh-chatbot/outputs/chatbot_retention_split_*.csv",
    },
}


def latest(pattern: str) -> Path | None:
    files = glob.glob(str(pattern))
    return Path(max(files, key=os.path.getmtime)) if files else None


def refresh():
    for project, files in SOURCES.items():
        dest_dir = Path(__file__).resolve().parent / "data" / project
        dest_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n{project}/")
        for dest_name, pattern in files.items():
            src = latest(pattern)
            if src is None:
                print(f"  {dest_name}: NOT FOUND ({pattern})")
                continue
            dest = dest_dir / dest_name
            shutil.copy2(src, dest)
            print(f"  {dest_name} ← {src.name}")

    print("\nDone. Run: git add data/ && git commit -m 'refresh data' && git push")


if __name__ == "__main__":
    refresh()
