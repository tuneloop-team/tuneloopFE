/**
 * PlaylistDetail — view tracks, remove track, like/unlike toggle
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PlaylistDetail from '../../pages/PlaylistDetail';
import { ToastProvider } from '../../components/Toast';

// ─── Mock framer-motion ──────────────────────────────────────
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({
        children,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        ...rest
      }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
        <div {...rest}>{children}</div>
      ),
    },
  };
});

// ─── Mock the api module ─────────────────────────────────────
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../services/api';
const mockGet = api.get as Mock;
const mockPost = api.post as Mock;
const mockDelete = api.delete as Mock;

const PLAYLIST_ID = 'aabbccdd-1234-5678-abcd-000000000001';

const samplePlaylist = {
  id: PLAYLIST_ID,
  user_id: 'u-1',
  name: 'Rock Anthems',
  description: 'Heavy riffs only',
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
  track_count: 2,
  tracks: [
    {
      id: 't-1',
      title: 'Back in Black',
      artist: 'AC/DC',
      album: 'Back in Black',
      genre: 'Rock',
      cover_url: '',
      duration_ms: 255000,
      created_at: '2026-01-01',
      is_liked: true,
      like_count: 42,
    },
    {
      id: 't-2',
      title: 'Smells Like Teen Spirit',
      artist: 'Nirvana',
      album: 'Nevermind',
      genre: 'Grunge',
      cover_url: '',
      duration_ms: 301000,
      created_at: '2026-01-01',
      is_liked: false,
      like_count: 99,
    },
  ],
};

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/playlists/${id}`]}>
      <ToastProvider>
        <Routes>
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('PlaylistDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('tuneloop_username', 'testuser');
  });

  it('shows playlist name and tracks after loading', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'ok', data: samplePlaylist },
    });

    renderAt(PLAYLIST_ID);

    await waitFor(() => {
      expect(screen.getByText('Rock Anthems')).toBeInTheDocument();
      expect(screen.getByText('Heavy riffs only')).toBeInTheDocument();
    });

    expect(screen.getByText('Back in Black')).toBeInTheDocument();
    expect(screen.getByText('Smells Like Teen Spirit')).toBeInTheDocument();
  });

  it('shows "Playlist not found" when API returns nothing', async () => {
    mockGet.mockRejectedValueOnce(new Error('Not found'));

    renderAt(PLAYLIST_ID);

    await waitFor(() => {
      expect(screen.getByText('Playlist not found')).toBeInTheDocument();
    });
  });

  it('removes a track when remove button is clicked', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'ok', data: samplePlaylist },
    });

    renderAt(PLAYLIST_ID);

    await waitFor(() =>
      expect(screen.getByText('Back in Black')).toBeInTheDocument(),
    );

    const removeBtns = screen.getAllByTitle('Remove from playlist');
    expect(removeBtns).toHaveLength(2);

    mockDelete.mockResolvedValueOnce({
      data: { status: 'ok', message: 'Track removed' },
    });

    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(
        expect.stringContaining(`/playlists/${PLAYLIST_ID}/tracks/t-1`),
      );
      expect(screen.queryByText('Back in Black')).not.toBeInTheDocument();
    });
  });

  it('renders both tracks with correct titles and genres', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'ok', data: samplePlaylist },
    });

    renderAt(PLAYLIST_ID);

    await waitFor(() => {
      expect(screen.getByText('Back in Black')).toBeInTheDocument();
      expect(screen.getByText('AC/DC')).toBeInTheDocument();
      expect(screen.getByText('Smells Like Teen Spirit')).toBeInTheDocument();
      expect(screen.getByText('Nirvana')).toBeInTheDocument();
    });

    // Check genres are rendered
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('Grunge')).toBeInTheDocument();
  });

  it('shows empty state when playlist has no tracks', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'ok',
        data: { ...samplePlaylist, tracks: [], track_count: 0 },
      },
    });

    renderAt(PLAYLIST_ID);

    await waitFor(() => {
      expect(screen.getByText('No tracks yet')).toBeInTheDocument();
      expect(screen.getByText('Discover Songs')).toBeInTheDocument();
    });
  });
});
