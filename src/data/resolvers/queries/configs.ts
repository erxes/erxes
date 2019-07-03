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
    const erxesDomain = getEnv({ name: 'MAIN_APP_DOMAIN' });
    const domain = getEnv({ name: 'DOMAIN' });
    const widgetsApiDomain = getEnv({ name: 'WIDGETS_API_DOMAIN' });
    const widgetsDomain = getEnv({ name: 'WIDGETS_DOMAIN' });

    let erxesVersion;
    let apiVersion;
    let widgetApiVersion;
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
      widgetApiVersion = await sendRequest({ url: `${widgetsApiDomain}/static/version.json`, method: 'GET' });
    } catch (e) {
      widgetApiVersion = {};
    }

    try {
      widgetVersion = await sendRequest({ url: `${widgetsDomain}/build/version.json`, method: 'GET' });
    } catch (e) {
      widgetVersion = {};
    }

    return {
      erxesVersion,
      apiVersion,
      widgetApiVersion,
      widgetVersion,
    };
  },
};

moduleRequireLogin(configQueries);

export default configQueries;
