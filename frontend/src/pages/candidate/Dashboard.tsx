/**
 * Candidate Dashboard — resume analysis, match score, recommended jobs
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Zap, TrendingUp, CheckCircle2,
  AlertCircle, Briefcase, BarChart3, Clock
} from 'lucide-react';
import { resumesApi, jobsApi, analysisApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/shared/StatCard';
import ScoreRing from '../../components/shared/ScoreRing';
import { SkillGroup } from '../../components/shared/SkillTag';
import { SkeletonCard } from '../../components/shared/Loader';
import { formatDate, formatScore } from '../../lib/utils';
import type { Resume, Job } from '../../types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, jRes] = await Promise.all([resumesApi.myResumes(), jobsApi.list()]);
        setResumes(rRes.data.resumes);
        setJobs(jRes.data.jobs);
        // Load analysis for first resume if exists
        if (rRes.data.resumes.length > 0) {
          const aRes = await analysisApi.getCandidateAnalysis(rRes.data.resumes[0].id);
          setAnalysis(aRes.data);
        }
      } catch {
        // Silently handle — shows empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latest = resumes[0];

  const radarData = latest ? [
    { subject: 'Skills', value: Math.min(latest.extracted_skills.length * 6, 100) },
    { subject: 'ATS', value: latest.ats_score },
    { subject: 'Quality', value: latest.quality_score },
    { subject: 'Keywords', value: Math.min(latest.keywords.length * 4, 100) },
    { subject: 'Match', value: analysis?.best_match_score || 0 },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-gradient">{user?.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {latest ? 'Your resume is analyzed. Here\'s your profile summary.' : 'Upload your resume to get started with AI analysis.'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Resumes Uploaded" value={resumes.length} color="blue" delay={0} />
        <StatCard icon={BarChart3} label="ATS Score" value={latest ? `${latest.ats_score}%` : '—'} color="violet" delay={0.08} />
        <StatCard icon={Zap} label="Quality Score" value={latest ? `${latest.quality_score}%` : '—'} color="green" delay={0.16} />
        <StatCard icon={TrendingUp} label="Best Job Match" value={analysis ? `${Math.round(analysis.best_match_score)}%` : '—'} color="amber" delay={0.24} />
      </div>

      {latest ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Resume analysis card */}
          <motion.div
            className="glass-card p-6 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-white">Resume Analysis</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{latest.filename} · {formatDate(latest.uploaded_at)}</p>
              </div>
              <button
                onClick={() => navigate('/candidate/upload')}
                className="btn-gradient px-3 py-1.5 text-xs text-white rounded-lg flex items-center gap-1.5"
              >
                <Upload size={12} /> New Upload
              </button>
            </div>

            {/* Score bars */}
            <div className="space-y-3 mb-5">
              {[
                { label: 'ATS Compatibility', value: latest.ats_score, color: '#3B82F6' },
                { label: 'Resume Quality', value: latest.quality_score, color: '#8B5CF6' },
                { label: 'Best Job Match', value: analysis?.best_match_score || 0, color: '#10B981' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-white font-medium">{Math.round(value)}%</span>
                  </div>
                  <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Extracted Skills ({latest.extracted_skills.length})</h3>
              <SkillGroup skills={latest.extracted_skills} variant="extra" max={16} />
            </div>
          </motion.div>

          {/* Radar chart */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-semibold text-white mb-4">Profile Radar</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
                <Tooltip
                  contentStyle={{ background: '#0F1629', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${Math.round(v)}%`]}
                />
              </RadarChart>
            </ResponsiveContainer>

            {analysis?.best_match_job && (
              <div className="mt-4 p-3 bg-surface-2 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Best matching job</p>
                <p className="text-sm font-medium text-white">{analysis.best_match_job.title}</p>
                <p className="text-xs text-emerald-400 mt-1">{Math.round(analysis.best_match_score)}% match</p>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* Empty state */
        <motion.div
          className="glass-card p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Upload your resume to begin</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Get AI-powered analysis including skill extraction, ATS scoring, and job match percentages.
          </p>
          <button
            id="upload-resume-btn"
            onClick={() => navigate('/candidate/upload')}
            className="btn-gradient px-6 py-3 text-white font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <Upload size={16} /> Upload Resume
          </button>
        </motion.div>
      )}

      {/* Recommended jobs */}
      {jobs.length > 0 && (
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-primary-400" />
            Recommended Jobs ({jobs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jobs.slice(0, 4).map((job, i) => (
              <motion.div
                key={job.id}
                className="bg-surface-2 rounded-xl p-4 border border-border hover:border-primary-500/30 transition-all group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-white text-sm group-hover:text-primary-400 transition-colors">{job.title}</h3>
                  <span className="badge-blue shrink-0">Open</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={11} />
                  <span>{formatDate(job.created_at)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
