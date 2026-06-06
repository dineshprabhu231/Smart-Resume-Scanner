/** Loading spinner and skeleton components */
import { motion } from 'framer-motion';

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      className="rounded-full border-2 border-primary-500/20 border-t-primary-500"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="h-4 w-1/3 bg-surface-3 rounded shimmer" />
      <div className="h-3 w-2/3 bg-surface-3 rounded shimmer" />
      <div className="h-3 w-1/2 bg-surface-3 rounded shimmer" />
    </div>
  );
}
