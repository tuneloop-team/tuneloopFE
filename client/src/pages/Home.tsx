import { useState, FormEvent } from 'react';
import api from '../services/api';
import SongCard from '../components/SongCard';
import type { Song, ApiResponse } from '../types';

type SearchBy = 'all' | 'artist' | 'title';

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('all');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Username for like functionality (stored in localStorage)
  const [username, setUsername] = useState(
    () => localStorage.getItem('tuneloop_username') || '',
  );

  const saveUsername = (val: string): void => {
    setUsername(val);
    localStorage.setItem('tuneloop_username', val);
  };

  const handleSearch = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        by: searchBy,
      });
      if (username) params.set('username', username);

      const res = await api.get<ApiResponse<Song[]>>(
        `/songs/search?${params.toString()}`,
      );
      setResults(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
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

      // Update local state
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Like action failed');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Discover <span className="text-primary-500">Music</span>
        </h1>
        <p className="mt-1 text-gray-500">
          Search by artist or song title, and like your favorites
        </p>
      </div>

      {/* Username input (for likes) */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <label className="shrink-0 text-sm font-medium text-gray-600">
          Your username:
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => saveUsername(e.target.value)}
          placeholder="Enter to enable likes..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex gap-3">
          <input
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
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search type toggle */}
        <div className="mt-3 flex gap-2">
          {(['all', 'artist', 'title'] as SearchBy[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSearchBy(type)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                searchBy === type
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all'
                ? 'All'
                : type === 'artist'
                  ? 'By Artist'
                  : 'By Title'}
            </button>
          ))}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-3">
            {results.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                username={username}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
          {results.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
              <p className="text-gray-400">
                No songs found. Try a different search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <div className="text-4xl">🎵</div>
          <p className="mt-3 text-gray-500">
            Start searching to discover music
          </p>
        </div>
      )}
    </div>
  );
}
