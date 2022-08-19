import { NextFunction, Request, Response } from 'express';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';

export default async function posUserMiddleware(
  req: Request & { posConfig?: any },
  _res: Response,
  next: NextFunction
) {
  let token;
  try {
    token = req.cookies['pos-config-token'];
  } catch (e) {}

  if (token) {
    try {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      req.posConfig = (await models.Configs.findOne({ token }).lean()) || {};
      return next();
    } catch (e) {
      console.log(e.message);
      return next();
    }
  }
  return next();
}
