import type { CookieOptions, Request } from 'express';
import { config } from '~/config';

export const SESSION_COOKIE = 'erxes_session';

export const readCookies = (header?: string): Record<string, string> => {
  const cookies: Record<string, string> = {};

  for (const part of (header ?? '').split(';')) {
    const index = part.indexOf('=');

    if (index > 0) {
      const value = part.slice(index + 1).trim();

      try {
        cookies[part.slice(0, index).trim()] = decodeURIComponent(value);
      } catch {
        cookies[part.slice(0, index).trim()] = value;
      }
    }
  }

  return cookies;
};

export const sessionCookieOptions = (req: Request): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: req.secure,
  path: '/',
  maxAge: config.auth.sessionHours * 60 * 60 * 1000,
});
