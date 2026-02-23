import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createPlaylist,
  getPlaylistsByUser,
  getPlaylistById,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  isPlaylistOwner,
} from '../services/playlistService';
import { findProfileByUsername } from '../services/profileService';
import { getSongById } from '../services/songService';
import { AppError } from '../utils/AppError';

/* ─── Validation schemas ─────────────────────────────── */
const createPlaylistSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  name: z.string().min(1, 'Playlist name is required').max(200),
  description: z.string().max(1000).optional().default(''),
});

const addTrackSchema = z.object({
  trackId: z.string().uuid('Invalid track ID'),
  username: z.string().min(1, 'Username is required'),
});

const ownerActionSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

/* ─── Helper: resolve profile or throw ───────────────── */
async function resolveProfile(username: string) {
  const profile = await findProfileByUsername(username);
  if (!profile) throw new AppError('Profile not found', 404);
  return profile;
}

/* ─── Helper: ownership guard ────────────────────────── */
async function guardOwnership(playlistId: string, userId: string) {
  const isOwner = await isPlaylistOwner(playlistId, userId);
  if (!isOwner) throw new AppError('Forbidden: not playlist owner', 403);
}

/* ════════════════════════════════════════════════════════
   POST /api/playlists
   COM-7: Create a playlist
   ════════════════════════════════════════════════════════ */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createPlaylistSchema.parse(req.body);
    const profile = await resolveProfile(body.username);

    const playlist = await createPlaylist(
      profile.id,
      body.name.trim(),
      (body.description ?? '').trim(),
    );

    res.status(201).json({ status: 'ok', data: playlist });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0]?.message ?? 'Validation error', 400));
      return;
    }
    next(error);
  }
};

/* ════════════════════════════════════════════════════════
   GET /api/playlists/user/:username
   Fetch all playlists for a user
   ════════════════════════════════════════════════════════ */
export const listByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const username = String(req.params.username ?? '');
    if (!username) throw new AppError('Username is required', 400);

    const profile = await resolveProfile(username);
    const playlists = await getPlaylistsByUser(profile.id);

    res.status(200).json({ status: 'ok', data: playlists });
  } catch (error) {
    next(error);
  }
};

/* ════════════════════════════════════════════════════════
   GET /api/playlists/:id?username=...
   COM-7: View single playlist with tracks
   ════════════════════════════════════════════════════════ */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const playlistId = String(req.params.id ?? '');
    const username = String(req.query.username ?? '');

    let profileId: string | undefined;
    if (username) {
      const profile = await findProfileByUsername(username);
      if (profile) profileId = profile.id;
    }

    const playlist = await getPlaylistById(playlistId, profileId);
    if (!playlist) throw new AppError('Playlist not found', 404);

    res.status(200).json({ status: 'ok', data: playlist });
  } catch (error) {
    next(error);
  }
};

/* ════════════════════════════════════════════════════════
   DELETE /api/playlists/:id
   Delete a playlist (owner only)
   ════════════════════════════════════════════════════════ */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const playlistId = String(req.params.id ?? '');
    const body = ownerActionSchema.parse(req.body);
    const profile = await resolveProfile(body.username);

    await guardOwnership(playlistId, profile.id);
    await deletePlaylist(playlistId);

    res.status(200).json({ status: 'ok', message: 'Playlist deleted' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0]?.message ?? 'Validation error', 400));
      return;
    }
    next(error);
  }
};

/* ════════════════════════════════════════════════════════
   POST /api/playlists/:id/tracks
   COM-8: Add song to playlist
   ════════════════════════════════════════════════════════ */
export const addTrack = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const playlistId = String(req.params.id ?? '');
    const body = addTrackSchema.parse(req.body);
    const profile = await resolveProfile(body.username);

    await guardOwnership(playlistId, profile.id);

    // Verify track exists
    const song = await getSongById(body.trackId);
    if (!song) throw new AppError('Song not found', 404);

    await addTrackToPlaylist(playlistId, body.trackId);

    res
      .status(200)
      .json({ status: 'ok', message: 'Track added to playlist' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0]?.message ?? 'Validation error', 400));
      return;
    }
    next(error);
  }
};

/* ════════════════════════════════════════════════════════
   DELETE /api/playlists/:id/tracks/:trackId
   COM-9: Remove song from playlist
   ════════════════════════════════════════════════════════ */
export const removeTrack = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const playlistId = String(req.params.id ?? '');
    const trackId = String(req.params.trackId ?? '');

    // Username from query param
    const username = String(req.query.username ?? '');
    if (!username) throw new AppError('Username is required', 400);

    const profile = await resolveProfile(username);
    await guardOwnership(playlistId, profile.id);

    const removed = await removeTrackFromPlaylist(playlistId, trackId);
    if (!removed) throw new AppError('Track not in playlist', 404);

    res
      .status(200)
      .json({ status: 'ok', message: 'Track removed from playlist' });
  } catch (error) {
    next(error);
  }
};
