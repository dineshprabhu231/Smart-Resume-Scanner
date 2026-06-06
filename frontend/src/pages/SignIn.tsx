/** Sign In Page */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      navigate(user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-violet flex items-center justify-center shadow-glow-blue">
            <Brain size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">ResumeAI</span>
        </Link>

        <div className="glass-card p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue to your dashboard</p>
          </div>

          {/* Demo credentials hint */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 mb-6 text-xs text-primary-400">
            <strong>Demo:</strong> recruiter@demo.com or candidate@demo.com · Password: demo1234
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

          <form id="signin-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signin-email"
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
                  id="signin-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="input-dark pl-10 pr-10"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  onClick={() => setShowPass(p => !p)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
