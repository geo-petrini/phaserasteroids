"""Public page routes — index, play, login, register, profile."""

from flask import Blueprint, render_template

pages_bp = Blueprint('pages', __name__)


@pages_bp.route('/')
def index():
    return render_template('index.html')


@pages_bp.route('/play')
def play():
    return render_template('play.html')


@pages_bp.route('/login')
def login():
    return render_template('login.html')


@pages_bp.route('/register')
def register():
    return render_template('register.html')


@pages_bp.route('/profile')
def profile():
    return render_template('profile.html')
