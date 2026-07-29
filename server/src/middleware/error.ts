import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: 'Validation failed', details: err.errors });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid ${err.path}: ${String(err.value)}` });
    return;
  }

  // Duplicate key
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({ message: 'Duplicate value violates a unique constraint' });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    message: 'Internal server error',
    ...(env.isProd ? {} : { error: err instanceof Error ? err.message : String(err) }),
  });
}
