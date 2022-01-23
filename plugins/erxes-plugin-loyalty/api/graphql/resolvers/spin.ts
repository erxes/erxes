export default [
  {
    type: 'Spin',
    field: 'owner',
    handler: (spin, { }, { models }) => {
      switch (spin.ownerType) {
        case 'customer':
          return models.Customers.findOne({ _id: spin.ownerId }).lean();
        case 'user':
          return models.Users.findOne({ _id: spin.ownerId }).lean();
        case 'company':
          return models.Companies.findOne({ _id: spin.ownerId }).lean();
        default:
          return {}
      }
    }
  },
]