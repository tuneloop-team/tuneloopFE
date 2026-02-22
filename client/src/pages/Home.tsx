import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Music,
  Headphones,
  Mic2,
  LayoutGrid,
  List,
  TrendingUp,
  Disc3,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import SongCard from '../components/SongCard';
import { SongCardSkeleton } from '../components/Skeleton';
import type { Song, ApiResponse } from '../types';

type SearchBy = 'all' | 'artist' | 'title';

interface Suggestion {
  type: 'artist' | 'title';
  value: string;
}

const filterButtons: {
  value: SearchBy;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'all', label: 'All', icon: <Music className="h-3.5 w-3.5" /> },
  {
    value: 'artist',
    label: 'Artist',
    icon: <Mic2 className="h-3.5 w-3.5" />,
  },
  {
    value: 'title',
    label: 'Title',
    icon: <Headphones className="h-3.5 w-3.5" />,
  },
];

/* ─── debounce utility ────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

export default function Home() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('all');
  const [results, setResults] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);
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

  // ─── Load all songs + trending on mount ─────────────────
  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const params = new URLSearchParams();
      if (username) params.set('username', username);

      const [allRes, trendRes] = await Promise.all([
        api.get<ApiResponse<Song[]>>(`/songs?${params.toString()}`),
        api.get<ApiResponse<Song[]>>(
          `/songs/trending?${params.toString()}&limit=5`,
        ),
      ]);
      setAllSongs(allRes.data.data);
      setTrendingSongs(trendRes.data.data);
    } catch {
      /* silent — feed is non-critical */
    } finally {
      setFeedLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // ─── Autocomplete suggestions ───────────────────────────
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiResponse<Suggestion[]>>(
          `/songs/suggest?q=${encodeURIComponent(debouncedQuery.trim())}`,
        );
        if (!cancelled) {
          setSuggestions(res.data.data);
          setShowSuggestions(true);
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestRef.current &&
        !suggestRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ─── Search ─────────────────────────────────────────────
  const doSearch = useCallback(
    async (q: string, by: SearchBy) => {
      if (!q.trim()) return;
      setLoading(true);
      setSearched(true);
      setShowSuggestions(false);

      try {
        const params = new URLSearchParams({ q: q.trim(), by });
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
    },
    [username, toast],
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    doSearch(query, searchBy);
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setQuery(s.value);
    const by = s.type === 'artist' ? 'artist' : 'title';
    setSearchBy(by);
    setShowSuggestions(false);
    doSearch(s.value, by);
  };

  // ─── Like toggle (works for both feed & results) ────────
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

      const updater = (prev: Song[]) =>
        prev.map((s) =>
          s.id === songId
            ? {
                ...s,
                is_liked: !isLiked,
                like_count: isLiked ? s.like_count - 1 : s.like_count + 1,
              }
            : s,
        );

      setResults(updater);
      setAllSongs(updater);
      setTrendingSongs(updater);
    } catch {
      toast('Like action failed', 'error');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Which songs to display (search results or full feed)
  const displaySongs = searched ? results : allSongs;
  const isLoading = searched ? loading : feedLoading;

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
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
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

          {/* ─── Search Bar + Autocomplete ─────────── */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch}
            className="group relative mx-auto mt-6 max-w-xl"
          >
            <div className="relative" ref={suggestRef}>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400 transition-colors group-focus-within:text-primary-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={
                  searchBy === 'artist'
                    ? 'Search by artist name...'
                    : searchBy === 'title'
                      ? 'Search by song title...'
                      : 'Search by artist or title...'
                }
                className="w-full rounded-2xl border border-surface-200 bg-white/90 py-3.5 pl-12 pr-24 text-sm shadow-glass backdrop-blur-md transition-all duration-200 placeholder:text-surface-400 focus:border-primary-400 focus:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary-100"
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
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>

              {/* ─── Suggestions Dropdown ────────── */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-glass-lg"
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s.type}-${s.value}-${i}`}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-50"
                      >
                        {s.type === 'artist' ? (
                          <Mic2 className="h-4 w-4 shrink-0 text-accent-400" />
                        ) : (
                          <Music className="h-4 w-4 shrink-0 text-primary-400" />
                        )}
                        <span className="min-w-0 truncate text-surface-700">
                          {s.value}
                        </span>
                        <span className="ml-auto shrink-0 rounded-full bg-surface-100 px-2 py-0.5 text-2xs font-semibold text-surface-400">
                          {s.type}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
                Press{' '}
                <kbd className="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-2xs">
                  /
                </kbd>{' '}
                to focus
              </span>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TRENDING SONGS (only when NOT searching)
         ════════════════════════════════════════════════════ */}
      {!searched && !feedLoading && trendingSongs.length > 0 && (
        <section className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-base font-bold text-surface-800">
              Trending Now
            </h2>
            <span className="badge bg-amber-50 text-amber-600">
              Most Liked
            </span>
          </div>
          <div className="space-y-3">
            {trendingSongs.map((song, i) => (
              <SongCard
                key={song.id}
                song={song}
                username={username}
                onLikeToggle={handleLikeToggle}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          SONG LIST (search results OR full catalog)
         ════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-3xl">
        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Song list */}
        {!isLoading && displaySongs.length > 0 && (
          <div>
            {/* Section header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!searched && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                    <Disc3 className="h-4 w-4 text-primary-500" />
                  </div>
                )}
                <p className="text-sm font-semibold text-surface-500">
                  {searched ? (
                    <>
                      <span className="text-surface-900">
                        {results.length}
                      </span>{' '}
                      result{results.length !== 1 ? 's' : ''} found
                    </>
                  ) : (
                    <span className="text-surface-800">All Songs</span>
                  )}
                </p>
                {searched && (
                  <button
                    onClick={clearSearch}
                    className="ml-2 flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-1 text-2xs font-semibold text-surface-500 transition-colors hover:bg-surface-200 hover:text-surface-700"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-surface-200 bg-white p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-surface-100 text-surface-900'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-surface-100 text-surface-900'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Songs */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${searched}-${viewMode}`}
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
                {displaySongs.map((song, i) => (
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

        {/* No results from search */}
        {searched && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col items-center justify-center px-8 py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50">
              <Search className="h-8 w-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-800">
              No songs found
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-surface-400">
              Try a different search term or change the filter
            </p>
            <button
              onClick={clearSearch}
              className="btn-secondary mt-5 text-xs"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
