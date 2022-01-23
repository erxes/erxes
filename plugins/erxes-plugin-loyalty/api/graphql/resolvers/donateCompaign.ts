export default [
  {
    type: 'DonateCompaign',
    field: 'donatesCount',
    handler: async (donateCompaign, { }, { models }) => {
      return models.Donates.find({ compaignId: donateCompaign._id }).countDocuments();
    }
  },
]