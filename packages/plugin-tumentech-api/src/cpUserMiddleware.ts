import { getSubdomain } from '@erxes/api-utils/src/core';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { sendClientPortalMessage } from './messageBroker';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any },
  _res: Response,
  next: NextFunction
) {
  const subdomain = getSubdomain(req);

  const token = req.cookies['client-auth-token'];

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const { userId }: any = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || ''
    );

    const userDoc = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: { _id: userId },
      isRPC: true,
      defaultValue: null
    });

    if (!userDoc) {
      return next();
    }

    // save user in request
    req.cpUser = userDoc;
    req.cpUser.loginToken = token;
    req.cpUser.sessionCode = req.headers.sessioncode || '';
  } catch (e) {
    console.error(e);
    return next();
  }

  return next();
}
