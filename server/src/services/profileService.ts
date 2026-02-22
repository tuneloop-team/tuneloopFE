import { query } from '../db';

export interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export interface CreateProfileInput {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export const findProfileByUsername = async (
  username: string,
): Promise<ProfileRow | null> => {
  const result = await query(
    'SELECT * FROM profiles WHERE username = $1 LIMIT 1',
    [username],
  );
  return (result.rows[0] as ProfileRow) || null;
};

export const createProfile = async (
  input: CreateProfileInput,
): Promise<ProfileRow> => {
  const result = await query(
    `INSERT INTO profiles (username, display_name, bio, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.username, input.displayName, input.bio || '', input.avatarUrl || ''],
  );
  return result.rows[0] as ProfileRow;
};

export const getAllProfiles = async (): Promise<ProfileRow[]> => {
  const result = await query(
    'SELECT * FROM profiles ORDER BY created_at DESC',
  );
  return result.rows as ProfileRow[];
};
