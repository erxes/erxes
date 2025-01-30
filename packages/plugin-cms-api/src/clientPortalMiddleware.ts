import { getSubdomain } from '@erxes/api-utils/src/core';
import { NextFunction, Request, Response } from 'express';
import { generateModels, IModels } from './connectionResolver';

export default async function clientPortalMiddleware(
  req: Request & { clientPortalId?: any },
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

  const clientPortalId = (req.headers['client-portal-id'] || '').toString();
  const subdomain = getSubdomain(req);

  let models: IModels;
  try {
    models = await generateModels(subdomain);

    if (clientPortalId) {
      req.clientPortalId = clientPortalId;
      return next();
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
