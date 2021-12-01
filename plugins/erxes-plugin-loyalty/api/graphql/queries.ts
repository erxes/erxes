import { paginate } from 'erxes-api-utils'

const loyaltyQueries = [
  {
    name: 'loyaltyConfigs',
    handler: async(_root, _params, {models}) => {
      return models.LoyaltyConfigs.find({});
    }
  },
  /**
   * Loyalties list for customer
   */
  {
    name: 'customerLoyalties',
    handler: async (_root, params, { models, checkPermission, user }) => {
      await checkPermission('showLoyalties', user);
      return paginate(
        models.Loyalties.find({
          customerId: params.customerId
        }).sort({ modifiedAt: 1 }), {
          page: params.page,
          perPage: params.perPage
        }
      )
    }
  },

  /**
   * Loyalty value for customer
   */
  {
    name: 'customerLoyalty',
    handler: async (_root, params, { models, checkPermission, user }) => {
      await checkPermission('showLoyalties', user);

      return {
        customerId: params.customerId,
        loyalty: await models.Loyalties.getLoyaltyValue(models, params.customerId)
      };
    }
  }
]

export default loyaltyQueries;
