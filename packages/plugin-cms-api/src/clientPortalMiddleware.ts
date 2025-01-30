import { getSubdomain } from '@erxes/api-utils/src/core';
import { NextFunction, Request, Response } from 'express';
import { generateModels, IModels } from './connectionResolver';

export default async function clientPortalMiddleware(
  req: Request & { clientPortalId?: any },
  _res: Response,
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

  const clientPortalId = (req.headers['client-portal-id'] || '').toString();

  if (clientPortalId) {
    req.clientPortalId = clientPortalId;
    return next();
  }

  return next();
}
