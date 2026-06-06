"""Job model — recruiter-created job postings."""

import json
from datetime import datetime
from ..extensions import db


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    _required_skills = db.Column("required_skills", db.Text, default="[]")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def required_skills(self):
        return json.loads(self._required_skills or "[]")

    @required_skills.setter
    def required_skills(self, value):
        self._required_skills = json.dumps(value)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "recruiter_id": self.recruiter_id,
            "title": self.title,
            "description": self.description,
            "required_skills": self.required_skills,
            "created_at": self.created_at.isoformat(),
        }
