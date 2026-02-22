import { query } from '../db';

export interface SongRow {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  cover_url: string;
  duration_ms: number;
  created_at: string;
}

export interface SongWithLike extends SongRow {
  is_liked: boolean;
  like_count: number;
}

/**
 * Search songs by artist name (case-insensitive, partial match)
 */
export const searchByArtist = async (
  artistQuery: string,
  profileId?: string,
): Promise<SongWithLike[]> => {
  const result = await query(
    `SELECT s.*,
            COUNT(l.id)::int AS like_count,
            BOOL_OR(l.profile_id = $2) AS is_liked
     FROM songs s
     LEFT JOIN likes l ON l.song_id = s.id
     WHERE LOWER(s.artist) LIKE LOWER($1)
     GROUP BY s.id
     ORDER BY s.artist, s.title`,
    [`%${artistQuery}%`, profileId || null],
  );
  return result.rows as SongWithLike[];
};

/**
 * Search songs by title (case-insensitive, partial match)
 */
export const searchByTitle = async (
  titleQuery: string,
  profileId?: string,
): Promise<SongWithLike[]> => {
  const result = await query(
    `SELECT s.*,
            COUNT(l.id)::int AS like_count,
            BOOL_OR(l.profile_id = $2) AS is_liked
     FROM songs s
     LEFT JOIN likes l ON l.song_id = s.id
     WHERE LOWER(s.title) LIKE LOWER($1)
     GROUP BY s.id
     ORDER BY s.title`,
    [`%${titleQuery}%`, profileId || null],
  );
  return result.rows as SongWithLike[];
};

/**
 * Search songs by either artist or title
 */
export const searchSongs = async (
  searchQuery: string,
  searchBy: 'artist' | 'title' | 'all',
  profileId?: string,
): Promise<SongWithLike[]> => {
  if (searchBy === 'artist') return searchByArtist(searchQuery, profileId);
  if (searchBy === 'title') return searchByTitle(searchQuery, profileId);

  // Search both artist and title
  const result = await query(
    `SELECT s.*,
            COUNT(l.id)::int AS like_count,
            BOOL_OR(l.profile_id = $2) AS is_liked
     FROM songs s
     LEFT JOIN likes l ON l.song_id = s.id
     WHERE LOWER(s.artist) LIKE LOWER($1)
        OR LOWER(s.title) LIKE LOWER($1)
     GROUP BY s.id
     ORDER BY s.artist, s.title`,
    [`%${searchQuery}%`, profileId || null],
  );
  return result.rows as SongWithLike[];
};

/**
 * Get a single song by ID
 */
export const getSongById = async (songId: string): Promise<SongRow | null> => {
  const result = await query('SELECT * FROM songs WHERE id = $1', [songId]);
  return (result.rows[0] as SongRow) || null;
};

/**
 * Like a song
 */
export const likeSong = async (
  profileId: string,
  songId: string,
): Promise<void> => {
  await query(
    'INSERT INTO likes (profile_id, song_id) VALUES ($1, $2) ON CONFLICT (profile_id, song_id) DO NOTHING',
    [profileId, songId],
  );
};

/**
 * Unlike a song
 */
export const unlikeSong = async (
  profileId: string,
  songId: string,
): Promise<void> => {
  await query(
    'DELETE FROM likes WHERE profile_id = $1 AND song_id = $2',
    [profileId, songId],
  );
};

/**
 * Get all liked songs for a profile
 */
export const getLikedSongs = async (
  profileId: string,
): Promise<SongWithLike[]> => {
  const result = await query(
    `SELECT s.*,
            COUNT(l2.id)::int AS like_count,
            TRUE AS is_liked
     FROM likes l
     JOIN songs s ON s.id = l.song_id
     LEFT JOIN likes l2 ON l2.song_id = s.id
     WHERE l.profile_id = $1
     GROUP BY s.id
     ORDER BY l.created_at DESC`,
    [profileId],
  );
  return result.rows as SongWithLike[];
};
