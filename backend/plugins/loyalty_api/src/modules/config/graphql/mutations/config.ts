import { IContext } from '~/connectionResolvers';

export const loyaltyConfigMutations = {
  async loyaltyConfigsUpdate(
    _root: undefined,
    param: { configsMap: Record<string, string> },
    { models }: IContext,
  ) {
    const { configsMap } = param;

    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];

      const doc = { code, value };

      models.LoyaltyConfigs.createOrUpdateConfig(doc);
    }
  },
};
