import { IContext } from '~/connectionResolvers';
import { ILoyaltyConfigDocument } from '~/modules/config/@types/config';

export const loyaltyConfigMutations = {
  updateLoyaltyConfigs: async (
    _parent: undefined,
    { configsMap }: { configsMap: Record<string, any> },
    { models }: IContext,
  ) => {
    const results: ILoyaltyConfigDocument[] = [];

    for (const [code, value] of Object.entries(configsMap || {})) {
      if (!code) {
        continue;
      }

      const config = await models.LoyaltyConfig.createOrUpdateConfig({
        code,
        value,
      });

      results.push(config);
    }

    return results;
  },
};
