import { checkPermission } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../../logUtils';
import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendCommonMessage,
  sendContactsMessage,
  sendCoreMessage
} from '../../../messageBroker';
import { ICarDocument } from '../../../models/definitions/tumentech';
import { ICarCategoryDocument } from './../../../models/definitions/tumentech';

const carMutations = {
  carsAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const car = await models.Cars.createCar(docModifier(doc), user);

    await putCreateLog(
      models,
      subdomain,
      {
        type: 'car',
        newData: doc,
        object: car,
        extraParams: { models }
      },
      user
    );

    return car;
  },
  /**
   * Updates a car
   */

  carsEdit: async (
    _root,
    doc: ICarDocument,
    { models, user, subdomain }: IContext
  ) => {
    const car = await models.Cars.getCar(doc._id);
    const updated = await models.Cars.updateCar(doc._id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'car',
        object: car,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
      },
      user
    );

    return updated;
  },

  /**
   * Removes cars
   */
  carsRemove: async (
    _root,
    { carIds }: { carIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const cars = await models.Cars.find({ _id: { $in: carIds } }).lean();

    await models.Cars.removeCars(subdomain, carIds);

    for (const car of cars) {
      await putDeleteLog(
        models,
        subdomain,

        { type: 'car', object: car, extraParams: { models } },
        user
      );
    }

    return carIds;
  },

  /**
   * Merge cars
   */
  carsMerge: async (
    _root,
    { carIds, carFields },
    { user, models, subdomain }: IContext
  ) => {
    return models.Cars.mergeCars(subdomain, carIds, carFields, user);
  },

  /**
   * Creates a new car category
   * @param {Object} doc Car category document
   */
  carCategoriesAdd: async (
    _root,
    doc,
    { docModifier, models, user, subdomain }: IContext
  ) => {
    const carCategory = await models.CarCategories.createCarCategory(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: 'car-category',
        newData: { ...doc, order: carCategory.order },
        object: carCategory,
        extraParams: { models }
      },
      user
    );

    return carCategory;
  },

  /**
   * Edits a car category
   * @param {string} param2._id CarCategory id
   * @param {Object} param2.doc CarCategory info
   */
  carCategoriesEdit: async (
    _root,
    doc: ICarCategoryDocument,
    { models, user, subdomain }: IContext
  ) => {
    const carCategory = await models.CarCategories.getCarCatogery({
      _id: doc._id
    });
    const updated = await models.CarCategories.updateCarCategory(doc._id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'car-category',
        object: carCategory,
        newData: doc,
        updatedDocument: updated,
        extraParams: { models }
      },
      user
    );

    return updated;
  },

  /**
   * Removes a car category
   * @param {string} param1._id CarCategory id
   */
  carCategoriesRemove: async (
    _root,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext
  ) => {
    const carCategory = await models.CarCategories.getCarCatogery({
      _id
    });
    const removed = await models.CarCategories.removeCarCategory(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: 'car-category', object: carCategory, extraParams: { models } },
      user
    );

    return removed;
  },

  // ClientPortal ===========
  cpCarsAdd: async (
    _root,
    doc,
    { docModifier, models, subdomain, user }: IContext
  ) => {
    const car = await models.Cars.createCar(docModifier(doc), user);

    if (doc.customerId) {
      await sendCoreMessage({
        subdomain: subdomain,
        action: 'conformities.addConformities',
        data: {
          mainType: 'customer',
          mainTypeId: doc.customerId,
          relType: 'car',
          relTypeId: car._id
        }
      });
    }

    if (doc.companyId) {
      await sendCoreMessage({
        subdomain: subdomain,
        action: 'conformities.addConformities',
        data: {
          mainType: 'company',
          mainTypeId: doc.companyId,
          relType: 'car',
          relTypeId: car._id
        }
      });
    }

    return car;
  },
  /**
   * Updates a car
   */
  cpCarsEdit: async (_root, doc: ICarDocument, { models }: IContext) => {
    await models.Cars.getCar(doc._id);
    const updated = await models.Cars.updateCar(doc._id, doc);

    return updated;
  },

  /**
   * Removes cars
   */
  cpCarsRemove: async (
    _root,
    { carIds }: { carIds: string[] },
    { models, subdomain }: IContext
  ) => {
    await models.Cars.removeCars(subdomain, carIds);
    return carIds;
  },

  topupAccount: async (
    _root,
    { invoiceId }: { invoiceId: string },
    { models, cpUser, subdomain }: IContext
  ) => {
    const invoice = await sendCommonMessage({
      subdomain: subdomain,
      serviceName: 'payment',
      action: 'invoices.findOne',
      data: {
        _id: invoiceId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const user = await sendClientPortalMessage({
      subdomain: subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.erxesCustomerId !== invoice.customerId) {
      throw new Error('User data mismatch');
    }

    await models.Topups.createTopup({
      invoiceId,
      customerId: invoice.customerId,
      amount: invoice.amount
    });

    return models.CustomerAccounts.addTopupAmount({
      customerId: invoice.customerId,
      amount: invoice.amount
    });
  },

  revealPhone: async (
    _root,
    {
      driverId,
      carId,
      dealId
    }: { driverId: string; carId: string; dealId: string },
    { models, cpUser, subdomain }: IContext
  ) => {
    const user = await sendClientPortalMessage({
      subdomain: subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!user) {
      throw new Error('login required');
    }

    const account = await models.CustomerAccounts.findOne({
      customerId: user.erxesCustomerId
    });

    if (!account) {
      throw new Error('Данс олдсонгүй, данс үүсгэнэ үү');
    }

    const car = await models.Cars.getCar(carId);

    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.getConformities',
      data: {
        mainType: 'customer',
        mainTypeIds: [driverId],
        relTypes: ['car']
      },
      isRPC: true,
      defaultValue: []
    });

    const conformity = conformities.find(c => c.relTypeId === carId);

    if (!conformity) {
      throw new Error('Driver and car are not related');
    }

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: driverId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!customer || !customer.primaryPhone) {
      throw new Error('Customer not found');
    }

    const history = await models.PurchaseHistories.findOne({
      cpUserId: user._id,
      driverId,
      carId: car._id,
      dealId
    });

    if (history) {
      return customer.primaryPhone;
    }

    const carCategory = await models.CarCategories.getCarCatogery({
      _id: car.carCategoryId
    });

    const parenctCarCategory = await models.CarCategories.getCarCatogery({
      _id: carCategory.parentId
    });

    if (!carCategory.description && !parenctCarCategory.description) {
      throw new Error('Car category price is not set');
    }

    const amount = Number(
      carCategory.description || parenctCarCategory.description || 0
    );

    if (amount === 0) {
      throw new Error('Car category price is not set');
    }

    if (account.balance < amount) {
      throw new Error('Дансны үлдэгдэл хүрэлцэхгүй байна');
    }

    account.balance -= amount;

    await models.CustomerAccounts.updateOne(
      { _id: account._id },
      { $set: { balance: account.balance } }
    );

    await models.PurchaseHistories.createHistory({
      carId: car._id,
      driverId,
      dealId,
      amount,
      cpUserId: user._id,
      phone: customer.primaryPhone
    });

    const receiver = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        erxesCustomerId: driverId,
        clientPortalId: process.env.MOBILE_CP_ID || ''
      },
      isRPC: true,
      defaultValue: []
    });

    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: {
        _id: dealId
      },
      isRPC: true,
      defaultValue: null
    });

    if (deal && receiver) {
      sendClientPortalMessage({
        subdomain,
        action: 'sendNotification',
        data: {
          title: 'Мэдэгдэл',
          content: `Таны ${deal.name} дугаартай ажилд илгээсэн үнийн саналыг хүлээн авч таны мэдээллийг хүлээн авлаа.`,
          receivers: [cpUser._id],
          notifType: 'system',
          link: '',
          isMobile: true
        }
      });
    }

    return customer.primaryPhone;
  }
};

checkPermission(carMutations, 'carsAdd', 'manageCars');
checkPermission(carMutations, 'carsEdit', 'manageCars');
checkPermission(carMutations, 'carsRemove', 'manageCars');
checkPermission(carMutations, 'carsMerge', 'manageCars');
checkPermission(carMutations, 'carCategoriesAdd', 'manageCars');
checkPermission(carMutations, 'carCategoriesEdit', 'manageCars');
checkPermission(carMutations, 'carCategoriesRemove', 'manageCars');

export default carMutations;
