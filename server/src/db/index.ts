import { Pool } from 'pg';
import { config } from '../utils/config';
import logger from '../utils/logger';

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
});

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', {
    error: err.message,
  });
  process.exit(-1);
});

export const query = async (
  text: string,
  params?: unknown[],
): Promise<import('pg').QueryResult> => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug(`Executed query`, { text, duration: `${duration}ms`, rows: result.rowCount });
  return result;
};

export const getPool = (): Pool => pool;

export const testConnection = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT 1');
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};

export const testConnectionWithLatency = async (): Promise<{ connected: boolean; latencyMs: number }> => {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch {
    const latencyMs = Date.now() - start;
    return { connected: false, latencyMs };
  }
};

export default { query, getPool, testConnection, testConnectionWithLatency };
