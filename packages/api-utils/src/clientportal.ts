import * as dotenv from 'dotenv';
dotenv.config();
import type { Request } from 'express';

export function extractClientportalToken(
  req: Request,
): string | null | undefined {
  const authHeader = req.headers.authorization;

  const token = req.cookies['client-auth-token']
    ? req.cookies['client-auth-token']
    : authHeader && authHeader.split(' ')[1];

  return token;
}
