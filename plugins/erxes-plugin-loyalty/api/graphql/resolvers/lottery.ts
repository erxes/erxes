export default [
  {
    type: 'Lottery',
    field: 'owner',
    handler: (lottery, { }, { models }) => {
      switch (lottery.ownerType) {
        case 'customer':
          return models.Customers.findOne({ _id: lottery.ownerId }).lean();
        case 'user':
          return models.Users.findOne({ _id: lottery.ownerId }).lean();
        case 'company':
          return models.Companies.findOne({ _id: lottery.ownerId }).lean();
        default:
          return {}
      }
    }
  },
]