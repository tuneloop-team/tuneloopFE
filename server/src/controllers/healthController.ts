import { Request, Response } from 'express';
import { testConnection } from '../db';

export const healthCheck = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const dbConnected = await testConnection();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbConnected ? 'connected' : 'disconnected',
  });
};
