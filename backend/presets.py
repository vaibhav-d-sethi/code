"""Loads the 20 preset questions."""
import json
from pathlib import Path

PRESET_FILE = Path(__file__).resolve().parent.parent / "data" / "presets.json"


def load_presets() -> list:
    return json.loads(PRESET_FILE.read_text(encoding="utf-8"))
