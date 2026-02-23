import { query } from '../db';
import type { SongWithLike } from './songService';

/* ─── Types ──────────────────────────────────────────── */
export interface PlaylistRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  track_count: number;
}

export interface PlaylistDetail extends PlaylistRow {
  tracks: SongWithLike[];
}

/* ─── Create ─────────────────────────────────────────── */
export const createPlaylist = async (
  userId: string,
  name: string,
  description: string,
): Promise<PlaylistRow> => {
  const result = await query(
    `INSERT INTO playlists (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *, 0 AS track_count`,
    [userId, name, description],
  );
  return result.rows[0] as PlaylistRow;
};

/* ─── Get playlists by user ──────────────────────────── */
export const getPlaylistsByUser = async (
  userId: string,
): Promise<PlaylistRow[]> => {
  const result = await query(
    `SELECT p.*,
            COUNT(pt.id)::int AS track_count
     FROM playlists p
     LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
     WHERE p.user_id = $1
     GROUP BY p.id
     ORDER BY p.updated_at DESC`,
    [userId],
  );
  return result.rows as PlaylistRow[];
};

/* ─── Get single playlist with tracks ────────────────── */
export const getPlaylistById = async (
  playlistId: string,
  profileId?: string,
): Promise<PlaylistDetail | null> => {
  const playlistResult = await query(
    `SELECT p.*,
            COUNT(pt.id)::int AS track_count
     FROM playlists p
     LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
     WHERE p.id = $1
     GROUP BY p.id`,
    [playlistId],
  );

  if (playlistResult.rows.length === 0) return null;

  const playlist = playlistResult.rows[0] as PlaylistRow;

  const tracksResult = await query(
    `SELECT s.*,
            COUNT(l.id)::int AS like_count,
            BOOL_OR(l.profile_id = $2) AS is_liked,
            pt.added_at
     FROM playlist_tracks pt
     JOIN songs s ON s.id = pt.track_id
     LEFT JOIN likes l ON l.song_id = s.id
     WHERE pt.playlist_id = $1
     GROUP BY s.id, pt.added_at
     ORDER BY pt.added_at DESC`,
    [playlistId, profileId || null],
  );

  return {
    ...playlist,
    tracks: tracksResult.rows as SongWithLike[],
  };
};

/* ─── Delete playlist ────────────────────────────────── */
export const deletePlaylist = async (playlistId: string): Promise<boolean> => {
  const result = await query(
    'DELETE FROM playlists WHERE id = $1 RETURNING id',
    [playlistId],
  );
  return (result.rowCount ?? 0) > 0;
};

/* ─── Add track to playlist ──────────────────────────── */
export const addTrackToPlaylist = async (
  playlistId: string,
  trackId: string,
): Promise<void> => {
  await query(
    `INSERT INTO playlist_tracks (playlist_id, track_id)
     VALUES ($1, $2)
     ON CONFLICT (playlist_id, track_id) DO NOTHING`,
    [playlistId, trackId],
  );
  // Touch updated_at
  await query(
    'UPDATE playlists SET updated_at = NOW() WHERE id = $1',
    [playlistId],
  );
};

/* ─── Remove track from playlist ─────────────────────── */
export const removeTrackFromPlaylist = async (
  playlistId: string,
  trackId: string,
): Promise<boolean> => {
  const result = await query(
    'DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2 RETURNING id',
    [playlistId, trackId],
  );
  if ((result.rowCount ?? 0) > 0) {
    await query(
      'UPDATE playlists SET updated_at = NOW() WHERE id = $1',
      [playlistId],
    );
    return true;
  }
  return false;
};

/* ─── Ownership check ────────────────────────────────── */
export const isPlaylistOwner = async (
  playlistId: string,
  userId: string,
): Promise<boolean> => {
  const result = await query(
    'SELECT id FROM playlists WHERE id = $1 AND user_id = $2',
    [playlistId, userId],
  );
  return (result.rowCount ?? 0) > 0;
};
