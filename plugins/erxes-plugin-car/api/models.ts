import { validSearchText } from 'erxes-api-utils'
import { carCategorySchema, carSchema } from './definitions';

class Car {
  /**
   * Checking if car has duplicated unique properties
   */
  public static async checkDuplication(
    models,
    carFields: {
      plateNumber?: string;
      vinNumber?: string;
    },
    idsToExclude?: string[] | string,
  ) {
    const query: { status: {};[key: string]: any } = { status: { $ne: 'Deleted' } };
    let previousEntry;

    // Adding exclude operator to the query
    if (idsToExclude) {
      query._id = { $nin: idsToExclude };
    }

    if (carFields.plateNumber) {
      // check duplication from primaryName
      previousEntry = await models.Cars.find({
        ...query,
        plateNumber: carFields.plateNumber,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated plate number');
      }
    }

    if (carFields.vinNumber) {
      // check duplication from code
      previousEntry = await models.Cars.find({
        ...query,
        vinNumber: carFields.vinNumber,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated VIN number');
      }
    }
  }

  public static fillSearchText(doc) {
    return validSearchText([
      doc.plateNumber || '',
      doc.vinNumber || '',
      doc.description || '',
      doc.categoryId || ''
    ]);
  }

  public static getCarName(car) {
    return car.plateNumber || car.vinNumber || 'Unknown';
  }

  /**
   * Retreives car
   */
  public static async getCar(models, _id: string) {
    const car = await models.Cars.findOne({ _id });

    if (!car) {
      throw new Error('Car not found');
    }

    return car;
  }

  /**
   * Create a car
   */
  public static async createCar(models, doc, user=undefined) {
    // Checking duplicated fields of car
    await models.Cars.checkDuplication(models, doc);

    if (!doc.ownerId && user) {
      doc.ownerId = user.name;
    }

    const car = await models.Cars.create({
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
      searchText: models.Cars.fillSearchText(doc),
    });

    return car;
  }

  /**
   * Update car
   */
  public static async updateCar(models, _id, doc) {
    // Checking duplicated fields of car
    await models.Cars.checkDuplication(models, doc, [_id]);

    const searchText = models.Cars.fillSearchText(Object.assign(await models.Cars.getCar(models, _id), doc));
    await models.Cars.updateOne({ _id }, { $set: { ...doc, searchText, modifiedAt: new Date() } });

    return models.Cars.findOne({ _id });
  }

  /**
   * Remove car
   */
  public static async removeCars(models, carIds) {
    for (const carId of carIds) {
      await models.ActivityLogs.removeActivityLog(carId)
      await models.InternalNotes.remove({ contentType: 'car', contentTypeId: carId });
      await models.Conformities.removeConformity({ mainType: 'car', mainTypeId: carId });
    }

    return models.Cars.deleteMany({ _id: { $in: carIds } });
  }

  /**
   * Merge cars
   */
  public static async mergeCars(models, carIds, carFields) {
    // Checking duplicated fields of car
    await this.checkDuplication(models, carFields, carIds);

    // Merging car tags
    for (const carId of carIds) {
      models.Cars.getCar(models, carId);
      await models.Cars.findByIdAndUpdate(carId, { $set: { status: 'Deleted' } });
    }

    // Creating car with properties
    const car = await models.Cars.createCar(models, {
      ...carFields,
      mergedIds: carIds,
    });

    // Updating customer cars, deals, tasks, tickets
    await models.Conformities.changeConformity({ type: 'car', newTypeId: car._id, oldTypeIds: carIds });

    // Removing modules associated with current cars
    // await models.InternalNotes.changeCar(car._id, carIds);

    return car;
  }
}

class CarCategory {
  /**
   *
   * Get Car Cagegory
   */

  public static async getCarCatogery(models, selector: any) {
    const carCategory = await models.CarCategories.findOne(selector);

    if (!carCategory) {
      throw new Error('Car & service category not found');
    }

    return carCategory;
  }

  /**
   * Create a car categorys
   */
  public static async createCarCategory(models, doc) {
    const parentCategory = doc.parentId ? await models.CarCategories.findOne({ _id: doc.parentId }).lean() : undefined;

    // Generatingg order
    doc.order = await this.generateOrder(parentCategory, doc);

    return models.CarCategories.create(doc);
  }

  /**
   * Update Car category
   */
  public static async updateCarCategory(models, _id, doc) {
    const parentCategory = doc.parentId ? await models.CarCategories.findOne({ _id: doc.parentId }).lean() : undefined;

    if (parentCategory && parentCategory.parentId === _id) {
      throw new Error('Cannot change category');
    }

    // Generatingg  order
    doc.order = await this.generateOrder(parentCategory, doc);

    const carCategory = await models.CarCategories.getCarCatogery(models, { _id });

    const childCategories = await models.CarCategories.find({
      $and: [{ order: { $regex: new RegExp(carCategory.order, 'i') } }, { _id: { $ne: _id } }],
    });

    await models.CarCategories.updateOne({ _id }, { $set: doc });

    // updating child categories order
    childCategories.forEach(async category => {
      let order = category.order;

      order = order.replace(carCategory.order, doc.order);

      await models.CarCategories.updateOne({ _id: category._id }, { $set: { order } });
    });

    return models.CarCategories.findOne({ _id });
  }

  /**
   * Remove Car category
   */
  public static async removeCarCategory(models, _id) {
    await models.CarCategories.getCarCatogery(models, { _id });

    let count = await models.Cars.countDocuments({ categoryId: _id });
    count += await models.CarCategories.countDocuments({ parentId: _id });

    if (count > 0) {
      throw new Error("Can't remove a car category");
    }

    return models.CarCategories.deleteOne({ _id });
  }

  /**
   * Generating order
   */
  public static async generateOrder(parentCategory, doc) {
    const order = parentCategory ? `${parentCategory.order}/${doc.code}` : `${doc.code}`;

    return order;
  }
}

export default [
  {
    name: 'CarCategories',
    schema: carCategorySchema,
    klass: CarCategory
  },
  {
    name: 'Cars',
    schema: carSchema,
    klass: Car
  },
];
