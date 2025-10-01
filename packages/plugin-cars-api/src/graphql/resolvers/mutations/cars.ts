import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
} from '@erxes/api-utils/src/logUtils';
import { ICar, ICarDocument } from '../../../models/definitions/cars';

const carMutations = {
  carsAdd: async (_root, doc, { user, docModifier, models, subdomain }) => {
    const car = await models.Cars.createCar(docModifier(doc), user);

    await putCreateLog(
      subdomain,
      {
        type: 'cars:car',
        newData: doc,
        object: car,
        description: `"${car.plateNumber}" has been created`,
      },
      user
    );

    return car;
  },

  carsEdit: async (_root, { _id, ...doc }, { models, user, subdomain }) => {
    const car = await models.Cars.getCar(_id);
    const updated = await models.Cars.updateCar(_id, doc);

    await putUpdateLog(
      subdomain,
      {
        type: 'cars:car',
        object: car,
        newData: { ...doc },
        updatedDocument: updated,
        description: `"${car.plateNumber}" has been updated`,
      },
      user
    );

    return updated;
  },

  carsRemove: async (
    _root,
    { carIds }: { carIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const cars = await models.Cars.find({ _id: { $in: carIds } }).lean();

    await models.Cars.removeCars(carIds);

    for (const car of cars) {
      await putDeleteLog(
        subdomain,
        {
          type: 'cars:car',
          object: car,
          description: `"${car.plateNumber}" has been deleted`,
        },
        user
      );
    }

    return carIds;
  },

  carsMerge: async (_root, { carIds, carFields }, { models, user }) => {
    return models.Cars.mergeCars(carIds, carFields);
  },

  carCategoriesAdd: async (
    _root,
    doc,
    { docModifier, models, subdomain, user }
  ) => {
    const carCategory = await models.CarCategories.createCarCategory(
      docModifier(doc)
    );

    await putCreateLog(
      subdomain,
      {
        type: 'cars:car-category',
        newData: { ...doc, order: carCategory.order },
        object: carCategory,
        description: `"${carCategory.name}" has been created`,
      },
      user
    );

    return carCategory;
  },

  carCategoriesEdit: async (
    _root,
    { _id, ...doc },
    { models, subdomain, user }
  ) => {
    const carCategory = await models.CarCategories.getCarCatogery({
      _id,
    });
    const updated = await models.CarCategories.updateCarCategory(_id, doc);

    await putUpdateLog(
      subdomain,
      {
        type: 'cars:car-category',
        object: carCategory,
        newData: doc,
        updatedDocument: updated,
        description: `"${carCategory.name}" has been updated`,
      },
      user
    );

    return updated;
  },

  carCategoriesRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) => {
    const carCategory = await models.CarCategories.getCarCatogery({
      _id,
    });
    const removed = await models.CarCategories.removeCarCategory(_id);

    await putDeleteLog(
      subdomain,
      {
        type: 'cars:car-category',
        object: carCategory,
        description: `"${carCategory.name}" has been deleted`,
      },
      user
    );

    return removed;
  },

  cpCarsAdd: async (_root, { customerId, companyId, ...doc }: ICar & { customerId: string, companyId: string }, { docModifier, models, subdomain, user }: IContext) => {
    let car: ICarDocument | null = await models.Cars.findOne({
      status: { $ne: 'Deleted' },
      $or: [
        { plateNumber: doc.plateNumber },
        { vinNumber: doc.vinNumber }
      ]
    }).lean();

    if (car) {
      car = await models.Cars.updateCar(car._id, doc);
      await putUpdateLog(
        subdomain,
        {
          type: 'cars:car',
          object: car,
          newData: { ...doc },
          updatedDocument: doc,
          description: `"${car.plateNumber}" has been updated at cp create`,
        },
        user
      );
    } else {
      car = await models.Cars.createCar(docModifier(doc));
      await putCreateLog(
        subdomain,
        {
          type: 'cars:car',
          newData: doc,
          object: car,
          description: `"${car.plateNumber}" has been created at cp`,
        },
        user
      );
    }

    if (customerId) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformities',
        data: {
          mainType: 'customer',
          mainTypeId: customerId,
          relType: 'car',
          relTypeId: car._id,
        },
      });
    }

    if (companyId) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformities',
        data: {
          mainType: 'company',
          mainTypeId: companyId,
          relType: 'car',
          relTypeId: car._id,
        },
      });
    }

    return car;
  },

  cpCarsEdit: async (_root, { _id, customerId, companyId, ...doc }: ICarDocument & { customerId: string, companyId: string }, { models, subdomain, user }: IContext) => {
    const car = await models.Cars.getCar(_id);

    const relTypeIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformies',
      data: {
        mainType: 'car',
        mainTypeId: car._id,
        relTypes: ['customer', 'company'],
      },
    });

    if (!relTypeIds.includes(customerId) && !relTypeIds.includes(companyId)) {
      throw new Error ('Cant edit this car, not a customer or company car')
    }

    const updated = await models.Cars.updateCar(_id, doc);
    await putUpdateLog(
      subdomain,
      {
        type: 'cars:car',
        object: car,
        newData: { ...doc },
        updatedDocument: updated,
        description: `"${car.plateNumber}" has been updated at cp`,
      },
      user
    );

    return updated;
  },

  cpCarsRemove: async (_root, { carIds, customerId, companyId }: { carIds: string[], customerId: string, companyId: string }, { models, subdomain, user }) => {
    if (customerId) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.deleteConformity',
        data: {
          mainType: 'customer',
          mainTypeId: customerId,
          relType: 'car',
          relTypeIds: carIds,
        },
      });
    }
    if (companyId) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.deleteConformity',
        data: {
          mainType: 'company',
          mainTypeId: companyId,
          relType: 'car',
          relTypeIds: carIds,
        },
      });
    }

    return carIds;
  },
};

requireLogin(carMutations, 'manageCars');

checkPermission(carMutations, 'carsAdd', 'manageCars');
checkPermission(carMutations, 'carsEdit', 'manageCars');
checkPermission(carMutations, 'carsRemove', 'manageCars');
checkPermission(carMutations, 'carsMerge', 'manageCars');
checkPermission(carMutations, 'carCategoriesAdd', 'manageCars');
checkPermission(carMutations, 'carCategoriesEdit', 'manageCars');
checkPermission(carMutations, 'carCategoriesRemove', 'manageCars');

export default carMutations;
