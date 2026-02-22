import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col items-center justify-center px-8 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50">
        <Icon className="h-8 w-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-800">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-surface-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
