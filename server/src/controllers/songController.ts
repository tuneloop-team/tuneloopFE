import { Request, Response, NextFunction } from 'express';
import {
  searchSongs,
  likeSong,
  unlikeSong,
  getSongById,
  getLikedSongs,
} from '../services/songService';
import { findProfileByUsername } from '../services/profileService';
import { AppError } from '../utils/AppError';

/**
 * GET /api/songs/search?q=...&by=artist|title|all&username=...
 * COM-2: Search by artist
 * COM-4: Search by title
 * COM-5: View search results
 */
export const search = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = req.query.q as string;
    const by = (req.query.by as string) || 'all';
    const username = req.query.username as string | undefined;

    if (!q || q.trim().length === 0) {
      throw new AppError('Search query "q" is required', 400);
    }

    if (!['artist', 'title', 'all'].includes(by)) {
      throw new AppError('Parameter "by" must be artist, title, or all', 400);
    }

    // Resolve profileId for like status
    let profileId: string | undefined;
    if (username) {
      const profile = await findProfileByUsername(username);
      if (profile) profileId = profile.id;
    }

    const songs = await searchSongs(
      q.trim(),
      by as 'artist' | 'title' | 'all',
      profileId,
    );

    res.status(200).json({ status: 'ok', data: songs });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/songs/:songId/like   { username }
 * COM-19: Like a song
 */
export const like = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const songId = req.params.songId as string;
    const { username } = req.body as { username: string };

    if (!username) throw new AppError('Username is required', 400);

    const profile = await findProfileByUsername(username);
    if (!profile) throw new AppError('Profile not found', 404);

    const song = await getSongById(songId);
    if (!song) throw new AppError('Song not found', 404);

    await likeSong(profile.id, songId);

    res.status(200).json({ status: 'ok', message: 'Song liked' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/songs/:songId/like   { username }
 * COM-19: Unlike a song
 */
export const unlike = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const songId = req.params.songId as string;
    const { username } = req.body as { username: string };

    if (!username) throw new AppError('Username is required', 400);

    const profile = await findProfileByUsername(username);
    if (!profile) throw new AppError('Profile not found', 404);

    await unlikeSong(profile.id, songId);

    res.status(200).json({ status: 'ok', message: 'Song unliked' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/songs/liked/:username
 * Used by profile page to show liked songs
 */
export const likedByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const username = req.params.username as string;

    if (!username) throw new AppError('Username is required', 400);

    const profile = await findProfileByUsername(username);
    if (!profile) throw new AppError('Profile not found', 404);

    const songs = await getLikedSongs(profile.id);

    res.status(200).json({ status: 'ok', data: songs });
  } catch (error) {
    next(error);
  }
};
