export default [
  {
    name: 'spinCompaignsAdd',
    handler: async (_root, doc, { models }) => {
      return models.SpinCompaigns.createSpinCompaign(models, doc)
    }
  },
  {
    name: 'spinCompaignsEdit',
    handler: async (_root, doc, { models }) => {
      return models.SpinCompaigns.updateSpinCompaign(models, doc._id, doc)
    }
  },
  {
    name: 'spinCompaignsRemove',
    handler: async (_root, doc, { models }) => {
      return models.SpinCompaigns.removeSpinCompaigns(models, doc._ids)
    }
  },
]