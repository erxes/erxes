import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const configsMutations = {
  async loyaltyConfigsUpdate(_root, param, { models }: IContext) {
    const { configsMap } = param;

    const codes = Object.keys(configsMap);
    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];
      const doc = { code, value };

      await models.LoyaltyConfigs.createOrUpdateConfig(doc);
    }
  }
};

checkPermission(configsMutations, 'loyaltyConfigsUpdate', 'manageLoyalties');

export default configsMutations;
