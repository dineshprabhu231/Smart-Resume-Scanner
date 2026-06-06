# 🧠 Smart Resume Scanner
### AI-Powered Resume Screening & Candidate Ranking Platform

![Tech Stack](https://img.shields.io/badge/Stack-React_+_Flask_+_spaCy-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)

---

## 🚀 What It Does

Smart Resume Scanner helps recruiters **automatically analyze and rank candidates** using AI/NLP. Candidates upload resumes and get instant feedback; recruiters see a full ranked leaderboard with match scores.

| Feature | Description |
|---------|-------------|
| 🤖 AI Matching | TF-IDF + Cosine Similarity scores resumes vs job descriptions |
| 🧬 Skill Extraction | spaCy NLP + vocabulary matching extracts 100+ tech skills |
| 📊 ATS Scoring | Checks resume sections, contact info, and formatting |
| 📈 Rankings | Auto-ranks all candidates by weighted match score |
| 🔐 Auth | JWT-based auth with recruiter/candidate role separation |
| 📁 File Support | PDF (pdfplumber + PyPDF2) and DOCX (python-docx) |

---

## 🏗️ Project Structure

```
smart-resume-scanner/
├── backend/                    # Python Flask REST API
│   ├── app/
│   │   ├── __init__.py         # App factory
│   │   ├── config.py           # Config (SQLite → MySQL)
│   │   ├── extensions.py       # SQLAlchemy, JWT, CORS
│   │   ├── models/             # User, Resume, Job
│   │   ├── routes/             # auth, resumes, jobs, analysis
│   │   └── services/           # parser, nlp, tfidf, scoring
│   ├── uploads/                # Uploaded resume files
│   ├── run.py
│   ├── .env
│   └── requirements.txt
│
└── frontend/                   # React + TypeScript + Vite
    ├── src/
    │   ├── api/                # Axios service layer
    │   ├── components/
    │   │   ├── layout/         # Sidebar, Topbar, DashboardLayout
    │   │   └── shared/         # ScoreRing, StatCard, SkillTag, Loader
    │   ├── context/            # AuthContext
    │   ├── lib/                # utils (cn, formatters)
    │   ├── pages/
    │   │   ├── Landing.tsx
    │   │   ├── SignIn.tsx
    │   │   ├── SignUp.tsx
    │   │   ├── candidate/      # Dashboard, ResumeUpload
    │   │   └── recruiter/      # Dashboard, JobDescription, CandidateAnalysis, Candidates
    │   ├── types/              # TypeScript interfaces
    │   ├── App.tsx
    │   └── main.tsx
    ├── tailwind.config.ts
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Python 3.10+** (`python --version`)
- **Node.js 18+** (`node --version`)
- **pip** and **npm**

---

### 1️⃣ Backend Setup

```bash
cd smart-resume-scanner/backend

# Create & activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy NLP model
python -m spacy download en_core_web_sm

# Copy .env
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux

# Run the backend
python run.py
```

> Backend runs at: **http://localhost:5000**
> Database auto-creates as `smart_resume.db` with demo accounts seeded.

---

### 2️⃣ Frontend Setup

```bash
cd smart-resume-scanner/frontend

# Install dependencies
npm install

# Copy .env
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux

# Start development server
npm run dev
```

> Frontend runs at: **http://localhost:5173**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Recruiter | recruiter@demo.com | demo1234 |
| Candidate | candidate@demo.com | demo1234 |

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Get current user |

### Resumes
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/resumes/upload` | Upload & parse resume |
| GET | `/api/resumes/my` | Candidate's own resumes |
| GET | `/api/resumes/all` | All resumes (recruiter) |

### Jobs
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/jobs` | Create job posting |
| GET | `/api/jobs` | List jobs |
| PUT | `/api/jobs/<id>` | Update job |
| DELETE | `/api/jobs/<id>` | Delete job |

### Analysis
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/analysis/rank` | Rank all resumes for a job |
| GET | `/api/analysis/detail/<rid>/<jid>` | Detailed match analysis |
| GET | `/api/analysis/candidate/<rid>` | Candidate self-analysis |

---

## 🤖 AI/NLP Pipeline

```
Resume File (PDF/DOCX)
        ↓
   Text Extraction (pdfplumber → PyPDF2 → python-docx)
        ↓
   Skill Extraction (vocabulary matching + spaCy NER)
        ↓
   Keyword Extraction (NLTK frequency analysis)
        ↓
   ATS Scoring (section detection + contact info + length)
        ↓
   Quality Scoring (action verbs + numbers + skill diversity)
        ↓
   TF-IDF Vectorization (scikit-learn, bigrams, sublinear TF)
        ↓
   Cosine Similarity (resume vector ↔ job description vector)
        ↓
   Final Score = (TF-IDF × 0.6) + (Skill Match % × 0.4)
        ↓
   Ranked Candidate List
```

---

## 🎨 UI Highlights

- **Dark futuristic theme** — Background `#0B1120`, glassmorphism cards
- **Framer Motion** — Page transitions, animated score rings, staggered lists
- **Recharts** — RadarChart, BarChart, animated progress bars
- **Animated score rings** — SVG circular progress indicators
- **Responsive** — Works on mobile, tablet, and desktop

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///smart_resume.db
# MySQL: DATABASE_URL=mysql+pymysql://user:pass@host/db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
JWT_ACCESS_TOKEN_EXPIRES=86400
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🔄 Switching to MySQL

1. Install PyMySQL: `pip install pymysql`
2. In `backend/.env`, change:
   ```
   DATABASE_URL=mysql+pymysql://user:password@localhost:3306/smart_resume_db
   ```
3. Create the MySQL database: `CREATE DATABASE smart_resume_db;`
4. Restart the backend — SQLAlchemy auto-creates all tables.

---

## 📦 Production Build

```bash
# Frontend
cd frontend && npm run build   # outputs to dist/

# Backend — use gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

---

## 🧪 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | Radix UI primitives, Lucide React icons |
| Animations | Framer Motion |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Python Flask, Flask-JWT-Extended |
| ORM | SQLAlchemy (SQLite / MySQL) |
| NLP | spaCy `en_core_web_sm`, NLTK |
| ML | scikit-learn TF-IDF + Cosine Similarity |
| File Parsing | pdfplumber, PyPDF2, python-docx |

---

## 👥 Contributors

- **Dinesh Prabhu** — Built as a full-stack AI project demonstrating modern SaaS architecture, NLP pipelines, and real-time candidate ranking.

---

*Smart Resume Scanner — Making recruitment smarter, one resume at a time.*
