import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { putCreateLog, putUpdateLog } from '../../../logUtils';

const configMutations = {
  /**
   * Create or update config object
   */

  async syncerkhetConfigsUpdate(
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

      const updatedConfig = await models.Configs.getConfig(code);

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
  }
};

checkPermission(
  configMutations,
  'syncerkhetConfigsUpdate',
  'manageGeneralSettings'
);

export default configMutations;
