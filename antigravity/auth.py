import secrets
from functools import wraps
from flask import request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from database import get_db_connection

import os
from itsdangerous import URLSafeTimedSerializer

# Stateless token serializer using the secret key
SECRET_KEY = os.environ.get('SECRET_KEY', 'darbello_imambargah_secret_key_2026')
serializer = URLSafeTimedSerializer(SECRET_KEY)

def authenticate_admin(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_users WHERE email = ? AND is_active = 1", (email.strip().lower(),))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user['password_hash'], password):
        user_info = {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "avatar_url": user['avatar_url'] if ('avatar_url' in user.keys() and user['avatar_url']) else '/static/images/logo.png',
            "role": user['role']
        }
        token = serializer.dumps(user_info)
        return token, user_info
    return None, None

def register_admin_user(name, email, password, role='CONTENT_ADMIN'):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    clean_email = email.strip().lower()
    cursor.execute("SELECT id FROM admin_users WHERE email = ?", (clean_email,))
    if cursor.fetchone():
        conn.close()
        return None, "An account with this email address already exists."
    
    password_hash = generate_password_hash(password)
    cursor.execute('''
        INSERT INTO admin_users (name, email, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, 1)
    ''', (name.strip(), clean_email, password_hash, role))
    conn.commit()
    
    cursor.execute("SELECT id FROM admin_users WHERE email = ?", (clean_email,))
    user_row = cursor.fetchone()
    user_id = user_row['id'] if user_row else None
    conn.close()
    
    user_info = {
        "id": user_id,
        "email": clean_email,
        "name": name.strip(),
        "avatar_url": '/static/images/logo.png',
        "role": role
    }
    token = serializer.dumps(user_info)
    return token, user_info

def get_current_admin():
    # Check Authorization header first
    auth_header = request.headers.get('Authorization')
    token = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    elif request.headers.get('X-Admin-Token'):
        token = request.headers.get('X-Admin-Token')
    elif 'admin_token' in session:
        token = session['admin_token']

    if token:
        try:
            # Token expires in 7 days
            user_info = serializer.loads(token, max_age=86400 * 7)
            return user_info
        except Exception:
            return None
    return None

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin = get_current_admin()
        if not admin:
            return jsonify({"error": "Unauthorized. Please log in as an administrator.", "status": 401}), 401
        return f(admin, *args, **kwargs)
    return decorated_function

def require_super_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin = get_current_admin()
        if not admin:
            return jsonify({"error": "Unauthorized. Please log in as an administrator.", "status": 401}), 401
        if admin.get('role') != 'SUPER_ADMIN':
            return jsonify({"error": "Forbidden. Super Admin privileges required.", "status": 403}), 403
        return f(admin, *args, **kwargs)
    return decorated_function

def log_admin_action(admin_name, admin_email, action_type, target_entity, details=""):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO admin_activity_logs (admin_name, admin_email, action_type, target_entity, details)
            VALUES (?, ?, ?, ?, ?)
        ''', (admin_name, admin_email, action_type, target_entity, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to log admin action: {e}")
