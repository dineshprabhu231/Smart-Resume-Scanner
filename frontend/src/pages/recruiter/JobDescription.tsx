/**
 * Job Description Manager — create, edit, delete job postings
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Trash2, Edit3, Save, X,
  Tags, FileText, Loader2, CheckCircle2
} from 'lucide-react';
import { jobsApi } from '../../api';
import type { Job } from '../../types';
import { formatDate } from '../../lib/utils';
import { SkillTag } from '../../components/shared/SkillTag';

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Flask', 'Django',
  'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'REST API',
  'Machine Learning', 'Data Science', 'Java', 'C++', 'Kubernetes', 'Linux',
];

interface JobFormData {
  title: string;
  description: string;
  skillInput: string;
  required_skills: string[];
}

const emptyForm = (): JobFormData => ({ title: '', description: '', skillInput: '', required_skills: [] });

export default function JobDescription() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<JobFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadJobs = async () => {
    try {
      const res = await jobsApi.list();
      setJobs(res.data.jobs);
    } catch {/* ignore */}
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !form.required_skills.includes(s)) {
      setForm(f => ({ ...f, required_skills: [...f.required_skills, s], skillInput: '' }));
    }
  };

  const removeSkill = (skill: string) =>
    setForm(f => ({ ...f, required_skills: f.required_skills.filter(s => s !== skill) }));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(form.skillInput);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        required_skills: form.required_skills,
      };
      if (editingId) {
        await jobsApi.update(editingId, payload);
      } else {
        await jobsApi.create(payload);
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowForm(false); setForm(emptyForm()); setEditingId(null); }, 1200);
      await loadJobs();
    } catch {/* ignore */}
    setSaving(false);
  };

  const handleEdit = (job: Job) => {
    setForm({ title: job.title, description: job.description, required_skills: job.required_skills, skillInput: '' });
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await jobsApi.delete(id);
      setJobs(js => js.filter(j => j.id !== id));
    } catch {/* ignore */}
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Job Postings</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage your job descriptions.</p>
        </div>
        <button
          id="new-job-btn"
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
          className="btn-gradient px-4 py-2.5 text-sm text-white font-semibold rounded-xl flex items-center gap-2"
        >
          <Plus size={15} /> New Job
        </button>
      </motion.div>

      {/* Job form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Briefcase size={16} className="text-primary-400" />
                {editingId ? 'Edit Job' : 'Create New Job'}
              </h2>
              <button onClick={() => { setShowForm(false); setForm(emptyForm()); setEditingId(null); }}
                className="text-muted-foreground hover:text-white transition-colors p-1">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Job Title *</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="job-title-input"
                    type="text"
                    placeholder="e.g. Senior Python Developer"
                    className="input-dark pl-10"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Job Description *</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-3.5 text-muted-foreground" />
                  <textarea
                    id="job-description-input"
                    rows={6}
                    placeholder="Describe responsibilities, requirements, and company culture…"
                    className="input-dark pl-10 resize-none"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: A detailed description improves AI matching accuracy.
                </p>
              </div>

              {/* Required skills */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Required Skills</label>
                <div className="relative">
                  <Tags size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="skill-input"
                    type="text"
                    placeholder="Type a skill and press Enter or comma…"
                    className="input-dark pl-10"
                    value={form.skillInput}
                    onChange={e => setForm(f => ({ ...f, skillInput: e.target.value }))}
                    onKeyDown={handleSkillKeyDown}
                  />
                </div>

                {/* Quick-add suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SKILL_SUGGESTIONS.filter(s => !form.required_skills.includes(s)).slice(0, 10).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="text-xs text-muted-foreground bg-surface-2 border border-border px-2.5 py-1 rounded-lg hover:border-primary-500/40 hover:text-primary-400 transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                </div>

                {/* Added skills */}
                {form.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.required_skills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-500/15 text-primary-400 border border-primary-500/30">
                        {s}
                        <button onClick={() => removeSkill(s)} className="hover:text-white">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  id="save-job-btn"
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.description}
                  className="btn-gradient px-6 py-2.5 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> :
                   saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                  {saved ? 'Saved!' : saving ? 'Saving…' : editingId ? 'Update Job' : 'Create Job'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(emptyForm()); setEditingId(null); }}
                  className="px-5 py-2.5 border border-border text-muted-foreground hover:text-white hover:border-border-2 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="h-5 w-1/3 bg-surface-3 rounded shimmer" />
              <div className="h-3 w-2/3 bg-surface-3 rounded shimmer" />
              <div className="h-3 w-1/2 bg-surface-3 rounded shimmer" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <Briefcase size={32} className="text-muted mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">No job postings yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              className="glass-card p-5 group"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm">{job.title}</h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        id={`edit-job-${job.id}`}
                        onClick={() => handleEdit(job)}
                        className="text-muted-foreground hover:text-primary-400 p-1.5 rounded-lg hover:bg-primary-500/10 transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        id={`delete-job-${job.id}`}
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                      >
                        {deletingId === job.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">{formatDate(job.created_at)}</span>
                    {job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.required_skills.slice(0, 5).map(s => (
                          <SkillTag key={s} skill={s} variant="extra" />
                        ))}
                        {job.required_skills.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{job.required_skills.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
