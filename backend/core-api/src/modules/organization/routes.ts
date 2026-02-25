import {
  getEnv,
  getSaasOrganizationDetail,
  getSubdomain,
} from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { generateModels } from '~/connectionResolvers';
import { handleCoreLogin, magiclinkCallback, ssocallback } from '~/utils/saas';
import { IOrganizationCharge } from './types';

// Rate limiter for /ml-callback route: max 100 requests per 15 minutes per IP
const callbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router: Router = Router();

router.get('/initial-setup', async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  let organizationInfo = {
    type: 'os',
    config: {},
    hasOwner: false,
  };

  const VERSION = getEnv({ name: 'VERSION', defaultValue: 'os' });

  if (VERSION && VERSION === 'saas') {
    organizationInfo = await getSaasOrganizationDetail({
      subdomain,
    });

    organizationInfo.type = 'saas';
  }

  if (VERSION && VERSION === 'os') {
    const orgWhiteLabel = await models.OrgWhiteLabel.getOrgWhiteLabel();

    if (orgWhiteLabel && orgWhiteLabel.enabled) {
      organizationInfo = {
        ...organizationInfo,
        ...orgWhiteLabel,
      };
    }
  }

  const userCount = await models.Users.countDocuments({
    isOwner: true,
  });

  if (userCount === 0) {
    organizationInfo.hasOwner = false;
  } else {
    organizationInfo.hasOwner = true;
  }

  return res.json(organizationInfo);
});

router.get('/get-frontend-plugins', async (_req: Request, res: Response) => {
  const ENABLED_PLUGINS = getEnv({ name: 'ENABLED_PLUGINS' });
  const VERSION = getEnv({ name: 'VERSION', defaultValue: 'os' });

  if (VERSION === 'saas') {
    const remotes: { name: string; entry: string }[] = [];
    const subdomain = getSubdomain(_req);

    const organizationInfo = await getSaasOrganizationDetail({
      subdomain,
    });

    const charges = organizationInfo.charge as IOrganizationCharge;

    Object.keys(charges).forEach((key) => {
      if (
        (charges[key].purchased && charges[key].purchased > 0) ||
        (charges[key].free && charges[key].free > 0)
      ) {
        const pluginName = key.split(':')[0];

        const enabledPluginsArray = ENABLED_PLUGINS.split(',');
        if (enabledPluginsArray.includes(pluginName)) {
          remotes.push({
            name: `${pluginName}_ui`,
            entry: `https://plugins.erxes.io/latest/${pluginName}_ui/remoteEntry.js`,
          });
        }
      }
    });

    if (remotes.find((remote) => remote.name != 'agent_ui')) {
      remotes.push({
        name: 'agent_ui',
        entry: `https://plugins.erxes.io/latest/agent_ui/remoteEntry.js`,
      });
    }

    return res.json(remotes);
  } else {
    const remotes: { name: string; entry: string }[] = [];

    if (ENABLED_PLUGINS) {
      ENABLED_PLUGINS.split(',').forEach((plugin) => {
        remotes.push({
          name: `${plugin}_ui`,
          entry: `https://plugins.erxes.io/latest/${plugin}_ui/remoteEntry.js`,
        });
      });
    }

    return res.json(remotes);
  }
});

router.get('/sso-callback', callbackLimiter, ssocallback);
router.get('/ml-callback', callbackLimiter, magiclinkCallback);
router.get('/core-login', callbackLimiter, handleCoreLogin);

export { router };
