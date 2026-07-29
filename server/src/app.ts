import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan('dev'));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  app.get('/', (_req, res) => {
    res.json({ name: 'DeshiCraft API', docs: '/api/health' });
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
