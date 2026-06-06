/** Dashboard Sidebar — navigation for recruiter and candidate */
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Briefcase, BarChart3,
  Users, LogOut, Brain, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const recruiterLinks = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiter/jobs', icon: Briefcase, label: 'Job Postings' },
  { to: '/recruiter/candidates', icon: Users, label: 'Candidates' },
  { to: '/recruiter/analysis', icon: BarChart3, label: 'Analysis' },
];

const candidateLinks = [
  { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidate/upload', icon: FileText, label: 'Upload Resume' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'recruiter' ? recruiterLinks : candidateLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
      style={{
        background: 'rgba(11,17,32,0.95)',
        borderRight: '1px solid rgba(30,45,74,0.8)',
        backdropFilter: 'blur(20px)',
      }}
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-blue-violet flex items-center justify-center">
          <Brain size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Resume</p>
          <p className="text-xs text-muted-foreground leading-tight">Scanner AI</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <span className={`badge text-xs ${user?.role === 'recruiter' ? 'badge-blue' : 'badge-violet'}`}>
          {user?.role === 'recruiter' ? '👔 Recruiter' : '🎓 Candidate'}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={12} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-violet flex items-center justify-center text-white text-xs font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
