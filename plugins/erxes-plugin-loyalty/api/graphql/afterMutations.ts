const loyaltyAfterMutations = [
  /**
   * Cars list
   */
  {
    type: 'deal',
    action: 'update',
    handler: async (_root, params, { models, memoryStorage, user }) => {
    }
  },
  {
    type: 'deal',
    action: 'remove',
    handler: async (_root, params, { models }) => {
    }
  }
]

export default loyaltyAfterMutations;