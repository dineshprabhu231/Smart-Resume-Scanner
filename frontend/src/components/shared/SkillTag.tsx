/** Skill badge list — shows matched (green), missing (red), extra (blue) */
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SkillTagProps {
  skill: string;
  variant?: 'matched' | 'missing' | 'extra' | 'default';
  index?: number;
}

const variantMap = {
  matched: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  missing: 'bg-red-500/15 text-red-400 border-red-500/30',
  extra: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
  default: 'bg-surface-2 text-muted-foreground border-border',
};

export function SkillTag({ skill, variant = 'default', index = 0 }: SkillTagProps) {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border',
        variantMap[variant]
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      {skill}
    </motion.span>
  );
}

interface SkillGroupProps {
  skills: string[];
  variant?: SkillTagProps['variant'];
  max?: number;
}

export function SkillGroup({ skills, variant = 'default', max = 20 }: SkillGroupProps) {
  const visible = skills.slice(0, max);
  const extra = skills.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((s, i) => (
        <SkillTag key={s} skill={s} variant={variant} index={i} />
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 text-muted border-border border">
          +{extra} more
        </span>
      )}
    </div>
  );
}
