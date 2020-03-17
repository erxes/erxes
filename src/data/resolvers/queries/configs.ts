import { Configs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { getEnv, sendRequest } from '../../utils';

const configQueries = {
  /**
   * Config object
   */
  configs(_root) {
    return Configs.find({});
  },

  async configsVersions(_root) {
    const erxesDomain = getEnv({ name: 'MAIN_APP_DOMAIN' });
    const domain = getEnv({ name: 'DOMAIN' });
    const widgetsDomain = getEnv({ name: 'WIDGETS_DOMAIN' });

    let erxesVersion;
    let apiVersion;
    let widgetVersion;

    try {
      erxesVersion = await sendRequest({ url: `${erxesDomain}/version.json`, method: 'GET' });
    } catch (e) {
      erxesVersion = {};
    }

    try {
      apiVersion = await sendRequest({ url: `${domain}/static/version.json`, method: 'GET' });
    } catch (e) {
      apiVersion = {};
    }

    try {
      widgetVersion = await sendRequest({ url: `${widgetsDomain}/build/version.json`, method: 'GET' });
    } catch (e) {
      widgetVersion = {};
    }

    return {
      erxesVersion,
      apiVersion,
      widgetVersion,
    };
  },

  configsGetEnv(_root) {
    return {
      USE_BRAND_RESTRICTIONS: process.env.USE_BRAND_RESTRICTIONS,
    };
  },
};

moduleRequireLogin(configQueries);

export default configQueries;
