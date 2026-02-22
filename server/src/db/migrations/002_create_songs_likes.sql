-- ============================================
-- TuneLoop — Sprint 1 Schema: Songs + Likes
-- ============================================

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(200) NOT NULL,
  artist      VARCHAR(200) NOT NULL,
  album       VARCHAR(200) DEFAULT '',
  genre       VARCHAR(100) DEFAULT '',
  cover_url   TEXT DEFAULT '',
  duration_ms INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table (profile <-> song relationship)
CREATE TABLE IF NOT EXISTS likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  song_id     UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, song_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs (LOWER(artist));
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_likes_profile ON likes (profile_id);
CREATE INDEX IF NOT EXISTS idx_likes_song ON likes (song_id);
