import { getSubdomain } from '@erxes/api-utils/src/core';
import { GraphQLError } from 'graphql';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { extractClientportalToken } from '@erxes/api-utils/src/clientportal';
import { IModels, generateModels } from '../connectionResolver';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any },
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

  const subdomain = getSubdomain(req);
  let models: IModels;
  try {
    models = await generateModels(subdomain);
  } catch (e) {
    return res.status(500).json({ error: e.message });
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

    const userDoc = await models.ClientPortalUsers.findOne({ _id: userId });

    if (!userDoc) {
      return next();
    }

    if (isEnableTwoFactor) {
      if (!isPassed2FA) {
        const graphQLError = new GraphQLError(
          '2Factor Authentication is activiated'
        );

        return res.status(200).json({ errors: [graphQLError] });
      }
    }

    // save user in request
    req.cpUser = userDoc;
    req.cpUser.loginToken = token;
    req.cpUser.sessionCode = req.headers.sessioncode || '';
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      const graphQLError = new GraphQLError('token expired');

      return res.status(200).json({ errors: [graphQLError] });
    }

    return next(e);
  }

  return next();
}
