import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';
import type { UserRole } from '../models/User.js';
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  if (typeof req.cookies?.accessToken === 'string') {
    return req.cookies.accessToken;
  }
  return null;
}

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.sub).select('role isBlocked');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  req.user = { id: payload.sub, role: user.role };
  next();
});
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // ignore invalid token for optional routes
    }
  }
  next();
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}
