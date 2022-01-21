export default [
  /**
   * Loyalty value for customer
   */
  {
    name: 'customerLoyalty',
    handler: async (_root, params, { models, checkPermission, user }) => {
      return {
        customerId: params.customerId,
        loyalty: await models.Loyalties.getLoyaltyValue(models, params.customerId)
      };
    }
  }
]