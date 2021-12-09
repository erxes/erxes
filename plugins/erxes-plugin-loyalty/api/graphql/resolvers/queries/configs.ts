export default [
  {
    name: 'loyaltyConfigs',
    handler: async (_root, _params, { models }) => {
      return models.LoyaltyConfigs.find({});
    }
  }
]