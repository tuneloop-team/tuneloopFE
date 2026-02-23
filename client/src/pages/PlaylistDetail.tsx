import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ListMusic,
  Music,
  Calendar,
  Trash2,
  Loader2,
  Heart,
  Clock,
  Disc3,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { SongCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import type { PlaylistDetail as PlaylistDetailType, Song, ApiResponse } from '../types';

/* ─── Genre color mapping (same as SongCard) ──────────── */
const genreColors: Record<string, string> = {
  rock: 'bg-red-50 text-red-600',
  pop: 'bg-pink-50 text-pink-600',
  'r&b': 'bg-purple-50 text-purple-600',
  alternative: 'bg-indigo-50 text-indigo-600',
  grunge: 'bg-stone-100 text-stone-600',
  'art rock': 'bg-violet-50 text-violet-600',
  electronic: 'bg-cyan-50 text-cyan-600',
  'synth-pop': 'bg-teal-50 text-teal-600',
  'hip-hop': 'bg-amber-50 text-amber-700',
  jazz: 'bg-yellow-50 text-yellow-700',
  classical: 'bg-emerald-50 text-emerald-700',
  reggae: 'bg-green-50 text-green-600',
  country: 'bg-orange-50 text-orange-600',
  blues: 'bg-blue-50 text-blue-600',
  metal: 'bg-slate-100 text-slate-700',
};

function getGenreColor(genre: string): string {
  return genreColors[genre.toLowerCase()] || 'bg-surface-100 text-surface-600';
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [username] = useState(
    () => localStorage.getItem('tuneloop_username') || '',
  );
  const [playlist, setPlaylist] = useState<PlaylistDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  // ─── Load playlist ───────────────────────────────────
  const loadPlaylist = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const params = username ? `?username=${username}` : '';
      const res = await api.get<ApiResponse<PlaylistDetailType>>(
        `/playlists/${id}${params}`,
      );
      setPlaylist(res.data.data);
    } catch {
      toast('Failed to load playlist', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, username, toast]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  // ─── Remove track ────────────────────────────────────
  const handleRemoveTrack = async (trackId: string) => {
    if (!id || !username) return;
    setRemoving(trackId);
    try {
      await api.delete(
        `/playlists/${id}/tracks/${trackId}?username=${username}`,
      );
      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tracks: prev.tracks.filter((t) => t.id !== trackId),
          track_count: prev.track_count - 1,
        };
      });
      toast('Track removed', 'success');
    } catch {
      toast('Failed to remove track', 'error');
    } finally {
      setRemoving(null);
    }
  };

  // ─── Like toggle ─────────────────────────────────────
  const handleLikeToggle = async (songId: string, isLiked: boolean) => {
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
      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tracks: prev.tracks.map((s) =>
            s.id === songId
              ? {
                  ...s,
                  is_liked: !isLiked,
                  like_count: isLiked ? s.like_count - 1 : s.like_count + 1,
                }
              : s,
          ),
        };
      });
    } catch {
      toast('Like action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <SongCardSkeleton />
        <SongCardSkeleton />
        <SongCardSkeleton />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={ListMusic}
          title="Playlist not found"
          description="This playlist may have been deleted"
          action={
            <Link to="/playlists" className="btn-primary text-xs">
              Back to Playlists
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ─── Back link ──────────────────────────────── */}
      <Link
        to="/playlists"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-400 transition-colors hover:text-surface-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Playlists
      </Link>

      {/* ─── Playlist Header ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="h-20 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 opacity-80" />
        <div className="relative px-6 pb-6">
          <div className="-mt-8 flex items-end gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-primary-100 to-accent-100 shadow-glass">
              <ListMusic className="h-7 w-7 text-primary-600" />
            </div>
            <div className="mb-1 min-w-0 flex-1">
              <h1 className="truncate text-xl font-extrabold text-surface-900">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="mt-0.5 text-sm text-surface-500">
                  {playlist.description}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-surface-400">
            <span className="flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5" />
              {playlist.track_count} track
              {playlist.track_count !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Created{' '}
              {new Date(playlist.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─── Tracks ────────────────────────────────── */}
      {playlist.tracks.length === 0 ? (
        <EmptyState
          icon={Music}
          title="No tracks yet"
          description="Search for songs on the home page and add them to this playlist"
          action={
            <Link to="/" className="btn-primary text-xs">
              Discover Songs
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {playlist.tracks.map((song: Song, i: number) => (
            <PlaylistTrackCard
              key={song.id}
              song={song}
              index={i}
              username={username}
              removing={removing === song.id}
              onRemove={() => handleRemoveTrack(song.id)}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Track card (with remove button) ────────────────── */
interface TrackCardProps {
  song: Song;
  index: number;
  username: string;
  removing: boolean;
  onRemove: () => void;
  onLikeToggle: (songId: string, isLiked: boolean) => void;
}

function PlaylistTrackCard({
  song,
  index,
  username,
  removing,
  onRemove,
  onLikeToggle,
}: TrackCardProps) {
  const [animating, setAnimating] = useState(false);

  const handleLike = () => {
    if (!username) return;
    setAnimating(true);
    onLikeToggle(song.id, song.is_liked);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card card-hover group flex items-center gap-4 p-4"
    >
      {/* Track number */}
      <span className="w-6 text-center text-xs font-bold text-surface-300">
        {index + 1}
      </span>

      {/* Cover */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-100 to-accent-100">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Disc3 className="h-5 w-5 text-primary-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-surface-900">
          {song.title}
        </h3>
        <p className="truncate text-xs text-surface-500">{song.artist}</p>
        <div className="mt-1 flex items-center gap-2">
          {song.genre && (
            <span className={`badge ${getGenreColor(song.genre)}`}>
              {song.genre}
            </span>
          )}
          <span className="flex items-center gap-1 text-2xs text-surface-400">
            <Clock className="h-3 w-3" />
            {formatDuration(song.duration_ms)}
          </span>
        </div>
      </div>

      {/* Like */}
      <button
        onClick={handleLike}
        disabled={!username}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
          song.is_liked
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-surface-50 text-surface-300 hover:text-red-400'
        }`}
      >
        <Heart
          className={`h-4 w-4 ${song.is_liked ? 'fill-current' : ''} ${animating ? 'animate-heart-pop' : ''}`}
        />
      </button>

      {/* Remove from playlist */}
      <button
        onClick={onRemove}
        disabled={removing}
        className="flex h-9 w-9 items-center justify-center rounded-full text-surface-300 transition-all hover:bg-danger-50 hover:text-danger-500 active:scale-90"
        title="Remove from playlist"
      >
        {removing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </motion.div>
  );
}
