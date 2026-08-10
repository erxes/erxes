import { IContext } from '~/connectionResolvers';

export const loyaltyConfigMutations = {
  async loyaltyConfigsUpdate(
    _root: undefined,
    param: { configsMap: Record<string, string> },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyConfigUpdate');
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