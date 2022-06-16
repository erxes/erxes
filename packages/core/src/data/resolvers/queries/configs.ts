import { moduleRequireLogin } from '../../permissions/wrappers';

import {
  checkPremiumService,
  getCoreDomain,
  getEnv,
  readFile,
  sendRequest
} from '../../utils';

import { getService, getServices } from '../../../serviceDiscovery';
import { sendCommonMessage } from '../../../messageBroker';
import { DEFAULT_CONSTANT_VALUES } from '@erxes/api-utils/src/constants';

import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
dotenv.config();

const configQueries = {
  /**
   * Config object
   */
  configs(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async configsGetVersion(_root, { releaseNotes }) {
    const result = {
      version: '-',
      isUsingRedis: Boolean(process.env.REDIS_HOST),
      isUsingRabbitMQ: Boolean(process.env.RABBITMQ_HOST),
      isUsingElkSyncer: Boolean(process.env.ELK_SYNCER !== 'false'),
      isLatest: false,
      releaseInfo: {}
    };

    const erxesDomain = getEnv({ name: 'DOMAIN' });

    const erxesVersion = await sendRequest({
      url: `${erxesDomain}/version.json`,
      method: 'GET'
    });

    result.version = erxesVersion.packageVersion || '-';

    const response = await sendRequest({
      url: `${process.env.CORE_URL || 'https://erxes.io'}/git-release-info`,
      method: 'GET'
    });

    result.isLatest = result.version === response.tag_name;

    if (releaseNotes) {
      result.releaseInfo = response;
    }

    return result;
  },

  configsGetEnv(_root) {
    return {
      USE_BRAND_RESTRICTIONS: process.env.USE_BRAND_RESTRICTIONS
    };
  },

  configsConstants(_root, _args, { models }: IContext) {
    return {
      allValues: models.Configs.constants(),
      defaultValues: DEFAULT_CONSTANT_VALUES
    };
  },

  async configsCheckPremiumService(_root, args: { type: string }) {
    return checkPremiumService(args.type);
  },

  async configsCheckActivateInstallation(_root, args: { hostname: string }) {
    try {
      return await sendRequest({
        method: 'POST',
        url: `${getCoreDomain()}/check-activate-installation`,
        body: args
      });
    } catch (e) {
      throw new Error(e.message);
    }
  },

  configsGetEmailTemplate(_root, { name }: { name?: string }) {
    return readFile(name || 'base');
  },

  async search(_root, { value }: { value: string }, { subdomain }: IContext) {
    const services = await getServices();

    let results: Array<{ module: string; items: any[] }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);
      const meta = service.config ? service.config.meta : {};

      if (meta && meta.isSearchable) {
        const serviceResults = await sendCommonMessage({
          subdomain,
          serviceName,
          action: 'search',
          data: {
            subdomain,
            value
          },
          isRPC: true
        });

        results = [...results, ...serviceResults];
      }
    }

    return results;
  },

  async configsGetValue(
    _root,
    { code }: { code: string },
    { models }: IContext
  ) {
    return models.Configs.findOne({ code });
  }
};

moduleRequireLogin(configQueries);

// @ts-ignore
configQueries.enabledServices = async () => {
  const names = await getServices();
  const result = {};

  for (const name of names) {
    result[name] = true;
  }

  return result;
};

export default configQueries;
