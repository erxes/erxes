export default [
  {
    type: 'LotteryCompaign',
    field: 'lotteriesCount',
    handler: async (lotteryCompaign, { }, { models }) => {
      return models.Lotteries.find({ compaignId: lotteryCompaign._id }).countDocuments();
    }
  },
]