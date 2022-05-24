import { generateCPModels } from './../connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { NextFunction, Request, Response } from 'express';
import { generateModels } from '../connectionResolver';
import * as jwt from 'jsonwebtoken';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any },
  _res: Response,
  next: NextFunction
) {
  const clientPortalId = (req.headers['client-portal-id'] || '').toString();

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const cpModels = clientPortalId && (await generateCPModels(clientPortalId));
  const token = req.cookies['client-auth-token'];

  if (!token) {
    return next();
  }

  if (!cpModels) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const { userId }: any = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || ''
    );

    const userDoc = await cpModels.ClientPortalUsers.findOne({ _id: userId });

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
