import * as jwt from 'jsonwebtoken';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { NextFunction, Request, Response } from 'express';

export default async function posUserMiddleware(
  req: Request & { posUser?: any },
  _res: Response,
  next: NextFunction
) {
  let token;
  try {
    token = req.cookies['pos-auth-token'];
  } catch (e) {}

  if (token) {
    try {
      // verify user token and retrieve stored user information
      const { user }: any = jwt.verify(
        token,
        process.env.JWT_TOKEN_SECRET || ''
      );

      // save user in request
      req.posUser = user;
      req.posUser.loginToken = token;
      return next();
    } catch (e) {
      console.log(e.message);
      return next();
    }
  }
  return next();
}
