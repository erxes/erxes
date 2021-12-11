export default [
  {
    name: 'lotteryCompaignsAdd',
    handler: async (_root, doc, { models }) => {
      return models.LotteryCompaigns.createLotteryCompaign(models, doc)
    }
  },
  {
    name: 'lotteryCompaignsEdit',
    handler: async (_root, doc, { models }) => {
      return models.LotteryCompaigns.updateLotteryCompaign(models, doc._id, doc)
    }
  },
  {
    name: 'lotteryCompaignsRemove',
    handler: async (_root, doc, { models }) => {
      return models.LotteryCompaigns.removeLotteryCompaigns(models, doc._ids)
    }
  },
]