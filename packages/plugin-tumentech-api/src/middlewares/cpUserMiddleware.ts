import { getSubdomain } from '@erxes/api-utils/src/core';
import { GraphQLError } from 'graphql';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { generateModels } from '../connectionResolver';

export default async function cpUserMiddleware(
  req: Request & { cpUser?: any },
  res: Response,
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
      'clientPortalKnowledgeBaseTopicDetail',
      'getAccount',
      'revealPhone',
      'customerAccountEditDriverGroups',
      'tumentechInvite',
      'getEbarimt',
      'searchDriver'
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
    if (e.name === 'TokenExpiredError') {
      const graphQLError = new GraphQLError('token expired');

      return res.status(200).json({ errors: [graphQLError] });
    }

    return next(e);
  }

  return next();
}
