/** Sign Up Page */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { RegisterPayload } from '../types';

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterPayload>({ name: '', email: '', password: '', role: 'candidate' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate(form.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-violet flex items-center justify-center shadow-glow-blue">
            <Brain size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">ResumeAI</span>
        </Link>

        <div className="glass-card p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-muted-foreground text-sm">Join thousands using AI-powered hiring</p>
          </div>

          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Role selector */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-muted-foreground mb-2">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { role: 'recruiter', icon: Briefcase, label: 'Recruiter', desc: 'Post jobs & rank candidates' },
                { role: 'candidate', icon: GraduationCap, label: 'Candidate', desc: 'Upload resume & track score' },
              ] as const).map(({ role, icon: Icon, label, desc }) => (
                <button
                  key={role}
                  id={`role-${role}`}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role }))}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center transition-all duration-200 ${
                    form.role === role
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-border bg-surface-2 text-muted-foreground hover:border-border-2'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium text-white">{label}</span>
                  <span className="text-xs">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form id="signup-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="input-dark pl-10"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input-dark pl-10"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
                  className="input-dark pl-10 pr-10"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  onClick={() => setShowPass(p => !p)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
