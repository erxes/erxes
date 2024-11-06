import * as telemetry from 'erxes-telemetry';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import { getSubdomain, sendMessage } from '../core';
import redis from '../redis';

export default async function userMiddleware(
  req: Request & { user?: any },
  _res: Response,
  next: NextFunction
) {
  const subdomain = getSubdomain(req);

  if (!req.cookies) {
    return next();
  }

  const token = req.cookies['auth-token'];

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const { user }: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET || '');

    const userDoc = await sendMessage({
      serviceName: 'core',
      subdomain,
      action: 'users.findOne',
      data: {
        _id: user._id,
      },
      isRPC: true,
    });

    if (!userDoc) {
      return next();
    }

    const validatedToken = await redis.get(`user_token_${user._id}_${token}`);

    // invalid token access.
    if (!validatedToken) {
      return next();
    }

    // save user in request
    req.user = user;
    req.user.loginToken = token;
    req.user.sessionCode = req.headers.sessioncode || '';

    const currentDate = new Date();
    const machineId: string = telemetry.getMachineId();

    const lastLoginDate = new Date((await redis.get(machineId)) || '');

    if (lastLoginDate.getDay() !== currentDate.getDay()) {
      redis.set(machineId, currentDate.toJSON());

      telemetry.trackCli('last_login', { updatedAt: currentDate });
    }

    const hostname = await redis.get('hostname');

    if (!hostname) {
      redis.set('hostname', process.env.DOMAIN || 'http://localhost:3000');
    }
  } catch (e) {
    console.error(e);
  }
  
  return next();
}
