import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const configMutations = {
  /**
   * Create or update config object
   */
  async accountingsConfigsUpdate(_root, { configsMap }, { models }: IContext) {
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];
      const doc = { code, value };

      await models.AccountingConfigs.createOrUpdateConfig(doc);
    }

    return ['success'];
  },
};

checkPermission(configMutations, 'accountingsConfigsUpdate', 'manageAccounts');

export default configMutations;
