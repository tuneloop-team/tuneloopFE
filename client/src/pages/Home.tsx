import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, Headphones, Mic2, LayoutGrid, List } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import SongCard from '../components/SongCard';
import { SongCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import type { Song, ApiResponse } from '../types';

type SearchBy = 'all' | 'artist' | 'title';

const filterButtons: { value: SearchBy; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Music className="h-3.5 w-3.5" /> },
  { value: 'artist', label: 'Artist', icon: <Mic2 className="h-3.5 w-3.5" /> },
  { value: 'title', label: 'Title', icon: <Headphones className="h-3.5 w-3.5" /> },
];

export default function Home() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('all');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Username for like functionality
  const [username, setUsername] = useState(
    () => localStorage.getItem('tuneloop_username') || '',
  );

  const saveUsername = (val: string): void => {
    setUsername(val);
    localStorage.setItem('tuneloop_username', val);
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({ q: query.trim(), by: searchBy });
      if (username) params.set('username', username);

      const res = await api.get<ApiResponse<Song[]>>(
        `/songs/search?${params.toString()}`,
      );
      setResults(res.data.data);
      if (res.data.data.length === 0) {
        toast('No songs found. Try a different search.', 'info');
      }
    } catch {
      toast('Search failed. Please try again.', 'error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (
    songId: string,
    isLiked: boolean,
  ): Promise<void> => {
    if (!username) return;

    try {
      if (isLiked) {
        await api.delete(`/songs/${songId}/like`, {
          body: JSON.stringify({ username }),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await api.post(`/songs/${songId}/like`, { username });
      }

      setResults((prev) =>
        prev.map((s) =>
          s.id === songId
            ? {
                ...s,
                is_liked: !isLiked,
                like_count: isLiked ? s.like_count - 1 : s.like_count + 1,
              }
            : s,
        ),
      );
    } catch {
      toast('Like action failed', 'error');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════════════ */}
      <section className="relative -mx-4 -mt-8 overflow-hidden px-4 pb-12 pt-16 sm:-mx-6 sm:px-6">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-hero-mesh opacity-[0.06]" />
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl" />
        <div className="absolute -right-32 top-0 h-64 w-64 rounded-full bg-accent-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Discover{' '}
            <span className="gradient-text gradient-text-hover">Music</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 text-base text-surface-500 sm:text-lg"
          >
            Search by artist or song title, and like your favorites
          </motion.p>

          {/* Username pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 flex max-w-sm items-center gap-2 rounded-full border border-surface-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm"
          >
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => saveUsername(e.target.value)}
              placeholder="enter to enable likes..."
              className="min-w-0 flex-1 bg-transparent text-sm text-surface-700 placeholder:text-surface-300 focus:outline-none"
            />
            {username && (
              <span className="rounded-full bg-success-50 px-2 py-0.5 text-2xs font-bold text-success-600">
                Active
              </span>
            )}
          </motion.div>

          {/* ─── Search Bar ────────────────────────── */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch}
            className="group relative mx-auto mt-6 max-w-xl"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400 transition-colors group-focus-within:text-primary-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchBy === 'artist'
                    ? 'Search by artist name...'
                    : searchBy === 'title'
                      ? 'Search by song title...'
                      : 'Search by artist or title...'
                }
                className="w-full rounded-2xl border border-surface-200 bg-white/90 py-3.5 pl-12 pr-24 text-sm shadow-glass backdrop-blur-md transition-all duration-200 placeholder:text-surface-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:shadow-glow"
              />
              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 !rounded-xl !px-4 !py-2 text-xs"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* Filter pills */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {filterButtons.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSearchBy(value)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    searchBy === value
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'bg-white/80 text-surface-500 shadow-sm hover:bg-white hover:text-surface-700 hover:shadow-md'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}

              {/* Keyboard hint */}
              <span className="ml-3 hidden items-center gap-1 text-2xs text-surface-300 sm:flex">
                Press <kbd className="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-2xs">/</kbd> to focus
              </span>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          RESULTS
         ════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-3xl">
        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {searched && !loading && results.length > 0 && (
          <div>
            {/* Results header */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-surface-500">
                <span className="text-surface-900">{results.length}</span> result
                {results.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-1 rounded-lg border border-surface-200 bg-white p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 transition-colors ${viewMode === 'list' ? 'bg-surface-100 text-surface-900' : 'text-surface-400 hover:text-surface-600'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-surface-100 text-surface-900' : 'text-surface-400 hover:text-surface-600'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Song list */}
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
                    : 'space-y-3'
                }
              >
                {results.map((song, i) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    username={username}
                    onLikeToggle={handleLikeToggle}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <EmptyState
            icon={Search}
            title="No songs found"
            description="Try a different search term or change the filter"
            action={
              <button onClick={clearSearch} className="btn-secondary text-xs">
                Clear search
              </button>
            }
          />
        )}

        {/* Initial state */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <EmptyState
              icon={Headphones}
              title="Start discovering"
              description="Search for your favorite artists or song titles to explore music"
            />
          </motion.div>
        )}
      </section>
    </div>
  );
}
