import { getSubdomain } from '@erxes/api-utils/src/core';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { generateModels } from '../connectionResolver';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any },
  _res: Response,
  next: NextFunction
) {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const token = req.cookies['client-auth-token'];

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const verifyResult: any = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || ''
    );

    const { userId } = verifyResult;

    const userDoc = await models.ClientPortalUsers.findOne({ _id: userId });

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
