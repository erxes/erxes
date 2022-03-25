import { sendCoreMessage } from "../../messageBroker";

const cars = {
  async owner(car, {}, { coreModels }) {
    const user = await coreModels.Users.findOne({ _id: car.ownerId });

    return user;
  },

  async customer(car, {}, { models, subdomain }) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "car",
        mainTypeId: car._id.toString(),
        relTypes: ["customer"],
      },
      isRPC: true,
      defaultValue: [],
    });

    console.log(customerIds, "hehehhehehehehh");

    return models.Customers.find({ _id: { $in: customerIds || [] } });
  },

  category(car, {}, { models }) {
    return models.CarCategories.findOne({ _id: car.categoryId });
  },
};

export default cars;
