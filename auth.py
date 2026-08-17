import secrets
from functools import wraps
from flask import request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from database import get_db_connection, execute_supabase_sql

import os
from itsdangerous import URLSafeTimedSerializer

# Stateless token serializer using the secret key
SECRET_KEY = os.environ.get('SECRET_KEY', 'darbello_imambargah_secret_key_2026')
serializer = URLSafeTimedSerializer(SECRET_KEY)

SUPERADMIN_EMAIL = 'alaewada43@gmail.com'

from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL', '').rstrip('/')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

_supabase = None
def get_supabase_client():
    global _supabase
    if _supabase is None and SUPABASE_URL and SUPABASE_KEY:
        try:
            _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"[Supabase Client Warning] Could not initialize: {e}")
    return _supabase

def authenticate_admin(email, password):
    clean_email = email.strip().lower()
    
    # 1. Fetch user from database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_users WHERE email = ?", (clean_email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return None, {"error": "Invalid email or password.", "status": 401}

    # Verify password hash
    password_ok = check_password_hash(user['password_hash'], password)

    # If local check didn't match, check Supabase Auth
    if not password_ok:
        sb = get_supabase_client()
        if sb:
            try:
                auth_res = sb.auth.sign_in_with_password({"email": clean_email, "password": password})
                if auth_res and auth_res.user:
                    password_ok = True
            except Exception as e:
                print(f"[Supabase Auth Login Note] {e}")

    if not password_ok:
        return None, {"error": "Invalid email or password.", "status": 401}

    # Check Superadmin Approval Status
    user_status = user.get('status', 'APPROVED') if hasattr(user, 'get') else 'APPROVED'
    user_role = user.get('role', 'CONTENT_ADMIN') if hasattr(user, 'get') else 'CONTENT_ADMIN'

    # Superadmin is always APPROVED
    if clean_email == SUPERADMIN_EMAIL:
        user_status = 'APPROVED'
        user_role = 'SUPER_ADMIN'

    if user_status == 'PENDING':
        return None, {
            "error": "Your account application is currently pending approval by the Super Administrator.",
            "requires_approval": True,
            "status": 403
        }

    if user_status == 'REJECTED':
        return None, {
            "error": "Your application to access the admin dashboard was rejected by the Super Administrator.",
            "status": 403
        }

    # Check Active status
    is_active = bool(user.get('is_active', 1)) if hasattr(user, 'get') else True
    if not is_active:
        return None, {
            "error": "Your account has been disabled. Please contact the Super Administrator.",
            "status": 403
        }

    user_info = {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "avatar_url": user['avatar_url'] if ('avatar_url' in user.keys() and user['avatar_url']) else '/static/images/logo.png',
        "role": user_role,
        "status": user_status,
        "is_verified": True
    }
    token = serializer.dumps(user_info)
    return token, user_info

def register_admin_user(name, email, password):
    clean_email = email.strip().lower()
    clean_name = name.strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM admin_users WHERE email = ?", (clean_email,))
    if cursor.fetchone():
        conn.close()
        return None, "An account with this email address already exists.", None

    # Only alaewada43@gmail.com is SUPER_ADMIN; all other users are CONTENT_ADMIN pending Superadmin approval
    role = 'SUPER_ADMIN' if clean_email == SUPERADMIN_EMAIL else 'CONTENT_ADMIN'
    status = 'APPROVED' if clean_email == SUPERADMIN_EMAIL else 'PENDING'
    is_verified = 1

    password_hash = generate_password_hash(password)
    
    cursor.execute('''
        INSERT INTO admin_users (name, email, password_hash, role, is_active, is_verified, status)
        VALUES (?, ?, ?, ?, 1, 1, ?)
    ''', (clean_name, clean_email, password_hash, role, status))
    conn.commit()

    cursor.execute("SELECT id FROM admin_users WHERE email = ?", (clean_email,))
    user_row = cursor.fetchone()
    user_id = user_row['id'] if user_row else None
    conn.close()

    # Sync to Supabase PostgreSQL public.admin_users table immediately
    try:
        execute_supabase_sql(f"""
            INSERT INTO public.admin_users (email, password_hash, name, role, is_active, is_verified, status)
            VALUES ('{clean_email}', '{password_hash}', '{clean_name.replace("'", "''")}', '{role}', 1, 1, '{status}')
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role,
                is_active = EXCLUDED.is_active,
                is_verified = 1,
                status = EXCLUDED.status;
        """)
    except Exception as e:
        print(f"[Supabase Admin Users Sync Note] {e}")

    user_info = {
        "id": user_id,
        "email": clean_email,
        "name": clean_name,
        "avatar_url": '/static/images/logo.png',
        "role": role,
        "status": status,
        "is_verified": True
    }
    token = serializer.dumps(user_info)
    return token, user_info, None

def get_current_admin():
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
            user_info = serializer.loads(token, max_age=86400 * 7)
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, name, role, is_active, is_verified, status FROM admin_users WHERE id = ?", (user_info['id'],))
            db_user = cursor.fetchone()
            conn.close()

            if not db_user or db_user['is_active'] != 1:
                return None
            if db_user['email'] != SUPERADMIN_EMAIL and db_user.get('status') != 'APPROVED':
                return None

            user_info['role'] = db_user['role']
            user_info['status'] = db_user.get('status', 'APPROVED')
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
        if admin.get('role') != 'SUPER_ADMIN' or admin.get('email') != SUPERADMIN_EMAIL:
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
