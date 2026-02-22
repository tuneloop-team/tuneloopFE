import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './utils/config';
import { requestLogger, errorHandler } from './middlewares';
import routes from './routes';

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl.split(',').map((url) => url.trim()),
    credentials: true,
  }),
);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────
app.use(requestLogger);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api', routes);

// ─── Error Handling ──────────────────────────────────────────
app.use(errorHandler);

export default app;
