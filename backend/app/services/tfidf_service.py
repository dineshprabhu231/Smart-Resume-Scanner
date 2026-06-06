"""
TF-IDF + Cosine Similarity Scoring Service
Computes how well a resume matches a job description.
"""

import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def _clean_text(text: str) -> str:
    """Lowercase, remove punctuation, normalize whitespace."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def compute_match_score(resume_text: str, job_description: str) -> float:
    """
    Compute cosine similarity between resume and job description
    using TF-IDF vectorization. Returns score from 0.0 to 100.0.
    """
    if not resume_text or not job_description:
        return 0.0

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        corpus = [_clean_text(resume_text), _clean_text(job_description)]
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),       # unigrams + bigrams
            max_features=5000,
            stop_words="english",
            sublinear_tf=True,        # log scaling
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(score) * 100, 1)

    except Exception as e:
        logger.error(f"TF-IDF scoring failed: {e}")
        return _fallback_score(resume_text, job_description)


def _fallback_score(resume_text: str, job_description: str) -> float:
    """Simple keyword overlap fallback if sklearn fails."""
    resume_words = set(_clean_text(resume_text).split())
    job_words = set(_clean_text(job_description).split())
    if not job_words:
        return 0.0
    overlap = resume_words & job_words
    return round(len(overlap) / len(job_words) * 100, 1)


def compute_skill_match(
    resume_skills: List[str],
    required_skills: List[str],
) -> Dict[str, Any]:
    """
    Compare resume skills vs job required skills.
    Returns matched, missing, and match percentage.
    """
    resume_lower = {s.lower() for s in resume_skills}
    required_lower = {s.lower() for s in required_skills}

    matched = [s for s in required_skills if s.lower() in resume_lower]
    missing = [s for s in required_skills if s.lower() not in resume_lower]
    extra = [s for s in resume_skills if s.lower() not in required_lower]

    pct = (len(matched) / len(required_skills) * 100) if required_skills else 0.0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra[:10],  # top 10 bonus skills
        "skill_match_percentage": round(pct, 1),
    }


def rank_resumes(
    resumes: List[Dict],
    job_description: str,
    required_skills: List[str],
) -> List[Dict]:
    """
    Rank a list of resumes against a job description.
    Each resume dict must have: id, text, skills.
    Returns sorted list with match_score, skill_analysis added.
    """
    ranked = []

    for resume in resumes:
        text_score = compute_match_score(resume.get("text", ""), job_description)
        skill_analysis = compute_skill_match(
            resume.get("skills", []), required_skills
        )

        # Weighted final score: 60% TF-IDF + 40% skill match
        final_score = (text_score * 0.6) + (skill_analysis["skill_match_percentage"] * 0.4)

        ranked.append({
            **resume,
            "match_score": round(final_score, 1),
            "tfidf_score": text_score,
            **skill_analysis,
        })

    # Sort descending by match_score
    ranked.sort(key=lambda x: x["match_score"], reverse=True)

    # Add rank position
    for i, item in enumerate(ranked):
        item["rank"] = i + 1

    return ranked
