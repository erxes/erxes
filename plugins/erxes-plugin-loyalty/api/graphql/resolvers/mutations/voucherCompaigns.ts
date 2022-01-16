export default [
  {
    name: 'voucherCompaignsAdd',
    handler: async (_root, doc, { models }) => {
      return models.VoucherCompaigns.createVoucherCompaign(models, doc)
    }
  },
  {
    name: 'voucherCompaignsEdit',
    handler: async (_root, doc, { models }) => {
      return models.VoucherCompaigns.updateVoucherCompaign(models, doc._id, doc)
    }
  },
  {
    name: 'voucherCompaignsRemove',
    handler: async (_root, doc, { models }) => {
      return models.VoucherCompaigns.removeVoucherCompaigns(models, doc._ids)
    }
  },
]