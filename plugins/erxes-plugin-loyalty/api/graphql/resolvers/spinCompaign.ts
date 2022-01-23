export default [
  {
    type: 'SpinCompaign',
    field: 'spinsCount',
    handler: async (spinCompaign, { }, { models }) => {
      return models.Spins.find({ compaignId: spinCompaign._id }).countDocuments();
    }
  },
]