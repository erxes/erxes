import {
  getEnv,
  getPlugin,
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

    if (orgWhiteLabel?.enabled) {
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

  // A plugin that registered UI_ENTRY_URL serves its own remote; everything
  // else loads from its release folder on the plugins CDN.
  const getPluginEntry = async (pluginName: string) => {
    const config = await getPlugin(pluginName)
      .then((pluginInfo) => pluginInfo?.config)
      .catch(() => undefined);

    return (
      config?.uiEntry ||
      `https://plugins.erxes.io/${
        config?.releaseVersion || 'latest'
      }/${pluginName}_ui/remoteEntry.js`
    );
  };

  // Module-federation container names cannot contain dashes — Nx builds
  // "erxes-agent_ui" as global `erxes_agent_ui` — so the runtime remote name
  // must use underscores while the CDN path keeps the plugin's real name.
  const remoteName = (pluginName: string): string =>
    `${pluginName.replace(/-/g, '_')}_ui`;

  // Marketplace-installed plugins (tenant db): env plugins and installed
  // plugins are additive sources of remotes.
  const getInstalledRemotes = async (
    subdomain: string,
  ): Promise<{ name: string; entry: string }[]> => {
    const models = await generateModels(subdomain);

    const installs = await models.PluginInstalls.find({ enabled: true }).lean();

    return installs.flatMap((install) =>
      install.ui?.remote && install.ui?.entry
        ? [{ name: install.ui.remote, entry: install.ui.entry }]
        : [],
    );
  };

  const mergeInstalledRemotes = async (
    remotes: { name: string; entry: string }[],
    subdomain: string,
  ) => {
    const known = new Set(remotes.map((remote) => remote.name));

    for (const remote of await getInstalledRemotes(subdomain)) {
      if (!known.has(remote.name)) {
        remotes.push(remote);
        known.add(remote.name);
      }
    }

    return remotes;
  };

  if (VERSION === 'saas') {
    const remotes: { name: string; entry: string }[] = [];
    const subdomain = getSubdomain(_req);

    const organizationInfo = await getSaasOrganizationDetail({
      subdomain,
    });

    const charges = organizationInfo.charge as IOrganizationCharge;

    const enabledPluginsArray = ENABLED_PLUGINS.split(',');

    for (const key of Object.keys(charges)) {
      if (
        (charges[key].purchased && charges[key].purchased > 0) ||
        (charges[key].free && charges[key].free > 0)
      ) {
        const pluginName = key.split(':')[0];

        if (enabledPluginsArray.includes(pluginName)) {
          remotes.push({
            name: remoteName(pluginName),
            entry: await getPluginEntry(pluginName),
          });
        }
      }
    }

    const hasAgentUi = remotes.some((remote) => remote.name === 'agent_ui');

    if (!hasAgentUi) {
      remotes.push({
        name: 'agent_ui',
        entry: await getPluginEntry('agent'),
      });
    }

    return res.json(await mergeInstalledRemotes(remotes, subdomain));
  } else {
    const remotes: { name: string; entry: string }[] = [];

    if (ENABLED_PLUGINS) {
      for (const plugin of ENABLED_PLUGINS.split(',')) {
        remotes.push({
          name: remoteName(plugin),
          entry: await getPluginEntry(plugin),
        });
      }
    }

    return res.json(
      await mergeInstalledRemotes(remotes, getSubdomain(_req)),
    );
  }
});

router.get('/sso-callback', callbackLimiter, ssocallback);
router.get('/ml-callback', callbackLimiter, magiclinkCallback);
router.get('/core-login', callbackLimiter, handleCoreLogin);

export { router };
