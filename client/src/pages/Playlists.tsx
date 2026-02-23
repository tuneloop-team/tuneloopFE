import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListMusic,
  Plus,
  Trash2,
  Loader2,
  Music,
  Calendar,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { SongCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import type { Playlist, ApiResponse } from '../types';

export default function Playlists() {
  const { toast } = useToast();

  const [username, setUsername] = useState(
    () => localStorage.getItem('tuneloop_username') || '',
  );
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Create form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const saveUsername = (val: string) => {
    setUsername(val);
    localStorage.setItem('tuneloop_username', val);
  };

  // ─── Load playlists ──────────────────────────────────
  const loadPlaylists = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Playlist[]>>(
        `/playlists/user/${username}`,
      );
      setPlaylists(res.data.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) loadPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // ─── Create playlist ─────────────────────────────────
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<ApiResponse<Playlist>>('/playlists', {
        username,
        name: name.trim(),
        description: description.trim(),
      });
      setPlaylists((prev) => [res.data.data, ...prev]);
      setName('');
      setDescription('');
      setShowCreate(false);
      toast('Playlist created!', 'success');
    } catch (err) {
      toast(
        err instanceof Error ? err.message : 'Failed to create playlist',
        'error',
      );
    } finally {
      setCreating(false);
    }
  };

  // ─── Delete playlist ─────────────────────────────────
  const handleDelete = async (playlistId: string) => {
    setDeleting(playlistId);
    try {
      await api.delete(`/playlists/${playlistId}`, {
        body: JSON.stringify({ username }),
        headers: { 'Content-Type': 'application/json' },
      });
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      toast('Playlist deleted', 'success');
    } catch {
      toast('Failed to delete playlist', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* ─── Page Header ───────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900">
            Playlists
          </h1>
          <p className="mt-1 text-sm text-surface-400">
            Create and manage your music collections
          </p>
        </div>
        {username && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary flex items-center gap-1.5"
          >
            {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreate ? 'Cancel' : 'New'}
          </button>
        )}
      </div>

      {/* ─── Username entry (if not set) ───────────── */}
      {!username && (
        <div className="card p-6 text-center">
          <ListMusic className="mx-auto mb-3 h-10 w-10 text-surface-300" />
          <h2 className="text-base font-bold text-surface-700">
            Enter your username to view playlists
          </h2>
          <div className="mx-auto mt-4 flex max-w-sm gap-2">
            <input
              type="text"
              placeholder="Username..."
              className="input flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveUsername((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = (e.target as HTMLElement)
                  .parentElement?.querySelector('input');
                if (input?.value) saveUsername(input.value);
              }}
              className="btn-primary"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {/* ─── Create Playlist Form ──────────────────── */}
      <AnimatePresence>
        {showCreate && username && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="card space-y-4 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50">
                  <Plus className="h-4 w-4 text-accent-500" />
                </div>
                <h2 className="text-base font-bold text-surface-800">
                  New Playlist
                </h2>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-surface-700">
                  Name <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  required
                  maxLength={200}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-surface-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this playlist about?"
                  rows={2}
                  maxLength={1000}
                  className="input resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="btn-primary w-full"
              >
                {creating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Playlist'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Playlists List ────────────────────────── */}
      {username && loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </div>
      )}

      {username && !loading && playlists.length === 0 && (
        <EmptyState
          icon={ListMusic}
          title="No playlists yet"
          description="Create your first playlist to start organizing music"
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Create Playlist
            </button>
          }
        />
      )}

      {username && !loading && playlists.length > 0 && (
        <div className="space-y-3">
          {playlists.map((pl, i) => (
            <motion.div
              key={pl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="card card-hover group flex items-center gap-4 p-4"
            >
              {/* Playlist icon */}
              <Link
                to={`/playlists/${pl.id}`}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 shadow-sm transition-transform group-hover:scale-105"
              >
                <ListMusic className="h-6 w-6 text-primary-500" />
              </Link>

              {/* Info */}
              <Link to={`/playlists/${pl.id}`} className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-surface-900 transition-colors group-hover:text-primary-600">
                  {pl.name}
                </h3>
                {pl.description && (
                  <p className="mt-0.5 truncate text-xs text-surface-400">
                    {pl.description}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-2xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <Music className="h-3 w-3" />
                    {pl.track_count} track{pl.track_count !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(pl.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>

              {/* Delete */}
              <button
                onClick={() => handleDelete(pl.id)}
                disabled={deleting === pl.id}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-surface-300 transition-all hover:bg-danger-50 hover:text-danger-500 active:scale-90"
                title="Delete playlist"
              >
                {deleting === pl.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
