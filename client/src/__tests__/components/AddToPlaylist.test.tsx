/**
 * AddToPlaylist — dropdown opens, fetches playlists, adds track
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddToPlaylist from '../../components/AddToPlaylist';
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

function wrap(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <ToastProvider>{ui}</ToastProvider>
    </MemoryRouter>,
  );
}

describe('AddToPlaylist Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "Add to playlist" button', () => {
    wrap(<AddToPlaylist songId="s-1" username="testuser" />);
    expect(screen.getByLabelText('Add to playlist')).toBeInTheDocument();
  });

  it('opens dropdown and fetches playlists on click', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'ok',
        data: [
          {
            id: 'pl-1',
            user_id: 'u-1',
            name: 'My Favs',
            description: '',
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            track_count: 3,
          },
        ],
      },
    });

    wrap(<AddToPlaylist songId="s-1" username="testuser" />);

    fireEvent.click(screen.getByLabelText('Add to playlist'));

    await waitFor(() => {
      expect(screen.getByText('My Favs')).toBeInTheDocument();
    });

    expect(mockGet).toHaveBeenCalledWith('/playlists/user/testuser');
  });

  it('shows "No playlists yet" when user has none', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'ok', data: [] },
    });

    wrap(<AddToPlaylist songId="s-1" username="testuser" />);

    fireEvent.click(screen.getByLabelText('Add to playlist'));

    await waitFor(() => {
      expect(
        screen.getByText('No playlists yet. Create one first!'),
      ).toBeInTheDocument();
    });
  });

  it('adds a song to a playlist on click', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'ok',
        data: [
          {
            id: 'pl-1',
            user_id: 'u-1',
            name: 'My Favs',
            description: '',
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            track_count: 3,
          },
        ],
      },
    });

    mockPost.mockResolvedValueOnce({
      data: { status: 'ok', message: 'Track added' },
    });

    wrap(<AddToPlaylist songId="s-99" username="testuser" />);

    fireEvent.click(screen.getByLabelText('Add to playlist'));

    await waitFor(() => screen.getByText('My Favs'));

    fireEvent.click(screen.getByText('My Favs'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/playlists/pl-1/tracks', {
        trackId: 's-99',
        username: 'testuser',
      });
    });
  });

  it('returns null when username is empty', () => {
    const { container } = wrap(
      <AddToPlaylist songId="s-1" username="" />,
    );
    expect(container.querySelector('button')).toBeNull();
  });
});
