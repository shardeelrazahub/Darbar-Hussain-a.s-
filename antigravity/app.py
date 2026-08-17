import os
from flask import Flask, send_from_directory
from database import init_db
from routes import public_bp, auth_bp, admin_bp

# Lightweight .env loader (checks both .env and env)
def _load_env_file():
    for name in ['.env', 'env']:
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
        if os.path.exists(env_path):
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            os.environ.setdefault(k.strip(), v.strip().strip("'").strip('"'))
            except Exception:
                pass

_load_env_file()

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = os.environ.get('SECRET_KEY', 'darbello_imambargah_secret_key_2026')

# Local upload folder (used for local uploads and fallback)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32 MB max upload

# Register Blueprints
app.register_blueprint(public_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

# Automatically ensure database tables & seed data are initialized
try:
    init_db()
except Exception as _e:
    print(f"[DB Init Warning] Could not initialize database on startup: {_e}")

# --- STATIC & SPA ROUTES ---
@app.route('/')
@app.route('/dashboard')
@app.route('/dashboard/<path:subpath>')
@app.route('/login')
@app.route('/signup')
@app.route('/admin')
@app.route('/admin/login')
@app.route('/admin/dashboard')
def serve_spa(subpath=None):
    return send_from_directory('static', 'index.html')

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ── Local development server ──
if __name__ == '__main__':
    print('Starting Flask application server on http://127.0.0.1:5000')
    app.run(host='127.0.0.1', port=5000, debug=True)
