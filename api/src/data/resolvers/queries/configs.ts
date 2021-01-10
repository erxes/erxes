import * as mongoose from 'mongoose';
import * as os from 'os';
import { Configs } from '../../../db/models';
import { DEFAULT_CONSTANT_VALUES } from '../../../db/models/definitions/constants';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { getEnv, getErxesSaasDomain, readFile, sendRequest } from '../../utils';

const configQueries = {
  /**
   * Config object
   */
  configs(_root) {
    return Configs.find({});
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

    const erxesDomain = getEnv({ name: 'MAIN_APP_DOMAIN' });

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

  async configsStatus(_root, _args) {
    const status: any = {
      erxesApi: {},
      erxesIntegration: {}
    };

    const { version, storageEngine } = await mongoose.connection.db.command({
      serverStatus: 1
    });

    status.erxesApi.os = {
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpuCount: os.cpus().length
    };

    status.erxesApi.process = {
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime()
    };

    status.erxesApi.mongo = {
      version,
      storageEngine: storageEngine.name
    };

    return status;
  },

  configsGetEnv(_root) {
    return {
      USE_BRAND_RESTRICTIONS: process.env.USE_BRAND_RESTRICTIONS
    };
  },

  configsConstants(_root) {
    return {
      allValues: Configs.constants(),
      defaultValues: DEFAULT_CONSTANT_VALUES
    };
  },

  async configsCheckActivateInstallation(_root, args: { hostname: string }) {
    try {
      return await sendRequest({
        method: 'POST',
        url: `${getErxesSaasDomain()}/check-activate-installation`,
        body: args
      });
    } catch (e) {
      throw new Error(e.message);
    }
  },

  configsGetEmailTemplate(_root, { name }: { name?: string }) {
    return readFile(name || 'base');
  }
};

moduleRequireLogin(configQueries);

export default configQueries;
