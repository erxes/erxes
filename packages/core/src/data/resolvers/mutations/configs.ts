import { sendCommonMessage } from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';
import {
  getCoreDomain,
  initFirebase,
  registerOnboardHistory,
  resetConfigsCache,
  sendRequest
} from '../../utils';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { putCreateLog, putUpdateLog } from '../../logUtils';

const configMutations = {
  /**
   * Create or update config object
   */
  async configsUpdate(
    _root,
    { configsMap },
    { user, models, subdomain }: IContext
  ) {
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const prevConfig = (await models.Configs.findOne({ code })) || {
        code: '',
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
        ['dealCurrency'].includes(code) &&
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

      if (prevConfig.code) {
        await putUpdateLog(
          models,
          subdomain,
          {
            type: 'config',
            object: prevConfig,
            newData: updatedConfig,
            updatedDocument: updatedConfig,
            description: updatedConfig.code
          },
          user
        );
      } else {
        await putCreateLog(
          models,
          subdomain,
          {
            type: 'config',
            description: updatedConfig.code,
            object: updatedConfig,
            newData: updatedConfig
          },
          user
        );
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

  async configsManagePluginInstall(
    _root,
    args,
    { models, subdomain }: IContext
  ) {
    const prevAction = await models.InstallationLogs.findOne({
      message: { $ne: 'done' }
    });

    if (prevAction) {
      throw new Error('Installer is busy. Please wait ...');
    }

    await sendCommonMessage({
      subdomain,
      serviceName: '',
      action: 'managePluginInstall',
      data: {
        ...args,
        subdomain
      }
    });

    return { status: 'success' };
  }
};

checkPermission(configMutations, 'configsUpdate', 'manageGeneralSettings');
checkPermission(
  configMutations,
  'configsActivateInstallation',
  'manageGeneralSettings'
);
checkPermission(
  configMutations,
  'configsManagePluginInstall',
  'manageGeneralSettings'
);

export default configMutations;
