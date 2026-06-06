"""
Jobs Routes
POST   /api/jobs        — Create job (recruiter only)
GET    /api/jobs        — List all jobs
GET    /api/jobs/<id>   — Get single job
PUT    /api/jobs/<id>   — Update job (recruiter only)
DELETE /api/jobs/<id>   — Delete job (recruiter only)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User
from ..models.job import Job

jobs_bp = Blueprint("jobs", __name__)


from werkzeug.exceptions import Unauthorized

def _get_current_user():
    user_id = get_jwt_identity()
    print(f"DEBUG: Trying to fetch user with JWT ID {user_id}", flush=True)
    user = User.query.get(int(user_id))
    if not user:
        print("DEBUG: User not found in DB! Forcing logout logic.", flush=True)
        raise Unauthorized("Invalid user token. Please log out and back in.")
    return user


@jobs_bp.route("", methods=["POST"])
@jwt_required()
def create_job():
    """Create a new job posting (recruiter only)."""
    user = _get_current_user()
    if user.role != "recruiter":
        return jsonify({"error": "Only recruiters can create jobs"}), 403

    data = request.get_json()
    if not data.get("title") or not data.get("description"):
        return jsonify({"error": "title and description are required"}), 400

    job = Job(
        recruiter_id=user.id,
        title=data["title"].strip(),
        description=data["description"].strip(),
    )
    job.required_skills = data.get("required_skills", [])

    db.session.add(job)
    db.session.commit()

    return jsonify({"job": job.to_dict()}), 201


@jobs_bp.route("", methods=["GET"])
@jwt_required()
def list_jobs():
    """List all jobs. Recruiters see only their own."""
    user = _get_current_user()

    if user.role == "recruiter":
        jobs = Job.query.filter_by(recruiter_id=user.id).order_by(Job.created_at.desc()).all()
    else:
        jobs = Job.query.order_by(Job.created_at.desc()).all()

    return jsonify({"jobs": [j.to_dict() for j in jobs]}), 200


@jobs_bp.route("/<int:job_id>", methods=["GET"])
@jwt_required()
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify({"job": job.to_dict()}), 200


@jobs_bp.route("/<int:job_id>", methods=["PUT"])
@jwt_required()
def update_job(job_id):
    user = _get_current_user()
    job = Job.query.get_or_404(job_id)

    if job.recruiter_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if data.get("title"):
        job.title = data["title"].strip()
    if data.get("description"):
        job.description = data["description"].strip()
    if "required_skills" in data:
        job.required_skills = data["required_skills"]

    db.session.commit()
    return jsonify({"job": job.to_dict()}), 200


@jobs_bp.route("/<int:job_id>", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
    user = _get_current_user()
    job = Job.query.get_or_404(job_id)

    if job.recruiter_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted"}), 200
