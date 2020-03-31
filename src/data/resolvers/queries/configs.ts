import { Configs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { frontendEnv, getEnv, sendRequest } from '../../utils';

const configQueries = {
  /**
   * Config object
   */
  configs(_root) {
    return Configs.find({});
  },

  async configsVersions(_root, _args, { requestInfo }: IContext) {
    const erxesDomain = getEnv({ name: 'MAIN_APP_DOMAIN' });
    const domain = frontendEnv({ name: 'API_URL', requestInfo });
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
