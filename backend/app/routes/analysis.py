"""
Analysis Routes
POST /api/analysis/rank            — Rank all resumes against a job
GET  /api/analysis/detail/<rid>/<jid> — Detailed analysis for one resume vs job
GET  /api/analysis/candidate/<rid> — Candidate's self-analysis summary
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User
from ..models.resume import Resume
from ..models.job import Job
from ..services.tfidf_service import compute_match_score, compute_skill_match, rank_resumes

analysis_bp = Blueprint("analysis", __name__)


def _get_current_user():
    return User.query.get(int(get_jwt_identity()))


@analysis_bp.route("/rank", methods=["POST"])
@jwt_required()
def rank_candidates():
    """
    Rank all uploaded resumes against a specified job.
    Body: { "job_id": int }
    """
    user = _get_current_user()
    if user.role != "recruiter":
        return jsonify({"error": "Only recruiters can run ranking"}), 403

    data = request.get_json()
    job_id = data.get("job_id")
    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    job = Job.query.get_or_404(job_id)

    # Collect all resumes with candidate info
    resumes = Resume.query.all()
    resume_data = []
    for r in resumes:
        owner = User.query.get(r.user_id)
        resume_data.append({
            "id": r.id,
            "user_id": r.user_id,
            "candidate_name": owner.name if owner else "Unknown",
            "candidate_email": owner.email if owner else "",
            "text": r.extracted_text or "",
            "skills": r.extracted_skills,
            "ats_score": r.ats_score,
            "quality_score": r.quality_score,
            "filename": r.filename,
            "uploaded_at": r.uploaded_at.isoformat(),
        })

    ranked = rank_resumes(resume_data, job.description, job.required_skills)

    return jsonify({
        "job": job.to_dict(),
        "ranked_candidates": ranked,
        "total": len(ranked),
    }), 200


@analysis_bp.route("/detail/<int:resume_id>/<int:job_id>", methods=["GET"])
@jwt_required()
def get_detail(resume_id, job_id):
    """
    Detailed match analysis for a specific resume against a job.
    Returns skill breakdown, match score, missing skills, and insights.
    """
    resume = Resume.query.get_or_404(resume_id)
    job = Job.query.get_or_404(job_id)
    candidate = User.query.get(resume.user_id)

    tfidf_score = compute_match_score(resume.extracted_text or "", job.description)
    skill_analysis = compute_skill_match(resume.extracted_skills, job.required_skills)

    final_score = (tfidf_score * 0.6) + (skill_analysis["skill_match_percentage"] * 0.4)

    # Generate AI recommendations
    insights = _generate_insights(skill_analysis, tfidf_score, resume.ats_score, resume.quality_score)

    return jsonify({
        "resume_id": resume_id,
        "job_id": job_id,
        "candidate_name": candidate.name if candidate else "Unknown",
        "job_title": job.title,
        "match_score": round(final_score, 1),
        "tfidf_score": tfidf_score,
        "ats_score": resume.ats_score,
        "quality_score": resume.quality_score,
        "skill_analysis": skill_analysis,
        "extracted_skills": resume.extracted_skills,
        "keywords": resume.keywords,
        "insights": insights,
    }), 200


@analysis_bp.route("/candidate/<int:resume_id>", methods=["GET"])
@jwt_required()
def get_candidate_analysis(resume_id):
    """Candidate's own resume analysis (no job comparison)."""
    user = _get_current_user()
    resume = Resume.query.get_or_404(resume_id)

    if resume.user_id != user.id and user.role != "recruiter":
        return jsonify({"error": "Unauthorized"}), 403

    # Find best matching job for this candidate
    jobs = Job.query.all()
    best_match = None
    best_score = 0

    for job in jobs:
        score = compute_match_score(resume.extracted_text or "", job.description)
        if score > best_score:
            best_score = score
            best_match = job

    return jsonify({
        "resume": resume.to_dict(),
        "ats_score": resume.ats_score,
        "quality_score": resume.quality_score,
        "best_match_job": best_match.to_dict() if best_match else None,
        "best_match_score": round(best_score, 1),
    }), 200


def _generate_insights(skill_analysis: dict, tfidf_score: float, ats_score: float, quality_score: float) -> list:
    """Generate human-readable AI insights and recommendations."""
    insights = []
    missing = skill_analysis.get("missing_skills", [])
    matched = skill_analysis.get("matched_skills", [])

    if tfidf_score >= 70:
        insights.append("✅ Strong keyword alignment with job description")
    elif tfidf_score >= 45:
        insights.append("🟡 Moderate keyword match — consider tailoring your resume")
    else:
        insights.append("🔴 Low keyword match — resume needs significant tailoring")

    if missing:
        top_missing = missing[:5]
        insights.append(f"📌 Focus on acquiring: {', '.join(top_missing)}")

    if len(matched) >= 5:
        insights.append(f"🌟 Strong skill match: {', '.join(matched[:4])} and more")

    if ats_score < 60:
        insights.append("⚠️ ATS score is low — add missing sections (Summary, Skills, Experience)")
    elif ats_score >= 80:
        insights.append("✅ Resume is highly ATS-compatible")

    if quality_score < 50:
        insights.append("💡 Add quantifiable achievements and action verbs to boost impact")
    elif quality_score >= 75:
        insights.append("🏆 Resume shows strong experience and impact metrics")

    return insights
