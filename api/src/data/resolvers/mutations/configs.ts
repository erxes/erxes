import { Configs } from '../../../db/models';
import {
  moduleCheckPermission,
  requireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';
import {
  getErxesSaasDomain,
  initFirebase,
  registerOnboardHistory,
  resetConfigsCache,
  sendRequest
} from '../../utils';

const configMutations = {
  /**
   * Create or update config object
   */
  async configsUpdate(_root, { configsMap }, { user }: IContext) {
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const prevConfig = (await Configs.findOne({ code })) || { value: [] };

      const value = configsMap[code];
      const doc = { code, value };

      await Configs.createOrUpdateConfig(doc);

      resetConfigsCache();

      const updatedConfig = await Configs.getConfig(code);

      if (['GOOGLE_APPLICATION_CREDENTIALS_JSON'].includes(code)) {
        initFirebase(configsMap[code] || '');
      }

      if (
        ['dealUOM', 'dealCurrency'].includes(code) &&
        prevConfig.value.toString() !== updatedConfig.value.toString()
      ) {
        registerOnboardHistory({ type: `configure.${code}`, user });
      }
    }
  },

  async configsActivateInstallation(
    _root,
    args: { token: string; hostname: string }
  ) {
    try {
      return await sendRequest({
        method: 'POST',
        url: `${getErxesSaasDomain()}/activate-installation`,
        body: args
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
};

moduleCheckPermission(configMutations, 'manageGeneralSettings');
requireLogin(configMutations, 'configsActivateInstallation');

export default configMutations;
