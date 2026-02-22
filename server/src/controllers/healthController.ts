import { Request, Response } from 'express';
import { testConnectionWithLatency } from '../db';

export const healthCheck = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const { connected, latencyMs } = await testConnectionWithLatency();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: connected ? 'connected' : 'disconnected',
    dbLatencyMs: latencyMs,
  });
};
