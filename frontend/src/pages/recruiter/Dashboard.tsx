/**
 * Recruiter Dashboard — analytics, ranked candidates table, search/filter
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, TrendingUp, BarChart3, Search,
  Filter, ChevronRight, ArrowUpDown, Star, Clock, Eye
} from 'lucide-react';
import { jobsApi, analysisApi, resumesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/shared/StatCard';
import { SkeletonCard } from '../../components/shared/Loader';
import { formatDate, getScoreColor, getScoreBg } from '../../lib/utils';
import type { Job, RankedCandidate } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [totalResumes, setTotalResumes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const load = async () => {
      try {
        const [jRes, rRes] = await Promise.all([jobsApi.list(), resumesApi.allResumes()]);
        const jobList: Job[] = jRes.data.jobs;
        setJobs(jobList);
        setTotalResumes(rRes.data.resumes.length);
        if (jobList.length > 0) {
          setSelectedJob(jobList[0]);
          await rankFor(jobList[0].id);
        }
      } catch {/* silently fail */} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rankFor = async (jobId: number) => {
    setRankingLoading(true);
    try {
      const res = await analysisApi.rankCandidates(jobId);
      setCandidates(res.data.ranked_candidates);
    } catch {
      setCandidates([]);
    } finally {
      setRankingLoading(false);
    }
  };

  const handleJobSwitch = async (job: Job) => {
    setSelectedJob(job);
    await rankFor(job.id);
  };

  const filtered = candidates
    .filter(c =>
      c.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      c.candidate_email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortDir === 'desc' ? b.match_score - a.match_score : a.match_score - b.match_score);

  const chartData = filtered.slice(0, 8).map(c => ({
    name: c.candidate_name.split(' ')[0],
    score: Math.round(c.match_score),
  }));

  const avgScore = candidates.length
    ? Math.round(candidates.reduce((s, c) => s + c.match_score, 0) / candidates.length)
    : 0;

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
      <SkeletonCard />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient">{user?.name.split(' ')[0]}</span> 👔
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your recruitment overview.</p>
        </div>
        <button
          id="create-job-btn"
          onClick={() => navigate('/recruiter/jobs')}
          className="btn-gradient px-4 py-2.5 text-sm text-white font-semibold rounded-xl flex items-center gap-2"
        >
          <Briefcase size={14} /> New Job
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={jobs.length} color="blue" delay={0} />
        <StatCard icon={Users} label="Total Candidates" value={totalResumes} color="violet" delay={0.08} />
        <StatCard icon={TrendingUp} label="Avg Match Score" value={`${avgScore}%`} color="green" delay={0.16} />
        <StatCard icon={Star} label="Top Score" value={candidates[0] ? `${Math.round(candidates[0].match_score)}%` : '—'} color="amber" delay={0.24} />
      </div>

      {/* Job selector + chart */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Job list */}
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Briefcase size={15} className="text-primary-400" />
              Your Job Postings
            </h2>
            <div className="space-y-2">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => handleJobSwitch(job)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                    selectedJob?.id === job.id
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-border bg-surface-2 text-muted-foreground hover:border-border-2 hover:text-white'
                  }`}
                >
                  <div className="font-medium text-white mb-0.5 truncate">{job.title}</div>
                  <div className="text-xs opacity-60">{formatDate(job.created_at)}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/recruiter/jobs')}
              className="mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              Manage jobs <ChevronRight size={12} />
            </button>
          </motion.div>

          {/* Bar chart */}
          <motion.div
            className="glass-card p-5 lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="font-semibold text-white mb-4">
              Candidate Scores — {selectedJob?.title}
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0F1629', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, 'Match Score']}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={getScoreBg(entry.score)} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                No candidates yet — they'll appear once resumes are uploaded.
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Candidates ranking table */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {/* Table header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <h2 className="font-semibold text-white flex items-center gap-2 flex-1">
            <Users size={15} className="text-violet-400" />
            Ranked Candidates
            {candidates.length > 0 && (
              <span className="badge-violet ml-1">{candidates.length}</span>
            )}
          </h2>

          {/* Search */}
          <div className="relative w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="candidate-search"
              type="text"
              placeholder="Search candidates…"
              className="w-full bg-surface-2 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-primary-500 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white bg-surface-2 border border-border rounded-lg px-3 py-1.5 transition-colors"
          >
            <ArrowUpDown size={12} />
            {sortDir === 'desc' ? 'Highest first' : 'Lowest first'}
          </button>
        </div>

        {/* Table */}
        {rankingLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
            Ranking candidates…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {candidates.length === 0
              ? 'No resumes uploaded yet. Candidates will appear here once they apply.'
              : 'No candidates match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Candidate</th>
                  <th className="text-left px-5 py-3 font-medium">Match Score</th>
                  <th className="text-left px-5 py-3 font-medium">ATS</th>
                  <th className="text-left px-5 py-3 font-medium">Skills</th>
                  <th className="text-left px-5 py-3 font-medium">Uploaded</th>
                  <th className="text-left px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-violet flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {c.candidate_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{c.candidate_name}</p>
                          <p className="text-xs text-muted-foreground">{c.candidate_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${c.match_score}%`, backgroundColor: getScoreBg(c.match_score) }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getScoreColor(c.match_score)}`}>
                          {Math.round(c.match_score)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-medium ${getScoreColor(c.ats_score)}`}>
                        {Math.round(c.ats_score)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap max-w-[160px]">
                        {c.skills.slice(0, 3).map(s => (
                          <span key={s} className="badge-blue text-xs">{s}</span>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{c.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(c.uploaded_at)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        id={`view-candidate-${c.id}`}
                        onClick={() => navigate(`/recruiter/analysis/${c.id}/${selectedJob?.id}`)}
                        className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/15 border border-primary-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Eye size={12} /> Analyze
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Empty jobs state */}
      {jobs.length === 0 && (
        <motion.div
          className="glass-card p-14 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Create your first job posting</h2>
          <p className="text-muted-foreground text-sm mb-6">Once you post a job, candidates can apply and you can rank them.</p>
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="btn-gradient px-6 py-3 text-white font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <Briefcase size={16} /> Create Job Posting
          </button>
        </motion.div>
      )}
    </div>
  );
}
