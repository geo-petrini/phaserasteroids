"""JSON API routes — consumed by the game at runtime."""

import random
import string

from flask import Blueprint, jsonify, request

from modules.common import CATEGORY_META, load_components
from modules.procedural import generate_world, save_session, load_session, list_sessions

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/components')
def components():
    result = []
    for meta in CATEGORY_META:
        items = load_components(meta['key'])
        result.append({'name': meta['label'], 'key': meta['key'], 'items': items})
    return jsonify(result)


@api_bp.route('/components/<category_key>')
def components_category(category_key):
    items = load_components(category_key)
    return jsonify(items)


@api_bp.route('/world')
def world():
    seed = request.args.get('seed', None)
    if seed is not None:
        seed = int(seed)
    manifest = generate_world(seed=seed)
    return jsonify(manifest)


@api_bp.route('/sessions', methods=['GET', 'POST'])
def sessions():
    if request.method == 'POST':
        data = request.get_json(force=True)
        session_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
        save_session(session_id, data)
        return jsonify({'id': session_id}), 201

    all_sessions = list_sessions()
    return jsonify(all_sessions)


@api_bp.route('/sessions/<session_id>')
def session_load(session_id):
    data = load_session(session_id)
    if data is None:
        return jsonify({'error': 'Session not found'}), 404
    return jsonify(data)
