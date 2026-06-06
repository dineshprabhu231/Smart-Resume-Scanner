/**
 * Resume Upload Page — drag & drop, progress animation, validation
 */
import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, XCircle, Loader2,
  CloudUpload, File, AlertCircle, ArrowRight
} from 'lucide-react';
import { resumesApi } from '../../api';
import type { Resume } from '../../types';
import { SkillGroup } from '../../components/shared/SkillTag';
import ScoreRing from '../../components/shared/ScoreRing';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export default function ResumeUpload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<Resume | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const validateFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      return 'Only PDF and DOCX files are supported';
    }
    if (file.size > 16 * 1024 * 1024) {
      return 'File size must be less than 16 MB';
    }
    return null;
  };

  const handleUpload = useCallback(async (file: File) => {
    const err = validateFile(file);
    if (err) { setErrorMsg(err); setUploadState('error'); return; }

    setSelectedFile(file);
    setUploadState('uploading');
    setProgress(0);

    // Simulate progress
    const progressTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 85) { clearInterval(progressTimer); return 85; }
        return p + Math.random() * 12;
      });
    }, 200);

    try {
      const res = await resumesApi.upload(file);
      clearInterval(progressTimer);
      setProgress(100);
      setResult(res.data.resume);
      setTimeout(() => setUploadState('success'), 300);
    } catch (e: any) {
      clearInterval(progressTimer);
      setErrorMsg(e.response?.data?.error || 'Upload failed. Please try again.');
      setUploadState('error');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState('idle');
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const reset = () => {
    setUploadState('idle');
    setSelectedFile(null);
    setResult(null);
    setErrorMsg('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Upload Resume</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Our AI will parse your resume and extract skills, keywords, and compatibility scores instantly.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Success state ── */}
        {uploadState === 'success' && result ? (
          <motion.div
            key="success"
            className="space-y-5"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Success banner */}
            <div className="glass-card p-5 border-emerald-500/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Resume analyzed successfully!</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedFile?.name}</p>
              </div>
              <button onClick={reset} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Upload another
              </button>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'ATS Score', value: result.ats_score, color: '#3B82F6' },
                { label: 'Quality Score', value: result.quality_score, color: '#8B5CF6' },
                { label: 'Skills Found', value: Math.min(result.extracted_skills.length * 4, 100), color: '#10B981' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card p-5 flex flex-col items-center gap-2">
                  <ScoreRing score={value} size={90} strokeWidth={7} label={label} />
                </div>
              ))}
            </div>

            {/* Skills extracted */}
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary-400" />
                Extracted Skills ({result.extracted_skills.length})
              </h2>
              {result.extracted_skills.length > 0 ? (
                <SkillGroup skills={result.extracted_skills} variant="extra" />
              ) : (
                <p className="text-sm text-muted-foreground">No specific tech skills detected. Consider adding a dedicated skills section.</p>
              )}
            </div>

            {/* Keywords */}
            {result.keywords.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-semibold text-white mb-3">Top Keywords</h2>
                <SkillGroup skills={result.keywords.slice(0, 15)} variant="default" />
              </div>
            )}

            {/* Tips */}
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400" />
                AI Recommendations
              </h2>
              <ul className="space-y-2 text-sm">
                {result.ats_score < 70 && (
                  <li className="flex gap-2 text-amber-400"><span>•</span> Add an Experience, Skills, and Education section to improve ATS score</li>
                )}
                {result.extracted_skills.length < 5 && (
                  <li className="flex gap-2 text-amber-400"><span>•</span> List your technical skills explicitly with a dedicated Skills section</li>
                )}
                {result.quality_score >= 70 && (
                  <li className="flex gap-2 text-emerald-400"><span>•</span> Great resume quality! Continue quantifying your achievements</li>
                )}
                <li className="flex gap-2 text-primary-400"><span>•</span> Browse open jobs and check your match score for each role</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/candidate/dashboard')}
              className="btn-gradient w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </motion.div>
        ) : uploadState === 'uploading' ? (
          /* ── Uploading state ── */
          <motion.div
            key="uploading"
            className="glass-card p-12 text-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto">
              <Loader2 size={28} className="text-primary-400 animate-spin" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Analyzing your resume…</p>
              <p className="text-muted-foreground text-sm">{selectedFile?.name}</p>
            </div>
            {/* Progress bar */}
            <div className="max-w-sm mx-auto w-full">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Processing with AI</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-violet rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex flex-col gap-1 mt-4 text-xs text-left text-muted-foreground">
                {progress > 20 && <p className="text-primary-400">✓ File parsed successfully</p>}
                {progress > 45 && <p className="text-primary-400">✓ Extracting skills with spaCy NLP</p>}
                {progress > 70 && <p className="text-primary-400">✓ Computing ATS compatibility score</p>}
                {progress > 85 && <p className="text-amber-400">⟳ Computing quality metrics…</p>}
              </div>
            </div>
          </motion.div>
        ) : uploadState === 'error' ? (
          /* ── Error state ── */
          <motion.div
            key="error"
            className="glass-card p-10 text-center space-y-4 border-red-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <XCircle size={26} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Upload Failed</p>
              <p className="text-red-400 text-sm mt-1">{errorMsg}</p>
            </div>
            <button onClick={reset} className="btn-gradient px-6 py-2.5 text-white font-semibold rounded-xl text-sm">
              Try Again
            </button>
          </motion.div>
        ) : (
          /* ── Drop zone (idle / dragging) ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div
              id="resume-dropzone"
              onDragOver={e => { e.preventDefault(); setUploadState('dragging'); }}
              onDragLeave={() => setUploadState('idle')}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`glass-card p-14 text-center cursor-pointer transition-all duration-300 ${
                uploadState === 'dragging'
                  ? 'border-primary-500 bg-primary-500/5 shadow-glow-blue'
                  : 'hover:border-primary-500/40 hover:bg-surface-2/50'
              }`}
            >
              <input
                ref={inputRef}
                id="resume-file-input"
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={onFileChange}
              />

              <motion.div
                animate={uploadState === 'dragging' ? { scale: 1.1 } : { scale: 1 }}
                className="w-20 h-20 rounded-3xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-5"
              >
                <CloudUpload size={36} className="text-primary-400" />
              </motion.div>

              <h2 className="text-xl font-semibold text-white mb-2">
                {uploadState === 'dragging' ? 'Drop your resume here' : 'Drag & drop your resume'}
              </h2>
              <p className="text-muted-foreground text-sm mb-5">
                or click to browse files — PDF or DOCX, up to 16 MB
              </p>

              <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/25 text-primary-400 text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-primary-500/15 transition-colors">
                <File size={14} /> Choose File
              </div>
            </div>

            {/* Supported formats info */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: '📄', label: 'PDF', desc: 'Adobe PDF files' },
                { icon: '📝', label: 'DOCX', desc: 'Microsoft Word' },
                { icon: '📋', label: 'DOC', desc: 'Legacy Word format' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-surface-2 border border-border rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs font-medium text-white">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
