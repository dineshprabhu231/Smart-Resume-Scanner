/** Top navigation bar for dashboards */
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header
      className="h-14 flex items-center gap-4 px-6 sticky top-0 z-30"
      style={{
        background: 'rgba(11,17,32,0.9)',
        borderBottom: '1px solid rgba(30,45,74,0.6)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search…"
          className="w-full bg-surface-2/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors text-muted-foreground hover:text-white">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-violet flex items-center justify-center text-white text-xs font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-white hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
