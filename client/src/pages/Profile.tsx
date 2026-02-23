import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  Calendar,
  Heart,
  Music,
  ListMusic,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import SongCard from '../components/SongCard';
import { ProfileCardSkeleton, SongCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import type {
  Profile,
  Song,
  Playlist,
  ApiResponse,
  CreateProfilePayload,
} from '../types';

export default function ProfilePage() {
  const { toast } = useToast();

  const [form, setForm] = useState<CreateProfilePayload>({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

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
      setCreateOpen(false);
      toast('Profile created successfully!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      toast(msg, 'error');
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

      const [likesRes, playlistsRes] = await Promise.all([
        api.get<ApiResponse<Song[]>>(
          `/songs/liked/${searchUsername.trim()}`,
        ),
        api.get<ApiResponse<Playlist[]>>(
          `/playlists/user/${searchUsername.trim()}`,
        ),
      ]);
      setLikedSongs(likesRes.data.data);
      setUserPlaylists(playlistsRes.data.data);
    } catch {
      setProfile(null);
      setLikedSongs([]);
      setUserPlaylists([]);
      toast('Profile not found', 'error');
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
    } catch {
      toast('Like action failed', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* ─── Page Header ───────────────────────────── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-surface-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-surface-400">
          Find a user or create a new profile
        </p>
      </div>

      {/* ─── Error Banner ──────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Search ────────────────────────────────── */}
      <section className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
            <Search className="h-4 w-4 text-primary-500" />
          </div>
          <h2 className="text-base font-bold text-surface-800">
            Find Profile
          </h2>
        </div>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Enter username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="input !pl-10"
            />
          </div>
          <button type="submit" disabled={searchLoading} className="btn-primary">
            {searchLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </form>
      </section>

      {/* ─── Loading Skeleton ──────────────────────── */}
      {searchLoading && (
        <div className="space-y-4">
          <ProfileCardSkeleton />
          <SongCardSkeleton />
          <SongCardSkeleton />
        </div>
      )}

      {/* ─── Profile Card ──────────────────────────── */}
      <AnimatePresence>
        {profile && !searchLoading && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="card overflow-hidden"
          >
            {/* Gradient banner */}
            <div className="h-24 bg-hero-mesh opacity-80" />

            <div className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="-mt-14 mb-4 flex items-end gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-primary-100 to-accent-100 text-3xl font-extrabold text-primary-600 shadow-glass">
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
                <div className="mb-1 min-w-0 flex-1">
                  <h3 className="truncate text-xl font-extrabold text-surface-900">
                    {profile.display_name}
                  </h3>
                  <p className="text-sm font-medium text-surface-400">
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mb-3 text-sm leading-relaxed text-surface-600 line-clamp-3">
                  {profile.bio}
                </p>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-surface-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined{' '}
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5 text-surface-400">
                  <Heart className="h-3.5 w-3.5" />
                  {likedSongs.length} liked song
                  {likedSongs.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── Liked Songs ───────────────────────────── */}
      {profile && !searchLoading && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <Heart className="h-4 w-4 text-red-400" />
            </div>
            <h2 className="text-base font-bold text-surface-800">
              Liked Songs
            </h2>
            <span className="badge-primary ml-auto">{likedSongs.length}</span>
          </div>

          {likedSongs.length > 0 ? (
            <div className="space-y-3">
              {likedSongs.map((song, i) => (
                <SongCard
                  key={song.id}
                  song={song}
                  username={profile.username}
                  onLikeToggle={handleLikeToggle}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Music}
              title="No liked songs yet"
              description="Head to the home page to discover and like songs"
            />
          )}
        </section>
      )}

      {/* ─── User Playlists ────────────────────────── */}
      {profile && !searchLoading && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50">
              <ListMusic className="h-4 w-4 text-accent-500" />
            </div>
            <h2 className="text-base font-bold text-surface-800">
              Playlists
            </h2>
            <span className="badge bg-accent-50 text-accent-600 ml-auto">
              {userPlaylists.length}
            </span>
          </div>

          {userPlaylists.length > 0 ? (
            <div className="space-y-3">
              {userPlaylists.map((pl, i) => (
                <motion.div
                  key={pl.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={`/playlists/${pl.id}`}
                    className="card card-hover flex items-center gap-4 p-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100">
                      <ListMusic className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-surface-900">
                        {pl.name}
                      </h3>
                      <p className="text-2xs text-surface-400">
                        {pl.track_count} track
                        {pl.track_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListMusic}
              title="No playlists yet"
              description="This user hasn't created any playlists"
            />
          )}
        </section>
      )}

      {/* ─── Create Profile (Accordion) ────────────── */}
      <section className="card overflow-hidden">
        <button
          onClick={() => setCreateOpen(!createOpen)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-surface-50"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50">
              <UserPlus className="h-4 w-4 text-accent-500" />
            </div>
            <h2 className="text-base font-bold text-surface-800">
              Create New Profile
            </h2>
          </div>
          {createOpen ? (
            <ChevronUp className="h-5 w-5 text-surface-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-surface-400" />
          )}
        </button>

        <AnimatePresence>
          {createOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-4 border-t border-surface-100 px-6 py-5"
              >
                {/* Username */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-surface-700">
                    Username <span className="text-danger-400">*</span>
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
                    className="input"
                  />
                  <p className="mt-1 text-2xs text-surface-400">
                    Letters, numbers, underscores only
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-surface-700">
                    Display Name <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    maxLength={100}
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-surface-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    maxLength={500}
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    className="input resize-none"
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-surface-700">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Profile
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
