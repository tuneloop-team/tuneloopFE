import { useState, FormEvent } from 'react';
import api from '../services/api';
import SongCard from '../components/SongCard';
import type {
  Profile,
  Song,
  ApiResponse,
  CreateProfilePayload,
} from '../types';

export default function ProfilePage() {
  const [form, setForm] = useState<CreateProfilePayload>({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post<ApiResponse<Profile>>('/profile', form);
      setProfile(res.data.data);
      setLikedSongs([]);
      setForm({ username: '', displayName: '', bio: '', avatarUrl: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ─── Search by username ────────────────────────────────
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setError(null);
    setSearchLoading(true);

    try {
      const res = await api.get<ApiResponse<Profile>>(
        `/profile/${searchUsername.trim()}`,
      );
      setProfile(res.data.data);

      // Fetch liked songs
      const likesRes = await api.get<ApiResponse<Song[]>>(
        `/songs/liked/${searchUsername.trim()}`,
      );
      setLikedSongs(likesRes.data.data);
    } catch (err) {
      setProfile(null);
      setLikedSongs([]);
      setError(err instanceof Error ? err.message : 'Profile not found');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLikeToggle = async (
    songId: string,
    isLiked: boolean,
  ): Promise<void> => {
    if (!profile) return;

    try {
      if (isLiked) {
        await api.delete(`/songs/${songId}/like`, {
          body: JSON.stringify({ username: profile.username }),
          headers: { 'Content-Type': 'application/json' },
        });
        setLikedSongs((prev) => prev.filter((s) => s.id !== songId));
      } else {
        await api.post(`/songs/${songId}/like`, {
          username: profile.username,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Like action failed');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

      {/* ─── Error Banner ──────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ─── Search ────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Find Profile
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </section>

      {/* ─── Profile Card ──────────────────────────────── */}
      {profile && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-2xl font-bold text-primary-600">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.display_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {profile.display_name}
              </h3>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── Liked Songs ───────────────────────────────── */}
      {profile && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Liked Songs ({likedSongs.length})
          </h2>
          {likedSongs.length > 0 ? (
            <div className="space-y-3">
              {likedSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  username={profile.username}
                  onLikeToggle={handleLikeToggle}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white py-8 text-center">
              <p className="text-gray-400">No liked songs yet</p>
            </div>
          )}
        </section>
      )}

      {/* ─── Create Profile Form ───────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Create New Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username *
            </label>
            <input
              type="text"
              name="username"
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-Z0-9_]+$"
              value={form.username}
              onChange={handleChange}
              placeholder="john_doe"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Letters, numbers, underscores only
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Display Name *
            </label>
            <input
              type="text"
              name="displayName"
              required
              maxLength={100}
              value={form.displayName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Avatar URL
            </label>
            <input
              type="url"
              name="avatarUrl"
              value={form.avatarUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Profile'
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
