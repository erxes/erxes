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
import { generateRandomString } from '../../../utils';
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
        subdomain,
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
        subdomain,
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

  generateRandomName: async (
    _root,
    { modelName, prefix, numberOfDigits },
    { subdomain }
  ) => {
    return generateRandomString(subdomain, modelName, prefix, numberOfDigits);
  },

  tumentechInvite: async (
    _root,
    { phone }: { phone: string },
    { subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('Login required');
    }

    const clientPortalId = process.env.MOBILE_CP_ID;

    if (!clientPortalId) {
      throw new Error('Client portal id is not set');
    }

    console.log('clientPortalId', clientPortalId);

    const foundUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        phone,
        clientPortalId
      },
      isRPC: true,
      defaultValue: null
    });

    console.log('foundUser', foundUser);

    if (foundUser) {
      throw new Error('User already exists');
    }

    let foundCustomer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        customerPrimaryPhone: phone
      },
      isRPC: true,
      defaultValue: null
    });

    if (!foundCustomer) {
      foundCustomer = await sendContactsMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: {
          primaryPhone: phone
        },
        isRPC: true
      });
    }

    const MAIN_API_DOMAIN = process.env.DOMAIN
      ? `${process.env.DOMAIN}/gateway`
      : 'http://localhost:4000';

    const url = `${MAIN_API_DOMAIN}/pl:tumentech/download`;

    sendClientPortalMessage({
      subdomain,
      action: 'sendSMS',
      data: {
        to: phone,
        content: `Та Түмэн Тээх платформд уригдлаа,татах линк ${url}`
      }
    });

    return foundCustomer._id;
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
