import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './utils/config';
import { requestLogger, errorHandler } from './middlewares';
import routes from './routes';

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = config.clientUrl
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// Always allow the production frontend
if (!allowedOrigins.includes('https://tuneloop.vercel.app')) {
  allowedOrigins.push('https://tuneloop.vercel.app');
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────
app.use(requestLogger);

// ─── Routes ──────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'TuneLoop API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});
app.use('/api', routes);

// ─── Error Handling ──────────────────────────────────────────
app.use(errorHandler);

export default app;
