"""JSON API routes — consumed by the game at runtime."""

from flask import Blueprint, jsonify

from modules.common import CATEGORY_META, load_components

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
