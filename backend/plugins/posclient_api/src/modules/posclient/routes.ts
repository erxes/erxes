import {
  authCookieOptions,
  getSubdomain,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';

export const posInitialSetup = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const config = await models.Configs.findOne({ status: { $ne: 'deleted' } });

  if (!config) {
    return res.end('no config found');
  }

  if (!res.cookie) {
    return res.end('success');
  }

  const envMaps = JSON.parse(req.query.envs || '{}');

  for (const key of Object.keys(envMaps)) {
    res.cookie(key, envMaps[key], authCookieOptions(req.secure));
  }

  return res.end('success');
};
