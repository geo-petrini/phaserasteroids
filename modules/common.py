"""Common module for the PhaserAsteroids server — constants and helpers."""

import json
from pathlib import Path

STATIC_DIR = Path(__file__).resolve().parent.parent / 'static'
COMPONENTS_DIR = STATIC_DIR / 'js' / 'components'

EXTRAS = ['accel', 'rotation', 'energyGen', 'recharge',
          'capacity', 'isTracking', 'particleColor', 'type']

CATEGORY_META = [
    {'key': 'hull',       'label': 'Hull',       'file': 'hull.json'},
    {'key': 'generators', 'label': 'Generators',  'file': 'generators.json'},
    {'key': 'thrusters',  'label': 'Thrusters',   'file': 'thrusters.json'},
    {'key': 'shields',    'label': 'Shields',     'file': 'shields.json'},
    {'key': 'weapons',    'label': 'Weapons',     'file': 'weapons.json'},
]


def load_components(category_key):
    """Load a single category JSON file; return list of items (empty on error)."""
    p = COMPONENTS_DIR / f'{category_key}.json'
    if not p.exists():
        return []
    with open(p, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_components(category_key, items):
    """Overwrite a category JSON file."""
    p = COMPONENTS_DIR / f'{category_key}.json'
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)


def all_fields(item):
    """Return every property of a component."""
    return {k: v for k, v in item.items()}


def coerce_val(val):
    """Try to convert a form string to int/float; return as-is on failure."""
    try:
        return int(val)
    except ValueError:
        pass
    try:
        return float(val)
    except ValueError:
        pass
    return val
