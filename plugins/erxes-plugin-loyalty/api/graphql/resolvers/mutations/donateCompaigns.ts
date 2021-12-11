export default [
  {
    name: 'donateCompaignsAdd',
    handler: async (_root, doc, { models }) => {
      return models.DonateCompaigns.createDonateCompaign(models, doc)
    }
  },
  {
    name: 'donateCompaignsEdit',
    handler: async (_root, doc, { models }) => {
      return models.DonateCompaigns.updateDonateCompaign(models, doc._id, doc)
    }
  },
  {
    name: 'donateCompaignsRemove',
    handler: async (_root, doc, { models, dataSources }) => {
      return models.DonateCompaigns.removeDonateCompaigns(models, doc._ids, dataSources)
    }
  },
]