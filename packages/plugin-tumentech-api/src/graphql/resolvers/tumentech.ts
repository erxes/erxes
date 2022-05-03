import { sendCoreMessage } from '../../messageBroker';

const Cars = {
  category(car, _args, { models }) {
    return (
      car.categoryId &&
      models.CarCategories.findOne({
        _id: car.categoryId
      })
    );
  },

  customers(car) {
    async ({ models, subdomain }) => {
      const customerIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: 'car',
          mainTypeId: car._id.toString(),
          relTypes: ['customer']
        },
        isRPC: true,
        defaultValue: []
      });

      return models.Customers.find({ _id: { $in: customerIds || [] } });
    };
  }
};

const CarCategory = {
  // carCount(category) {
  //   async ({ models }) => {
  //   const categoryIds = await models.CarCategories.find(
  //     {
  //       $or: [
  //         { order: { $regex: new RegExp(`${category.order}/`) } },
  //         { order: category.order }
  //       ]
  //     },
  //     { _id: 1 }
  //   );

  //   return models.Cars.countDocuments({
  //     categoryId: category._id,
  //     status: { $ne: 'Deleted' }
  //   });
  // };
  // }
  carCount(category, {}, { models }) {
    return models.Cars.countDocuments({
      categoryId: category._id,
      status: { $ne: 'Deleted' }
    });
  }
};

export { Cars, CarCategory };
