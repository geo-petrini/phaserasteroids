"""Flask application factory for PhaserAsteroids."""

import os
import sys
from pathlib import Path
from flask import Flask, send_from_directory

PROJECT_DIR = Path(__file__).resolve().parent
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from routes.pages import pages_bp
from routes.admin import admin_bp
from routes.api import api_bp

STATIC_DIR = PROJECT_DIR / 'static'


def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')

    app.register_blueprint(pages_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)

    @app.route('/<path:filename>')
    def static_files(filename):
        return send_from_directory(str(STATIC_DIR), filename)

    return app


if __name__ == '__main__':
    app = create_app()
    print(f' * Project root: {PROJECT_DIR}')
    print(f' * Static:       {STATIC_DIR}')
    print(f' * Components:   {STATIC_DIR / "js" / "components"}')
    print(f' * Point browser to http://127.0.0.1:5000/')
    app.run(debug=True, port=5000)
