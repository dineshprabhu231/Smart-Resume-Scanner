/** Animated stat card with icon, value, label, and optional trend */
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'violet' | 'green' | 'amber';
  delay?: number;
}

const colorMap = {
  blue: { icon: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
  violet: { icon: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  green: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'blue', delay = 0 }: StatCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
          <Icon size={18} className={c.icon} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}
