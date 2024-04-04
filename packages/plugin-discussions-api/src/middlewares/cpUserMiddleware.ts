import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any },
  _res: Response,
  next: NextFunction
) {
  req.cpUser = { userId: '_id' };
  return next();

  const token = req.cookies['client-auth-token'];

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const cpUser: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET || '');

    if (!cpUser) {
      return next();
    }

    // save user in request
    req.cpUser = cpUser;
    req.cpUser.loginToken = token;
    req.cpUser.sessionCode = req.headers.sessioncode || '';
  } catch (e) {
    return next();
  }

  return next();
}
