import { sendCommonMessage } from '../../../messageBroker';
import {
  moduleCheckPermission,
  requireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../../connectionResolver';
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
  async configsUpdate(_root, { configsMap }, { user, models }: IContext) {
    const codes = Object.keys(configsMap);

    const isThemeEnabled = await checkPremiumService('isThemeServiceEnabled');

    for (const code of codes) {
      if (!code) {
        continue;
      }

      if (code.includes('THEME_') && !isThemeEnabled) {
        continue;
      }

      const prevConfig = (await models.Configs.findOne({ code })) || {
        value: []
      };

      const value = configsMap[code];
      const doc = { code, value };

      await models.Configs.createOrUpdateConfig(doc);

      resetConfigsCache();

      const updatedConfig = await models.Configs.getConfig(code);

      if (['GOOGLE_APPLICATION_CREDENTIALS_JSON'].includes(code)) {
        initFirebase(models);
      }

      if (
        ['dealUOM', 'dealCurrency'].includes(code) &&
        (prevConfig.value || '').toString() !==
          (updatedConfig.value || '').toString()
      ) {
        registerOnboardHistory({ models, type: 'generalSettingsCreate', user });
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
        registerOnboardHistory({
          models,
          type: 'generalSettingsUploadCreate',
          user
        });
      }

      if (
        ['sex_choices', 'company_industry_types', 'social_links'].includes(
          code
        ) &&
        (prevConfig.value || '').toString() !==
          (updatedConfig.value || '').toString()
      ) {
        registerOnboardHistory({
          models,
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
  },

  async configsManagePluginInstall(_root, args, { subdomain }: IContext) {
    await sendCommonMessage({
      subdomain,
      serviceName: '',
      action: 'managePluginInstall',
      data: args,
      isRPC: true
    });

    return { status: 'success' };
  }
};

moduleCheckPermission(configMutations, 'manageGeneralSettings');
requireLogin(configMutations, 'configsActivateInstallation');
requireLogin(configMutations, 'configsManagePluginInstall');

export default configMutations;
