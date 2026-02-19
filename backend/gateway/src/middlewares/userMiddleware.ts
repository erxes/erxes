import * as dotenv from 'dotenv';

import { USER_ROLES, userActionsMap } from 'erxes-api-shared/core-modules';
import {
  getSubdomain,
  redis,
  setClientPortalHeader,
  setCPUserHeader,
  setUserHeader,
} from 'erxes-api-shared/utils';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { generateModels, IModels } from '../connectionResolver';

dotenv.config();

export default async function userMiddleware(
  req: Request & { user?: any; cpUser?: any; clientPortal?: any },
  res: Response,
  next: NextFunction,
) {
  const url = req.headers['erxes-core-website-url'];
  const erxesCoreToken = req.headers['erxes-core-token'];

  if (Array.isArray(erxesCoreToken)) {
    return res.status(400).json({ error: `Multiple erxes-core-tokens found` });
  }

  if (erxesCoreToken && url) {
    try {
      const response = await fetch('https://erxes.io/check-website', {
        method: 'POST',
        headers: {
          'erxes-core-token': erxesCoreToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
        }),
      }).then((r) => r.text());

      if (response === 'ok') {
        req.user = {
          _id: 'userId',
          customPermissions: [
            {
              action: 'showIntegrations',
              allowed: true,
              requiredActions: [],
            },
            {
              action: 'showKnowledgeBase',
              allowed: true,
              requiredActions: [],
            },
            {
              action: 'showScripts',
              allowed: true,
              requiredActions: [],
            },
          ],
        };
      }
    } catch {
      return next();
    }

    return next();
  }

  const appToken = (req.headers['erxes-app-token'] || '').toString();
  const subdomain = getSubdomain(req);

  let models: IModels;
  try {
    models = await generateModels(subdomain);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({ error: e.message });
    } else {
      // In case `e` is not an instance of Error, handle it accordingly
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }

  if (appToken) {
    try {
      const { app }: any = jwt.verify(
        appToken,
        process.env.JWT_TOKEN_SECRET || 'SECRET',
      );

      if (app && app._id) {
        const appInDb = await models.Apps.findOne({ _id: app._id });

        if (appInDb) {
          const permissions = await models.Permissions.find({
            groupId: appInDb.userGroupId,
            allowed: true,
          }).lean();

          const user = await models.Users.findOne({
            role: USER_ROLES.SYSTEM,
            groupIds: { $in: [app.userGroupId] },
            appId: app._id,
          }).lean();

          if (user) {
            const key = `user_permissions_${user._id}`;
            const cachedPermissions = await redis.get(key);

            if (
              !cachedPermissions ||
              (cachedPermissions && cachedPermissions === '{}')
            ) {
              const userPermissions = await models.Permissions.find({
                userId: user._id,
              });
              const groupPermissions = await models.Permissions.find({
                groupId: { $in: user.groupIds },
              });

              const actionMap = await userActionsMap(
                userPermissions,
                groupPermissions,
                user,
              );

              await redis.set(key, JSON.stringify(actionMap));
            }

            req.user = {
              _id: user._id || 'userId',
              ...user,
              role: USER_ROLES.SYSTEM,
              isOwner: appInDb.allowAllPermission || false,
              customPermissions: permissions.map((p) => ({
                action: p.action,
                allowed: p.allowed,
                requiredActions: p.requiredActions,
              })),
            };
          }
        }
      }

      setUserHeader(req.headers, req.user);

      return next();
    } catch (e) {
      console.error(e);

      return next();
    }
  }

  const clientPortalToken = req.headers['x-app-token'];
  const clientAuthToken =
    req.headers['client-auth-token'] || req.cookies['client-auth-token'];

  if (clientPortalToken) {
    const clientPortalTokenString = String(clientPortalToken);

    try {
      const clientPortalTokenDecoded: any = jwt.verify(
        clientPortalTokenString,
        process.env.JWT_TOKEN_SECRET || 'SECRET',
      );

      const clientPortal = await models.ClientPortals.findOne({
        _id: clientPortalTokenDecoded.clientPortalId,
      });

      if (!clientPortal) {
        return next();
      }

      req.clientPortal = clientPortal;

      setClientPortalHeader(req.headers, req.clientPortal);

      if (clientAuthToken) {
        try {
          const clientAuthTokenString = String(clientAuthToken);

          const clientAuthTokenDecoded: any = jwt.verify(
            clientAuthTokenString,
            process.env.JWT_TOKEN_SECRET || 'SECRET',
          );

          const clientPortalUser = await models.CPUsers.findOne({
            _id: clientAuthTokenDecoded.userId,
            clientPortalId: clientPortal._id,
          });

          if (clientPortalUser) {
            req.cpUser = clientPortalUser;
            setCPUserHeader(req.headers, req.cpUser);
          }
        } catch (e) {
          if (e instanceof jwt.TokenExpiredError) {
            return next();
          } else {
            console.error(e);
          }
        }
      }

      return next();
    } catch (e) {
      console.error(e);

      return next();
    }
  }

  const token = req.cookies['auth-token'];

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || 'SECRET',
    );
    const user = decoded.user;

    const userDoc = await models.Users.findOne(
      { _id: user._id },
      '_id email details isOwner groupIds brandIds username code departmentIds',
    ).lean();

    if (!userDoc) {
      return next();
    }

    const validatedToken = await redis.get(`user_token_${user._id}_${token}`);

    // invalid token access.
    if (!validatedToken) {
      return next();
    }

    // save user in request
    req.user = { ...userDoc };
    req.user.loginToken = token;
    req.user.sessionCode = req.headers.sessioncode || '';

    const hostname = await redis.get('hostname');

    if (!hostname) {
      redis.set('hostname', process.env.DOMAIN || 'http://localhost:3001');
    }
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return next();
    } else {
      console.error(e);
    }
  }
  setUserHeader(req.headers, req.user);

  return next();
}
