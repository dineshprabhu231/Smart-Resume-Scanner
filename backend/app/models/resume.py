"""Resume model — stores uploaded resumes and AI analysis results."""

import json
from datetime import datetime
from ..extensions import db


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    resume_path = db.Column(db.String(500), nullable=False)
    extracted_text = db.Column(db.Text, default="")
    _extracted_skills = db.Column("extracted_skills", db.Text, default="[]")
    _keywords = db.Column("keywords", db.Text, default="[]")
    ats_score = db.Column(db.Float, default=0.0)
    quality_score = db.Column(db.Float, default=0.0)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def extracted_skills(self):
        return json.loads(self._extracted_skills or "[]")

    @extracted_skills.setter
    def extracted_skills(self, value):
        self._extracted_skills = json.dumps(value)

    @property
    def keywords(self):
        return json.loads(self._keywords or "[]")

    @keywords.setter
    def keywords(self, value):
        self._keywords = json.dumps(value)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "extracted_skills": self.extracted_skills,
            "keywords": self.keywords,
            "ats_score": self.ats_score,
            "quality_score": self.quality_score,
            "uploaded_at": self.uploaded_at.isoformat(),
        }
