import type { CookieOptions, Request, Response } from 'express';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { env } from '../config/env.js';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  sellerProfile?: unknown;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    sellerProfile: user.sellerProfile,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password });
  const payload = { sub: String(user._id), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  res.status(201).json({ user: publicUser(user), accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  const payload = { sub: String(user._id), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  res.json({ user: publicUser(user), accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized('No refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  const newPayload = { sub: String(user._id), role: user.role };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  res.json({ user: publicUser(user), accessToken });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user: publicUser(user) });
});
