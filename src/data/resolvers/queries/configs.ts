import { Configs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { getEnv, sendRequest } from '../../utils';

const configQueries = {
  /**
   * Config object
   */
  configsDetail(_root, { code }: { code: string }) {
    return Configs.findOne({ code });
  },

  async configsVersions(_root) {
    const domain = getEnv({ name: 'DOMAIN' });
    const widgetsApiDomain = getEnv({ name: 'WIDGETS_API_DOMAIN' });

    let apiVersion;
    let widgetApiVersion = {};

    try {
      apiVersion = await sendRequest({ url: `${domain}/static/version.json`, method: 'GET' });
    } catch (e) {
      apiVersion = {};
    }

    try {
      widgetApiVersion = await sendRequest({ url: `${widgetsApiDomain}/static/version.json`, method: 'GET' });
    } catch (e) {
      widgetApiVersion = {};
    }

    return {
      apiVersion,
      widgetApiVersion,
    };
  },
};

moduleRequireLogin(configQueries);

export default configQueries;
