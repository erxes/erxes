import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any },
  _res: Response,
  next: NextFunction
) {
  const { body } = req;

  const operationName = body.operationName && body.operationName.split('__')[0];

  if (
    [
      'clientPortalLogin',
      'clientPortalLoginRegister',
      'clientPortalRefreshToken',
      'clientPortalGetConfigByDomain',
      'clientPortalRefreshToken',
      'clientPortalKnowledgeBaseTopicDetail'
    ].includes(operationName)
  ) {
    return next();
  }

  const authHeader = req.headers.authorization;

  const token = req.cookies['client-auth-token']
    ? req.cookies['client-auth-token']
    : authHeader && authHeader.split(' ')[1];

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
