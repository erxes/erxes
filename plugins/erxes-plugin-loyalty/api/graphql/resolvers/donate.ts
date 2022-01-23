export default [
  {
    type: 'Donate',
    field: 'owner',
    handler: (donate, { }, { models }) => {
      switch (donate.ownerType) {
        case 'customer':
          return models.Customers.findOne({ _id: donate.ownerId }).lean();
        case 'user':
          return models.Users.findOne({ _id: donate.ownerId }).lean();
        case 'company':
          return models.Companies.findOne({ _id: donate.ownerId }).lean();
        default:
          return {}
      }
    }
  },
]