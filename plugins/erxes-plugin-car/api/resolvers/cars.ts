
const carResolvers = [
  {
    type: 'Car',
    field: 'category',
    handler: (car, { }, { models }) => {
      return models.CarCategories.findOne({ _id: car.categoryId });
    }
  },
  {
    type: 'Car',
    field: 'customers',
    handler: async (car, { }, { models }) => {
      const customerIds = await models.Conformities.savedConformity({
        mainType: 'car',
        mainTypeId: car._id.toString(),
        relTypes: ['customer'],
      });

      return models.Customers.find({ _id: { $in: customerIds || [] } });
    }
  },
  {
    type: 'Car',
    field: 'owner',
    handler: (car, { }, { models }) => {
      return models.Users.findOne({ _id: car.ownerId });
    }
  },
  {
    type: 'CarCategory',
    field: 'carCount',
    handler: async (category, { }, { models }) => {
      return models.Cars.countDocuments({ categoryId: category._id, status: { $ne: 'Deleted' } });
    },
  }

]

export default carResolvers
