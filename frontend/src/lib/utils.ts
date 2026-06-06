/** Utility for merging Tailwind class names */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a score (0–100) to display string */
export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

/** Get color class based on score */
export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

/** Truncate long text */
export function truncate(str: string, max = 50): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Format date string */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
