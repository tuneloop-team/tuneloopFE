import morgan from 'morgan';
import { config } from '../utils/config';

const format = config.nodeEnv === 'production' ? 'combined' : 'dev';

export const requestLogger = morgan(format);
