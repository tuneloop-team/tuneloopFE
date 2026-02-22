import app from './app';
import { config } from './utils/config';
import logger from './utils/logger';

const start = (): void => {
  app.listen(config.port, () => {
    logger.info(
      `🚀 TuneLoop API running on http://localhost:${config.port} [${config.nodeEnv}]`,
    );
  });
};

start();
