"""
Auth Routes
POST /api/auth/register  — Create new user account
POST /api/auth/login     — Get JWT access token
GET  /api/auth/me        — Get current user profile (JWT required)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user (recruiter or candidate)."""
    data = request.get_json()

    # Validate required fields
    required = ["name", "email", "password", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    if data["role"] not in ("recruiter", "candidate"):
        return jsonify({"error": "role must be 'recruiter' or 'candidate'"}), 400

    # Check duplicate email
    if User.query.filter_by(email=data["email"].lower()).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        name=data["name"].strip(),
        email=data["email"].lower().strip(),
        role=data["role"],
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token."""
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=data["email"].lower().strip()).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    """Return current user profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()}), 200
