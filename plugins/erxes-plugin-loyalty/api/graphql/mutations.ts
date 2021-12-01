
const loyaltyMutations = [
  {
    name: 'loyaltyConfigsUpdate',
    handler: async (_root, param, { models }) => {
      const { configsMap } = param;

      const codes = Object.keys(configsMap);
      for (const code of codes) {
        if (!code) {
          continue;
        }

        const value = configsMap[code];
        const doc = { code, value };

        await models.LoyaltyConfigs.createOrUpdateLoyaltyConfig(models, doc);

      }
    }
  }
];

export default loyaltyMutations;