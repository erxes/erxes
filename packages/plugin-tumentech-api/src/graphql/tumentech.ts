const Cars = {
  category(car) {
    return (
      car.categoryId && {
        _id: car.categoryId
      }
    );
  },

  customers(car) {
    async ({ models }) => {
      const customerIds = await models.Conformities.savedConformity({
        mainType: 'car',
        mainTypeId: car._id.toString(),
        relTypes: ['customer']
      });

      return models.Customers.find({ _id: { $in: customerIds || [] } });
    };
  }
};

const CarCategory = {
  carCount(category) {
    async ({ models }) => {
      const categoryIds = await models.CarCategories.find(
        {
          $or: [
            { order: { $regex: new RegExp(`${category.order}/`) } },
            { order: category.order }
          ]
        },
        { _id: 1 }
      );

      return models.Cars.countDocuments({
        categoryId: { $in: categoryIds },
        status: { $ne: 'Deleted' }
      });
    };
  }
};

export default { Cars, CarCategory };
