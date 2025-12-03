import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

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
  },
};

checkPermission(configsMutations, 'loyaltyConfigsUpdate', 'manageLoyalties');

export default configsMutations;
