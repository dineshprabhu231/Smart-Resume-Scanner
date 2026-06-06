"""
NLP Service
Skill extraction, keyword detection, and ATS scoring using spaCy + NLTK.
Falls back gracefully if models are not installed.
"""

import re
import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)

# ─── Tech Skills Vocabulary ──────────────────────────────────────────────────────
TECH_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go",
    "rust", "kotlin", "swift", "r", "scala", "php", "perl", "matlab", "julia",
    # Web / Frontend
    "react", "angular", "vue", "nextjs", "html", "css", "tailwind", "bootstrap",
    "sass", "webpack", "vite", "redux", "graphql",
    # Backend / Frameworks
    "flask", "django", "fastapi", "express", "spring", "rails", "laravel", "nodejs",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
    "elasticsearch", "cassandra", "dynamodb",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "circleci", "github actions", "linux", "nginx", "apache",
    # AI / ML / Data
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "matplotlib", "keras", "opencv",
    "computer vision", "data science", "statistics", "hadoop", "spark",
    # Tools
    "git", "jira", "confluence", "postman", "figma", "tableau", "power bi",
    # Soft Skills
    "communication", "leadership", "teamwork", "problem solving", "agile", "scrum",
}

# ─── ATS Section Keywords ────────────────────────────────────────────────────────
ATS_SECTIONS = [
    "experience", "education", "skills", "projects", "certifications",
    "summary", "objective", "achievements", "awards", "publications",
    "volunteer", "languages", "references",
]


def extract_skills(text: str) -> List[str]:
    """
    Extract tech skills from resume text.
    Uses both vocabulary matching and spaCy NER.
    """
    if not text:
        return []

    text_lower = text.lower()
    found_skills = set()

    # Vocabulary-based matching
    for skill in TECH_SKILLS:
        # Use word-boundary matching
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found_skills.add(skill.title())

    # spaCy NER for additional entities
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text[:50000])  # Limit for performance

        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT", "WORK_OF_ART"):
                entity_text = ent.text.strip().lower()
                if entity_text in TECH_SKILLS:
                    found_skills.add(ent.text.strip().title())
    except Exception as e:
        logger.debug(f"spaCy NER skipped: {e}")

    return sorted(list(found_skills))


def extract_keywords(text: str, top_n: int = 20) -> List[str]:
    """
    Extract top keywords using NLTK frequency analysis.
    Falls back to simple tokenization if NLTK not available.
    """
    if not text:
        return []

    try:
        import nltk
        from nltk.corpus import stopwords
        from nltk.tokenize import word_tokenize

        # Download required NLTK data quietly
        for resource in ["punkt", "stopwords", "punkt_tab"]:
            try:
                nltk.download(resource, quiet=True)
            except Exception:
                pass

        tokens = word_tokenize(text.lower())
        stop_words = set(stopwords.words("english"))
        filtered = [
            w for w in tokens
            if w.isalnum() and w not in stop_words and len(w) > 2
        ]

        # Frequency distribution
        freq = {}
        for word in filtered:
            freq[word] = freq.get(word, 0) + 1

        sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, _ in sorted_words[:top_n]]

    except Exception as e:
        logger.debug(f"NLTK keyword extraction failed: {e}")
        # Simple fallback
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        common = ["the", "and", "for", "with", "that", "this", "are", "have", "from"]
        filtered = [w for w in words if w not in common]
        freq = {}
        for w in filtered:
            freq[w] = freq.get(w, 0) + 1
        return sorted(freq, key=freq.get, reverse=True)[:top_n]


def compute_ats_score(text: str) -> float:
    """
    Calculate ATS (Applicant Tracking System) compatibility score (0–100).
    Checks for required sections, contact info, and formatting signals.
    """
    if not text:
        return 0.0

    score = 0
    text_lower = text.lower()

    # Section presence check (50 points max)
    section_score = sum(1 for s in ATS_SECTIONS if s in text_lower)
    score += min(section_score * 5, 50)

    # Contact info (20 points)
    if re.search(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", text_lower):
        score += 10  # email
    if re.search(r"\+?\d[\d\s\-().]{8,}", text):
        score += 10  # phone

    # Content length (15 points)
    word_count = len(text.split())
    if word_count > 300:
        score += 5
    if word_count > 500:
        score += 5
    if word_count > 700:
        score += 5

    # Skills presence (15 points)
    skill_count = sum(1 for s in TECH_SKILLS if s in text_lower)
    score += min(skill_count * 2, 15)

    return round(min(score, 100), 1)


def compute_quality_score(text: str, skills: List[str]) -> float:
    """
    Estimate overall resume quality score (0–100).
    Based on content richness, skill diversity, and structure.
    """
    score = 0
    word_count = len(text.split())

    # Length scoring
    score += min(word_count / 10, 30)  # up to 30 pts

    # Skill richness
    score += min(len(skills) * 3, 40)  # up to 40 pts

    # Has quantifiable achievements (numbers = impact)
    numbers = re.findall(r"\d+\s*%|\d+\+\s*\w+|\$\d+|\d+\s+years?", text, re.IGNORECASE)
    score += min(len(numbers) * 3, 20)  # up to 20 pts

    # Action verbs
    action_verbs = ["developed", "built", "led", "managed", "designed", "implemented",
                    "created", "improved", "increased", "reduced", "launched", "delivered"]
    verb_count = sum(1 for v in action_verbs if v in text.lower())
    score += min(verb_count, 10)  # up to 10 pts

    return round(min(score, 100), 1)
