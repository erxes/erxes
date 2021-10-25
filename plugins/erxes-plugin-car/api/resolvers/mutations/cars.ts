import { putCreateLog, putDeleteLog, putUpdateLog, sendToWebhook } from "erxes-api-utils";
import { gatherDescriptions } from "../../utils";

const carMutations = [
  {
    name: 'carsAdd',
    handler: async (_root, doc, { user, docModifier, models, checkPermission, messageBroker }) => {
      await checkPermission('manageCars', user);
      const car = await models.Cars.createCar(models, docModifier(doc), user)

      await putCreateLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'car',
          newData: doc,
          object: car,
          extraParams: { models }
        },
        user,
      );

      await sendToWebhook(models, { type: 'car', action: 'create', params: car });

      return car;
    }
  },
  /**
   * Updates a car
   */
  {
    name: 'carsEdit',
    handler: async (_root, { _id, ...doc }, { models, checkPermission, user, messageBroker }) => {
      await checkPermission('manageCars', user);
      const car = await models.Cars.getCar(models, _id);
      const updated = await models.Cars.updateCar(models, _id, doc);

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
        user,
      );

      return updated;
    }
  },

  /**
   * Removes cars
   */
  {
    name: 'carsRemove',
    handler: async (_root, { carIds }: { carIds: string[] }, { models, checkPermission, user, messageBroker }) => {
      await checkPermission('manageCars', user);
      const cars = await models.Cars.find({ _id: { $in: carIds } }).lean();

      await models.Cars.removeCars(models, carIds);

      for (const car of cars) {
        await putDeleteLog(
          messageBroker,
          gatherDescriptions,
          { type: 'car', object: car, extraParams: { models } },
          user
        );
      }

      return carIds;
    }
  },

  /**
   * Merge cars
   */
  {
    name: 'carsMerge',
    handler: async (_root, { carIds, carFields }, { models, checkPermission, user }) => {
      await checkPermission('manageCars', user);
      return models.Cars.mergeCars(models, carIds, carFields);
    }
  },

  /**
   * Creates a new car category
   * @param {Object} doc Car category document
   */
  {
    name: 'carCategoriesAdd',
    handler: async (_root, doc, { docModifier, models, checkPermission, user, messageBroker }) => {
      await checkPermission('manageCars', user);
      const carCategory = await models.CarCategories.createCarCategory(models, docModifier(doc));

      await putCreateLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'car-category',
          newData: { ...doc, order: carCategory.order },
          object: carCategory,
          extraParams: { models }
        },
        user,
      );

      return carCategory;
    }
  },

  /**
   * Edits a car category
   * @param {string} param2._id CarCategory id
   * @param {Object} param2.doc CarCategory info
   */
  {
    name: 'carCategoriesEdit',
    handler: async (_root, { _id, ...doc }, { models, checkPermission, user, messageBroker }) => {
      await checkPermission('manageCars', user);
      const carCategory = await models.CarCategories.getCarCatogery(models, { _id });
      const updated = await models.CarCategories.updateCarCategory(models, _id, doc);

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
        user,
      );

      return updated;
    }
  },

  /**
   * Removes a car category
   * @param {string} param1._id CarCategory id
   */
  {
    name: 'carCategoriesRemove',
    handler: async (_root, { _id }: { _id: string }, { models, checkPermission, user, messageBroker }) => {
      await checkPermission('manageCars', user);
      const carCategory = await models.CarCategories.getCarCatogery(models, { _id });
      const removed = await models.CarCategories.removeCarCategory(models, _id);

      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'car-category', object: carCategory, extraParams: { models } },
        user
      );

      return removed;
    }
  }

]

export default carMutations;
