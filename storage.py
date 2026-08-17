import os
import uuid
import mimetypes
import requests

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'pdf'}

# Lightweight .env loader if not already loaded
def _load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
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

_load_env()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, folder="uploads"):
    """
    Uploads a file directly to the Supabase Storage 'media' bucket
    and returns its permanent public URL.
    """
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'bin'
    unique_name = f"{folder}/{uuid.uuid4().hex}.{ext}"
    
    supabase_url = os.environ.get('SUPABASE_URL', '').rstrip('/')
    supabase_key = os.environ.get('SUPABASE_KEY', '')
    supabase_bucket = os.environ.get('SUPABASE_STORAGE_BUCKET', 'media')

    content_type, _ = mimetypes.guess_type(file.filename)
    if not content_type:
        content_type = getattr(file, 'mimetype', 'application/octet-stream') or 'application/octet-stream'

    file_bytes = file.read()
    file.seek(0)

    # 1. Primary & Direct: Upload to Supabase Storage Bucket
    if supabase_url and supabase_key:
        try:
            headers = {
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': content_type,
                'x-upsert': 'true'
            }
            target_url = f"{supabase_url}/storage/v1/object/{supabase_bucket}/{unique_name}"
            resp = requests.post(target_url, headers=headers, data=file_bytes, timeout=15)
            
            if resp.status_code in (200, 201):
                public_url = f"{supabase_url}/storage/v1/object/public/{supabase_bucket}/{unique_name}"
                print(f"[Supabase Storage] File successfully uploaded to bucket: {public_url}")
                return public_url
            else:
                print(f"[Supabase Storage Warning] Status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[Supabase Storage Upload Error] {e}")

    # 2. Local Fallback (if Supabase network is unreachable)
    filename = f"{uuid.uuid4().hex}.{ext}"
    if os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
        upload_folder = '/tmp/uploads'
    else:
        upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    try:
        os.makedirs(upload_folder, exist_ok=True)
    except Exception:
        upload_folder = '/tmp/uploads'
        os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    with open(filepath, 'wb') as f:
        f.write(file_bytes)
    return f"/uploads/{filename}"
