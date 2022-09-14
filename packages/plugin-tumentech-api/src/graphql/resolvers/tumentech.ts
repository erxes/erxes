import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IParticipantDocument } from '../../models/definitions/participants';
import {
  ICarCategoryDocument,
  ICarDocument
} from '../../models/definitions/tumentech';

const Cars = {
  category(car, _args, { models }) {
    return (
      car.categoryId &&
      models.CarCategories.findOne({
        _id: car.categoryId
      })
    );
  },

  async customers(car: ICarDocument, {}, { subdomain }: IContext) {
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

    return (customerIds || []).map(_id => ({ __typename: 'Customer', _id }));
  },

  async companies(car: ICarDocument, {}, { subdomain }: IContext) {
    const companiIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'car',
        mainTypeId: car._id.toString(),
        relTypes: ['company']
      },
      isRPC: true,
      defaultValue: []
    });

    return (companiIds || []).map(_id => ({ __typename: 'Company', _id }));
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
  cars(participant: IParticipantDocument, {}, { models }: IContext) {
    return models.Cars.find({ _id: { $in: participant.carIds } }).lean();
  },

  route(participant: IParticipantDocument, {}, { models }: IContext) {
    return models.Routes.findOne({ _id: participant.routeId });
  },

  driver(participant: IParticipantDocument) {
    return (
      participant.driverId && {
        __typename: 'Customer',
        _id: participant.driverId
      }
    );
  },

  deal(participant: IParticipantDocument) {
    return (
      participant.dealId && { __typename: 'Deal', _id: participant.dealId }
    );
  }
};

export { Cars, CarCategory, Participant };
