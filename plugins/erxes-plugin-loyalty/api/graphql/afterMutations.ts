const loyaltyAfterMutations = [
  /**
   * Cars list
   */
  {
    type: 'deal',
    action: 'update',
    handler: async (_root, params, { models, memoryStorage, user }) => {
      await models.Loyalties.dealChangeCheckLoyalty(models, memoryStorage, params.object, params.updatedDocument.stageId, user);
    }
  },
  {
    type: 'deal',
    action: 'remove',
    handler: async (_root, params, { models }) => {
      await models.Loyalties.deleteLoyaltyOfDeal(models, params.updatedDocument._id);
    }
  }
]

export default loyaltyAfterMutations;