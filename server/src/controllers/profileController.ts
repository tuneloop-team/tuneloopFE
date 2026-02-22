import { Request, Response, NextFunction } from 'express';
import {
  findProfileByUsername,
  createProfile,
  getAllProfiles,
  CreateProfileInput,
} from '../services/profileService';
import { AppError } from '../utils/AppError';

export const getProfileByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const username = req.params.username as string;

    if (!username || username.trim().length === 0) {
      throw new AppError('Username is required', 400);
    }

    const profile = await findProfileByUsername(username);

    if (!profile) {
      throw new AppError(`Profile not found: ${username}`, 404);
    }

    res.status(200).json({ status: 'ok', data: profile });
  } catch (error) {
    next(error);
  }
};

export const createNewProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { username, displayName, bio, avatarUrl } =
      req.body as CreateProfileInput;

    // Validation
    if (!username || username.trim().length === 0) {
      throw new AppError('Username is required', 400);
    }
    if (username.length < 3 || username.length > 50) {
      throw new AppError('Username must be between 3 and 50 characters', 400);
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new AppError(
        'Username can only contain letters, numbers, and underscores',
        400,
      );
    }
    if (!displayName || displayName.trim().length === 0) {
      throw new AppError('Display name is required', 400);
    }

    // Check if username already exists
    const existing = await findProfileByUsername(username);
    if (existing) {
      throw new AppError('Username already taken', 409);
    }

    const profile = await createProfile({
      username: username.trim(),
      displayName: displayName.trim(),
      bio: bio?.trim(),
      avatarUrl: avatarUrl?.trim(),
    });

    res.status(201).json({ status: 'ok', data: profile });
  } catch (error) {
    next(error);
  }
};

export const listProfiles = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const profiles = await getAllProfiles();
    res.status(200).json({ status: 'ok', data: profiles });
  } catch (error) {
    next(error);
  }
};
