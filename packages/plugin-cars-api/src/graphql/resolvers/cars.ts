const cars = {
  async owner(car, {}, { coreModels }) {
    const user = await coreModels.Users.findOne({ _id: car.ownerId });

    return user;
  },

  async customer(car, {}, { models }) {
    const customerIds = await models.Conformities.savedConformity({
      mainType: "car",
      mainTypeId: car._id.toString(),
      relTypes: ["customer"],
    });

    return models.Customers.find({ _id: { $in: customerIds || [] } });
  },

  category(car, {}, { models }) {
    return models.CarCategories.findOne({ _id: car.categoryId });
  },
};

export default cars;
