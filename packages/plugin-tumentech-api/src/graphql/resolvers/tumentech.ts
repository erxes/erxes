import {
  sendCoreMessage,
  sendContactsMessage,
  sendCardsMessage,
} from '../../messageBroker';
import { IParticipantDocument } from '../../models/definitions/participants';

const Cars = {
  category(car, _args, { models }) {
    return (
      car.categoryId &&
      models.CarCategories.findOne({
        _id: car.categoryId,
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
          relTypes: ['customer'],
        },
        isRPC: true,
        defaultValue: [],
      });

      return models.Customers.find({ _id: { $in: customerIds || [] } });
    };
  },
};

const CarCategory = {
  carCount(category, {}, { models }) {
    return models.Cars.countDocuments({
      categoryId: category._id,
      status: { $ne: 'Deleted' },
    });
  },
};

const Participant = {
  customer(participant: IParticipantDocument) {
    return (
      participant.customerId && {
        __typename: 'Customer',
        _id: participant.customerId,
      }
    );
  },

  deal(participant: IParticipantDocument) {
    return (
      participant.dealId && { __typename: 'Deal', _id: participant.dealId }
    );
  },
};

export { Cars, CarCategory, Participant };
