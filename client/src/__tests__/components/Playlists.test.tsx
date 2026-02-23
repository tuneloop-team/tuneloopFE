/**
 * Frontend Tests — Playlist Creation, Delete, Unlike
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Playlists from '../../pages/Playlists';
import SongCard from '../../components/SongCard';
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
      form: ({
        children,
        ...rest
      }: React.FormHTMLAttributes<HTMLFormElement> & Record<string, unknown>) => (
        <form {...rest}>{children}</form>
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

function wrap(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <ToastProvider>{ui}</ToastProvider>
    </MemoryRouter>,
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  Playlists Page                                            */
/* ═══════════════════════════════════════════════════════════ */
describe('Playlists Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('tuneloop_username', 'testuser');
  });

  it('renders the page title and subtitle', () => {
    mockGet.mockResolvedValueOnce({ data: { status: 'ok', data: [] } });
    wrap(<Playlists />);
    expect(screen.getByText('Playlists')).toBeInTheDocument();
    expect(
      screen.getByText('Create and manage your music collections'),
    ).toBeInTheDocument();
  });

  it('opens create form on "New" click, then closes on "Cancel"', async () => {
    mockGet.mockResolvedValueOnce({ data: { status: 'ok', data: [] } });
    wrap(<Playlists />);

    fireEvent.click(screen.getByText('New'));
    await waitFor(() =>
      expect(screen.getByText('New Playlist')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() =>
      expect(screen.queryByText('New Playlist')).not.toBeInTheDocument(),
    );
  });

  it('creates a playlist and adds it to the list', async () => {
    mockGet.mockResolvedValueOnce({ data: { status: 'ok', data: [] } });
    wrap(<Playlists />);

    fireEvent.click(screen.getByText('New'));
    await waitFor(() => screen.getByPlaceholderText('My Awesome Playlist'));

    fireEvent.change(screen.getByPlaceholderText('My Awesome Playlist'), {
      target: { value: 'Chill Mix' },
    });

    mockPost.mockResolvedValueOnce({
      data: {
        status: 'ok',
        data: {
          id: 'pl-1',
          user_id: 'u-1',
          name: 'Chill Mix',
          description: '',
          created_at: '2026-02-23',
          updated_at: '2026-02-23',
          track_count: 0,
        },
      },
    });

    // Multiple "Create Playlist" texts exist (form submit + empty-state CTA)
    // Target the form submit button by type=submit
    const formSubmit = document.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(formSubmit).toBeTruthy();

    mockPost.mockResolvedValueOnce({
      data: {
        status: 'ok',
        data: {
          id: 'pl-1',
          user_id: 'u-1',
          name: 'Chill Mix',
          description: '',
          created_at: '2026-02-23',
          updated_at: '2026-02-23',
          track_count: 0,
        },
      },
    });

    fireEvent.click(formSubmit);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/playlists', {
        username: 'testuser',
        name: 'Chill Mix',
        description: '',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Chill Mix')).toBeInTheDocument();
    });
  });

  it('lists existing playlists from API', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'ok',
        data: [
          {
            id: 'pl-1',
            user_id: 'u-1',
            name: 'Rock Classics',
            description: 'Best rock songs',
            created_at: '2026-02-23',
            updated_at: '2026-02-23',
            track_count: 5,
          },
          {
            id: 'pl-2',
            user_id: 'u-1',
            name: 'Chill Vibes',
            description: '',
            created_at: '2026-02-23',
            updated_at: '2026-02-23',
            track_count: 3,
          },
        ],
      },
    });

    wrap(<Playlists />);

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument();
      expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
    });
  });

  it('deletes a playlist optimistically', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'ok',
        data: [
          {
            id: 'pl-1',
            user_id: 'u-1',
            name: 'To Delete',
            description: '',
            created_at: '2026-02-23',
            updated_at: '2026-02-23',
            track_count: 0,
          },
        ],
      },
    });

    wrap(<Playlists />);

    await waitFor(() =>
      expect(screen.getByText('To Delete')).toBeInTheDocument(),
    );

    mockDelete.mockResolvedValueOnce({
      data: { status: 'ok', message: 'Playlist deleted' },
    });

    fireEvent.click(screen.getByTitle('Delete playlist'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
    });
  });
});

/* ═══════════════════════════════════════════════════════════ */
/*  SongCard — Unlike                                         */
/* ═══════════════════════════════════════════════════════════ */
describe('SongCard — Unlike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('tuneloop_username', 'testuser');
  });

  const likedSong = {
    id: 's-1',
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    genre: 'Rock',
    cover_url: '',
    duration_ms: 200000,
    created_at: '2026-01-01',
    is_liked: true,
    like_count: 5,
  };

  it('renders "Unlike song" aria-label for a liked song', () => {
    wrap(
      <SongCard
        song={likedSong}
        username="testuser"
        onLikeToggle={vi.fn()}
        index={0}
      />,
    );
    expect(screen.getByLabelText('Unlike song')).toBeInTheDocument();
  });

  it('renders "Like song" aria-label for an unliked song', () => {
    wrap(
      <SongCard
        song={{ ...likedSong, is_liked: false }}
        username="testuser"
        onLikeToggle={vi.fn()}
        index={0}
      />,
    );
    expect(screen.getByLabelText('Like song')).toBeInTheDocument();
  });

  it('calls onLikeToggle(songId, true) when unlike button is clicked', () => {
    const onToggle = vi.fn();
    wrap(
      <SongCard
        song={likedSong}
        username="testuser"
        onLikeToggle={onToggle}
        index={0}
      />,
    );

    fireEvent.click(screen.getByLabelText('Unlike song'));
    expect(onToggle).toHaveBeenCalledWith('s-1', true);
  });

  it('calls onLikeToggle(songId, false) when like button is clicked', () => {
    const onToggle = vi.fn();
    wrap(
      <SongCard
        song={{ ...likedSong, is_liked: false, like_count: 0 }}
        username="testuser"
        onLikeToggle={onToggle}
        index={0}
      />,
    );

    fireEvent.click(screen.getByLabelText('Like song'));
    expect(onToggle).toHaveBeenCalledWith('s-1', false);
  });
});
