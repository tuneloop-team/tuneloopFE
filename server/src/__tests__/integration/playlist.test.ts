/**
 * Playlist API — Integration Tests
 *
 * Tests the full flow: create → add track → fetch → remove track → delete.
 * Uses supertest against the Express app with mocked DB.
 */
import request from 'supertest';
import app from '../../app';
import * as db from '../../db';

jest.mock('../../db', () => ({
  query: jest.fn(),
  getPool: jest.fn(() => ({ on: jest.fn() })),
  testConnection: jest.fn(),
  testConnectionWithLatency: jest.fn(),
}));

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

function mockResult(rows: unknown[], rowCount = rows.length) {
  return {
    rows,
    rowCount,
    command: 'SELECT',
    oid: 0,
    fields: [],
  } as unknown as import('pg').QueryResult;
}

const fakeProfile = {
  id: 'u-1',
  username: 'testuser',
  display_name: 'Test',
  bio: '',
  avatar_url: '',
  created_at: '2026-01-01',
};

const fakePlaylist = {
  id: 'pl-1',
  user_id: 'u-1',
  name: 'My Playlist',
  description: 'Test desc',
  created_at: '2026-02-23',
  updated_at: '2026-02-23',
  track_count: 0,
};

const fakeSong = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  genre: 'Rock',
  cover_url: '',
  duration_ms: 354000,
  created_at: '2026-01-01',
};

describe('Playlist API Integration', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // ─── Step 1: Create playlist ─────────────────────────
  it('POST /api/playlists — creates a playlist', async () => {
    // findProfileByUsername
    mockQuery.mockResolvedValueOnce(mockResult([fakeProfile]));
    // INSERT INTO playlists
    mockQuery.mockResolvedValueOnce(mockResult([fakePlaylist]));

    const res = await request(app)
      .post('/api/playlists')
      .send({ username: 'testuser', name: 'My Playlist', description: 'Test desc' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.name).toBe('My Playlist');
  });

  it('POST /api/playlists — 400 if name missing', async () => {
    const res = await request(app)
      .post('/api/playlists')
      .send({ username: 'testuser' });

    expect(res.status).toBe(400);
  });

  // ─── Step 2: Add track ──────────────────────────────
  it('POST /api/playlists/:id/tracks — adds a track', async () => {
    // findProfileByUsername
    mockQuery.mockResolvedValueOnce(mockResult([fakeProfile]));
    // isPlaylistOwner
    mockQuery.mockResolvedValueOnce(mockResult([{ id: 'pl-1' }], 1));
    // getSongById
    mockQuery.mockResolvedValueOnce(mockResult([fakeSong]));
    // INSERT INTO playlist_tracks
    mockQuery.mockResolvedValueOnce(mockResult([]));
    // UPDATE playlists SET updated_at
    mockQuery.mockResolvedValueOnce(mockResult([]));

    const res = await request(app)
      .post('/api/playlists/pl-1/tracks')
      .send({ trackId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', username: 'testuser' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('added');
  });

  // ─── Step 3: Fetch playlist with tracks ─────────────
  it('GET /api/playlists/:id — returns playlist with tracks', async () => {
    const playlistRow = { ...fakePlaylist, track_count: 1 };
    const trackRows = [
      { ...fakeSong, like_count: 3, is_liked: false, added_at: '2026-02-23' },
    ];

    // No username → skip profile lookup
    // getPlaylistById main query
    mockQuery.mockResolvedValueOnce(mockResult([playlistRow]));
    // tracks query
    mockQuery.mockResolvedValueOnce(mockResult(trackRows));

    const res = await request(app).get('/api/playlists/pl-1');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('My Playlist');
    expect(res.body.data.tracks).toHaveLength(1);
    expect(res.body.data.tracks[0].title).toBe('Bohemian Rhapsody');
  });

  // ─── Step 4: Remove track ──────────────────────────
  it('DELETE /api/playlists/:id/tracks/:trackId — removes a track', async () => {
    // findProfileByUsername
    mockQuery.mockResolvedValueOnce(mockResult([fakeProfile]));
    // isPlaylistOwner
    mockQuery.mockResolvedValueOnce(mockResult([{ id: 'pl-1' }], 1));
    // DELETE from playlist_tracks
    mockQuery.mockResolvedValueOnce(mockResult([{ id: 'pt-1' }], 1));
    // UPDATE playlists SET updated_at
    mockQuery.mockResolvedValueOnce(mockResult([]));

    const res = await request(app)
      .delete('/api/playlists/pl-1/tracks/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11?username=testuser');

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('removed');
  });

  // ─── Step 5: Delete playlist ────────────────────────
  it('DELETE /api/playlists/:id — deletes the playlist', async () => {
    // findProfileByUsername
    mockQuery.mockResolvedValueOnce(mockResult([fakeProfile]));
    // isPlaylistOwner
    mockQuery.mockResolvedValueOnce(mockResult([{ id: 'pl-1' }], 1));
    // DELETE from playlists
    mockQuery.mockResolvedValueOnce(mockResult([{ id: 'pl-1' }], 1));

    const res = await request(app)
      .delete('/api/playlists/pl-1')
      .send({ username: 'testuser' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });

  // ─── Auth guard: 403 for non-owner ──────────────────
  it('POST /api/playlists/:id/tracks — 403 if not owner', async () => {
    // findProfileByUsername  
    mockQuery.mockResolvedValueOnce(mockResult([fakeProfile]));
    // isPlaylistOwner → empty (not owner)
    mockQuery.mockResolvedValueOnce(mockResult([], 0));

    const res = await request(app)
      .post('/api/playlists/pl-1/tracks')
      .send({ trackId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', username: 'testuser' });

    expect(res.status).toBe(403);
  });

  // ─── Unlike song ────────────────────────────────────
  it('DELETE /api/songs/:songId/like — unlikes a song', async () => {
    // findProfileByUsername
    mockQuery.mockResolvedValueOnce(mockResult([fakeProfile]));
    // unlikeSong DELETE
    mockQuery.mockResolvedValueOnce(mockResult([], 1));

    const res = await request(app)
      .delete('/api/songs/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/like')
      .send({ username: 'testuser' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('unliked');
  });

  // ─── Liked songs list ───────────────────────────────
  it('GET /api/songs/liked/:username — returns liked songs with count', async () => {
    const likedSongs = [
      { ...fakeSong, is_liked: true, like_count: 5, liked_at: '2026-02-23' },
    ];

    // findProfileByUsername
    mockQuery.mockResolvedValueOnce(mockResult([fakeProfile]));
    // getLikedSongs
    mockQuery.mockResolvedValueOnce(mockResult(likedSongs));

    const res = await request(app).get('/api/songs/liked/testuser');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });
});
