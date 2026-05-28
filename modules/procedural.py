"""Procedural world generation — seeded RNG + manifest builder."""

import json
import random
from pathlib import Path

CONFIG_DIR = Path(__file__).resolve().parent.parent / 'config'
CONFIG_PATH = CONFIG_DIR / 'procedural.json'
DATA_DIR = Path(__file__).resolve().parent.parent / 'data'
SESSIONS_DIR = DATA_DIR / 'sessions'


def load_config():
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_config(cfg):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, indent=2)


def _rng(seed):
    r = random.Random(seed)
    return r


def _pick(r, seq):
    return seq[r.randint(0, len(seq) - 1)]


def _rand_range(r, lo, hi):
    if lo >= hi:
        return lo
    return r.uniform(lo, hi)


def generate_world(seed=None, config=None):
    if config is None:
        config = load_config()
    if seed is None:
        seed = random.randint(0, 2**31 - 1)

    r = _rng(seed)
    w = config['world']
    a_cfg = config['asteroids']
    s_cfg = config['stars']
    n_cfg = config['nebula']
    p_cfg = config['planets']
    g_cfg = config['galaxies']
    e_cfg = config['eyes']

    def rand_pos(margin=50):
        return {
            'x': round(r.uniform(margin, w['width'] - margin), 1),
            'y': round(r.uniform(margin, w['height'] - margin), 1),
        }

    def rand_vel():
        angle = r.uniform(0, 6.2832)
        speed = _rand_range(r, a_cfg['minSpeed'], a_cfg['maxSpeed'])
        return {
            'vx': round(speed * __import__('math').cos(angle), 2),
            'vy': round(speed * __import__('math').sin(angle), 2),
        }

    asteroids = []
    for _ in range(a_cfg['count']):
        pos = rand_pos(100)
        vel = rand_vel()
        radius = round(_rand_range(r, a_cfg['minRadius'], a_cfg['maxRadius']), 1)
        hue = _pick(r, a_cfg['colorHues'])
        asteroids.append({
            'x': pos['x'],
            'y': pos['y'],
            'vx': vel['vx'],
            'vy': vel['vy'],
            'radius': radius,
            'hue': hue,
            'sat': a_cfg['colorSat'],
            'light': a_cfg['colorLight'],
            'seed': r.randint(0, 2**16 - 1),
        })

    stars_layers = []
    for layer in range(s_cfg['parallaxLayers']):
        points = []
        for _ in range(s_cfg['count']):
            pos = rand_pos(0)
            rad = round(_rand_range(r, s_cfg['minRadius'], s_cfg['maxRadius']), 1)
            points.append({
                'x': pos['x'],
                'y': pos['y'],
                'radius': rad,
                'brightness': r.randint(100, 255),
            })
        stars_layers.append(points)

    nebula_list = []
    for _ in range(n_cfg['count']):
        pos = rand_pos(200)
        palette = _pick(r, n_cfg['palettes'])
        nebula_list.append({
            'x': pos['x'],
            'y': pos['y'],
            'radius': round(_rand_range(r, n_cfg['minRadius'], n_cfg['maxRadius']), 1),
            'palette': palette,
            'seed': r.randint(0, 2**16 - 1),
        })

    planets = []
    for _ in range(p_cfg['count']):
        pos = rand_pos(200)
        palette = _pick(r, p_cfg['palettes'])
        planets.append({
            'x': pos['x'],
            'y': pos['y'],
            'radius': round(_rand_range(r, p_cfg['minRadius'], p_cfg['maxRadius']), 1),
            'palette': palette,
            'seed': r.randint(0, 2**16 - 1),
        })

    galaxies = []
    for _ in range(g_cfg['count']):
        pos = rand_pos(200)
        galaxies.append({
            'x': pos['x'],
            'y': pos['y'],
            'radius': round(_rand_range(r, g_cfg['minRadius'], g_cfg['maxRadius']), 1),
            'seed': r.randint(0, 2**16 - 1),
        })

    eyes = []
    for _ in range(e_cfg['count']):
        pos = rand_pos(100)
        eyes.append({
            'x': pos['x'],
            'y': pos['y'],
            'radius': round(_rand_range(r, e_cfg['minRadius'], e_cfg['maxRadius']), 1),
            'seed': r.randint(0, 2**16 - 1),
        })

    manifest = {
        'seed': seed,
        'world': {'width': w['width'], 'height': w['height']},
        'asteroids': asteroids,
        'stars': stars_layers,
        'nebula': nebula_list,
        'planets': planets,
        'galaxies': galaxies,
        'eyes': eyes,
    }
    return manifest


def save_session(session_id, data):
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    path = SESSIONS_DIR / f'{session_id}.json'
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


def load_session(session_id):
    path = SESSIONS_DIR / f'{session_id}.json'
    if not path.exists():
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def list_sessions():
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    sessions = []
    for p in sorted(SESSIONS_DIR.glob('*.json'), reverse=True):
        sessions.append({
            'id': p.stem,
            'modified': p.stat().st_mtime,
        })
    return sessions
