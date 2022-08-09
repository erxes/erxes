import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IParticipantDocument } from '../../models/definitions/participants';
import { ICarCategoryDocument } from '../../models/definitions/tumentech';

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
  __resolveReference({ _id }, { models }: IContext) {
    return models.CarCategories.findOne({ _id });
  },

  isRoot(category: ICarCategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async carCount(category: ICarCategoryDocument, {}, { models }: IContext) {
    const product_category_ids = await models.CarCategories.find(
      { order: { $regex: new RegExp(category.order) } },
      { _id: 1 }
    );

    return models.Cars.countDocuments({
      categoryId: { $in: product_category_ids },
      status: { $ne: 'Deleted' }
    });
  }
};

const Participant = {
  trip(participant: IParticipantDocument, {}, { models }: IContext) {
    return models.Trips.findOne({ _id: participant.tripId });
  },

  deal(participant: IParticipantDocument) {
    return (
      participant.dealId && { __typename: 'Deal', _id: participant.dealId }
    );
  }
};

export { Cars, CarCategory, Participant };
