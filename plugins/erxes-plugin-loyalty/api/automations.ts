export default [
  {
    action: 'erxes-plugin-add-voucher',
    handler: async (_action, doc, { models }) => {
      const { compaignId, ownerType, ownerId } = doc;
      return models.Vouchers.createVoucher(models, { compaignId, ownerType, ownerId })
    }
  }
]
