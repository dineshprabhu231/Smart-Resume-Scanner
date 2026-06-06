/**
 * Landing Page — Hero, Features, How It Works, Team, Footer
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Zap, BarChart3, Shield, FileSearch, Users,
  ChevronRight, Star, ArrowRight, CheckCircle2, Github, Twitter, Linkedin
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'TF-IDF + Cosine Similarity algorithms score resumes against job descriptions with 95% accuracy.', color: 'warm' },
  { icon: FileSearch, title: 'Smart Resume Parsing', desc: 'Extract skills, keywords, and insights from PDF/DOCX files in seconds using spaCy NLP.', color: 'warm' },
  { icon: BarChart3, title: 'Candidate Rankings', desc: 'Automatically rank all applicants by match score, ATS compatibility, and skill alignment.', color: 'warm' },
  { icon: Shield, title: 'ATS Compatibility', desc: 'Score every resume for ATS compatibility so candidates know how to optimize before applying.', color: 'warm' },
  { icon: Zap, title: 'Real-Time Analysis', desc: 'Get instant match scores, skill gap analysis, and actionable insights the moment a resume is uploaded.', color: 'warm' },
  { icon: Users, title: 'Role-Based Access', desc: 'Separate recruiter and candidate portals with dedicated workflows and dashboards.', color: 'warm' },
];

const steps = [
  { num: '01', title: 'Create Job Posting', desc: 'Recruiter creates a detailed job description with required skills and qualifications.' },
  { num: '02', title: 'Upload Resume', desc: 'Candidates upload their PDF or DOCX resume. Our parser extracts all relevant information.' },
  { num: '03', title: 'AI Analyzes & Ranks', desc: 'The NLP engine computes TF-IDF vectors, cosine similarity, and skill match scores.' },
  { num: '04', title: 'View Rankings', desc: 'Recruiters see a ranked leaderboard with detailed breakdowns for every candidate.' },
];

const team = [
  { name: 'Dinesh Prabhu', role: 'Full Stack Developer', avatar: 'D', color: 'from-warm-700 to-warm-500' },
];

function NavBar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
      style={{ background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(30,45,74,0.5)' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-warm-700 flex items-center justify-center">
          <Brain size={16} className="text-warm-100" />
        </div>
        <span className="font-bold text-white text-lg">ResumeAI</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        <a href="#team" className="hover:text-white transition-colors">Team</a>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/signin')} className="text-sm text-muted-foreground hover:text-white transition-colors px-4 py-2">
          Sign In
        </button>
        <button onClick={() => navigate('/signup')} className="px-4 py-2 text-sm text-warm-100 font-semibold rounded-xl bg-warm-700 hover:bg-warm-900 transition-colors">
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/25 text-primary-400 text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Zap size={12} />
            AI-Powered Resume Screening Platform
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Find the{' '}
            <span className="text-gradient">Perfect Candidate</span>
            <br />with AI Precision
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Smart Resume Scanner uses advanced NLP, TF-IDF, and cosine similarity to automatically
            rank candidates and match resumes to job descriptions with unmatched accuracy.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              id="hero-cta-recruiter"
              onClick={() => navigate('/signup')}
              className="btn-gradient px-8 py-3.5 text-white font-semibold rounded-xl flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start as Recruiter
              <ArrowRight size={16} />
            </button>
            <button
              id="hero-cta-candidate"
              onClick={() => navigate('/signup')}
              className="px-8 py-3.5 border border-border text-white font-semibold rounded-xl hover:bg-surface-2 hover:border-primary-500/30 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Upload Your Resume
              <ChevronRight size={16} />
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {['95% Accuracy', '500+ Resumes Ranked', 'Real-time Analysis', 'Free to Use'].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-blue-violet opacity-10 blur-3xl rounded-3xl" />
              <div className="relative glass-card p-4 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[['87', 'Top Match', 'emerald'], ['72', 'Skill Score', 'blue'], ['94', 'ATS Score', 'violet']].map(([val, label, c]) => (
                    <div key={label} className="bg-surface-2 rounded-xl p-3 text-center">
                      <div className={`text-2xl font-bold text-${c}-400`}>{val}%</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[['Sarah J.', 87, 'emerald'], ['Mike R.', 74, 'blue'], ['Ana K.', 61, 'amber'], ['Tom W.', 48, 'orange']].map(([name, score, color]) => (
                    <div key={name as string} className="flex items-center gap-3 bg-surface-2 rounded-lg p-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-violet flex items-center justify-center text-xs font-bold text-white">
                        {(name as string).charAt(0)}
                      </div>
                      <span className="text-sm text-white flex-1">{name as string}</span>
                      <div className="flex-1 bg-surface-3 rounded-full h-1.5 mx-2">
                        <div className={`h-1.5 rounded-full bg-${color}-400`} style={{ width: `${score}%` }} />
                      </div>
                      <span className={`text-xs font-medium text-${color}-400`}>{score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="badge-blue mb-4 mx-auto">Features</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything you need to hire <span className="text-gradient">smarter</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From NLP-powered parsing to interactive dashboards, we've got the full recruitment pipeline covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              className="glass-card p-6 group cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${color === 'blue' ? 'bg-primary-500/15' : 'bg-violet-500/15'}`}>
                <Icon size={20} className={color === 'blue' ? 'text-primary-400' : 'text-violet-400'} />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="badge-violet mb-4 mx-auto">Process</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            How it <span className="text-gradient">works</span>
          </h2>
          <p className="text-muted-foreground text-lg">Simple 4-step process from job creation to ranked results.</p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary-500 to-violet-500 hidden md:block" />
          <div className="space-y-8">
            {steps.map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-violet flex items-center justify-center text-white font-bold text-lg z-10 shadow-glow-blue">
                  {num}
                </div>
                <div className="glass-card flex-1 p-5">
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="badge-blue mb-4 mx-auto">Contributors</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Built by <span className="text-gradient">passionate developers</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map(({ name, role, avatar, color }, i) => (
            <motion.div
              key={name}
              className="glass-card p-6 flex flex-col items-center text-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                {avatar}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
              </div>
              <div className="flex gap-2">
                {[Github, Twitter, Linkedin].map((SocialIcon, j) => (
                  <button key={j} className="text-muted-foreground hover:text-white transition-colors">
                    <SocialIcon size={13} />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center glass-card p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-blue-violet opacity-5 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-violet" />
          <Star className="mx-auto text-amber-400 mb-4" size={28} />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your hiring?</h2>
          <p className="text-muted-foreground mb-8">Join today and let AI do the heavy lifting.</p>
          <button
            onClick={() => navigate('/signup')}
            className="btn-gradient px-10 py-3.5 text-white font-semibold rounded-xl inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={14} className="text-primary-400" />
          <span className="text-white font-semibold">ResumeAI</span>
        </div>
        <p>© 2024 Smart Resume Scanner. Built with ❤️ using React, Flask & spaCy.</p>
      </footer>
    </div>
  );
}
