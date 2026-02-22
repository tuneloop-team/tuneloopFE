// Types barrel export

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export interface CreateProfilePayload {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  cover_url: string;
  duration_ms: number;
  created_at: string;
  is_liked: boolean;
  like_count: number;
}

export interface ApiHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: string;
  dbLatencyMs: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
