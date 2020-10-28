import * as mongoose from 'mongoose';
import * as os from 'os';
import * as path from 'path';
import { Configs } from '../../../db/models';
import { DEFAULT_CONSTANT_VALUES } from '../../../db/models/definitions/constants';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { getEnv, getSubServiceDomain, sendRequest } from '../../utils';

const configQueries = {
  /**
   * Config object
   */
  configs(_root) {
    return Configs.find({});
  },

  async configsStatus(_root, _args) {
    const status: any = {
      erxesApi: {},
      erxesIntegration: {},
      erxes: {}
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

    const projectPath = process.cwd();
    status.erxesApi.packageVersion = require(path.join(
      projectPath,
      'package.json'
    )).version;

    try {
      const erxesDomain = getEnv({ name: 'MAIN_APP_DOMAIN' });
      const erxesVersion = await sendRequest({
        url: `${erxesDomain}/version.json`,
        method: 'GET'
      });

      status.erxes.packageVersion = erxesVersion.packageVersion || '-';
    } catch (e) {
      status.erxes.packageVersion = '-';
    }

    try {
      const erxesIntegrationDomain = getSubServiceDomain({
        name: 'INTEGRATIONS_API_DOMAIN'
      });
      const erxesIntegration = await sendRequest({
        url: `${erxesIntegrationDomain}/system-status`,
        method: 'GET'
      });

      status.erxesIntegration = erxesIntegration || '-';
    } catch (e) {
      status.erxesIntegration = {
        packageVersion: '-'
      };
    }

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
  }
};

moduleRequireLogin(configQueries);

export default configQueries;
