/**
 * Recruiter Candidates Page — view all resumes with basic info
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, FileText, Clock } from 'lucide-react';
import { resumesApi } from '../../api';
import { formatDate, getScoreColor } from '../../lib/utils';
import type { Resume } from '../../types';
import { SkeletonCard } from '../../components/shared/Loader';
import { SkillGroup } from '../../components/shared/SkillTag';

export default function Candidates() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    resumesApi.allResumes()
      .then(r => setResumes(r.data.resumes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = resumes.filter(r =>
    r.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.candidate_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">All Candidates</h1>
          <p className="text-muted-foreground text-sm mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidates…"
            className="bg-surface-2 border border-border rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary-500 transition-colors w-52"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <Users size={32} className="mx-auto mb-3 text-muted opacity-30" />
          <p className="text-muted-foreground text-sm">
            {resumes.length === 0 ? 'No candidates have uploaded resumes yet.' : 'No candidates match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              className="glass-card p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-violet flex items-center justify-center text-white font-bold shrink-0">
                  {r.candidate_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-white text-sm">{r.candidate_name}</p>
                      <p className="text-xs text-muted-foreground">{r.candidate_email}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock size={11} />{formatDate(r.uploaded_at)}</span>
                      <span className={`font-semibold ${getScoreColor(r.ats_score)}`}>ATS {Math.round(r.ats_score)}%</span>
                      <span className={`font-semibold ${getScoreColor(r.quality_score)}`}>Quality {Math.round(r.quality_score)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={11} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{r.filename}</span>
                  </div>
                  <SkillGroup skills={r.extracted_skills} variant="extra" max={10} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
