import type { Song } from '../types';

interface SongCardProps {
  song: Song;
  username?: string;
  onLikeToggle?: (songId: string, isLiked: boolean) => void;
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
}: SongCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Cover */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl text-gray-400">
            ♪
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-gray-900">
          {song.title}
        </h3>
        <p className="truncate text-xs text-gray-500">{song.artist}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
          {song.album && <span>{song.album}</span>}
          {song.genre && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {song.genre}
            </span>
          )}
          <span>{formatDuration(song.duration_ms)}</span>
        </div>
      </div>

      {/* Like button */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => {
            if (username && onLikeToggle) {
              onLikeToggle(song.id, song.is_liked);
            }
          }}
          disabled={!username}
          title={username ? (song.is_liked ? 'Unlike' : 'Like') : 'Set username to like songs'}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            song.is_liked
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-400'
          } ${!username ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
        >
          {song.is_liked ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          )}
        </button>
        <span className="text-[10px] font-medium text-gray-400">
          {song.like_count}
        </span>
      </div>
    </div>
  );
}
