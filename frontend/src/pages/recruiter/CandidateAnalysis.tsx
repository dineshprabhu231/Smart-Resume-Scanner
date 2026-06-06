/**
 * Candidate Analysis Page — detailed match breakdown, charts, insights
 * Route: /recruiter/analysis/:resumeId/:jobId
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Brain, CheckCircle2, XCircle, Zap,
  BarChart3, Target, Lightbulb, Star, TrendingUp
} from 'lucide-react';
import { analysisApi } from '../../api';
import type { DetailedAnalysis } from '../../types';
import ScoreRing from '../../components/shared/ScoreRing';
import { SkillGroup } from '../../components/shared/SkillTag';
import { PageLoader } from '../../components/shared/Loader';
import { getScoreBg, getScoreColor } from '../../lib/utils';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell
} from 'recharts';

export default function CandidateAnalysis() {
  const { resumeId, jobId } = useParams<{ resumeId: string; jobId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!resumeId || !jobId) return;
      try {
        const res = await analysisApi.getDetail(Number(resumeId), Number(jobId));
        setAnalysis(res.data);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resumeId, jobId]);

  if (loading) return <PageLoader />;
  if (error || !analysis) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error || 'Analysis not found'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-400 hover:underline text-sm">
          ← Go Back
        </button>
      </div>
    );
  }

  const radarData = [
    { subject: 'TF-IDF', value: Math.round(analysis.tfidf_score) },
    { subject: 'Skills', value: Math.round(analysis.skill_analysis.skill_match_percentage) },
    { subject: 'ATS', value: Math.round(analysis.ats_score) },
    { subject: 'Quality', value: Math.round(analysis.quality_score) },
    { subject: 'Overall', value: Math.round(analysis.match_score) },
  ];

  const skillBarData = [
    { name: 'Matched', value: analysis.skill_analysis.matched_skills.length, fill: '#10B981' },
    { name: 'Missing', value: analysis.skill_analysis.missing_skills.length, fill: '#EF4444' },
    { name: 'Bonus', value: analysis.skill_analysis.extra_skills.length, fill: '#3B82F6' },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      {/* Back + header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Candidate Analysis</h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="text-white font-medium">{analysis.candidate_name}</span>
              {' '}→ <span className="text-primary-400">{analysis.job_title}</span>
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl font-semibold text-sm ${
            analysis.match_score >= 75 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
            analysis.match_score >= 50 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
            'bg-red-500/15 text-red-400 border border-red-500/25'
          }`}>
            {analysis.match_score >= 75 ? '⭐ Strong Match' : analysis.match_score >= 50 ? '🔶 Moderate Match' : '🔴 Weak Match'}
          </div>
        </div>
      </motion.div>

      {/* Score overview row */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Target size={16} className="text-primary-400" />
          Score Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
          <ScoreRing score={analysis.match_score} size={110} label="Overall Match" />
          <ScoreRing score={analysis.tfidf_score} size={110} label="Content Match" />
          <ScoreRing score={analysis.ats_score} size={110} label="ATS Score" />
          <ScoreRing score={analysis.quality_score} size={110} label="Quality" />
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar chart */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 size={15} className="text-violet-400" />
            Score Breakdown Radar
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ background: '#0F1629', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skills bar chart */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Zap size={15} className="text-primary-400" />
            Skill Match Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={skillBarData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0F1629', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {skillBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Skill summary */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Matched', count: analysis.skill_analysis.matched_skills.length, color: 'text-emerald-400' },
              { label: 'Missing', count: analysis.skill_analysis.missing_skills.length, color: 'text-red-400' },
              { label: 'Bonus', count: analysis.skill_analysis.extra_skills.length, color: 'text-primary-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-surface-2 rounded-xl p-2.5 text-center">
                <p className={`text-xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Skills detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Matched skills */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Matched Skills ({analysis.skill_analysis.matched_skills.length})
          </h3>
          {analysis.skill_analysis.matched_skills.length > 0 ? (
            <SkillGroup skills={analysis.skill_analysis.matched_skills} variant="matched" />
          ) : (
            <p className="text-xs text-muted-foreground">No required skills matched.</p>
          )}
        </motion.div>

        {/* Missing skills */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <XCircle size={14} className="text-red-400" />
            Missing Skills ({analysis.skill_analysis.missing_skills.length})
          </h3>
          {analysis.skill_analysis.missing_skills.length > 0 ? (
            <SkillGroup skills={analysis.skill_analysis.missing_skills} variant="missing" />
          ) : (
            <p className="text-xs text-emerald-400">All required skills are present! 🎉</p>
          )}
        </motion.div>

        {/* Bonus skills */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <Star size={14} className="text-primary-400" />
            Bonus Skills ({analysis.skill_analysis.extra_skills.length})
          </h3>
          {analysis.skill_analysis.extra_skills.length > 0 ? (
            <SkillGroup skills={analysis.skill_analysis.extra_skills} variant="extra" />
          ) : (
            <p className="text-xs text-muted-foreground">No additional skills beyond requirements.</p>
          )}
        </motion.div>
      </div>

      {/* All extracted skills */}
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp size={15} className="text-primary-400" />
          All Extracted Skills from Resume
        </h2>
        <SkillGroup skills={analysis.extracted_skills} variant="default" max={30} />
      </motion.div>

      {/* AI Insights */}
      {analysis.insights.length > 0 && (
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Brain size={15} className="text-violet-400" />
            AI Insights & Recommendations
          </h2>
          <div className="space-y-2.5">
            {analysis.insights.map((insight, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 p-3.5 bg-surface-2 rounded-xl border border-border"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06 }}
              >
                <Lightbulb size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-white/90">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Keywords */}
      {analysis.keywords.length > 0 && (
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <h2 className="font-semibold text-white mb-3 text-sm">Top Resume Keywords</h2>
          <div className="flex flex-wrap gap-1.5">
            {analysis.keywords.slice(0, 20).map((kw, i) => (
              <span key={kw} className="text-xs px-2.5 py-1 rounded-lg bg-surface-2 text-muted-foreground border border-border">
                {kw}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
