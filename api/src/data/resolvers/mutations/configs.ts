import { Configs } from '../../../db/models';
import {
  moduleCheckPermission,
  requireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';
import {
  checkPremiumService,
  getCoreDomain,
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

    const isThemeEnabled = await checkPremiumService('isThemeServiceEnabled');

    for (const code of codes) {
      if (!code) {
        continue;
      }

      if (code.includes('THEME_') && !isThemeEnabled) {
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
        (prevConfig.value || '').toString() !==
          (updatedConfig.value || '').toString()
      ) {
        registerOnboardHistory({ type: 'generalSettingsCreate', user });
      }

      if (
        [
          'UPLOAD_FILE_TYPES',
          'WIDGETS_UPLOAD_FILE_TYPES',
          'UPLOAD_SERVICE_TYPE',
          'FILE_SYSTEM_PUBLIC'
        ].includes(code) &&
        (prevConfig.value || '').toString() !==
          (updatedConfig.value || '').toString()
      ) {
        registerOnboardHistory({ type: 'generalSettingsUploadCreate', user });
      }

      if (
        ['sex_choices', 'company_industry_types', 'social_links'].includes(
          code
        ) &&
        (prevConfig.value || '').toString() !==
          (updatedConfig.value || '').toString()
      ) {
        registerOnboardHistory({
          type: 'generelSettingsConstantsCreate',
          user
        });
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
        url: `${getCoreDomain()}/activate-installation`,
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
