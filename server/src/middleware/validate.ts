import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Reassign only body/params safely; query is read-only in some setups.
      if (source === 'body') req.body = parsed;
      else if (source === 'params') req.params = parsed as Request['params'];
      else Object.assign(req.query, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest('Validation failed', err.flatten().fieldErrors));
      } else {
        next(err);
      }
    }
  };
}
