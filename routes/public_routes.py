from flask import Blueprint, request, jsonify
from database import get_db_connection
from storage import save_uploaded_file, allowed_file

public_bp = Blueprint('public_bp', __name__)

@public_bp.route('/api/public/initial_data', methods=['GET'])
def get_public_initial_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Settings dict
    cursor.execute("SELECT setting_key, setting_value FROM website_settings")
    settings = {row['setting_key']: row['setting_value'] for row in cursor.fetchall()}

    # Pages dict
    cursor.execute("SELECT * FROM pages")
    pages = {row['page_key']: dict(row) for row in cursor.fetchall()}

    # Published Events
    cursor.execute("SELECT * FROM events WHERE is_published = 1 ORDER BY event_date ASC")
    events = [dict(row) for row in cursor.fetchall()]

    # Published Announcements
    cursor.execute("SELECT * FROM announcements WHERE is_published = 1 ORDER BY created_at DESC")
    announcements = [dict(row) for row in cursor.fetchall()]

    # Gallery Categories
    cursor.execute("SELECT * FROM gallery_categories ORDER BY display_order ASC")
    categories = [dict(row) for row in cursor.fetchall()]

    # Gallery Images
    cursor.execute('''
        SELECT g.*, c.name_en as category_name_en, c.name_ur as category_name_ur, c.slug as category_slug
        FROM gallery_images g
        LEFT JOIN gallery_categories c ON g.category_id = c.id
        ORDER BY g.display_order ASC, g.id DESC
    ''')
    images = [dict(row) for row in cursor.fetchall()]

    # Published Media Items
    cursor.execute("SELECT * FROM media_items WHERE is_published = 1 ORDER BY id DESC")
    media = [dict(row) for row in cursor.fetchall()]

    # Active Social Links
    cursor.execute("SELECT * FROM social_links WHERE is_active = 1 ORDER BY display_order ASC")
    socials = [dict(row) for row in cursor.fetchall()]

    # Visitor Posts (latest 20)
    cursor.execute("SELECT * FROM visitor_posts WHERE is_approved = 1 ORDER BY created_at DESC LIMIT 20")
    visitor_posts = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        "settings": settings,
        "pages": pages,
        "events": events,
        "announcements": announcements,
        "gallery_categories": categories,
        "gallery_images": images,
        "media_items": media,
        "social_links": socials,
        "visitor_posts": visitor_posts
    })

@public_bp.route('/api/public/contact', methods=['POST'])
def submit_contact():
    data = request.json
    if not data or not data.get('name') or not data.get('message'):
        return jsonify({'error': 'Name and message are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO contact_messages (name, email, phone, message)
        VALUES (?, ?, ?, ?)
    ''', (data.get('name'), data.get('email'), data.get('phone'), data.get('message')))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Message sent successfully.'})

@public_bp.route('/api/public/upload_visitor_media', methods=['POST'])
def upload_visitor_media():
    if 'file' not in request.files:
        return jsonify({"error": "No file part provided."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    if not (file and allowed_file(file.filename)):
        return jsonify({"error": "File type not allowed. Allowed: PNG, JPG, JPEG, WEBP, GIF, MP4, WEBM, MOV"}), 400

    try:
        file_url = save_uploaded_file(file, folder="visitor_uploads")
        return jsonify({"message": "File uploaded successfully", "url": file_url})
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

@public_bp.route('/api/public/visitor_posts', methods=['POST'])
def add_visitor_post():
    data = request.json or {}
    name = data.get('name', '').strip()
    content = data.get('content', '').strip()
    media_url = data.get('media_url', '').strip() or None
    media_type = data.get('media_type', '').strip() or None

    if not name or not content:
        return jsonify({"error": "Name and content are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO visitor_posts (name, content, media_url, media_type, is_approved)
        VALUES (?, ?, ?, ?, 1)
    ''', (name, content, media_url, media_type))
    conn.commit()
    conn.close()
    return jsonify({"message": "Post submitted successfully."})
