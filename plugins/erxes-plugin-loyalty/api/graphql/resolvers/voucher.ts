export default [
  {
    type: 'Voucher',
    field: 'owner',
    handler: (voucher, { }, { models }) => {
      switch (voucher.ownerType) {
        case 'customer':
          return models.Customers.findOne({ _id: voucher.ownerId }).lean();
        case 'user':
          return models.Users.findOne({ _id: voucher.ownerId }).lean();
        case 'company':
          return models.Companies.findOne({ _id: voucher.ownerId }).lean();
        default:
          return {}
      }
    }
  },
]