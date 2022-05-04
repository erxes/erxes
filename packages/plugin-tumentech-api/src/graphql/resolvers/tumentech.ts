import { sendCoreMessage, sendContactsMessage, sendCardsMessage } from "../../messageBroker";

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
        action: "conformities.savedConformity",
        data: {
          mainType: "car",
          mainTypeId: car._id.toString(),
          relTypes: ["customer"]
        },
        isRPC: true,
        defaultValue: []
      });

      return models.Customers.find({ _id: { $in: customerIds || [] } });
    };
  }
};

const CarCategory = {
  carCount(category, {}, { models }) {
    return models.Cars.countDocuments({
      categoryId: category._id,
      status: { $ne: "Deleted" }
    });
  }
};

const Participant = {
  async customer(participant, _args, { subdomain }) {
    return sendContactsMessage({
      subdomain,
      action: "customers.findOne",
      data: {
        _id:participant.customerId
      },
      isRPC: true,
      defaultValue: []
    });
  },

  async deal(participant, _args, { subdomain }) {
    return sendCardsMessage({
      subdomain,
      action: "deals.findOne",
      data: {
        _id:participant.dealId
      },
      isRPC: true,
      defaultValue: []
    });
  }

 
};

export { Cars, CarCategory, Participant };
