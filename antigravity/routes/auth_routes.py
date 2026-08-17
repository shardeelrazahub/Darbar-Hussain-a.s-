from flask import Blueprint, request, jsonify, session
from auth import (
    authenticate_admin, register_admin_user, get_current_admin, log_admin_action
)

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def admin_login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    token, user_or_error = authenticate_admin(email, password)
    if not token:
        if isinstance(user_or_error, dict):
            status_code = user_or_error.get('status', 401)
            return jsonify(user_or_error), status_code
        return jsonify({"error": user_or_error or "Invalid email or password."}), 401

    session['admin_token'] = token
    log_admin_action(user_or_error['name'], user_or_error['email'], 'LOGIN', 'Admin Dashboard', 'User logged in successfully.')
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user_or_error
    })

@auth_bp.route('/api/auth/signup', methods=['POST'])
@auth_bp.route('/api/auth/register', methods=['POST'])
def admin_signup():
    data = request.json or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not name or not email or not password:
        return jsonify({"error": "Full name, email address, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    token, user_info_or_error, _ = register_admin_user(name, email, password)
    if not token:
        return jsonify({"error": user_info_or_error}), 400

    log_admin_action(name, email, 'SIGNUP', 'Admin User Account', 'New user registered and submitted application for Super Admin approval.')
    return jsonify({
        "message": "Account created successfully! Your application has been submitted and is currently pending approval by the Super Administrator.",
        "requires_approval": True,
        "email": email,
        "user": user_info_or_error
    })

@auth_bp.route('/api/auth/logout', methods=['POST'])
def admin_logout():
    admin = get_current_admin()
    auth_header = request.headers.get('Authorization')
    token = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    elif 'admin_token' in session:
        token = session['admin_token']

    if admin:
        log_admin_action(admin['name'], admin['email'], 'LOGOUT', 'Admin Dashboard', 'User logged out.')
    session.pop('admin_token', None)

    return jsonify({"message": "Logged out successfully."})

@auth_bp.route('/api/auth/me', methods=['GET'])
def admin_me():
    admin = get_current_admin()
    if not admin:
        return jsonify({"authenticated": False}), 401
    return jsonify({"authenticated": True, "user": admin})
