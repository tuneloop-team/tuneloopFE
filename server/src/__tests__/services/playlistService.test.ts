/**
 * Playlist Service — Unit Tests
 *
 * These tests mock the DB layer and verify the service logic.
 */
import * as db from '../../db';
import {
  createPlaylist,
  getPlaylistsByUser,
  getPlaylistById,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  isPlaylistOwner,
} from '../../services/playlistService';

// Mock the DB query function
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

// Helper to build a mock QueryResult
function mockResult(rows: unknown[], rowCount = rows.length) {
  return {
    rows,
    rowCount,
    command: 'SELECT',
    oid: 0,
    fields: [],
  } as unknown as import('pg').QueryResult;
}

describe('playlistService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // ─── createPlaylist ──────────────────────────────────
  describe('createPlaylist', () => {
    it('should insert and return the new playlist', async () => {
      const fakePlaylist = {
        id: 'pl-1',
        user_id: 'u-1',
        name: 'Chill Vibes',
        description: 'Relaxing songs',
        created_at: '2026-02-23T00:00:00Z',
        updated_at: '2026-02-23T00:00:00Z',
        track_count: 0,
      };
      mockQuery.mockResolvedValueOnce(mockResult([fakePlaylist]));

      const result = await createPlaylist('u-1', 'Chill Vibes', 'Relaxing songs');

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO playlists'),
        ['u-1', 'Chill Vibes', 'Relaxing songs'],
      );
      expect(result).toEqual(fakePlaylist);
    });
  });

  // ─── getPlaylistsByUser ──────────────────────────────
  describe('getPlaylistsByUser', () => {
    it('should return all playlists for a user', async () => {
      const playlists = [
        { id: 'pl-1', name: 'A', track_count: 3 },
        { id: 'pl-2', name: 'B', track_count: 0 },
      ];
      mockQuery.mockResolvedValueOnce(mockResult(playlists));

      const result = await getPlaylistsByUser('u-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('pl-1');
    });

    it('should return empty array if no playlists', async () => {
      mockQuery.mockResolvedValueOnce(mockResult([]));
      const result = await getPlaylistsByUser('u-1');
      expect(result).toEqual([]);
    });
  });

  // ─── getPlaylistById ────────────────────────────────
  describe('getPlaylistById', () => {
    it('should return playlist with tracks', async () => {
      const playlistRow = {
        id: 'pl-1',
        user_id: 'u-1',
        name: 'Rock',
        description: '',
        created_at: '2026-02-23',
        updated_at: '2026-02-23',
        track_count: 1,
      };
      const trackRows = [
        {
          id: 's-1',
          title: 'Song1',
          artist: 'Artist1',
          is_liked: false,
          like_count: 5,
        },
      ];

      mockQuery
        .mockResolvedValueOnce(mockResult([playlistRow]))
        .mockResolvedValueOnce(mockResult(trackRows));

      const result = await getPlaylistById('pl-1', 'u-1');

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Rock');
      expect(result!.tracks).toHaveLength(1);
      expect(result!.tracks[0].title).toBe('Song1');
    });

    it('should return null if playlist not found', async () => {
      mockQuery.mockResolvedValueOnce(mockResult([]));
      const result = await getPlaylistById('pl-999');
      expect(result).toBeNull();
    });
  });

  // ─── deletePlaylist ─────────────────────────────────
  describe('deletePlaylist', () => {
    it('should return true when deleted', async () => {
      mockQuery.mockResolvedValueOnce(mockResult([{ id: 'pl-1' }], 1));
      const result = await deletePlaylist('pl-1');
      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      mockQuery.mockResolvedValueOnce(mockResult([], 0));
      const result = await deletePlaylist('pl-999');
      expect(result).toBe(false);
    });
  });

  // ─── addTrackToPlaylist ─────────────────────────────
  describe('addTrackToPlaylist', () => {
    it('should insert track and update playlist timestamp', async () => {
      mockQuery
        .mockResolvedValueOnce(mockResult([]))  // INSERT
        .mockResolvedValueOnce(mockResult([]));  // UPDATE updated_at

      await addTrackToPlaylist('pl-1', 's-1');

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO playlist_tracks'),
        ['pl-1', 's-1'],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE playlists SET updated_at'),
        ['pl-1'],
      );
    });
  });

  // ─── removeTrackFromPlaylist ────────────────────────
  describe('removeTrackFromPlaylist', () => {
    it('should return true when track removed', async () => {
      mockQuery
        .mockResolvedValueOnce(mockResult([{ id: 'pt-1' }], 1))
        .mockResolvedValueOnce(mockResult([]));

      const result = await removeTrackFromPlaylist('pl-1', 's-1');
      expect(result).toBe(true);
    });

    it('should return false when track not in playlist', async () => {
      mockQuery.mockResolvedValueOnce(mockResult([], 0));
      const result = await removeTrackFromPlaylist('pl-1', 's-999');
      expect(result).toBe(false);
    });
  });

  // ─── isPlaylistOwner ───────────────────────────────
  describe('isPlaylistOwner', () => {
    it('should return true when user owns playlist', async () => {
      mockQuery.mockResolvedValueOnce(mockResult([{ id: 'pl-1' }], 1));
      const result = await isPlaylistOwner('pl-1', 'u-1');
      expect(result).toBe(true);
    });

    it('should return false when user does not own playlist', async () => {
      mockQuery.mockResolvedValueOnce(mockResult([], 0));
      const result = await isPlaylistOwner('pl-1', 'u-2');
      expect(result).toBe(false);
    });
  });
});
