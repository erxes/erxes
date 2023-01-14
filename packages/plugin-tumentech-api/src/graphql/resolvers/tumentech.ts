import { IContext } from '../../connectionResolver';
import { sendContactsMessage, sendCoreMessage } from '../../messageBroker';
import { IParticipantDocument } from '../../models/definitions/participants';
import {
  ICarCategoryDocument,
  ICarDocument
} from '../../models/definitions/tumentech';

const Cars = {
  category(car, _args, { models }) {
    return (
      car.carCategoryId &&
      models.CarCategories.findOne({
        _id: car.carCategoryId
      })
    );
  },

  parentCategory(car: ICarDocument, _args, { models }: IContext) {
    return (
      car.parentCarCategoryId &&
      models.CarCategories.findOne({ _id: car.parentCarCategoryId })
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

    const customers = await sendContactsMessage({
      subdomain,
      action: 'customers.find',
      data: { _id: { $in: customerIds } },
      isRPC: true,
      defaultValue: []
    });

    return customers;
  },

  async companies(car: ICarDocument, {}, { subdomain }: IContext) {
    const companyIds = await sendCoreMessage({
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

    const companies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: { selector: { _id: { $in: companyIds } } },
      isRPC: true,
      defaultValue: []
    });

    return companies;
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
      carCategoryId: { $in: product_category_ids },
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
  },

  phone: async (
    participant: IParticipantDocument,
    {},
    { models, cpUser }: IContext
  ) => {
    const history = await models.PurchaseHistories.findOne({
      driverId: participant.driverId,
      dealId: participant.dealId,
      cpUserId: cpUser.userId
    }).lean();

    if (!history) {
      return 'hidden';
    }

    return history.phone;
  }
};

export { Cars, CarCategory, Participant };
