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
            TRUE AS is_liked,
            MAX(l.created_at) AS liked_at
     FROM likes l
     JOIN songs s ON s.id = l.song_id
     LEFT JOIN likes l2 ON l2.song_id = s.id
     WHERE l.profile_id = $1
     GROUP BY s.id
     ORDER BY liked_at DESC`,
    [profileId],
  );
  return result.rows as SongWithLike[];
};

/**
 * Get all songs (for homepage feed) with optional like status
 */
export const getAllSongs = async (
  profileId?: string,
  limit = 50,
): Promise<SongWithLike[]> => {
  const result = await query(
    `SELECT s.*,
            COUNT(l.id)::int AS like_count,
            BOOL_OR(l.profile_id = $1) AS is_liked
     FROM songs s
     LEFT JOIN likes l ON l.song_id = s.id
     GROUP BY s.id
     ORDER BY like_count DESC, s.artist, s.title
     LIMIT $2`,
    [profileId || null, limit],
  );
  return result.rows as SongWithLike[];
};

/**
 * Get trending songs (most liked)
 */
export const getTrendingSongs = async (
  profileId?: string,
  limit = 10,
): Promise<SongWithLike[]> => {
  const result = await query(
    `SELECT s.*,
            COUNT(l.id)::int AS like_count,
            BOOL_OR(l.profile_id = $1) AS is_liked
     FROM songs s
     LEFT JOIN likes l ON l.song_id = s.id
     GROUP BY s.id
     HAVING COUNT(l.id) > 0
     ORDER BY like_count DESC
     LIMIT $2`,
    [profileId || null, limit],
  );
  return result.rows as SongWithLike[];
};

/**
 * Autocomplete suggestions — returns matching artist names and song titles
 */
export const getSuggestions = async (
  searchQuery: string,
  limit = 8,
): Promise<{ type: 'artist' | 'title'; value: string }[]> => {
  const pattern = `%${searchQuery}%`;

  // Artists (distinct)
  const artists = await query(
    `SELECT DISTINCT artist AS value
     FROM songs
     WHERE LOWER(artist) LIKE LOWER($1)
     ORDER BY artist
     LIMIT $2`,
    [pattern, limit],
  );

  // Titles
  const titles = await query(
    `SELECT title AS value
     FROM songs
     WHERE LOWER(title) LIKE LOWER($1)
     ORDER BY title
     LIMIT $2`,
    [pattern, limit],
  );

  const results: { type: 'artist' | 'title'; value: string }[] = [
    ...artists.rows.map((r: { value: string }) => ({ type: 'artist' as const, value: r.value })),
    ...titles.rows.map((r: { value: string }) => ({ type: 'title' as const, value: r.value })),
  ];

  return results.slice(0, limit);
};
