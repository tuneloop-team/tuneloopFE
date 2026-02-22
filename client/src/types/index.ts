// Types barrel export
// Add shared type definitions here

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ApiHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: string;
}
