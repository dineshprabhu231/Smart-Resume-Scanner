"""
Resumes Routes
POST /api/resumes/upload  — Upload & parse resume (candidate)
GET  /api/resumes/my      — Get candidate's own resumes
GET  /api/resumes/all     — Get all resumes (recruiter only)
"""

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..extensions import db
from ..models.user import User
from ..models.resume import Resume
from ..services.parser_service import extract_text_from_file
from ..services.nlp_service import extract_skills, extract_keywords, compute_ats_score, compute_quality_score

resumes_bp = Blueprint("resumes", __name__)


def _allowed_file(filename: str) -> bool:
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf", "docx"})
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


def _get_current_user():
    return User.query.get(int(get_jwt_identity()))


@resumes_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    """
    Upload and parse a resume file.
    Accepts multipart/form-data with 'file' field.
    """
    user = _get_current_user()

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    if not _allowed_file(file.filename):
        return jsonify({"error": "Only PDF and DOCX files are allowed"}), 400

    # Save with unique name to prevent collisions
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    safe_filename = secure_filename(unique_filename)
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    filepath = os.path.join(upload_folder, safe_filename)
    file.save(filepath)

    # Extract text
    text = extract_text_from_file(filepath)

    # AI analysis
    skills = extract_skills(text)
    keywords = extract_keywords(text)
    ats_score = compute_ats_score(text)
    quality_score = compute_quality_score(text, skills)

    # Save to database
    resume = Resume(
        user_id=user.id,
        filename=secure_filename(file.filename),
        resume_path=filepath,
        extracted_text=text[:10000],  # Store first 10k chars
    )
    resume.extracted_skills = skills
    resume.keywords = keywords
    resume.ats_score = ats_score
    resume.quality_score = quality_score

    db.session.add(resume)
    db.session.commit()

    return jsonify({
        "message": "Resume uploaded and analyzed successfully",
        "resume": resume.to_dict(),
        "word_count": len(text.split()),
    }), 201


@resumes_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_resumes():
    """Return current candidate's resumes."""
    user = _get_current_user()
    resumes = Resume.query.filter_by(user_id=user.id).order_by(Resume.uploaded_at.desc()).all()
    return jsonify({"resumes": [r.to_dict() for r in resumes]}), 200


@resumes_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_resumes():
    """Return all resumes with candidate info (recruiter only)."""
    user = _get_current_user()
    if user.role != "recruiter":
        return jsonify({"error": "Unauthorized"}), 403

    resumes = Resume.query.order_by(Resume.uploaded_at.desc()).all()
    result = []
    for r in resumes:
        d = r.to_dict()
        owner = User.query.get(r.user_id)
        d["candidate_name"] = owner.name if owner else "Unknown"
        d["candidate_email"] = owner.email if owner else ""
        result.append(d)

    return jsonify({"resumes": result}), 200
