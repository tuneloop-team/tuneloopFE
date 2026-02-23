import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListPlus, Check, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from './Toast';
import type { Playlist, ApiResponse } from '../types';

interface AddToPlaylistProps {
  songId: string;
  username: string;
}

export default function AddToPlaylist({ songId, username }: AddToPlaylistProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchPlaylists = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Playlist[]>>(
        `/playlists/user/${username}`,
      );
      setPlaylists(res.data.data);
    } catch {
      toast('Failed to load playlists', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open) {
      fetchPlaylists();
    }
    setOpen(!open);
  };

  const handleAdd = async (playlistId: string) => {
    setAddingTo(playlistId);
    try {
      await api.post(`/playlists/${playlistId}/tracks`, {
        trackId: songId,
        username,
      });
      toast('Added to playlist!', 'success');
      setOpen(false);
    } catch {
      toast('Failed to add to playlist', 'error');
    } finally {
      setAddingTo(null);
    }
  };

  if (!username) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-50 text-surface-400 transition-all hover:bg-primary-50 hover:text-primary-500 active:scale-90"
        title="Add to playlist"
        aria-label="Add to playlist"
      >
        <ListPlus className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-glass-lg"
          >
            <div className="border-b border-surface-100 px-3 py-2">
              <p className="text-xs font-bold text-surface-500">
                Add to playlist
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-surface-300" />
              </div>
            ) : playlists.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-surface-400">
                No playlists yet. Create one first!
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto py-1">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleAdd(pl.id)}
                    disabled={addingTo === pl.id}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-50 disabled:opacity-50"
                  >
                    {addingTo === pl.id ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary-400" />
                    ) : (
                      <Check className="h-3.5 w-3.5 shrink-0 text-transparent" />
                    )}
                    <span className="min-w-0 truncate text-surface-700">
                      {pl.name}
                    </span>
                    <span className="ml-auto shrink-0 text-2xs text-surface-300">
                      {pl.track_count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
