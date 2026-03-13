"""JWT and password hashing utilities for IT Budget Buddy."""
import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

# Use env or default secret; in production set JWT_SECRET in environment
JWT_SECRET = os.environ.get("JWT_SECRET", "it-budget-buddy-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


def hash_password(plain_password: str) -> str:
    """Hash password with bcrypt."""
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(plain_password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, role: str, department_id: str = None) -> str:
    """Create JWT for user."""
    payload = {
        "sub": user_id,
        "role": role,
        "department_id": department_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str):
    """Decode and validate JWT; return payload dict or None."""
    if not token:
        return None
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Decorator: require valid JWT. Injects payload into kwargs as 'auth_payload'."""
    @wraps(f)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        payload = decode_token(auth_header) if auth_header else None
        if not payload:
            return jsonify({"status": "failed", "message": "Authentication required"}), 401
        kwargs["auth_payload"] = payload
        return f(*args, **kwargs)
    return wrapped


def require_admin(f):
    """Decorator: require valid JWT and admin role."""
    @wraps(f)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        payload = decode_token(auth_header) if auth_header else None
        if not payload:
            return jsonify({"status": "failed", "message": "Authentication required"}), 401
        if payload.get("role") != "admin":
            return jsonify({"status": "failed", "message": "Admin access required"}), 403
        kwargs["auth_payload"] = payload
        return f(*args, **kwargs)
    return wrapped


def optional_auth(f):
    """Decorator: optional JWT. If present, injects payload as 'auth_payload'."""
    @wraps(f)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        payload = decode_token(auth_header) if auth_header else None
        kwargs["auth_payload"] = payload
        return f(*args, **kwargs)
    return wrapped
