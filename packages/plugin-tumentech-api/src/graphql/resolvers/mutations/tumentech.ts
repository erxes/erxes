import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import { gatherDescriptions } from '../../../utils';
import { checkPermission } from '@erxes/api-utils/src';
import messageBroker, { sendCoreMessage } from '../../../messageBroker';

const carMutations = {
  carsAdd: async (_root, doc, { user, docModifier, models }) => {
    const car = await models.Cars.createCar(docModifier(doc), user);

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
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

  carsEdit: async (_root, { _id, ...doc }, { models, user, messageBroker }) => {
    const car = await models.Cars.getCar(_id);
    const updated = await models.Cars.updateCar(_id, doc);

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
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
    { models, user, messageBroker }
  ) => {
    const cars = await models.Cars.find({ _id: { $in: carIds } }).lean();

    await models.Cars.removeCars(carIds);

    for (const car of cars) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'car', object: car, extraParams: { models } },
        user
      );
    }

    return carIds;
  },

  /**
   * Merge cars
   */
  carsMerge: async (_root, { carIds, carFields }, { models }) => {
    return models.Cars.mergeCars(carIds, carFields);
  },

  /**
   * Creates a new car category
   * @param {Object} doc Car category document
   */
  carCategoriesAdd: async (
    _root,
    doc,
    { docModifier, models, user, messageBroker }
  ) => {
    const carCategory = await models.CarCategories.createCarCategory(
      docModifier(doc)
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
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
    { _id, ...doc },
    { models, user, messageBroker }
  ) => {
    const carCategory = await models.CarCategories.getCarCatogery({
      _id
    });
    const updated = await models.CarCategories.updateCarCategory(_id, doc);

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
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
    { models, user, messageBroker }
  ) => {
    const carCategory = await models.CarCategories.getCarCatogery({
      _id
    });
    const removed = await models.CarCategories.removeCarCategory(_id);

    await putDeleteLog(
      messageBroker,
      gatherDescriptions,
      { type: 'car-category', object: carCategory, extraParams: { models } },
      user
    );

    return removed;
  },

  // ClientPortal ===========
  cpCarsAdd: async (_root, doc, { docModifier, models }) => {
    const car = await models.Cars.createCar(docModifier(doc));

    if (doc.customerId) {
      await sendCoreMessage({
        subdomain: models.subdomain,
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
        subdomain: models.subdomain,
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
  cpCarsEdit: async (_root, { _id, ...doc }, { models }) => {
    await models.Cars.getCar(models, _id);
    const updated = await models.Cars.updateCar(_id, doc);

    return updated;
  },

  /**
   * Removes cars
   */
  cpCarsRemove: async (_root, { carIds }: { carIds: string[] }, { models }) => {
    await models.Cars.removeCars(carIds);
    return carIds;
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
