import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Github } from 'lucide-react';
import Header from './Header';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <AnimatePresence mode="wait">
        <motion.main
          id="main-content"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* ─── Footer ──────────────────────────────────── */}
      <footer className="border-t border-surface-100 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <Music2 className="h-4 w-4" />
            <span>
              &copy; {new Date().getFullYear()} TuneLoop &mdash; Music Discovery
              Platform
            </span>
          </div>
          <a
            href="https://github.com/tuneloop-team/tuneloopFE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-surface-400 transition-colors hover:text-surface-700"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
