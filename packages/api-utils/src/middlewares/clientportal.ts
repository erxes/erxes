import { getSubdomain } from '@erxes/api-utils/src/core';
import { GraphQLError } from 'graphql';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { extractClientportalToken } from '@erxes/api-utils/src/clientportal';
import { sendMessage } from '../core';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any; isPassed2FA: boolean },
  res: Response,
  next: NextFunction
) {
  if (
    req.path === '/subscriptionPlugin.js' ||
    req.path.startsWith('/rpc') ||
    req.body?.operationName === 'SubgraphIntrospectQuery' ||
    req.body?.operationName === 'IntrospectionQuery'
  ) {
    return next();
  }

  const { body } = req;

  const operationName = body.operationName && body.operationName.split('__')[0];

  if (
    [
      'clientPortalGetLast',
      'clientPortalGetConfigs',
      'clientPortalGetConfig',
      'clientPortalConfigsTotalCount',
      'clientPortalConfigUpdate',
      'clientPortalRemove',
      'clientPortalGetAllowedFields',
      'clientPortalLogin',
      'clientPortalLogout',
      'clientPortalLoginWithPhone',
      'clientPortalLoginWithMailOTP',
      'clientPortalLoginWithSocialPay',
      'clientPortalRegister',
      'clientPortalVerifyOTP',
      'clientPortalRefreshToken',
      'clientPortalGetConfigByDomain',
      'clientPortalKnowledgeBaseTopicDetail',
    ].includes(operationName)
  ) {
    return next();
  }

  const token = extractClientportalToken(req);

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const verifyResult: any = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || ''
    );

    const { userId, isPassed2FA, isEnableTwoFactor } = verifyResult;

    if (!userId) {
      return next();
    }

    const userDoc = await sendMessage({
      serviceName: 'clientportal',
      subdomain: getSubdomain(req),
      action: 'clientPortalUsers.findOne',
      data: {
        _id: userId,
      },
      isRPC: true,
      defaultValue: null,
    });

    if (!userDoc) {
      return next();
    }

    // save user in request
    req.cpUser = userDoc;
    req.cpUser.loginToken = token;
    req.cpUser.sessionCode = req.headers.sessioncode || '';
    if (isEnableTwoFactor) {
      req.isPassed2FA = isPassed2FA;
    } else {
      req.isPassed2FA = true;
    }
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      const graphQLError = new GraphQLError('token expired');

      return res.status(200).json({ errors: [graphQLError] });
    }

    return next(e);
  }

  return next();
}
