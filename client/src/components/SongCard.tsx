import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Disc3 } from 'lucide-react';
import AddToPlaylist from './AddToPlaylist';
import type { Song } from '../types';

interface SongCardProps {
  song: Song;
  username?: string;
  onLikeToggle?: (songId: string, isLiked: boolean) => void;
  index?: number;
}

/* ─── Genre color mapping ─────────────────────────────────── */
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
  const key = genre.toLowerCase();
  return genreColors[key] || 'bg-surface-100 text-surface-600';
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function SongCard({
  song,
  username,
  onLikeToggle,
  index = 0,
}: SongCardProps) {
  const [animating, setAnimating] = useState(false);

  const handleLike = () => {
    if (!username || !onLikeToggle) return;
    setAnimating(true);
    onLikeToggle(song.id, song.is_liked);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className="card card-hover group flex items-center gap-4 p-4"
    >
      {/* ─── Cover Art ─────────────────────────────── */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 shadow-sm">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Disc3 className="h-7 w-7 text-primary-300 transition-transform duration-500 group-hover:rotate-90" />
          </div>
        )}
      </div>

      {/* ─── Info ──────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-surface-900 group-hover:text-primary-600 transition-colors duration-200">
          {song.title}
        </h3>
        <p className="truncate text-xs font-medium text-surface-500">
          {song.artist}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {song.genre && (
            <span
              className={`badge ${getGenreColor(song.genre)}`}
            >
              {song.genre}
            </span>
          )}
          {song.album && (
            <span className="badge-neutral hidden sm:inline-flex">
              {song.album}
            </span>
          )}
          <span className="flex items-center gap-1 text-2xs text-surface-400">
            <Clock className="h-3 w-3" />
            {formatDuration(song.duration_ms)}
          </span>
        </div>
      </div>

      {/* ─── Actions ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Add to playlist */}
        {username && (
          <AddToPlaylist songId={song.id} username={username} />
        )}

        {/* Like Button */}
        <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={handleLike}
          disabled={!username}
          aria-label={song.is_liked ? 'Unlike song' : 'Like song'}
          title={
            username
              ? song.is_liked
                ? 'Unlike'
                : 'Like'
              : 'Set username to like songs'
          }
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
            song.is_liked
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-surface-50 text-surface-300 hover:bg-surface-100 hover:text-red-400'
          } ${!username ? 'cursor-not-allowed opacity-40' : 'cursor-pointer active:scale-90'}`}
        >
          <Heart
            className={`h-5 w-5 transition-all duration-200 ${
              song.is_liked ? 'fill-current' : ''
            } ${animating ? 'animate-heart-pop' : ''}`}
          />
        </button>
        <span
          className={`text-2xs font-semibold transition-colors duration-200 ${
            song.is_liked ? 'text-red-400' : 'text-surface-300'
          }`}
        >
          {song.like_count}
        </span>
        </div>
      </div>
    </motion.div>
  );
}
