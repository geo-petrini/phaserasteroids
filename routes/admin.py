"""Admin routes — component CRUD + procedural config."""

from flask import Blueprint, render_template, request, redirect, url_for, flash

from modules.common import CATEGORY_META, EXTRAS, load_components, save_components, coerce_val
from modules.procedural import load_config, save_config, list_sessions

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/components')
def components():
    categories = []
    for meta in CATEGORY_META:
        items = load_components(meta['key'])
        keys = set()
        for it in items:
            keys.update(it.keys())
        extras_present = [k for k in EXTRAS if k in keys]
        categories.append({**meta, 'parts': items, 'extras_present': extras_present})
    return render_template('admin/components.html', categories=categories)


@admin_bp.route('/components/<category_key>/new', methods=['GET', 'POST'])
def component_new(category_key):
    meta = next((m for m in CATEGORY_META if m['key'] == category_key), None)
    if not meta:
        flash('Unknown category')
        return redirect(url_for('admin.components'))

    if request.method == 'POST':
        items = load_components(category_key)
        item = {}
        for key in request.form:
            item[key] = coerce_val(request.form[key])
        existing = {i['id'] for i in items}
        if item.get('id') in existing:
            flash(f"ID '{item['id']}' already exists in this category")
            return render_template('admin/component_form.html', meta=meta, item=item, edit=False)
        items.append(item)
        save_components(category_key, items)
        flash(f"Component '{item.get('id', '?')}' created")
        return redirect(url_for('admin.components'))

    return render_template('admin/component_form.html', meta=meta, item={}, edit=False)


@admin_bp.route('/components/<category_key>/<item_id>/edit', methods=['GET', 'POST'])
def component_edit(category_key, item_id):
    meta = next((m for m in CATEGORY_META if m['key'] == category_key), None)
    if not meta:
        flash('Unknown category')
        return redirect(url_for('admin.components'))

    items = load_components(category_key)
    idx = next((i for i, it in enumerate(items) if it.get('id') == item_id), None)
    if idx is None:
        flash('Component not found')
        return redirect(url_for('admin.components'))

    if request.method == 'POST':
        item = {}
        for key in request.form:
            item[key] = coerce_val(request.form[key])
        items[idx] = item
        save_components(category_key, items)
        flash(f"Component '{item_id}' updated")
        return redirect(url_for('admin.components'))

    return render_template('admin/component_form.html', meta=meta, item=items[idx], edit=True)


@admin_bp.route('/components/<category_key>/<item_id>/delete', methods=['POST'])
def component_delete(category_key, item_id):
    items = load_components(category_key)
    items = [it for it in items if it.get('id') != item_id]
    save_components(category_key, items)
    flash(f"Component '{item_id}' deleted")
    return redirect(url_for('admin.components'))


@admin_bp.route('/procedural', methods=['GET', 'POST'])
def procedural_config():
    if request.method == 'POST':
        cfg = load_config()
        cfg['asteroids']['count'] = int(request.form.get('asteroid_count', cfg['asteroids']['count']))
        cfg['asteroids']['minRadius'] = float(request.form.get('asteroid_minRadius', cfg['asteroids']['minRadius']))
        cfg['asteroids']['maxRadius'] = float(request.form.get('asteroid_maxRadius', cfg['asteroids']['maxRadius']))
        cfg['asteroids']['minSpeed'] = float(request.form.get('asteroid_minSpeed', cfg['asteroids']['minSpeed']))
        cfg['asteroids']['maxSpeed'] = float(request.form.get('asteroid_maxSpeed', cfg['asteroids']['maxSpeed']))
        cfg['asteroids']['colorSat'] = int(request.form.get('asteroid_colorSat', cfg['asteroids']['colorSat']))
        cfg['asteroids']['colorLight'] = int(request.form.get('asteroid_colorLight', cfg['asteroids']['colorLight']))
        cfg['asteroids']['breakCount'] = int(request.form.get('asteroid_breakCount', cfg['asteroids']['breakCount']))
        cfg['asteroids']['childRadiusFactor'] = float(request.form.get('asteroid_childRadiusFactor', cfg['asteroids']['childRadiusFactor']))
        cfg['stars']['count'] = int(request.form.get('star_count', cfg['stars']['count']))
        cfg['stars']['parallaxLayers'] = int(request.form.get('star_parallaxLayers', cfg['stars']['parallaxLayers']))
        cfg['nebula']['count'] = int(request.form.get('nebula_count', cfg['nebula']['count']))
        cfg['planets']['count'] = int(request.form.get('planet_count', cfg['planets']['count']))
        cfg['galaxies']['count'] = int(request.form.get('galaxy_count', cfg['galaxies']['count']))
        cfg['eyes']['count'] = int(request.form.get('eye_count', cfg['eyes']['count']))
        cfg['world']['width'] = int(request.form.get('world_width', cfg['world']['width']))
        cfg['world']['height'] = int(request.form.get('world_height', cfg['world']['height']))
        save_config(cfg)
        flash('Procedural parameters updated')
        return redirect(url_for('admin.procedural_config'))

    cfg = load_config()
    return render_template('admin/procedural.html', cfg=cfg)


@admin_bp.route('/sessions')
def sessions():
    all_sessions = list_sessions()
    return render_template('admin/sessions.html', sessions=all_sessions)
