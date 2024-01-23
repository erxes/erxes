import { IUser } from '@erxes/api-utils/src/types';
import { validSearchText } from '@erxes/api-utils/src/core';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { sendCoreMessage, sendInternalNotesMessage } from '../messageBroker';
import {
  carCategorySchema,
  carSchema,
  ICar,
  ICarCategory,
  ICarCategoryDocument,
  ICarDocument,
  IProductCarCategoryDocument
} from './definitions/tumentech';

export interface ICarModel extends Model<ICarDocument> {
  createCar(doc: ICar, user: IUser): Promise<ICarDocument>;
  getCar(_id: string): Promise<ICarDocument>;
  updateCar(_id: string, doc: ICar): Promise<ICarDocument>;
  removeCars(subdomain: string, carIds: string[]): Promise<ICarDocument>;
  mergeCars(
    subdomain: string,
    carIds: string,
    carFields: any,
    user: IUser
  ): Promise<ICarDocument>;
  checkDuplication(
    carFields: any,
    idsToExclude?: string[]
  ): Promise<ICarDocument>;
  fillSearchText(doc: ICar): Promise<void>;
}

export interface ICarCategoryModel extends Model<ICarCategoryDocument> {
  getCarCatogery(selector: any): Promise<ICarCategoryDocument>;
  createCarCategory(doc: ICarCategory): Promise<ICarCategoryDocument>;
  updateCarCategory(
    _id: string,
    doc: ICarCategory
  ): Promise<ICarCategoryDocument>;
  removeCarCategory(_id: string): Promise<ICarCategoryDocument>;
  generateOrder(
    parentCategory: any,
    doc: ICarCategory
  ): Promise<ICarCategoryDocument>;
}
export interface IProductCarCategoryModel
  extends Model<IProductCarCategoryDocument> {}

export const loadCarsClass = (models: IModels) => {
  class Cars {
    /**
     * Checking if car has duplicated unique properties
     */
    public static async checkDuplication(
      carFields: {
        plateNumber?: string;
        vinNumber?: string;
      },
      idsToExclude?: string[] | string
    ) {
      const query: { status: {}; [key: string]: any } = {
        status: { $ne: 'Deleted' }
      };
      let previousEntry;

      // Adding exclude operator to the query
      if (idsToExclude) {
        query._id = { $nin: idsToExclude };
      }

      if (carFields.plateNumber) {
        // check duplication from primaryName
        previousEntry = await models.Cars.find({
          ...query,
          plateNumber: carFields.plateNumber
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated plate number');
        }
      }

      if (carFields.vinNumber) {
        // check duplication from code
        previousEntry = await models.Cars.find({
          ...query,
          vinNumber: carFields.vinNumber
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
        doc.carCategoryId || ''
      ]);
    }

    public static getCarName(car) {
      return car.plateNumber || car.vinNumber || 'Unknown';
    }

    /**
     * Retreives car
     */
    public static async getCar(_id: string) {
      const car = await models.Cars.findOne({ _id });

      if (!car) {
        throw new Error('Car not found');
      }

      return car;
    }

    /**
     * Create a car
     */
    public static async createCar(doc) {
      // Checking duplicated fields of car
      await models.Cars.checkDuplication(doc);

      const category = await models.CarCategories.getCarCatogery({
        _id: doc.carCategoryId
      });

      if (category.parentId) {
        doc.parentCarCategoryId = category.parentId;
      }

      const car = await models.Cars.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: models.Cars.fillSearchText(doc)
      });

      return car;
    }

    /**
     * Update car
     */
    public static async updateCar(_id, doc) {
      // Checking duplicated fields of car
      await models.Cars.checkDuplication(doc, [_id]);

      const searchText = models.Cars.fillSearchText(
        Object.assign(await models.Cars.getCar(_id), doc)
      );

      const car = await models.Cars.getCar(_id);

      if (car.carCategoryId !== doc.carCategoryId) {
        const category = await models.CarCategories.getCarCatogery({
          _id: doc.carCategoryId
        });

        if (category.parentId) {
          doc.parentCarCategoryId = category.parentId;
        }
      }

      await models.Cars.updateOne(
        { _id },
        { $set: { ...doc, searchText, modifiedAt: new Date() } }
      );

      return models.Cars.findOne({ _id });
    }

    /**
     * Remove car
     */
    public static async removeCars(subdomain: string, carIds) {
      for (const carId of carIds) {
        await sendInternalNotesMessage({
          subdomain: subdomain,
          action: 'removeInternalNotes',
          data: {
            contentType: 'car',
            contentTypeId: carId
          },
          defaultValue: {}
        });

        await sendCoreMessage({
          subdomain: subdomain,
          action: 'conformities.removeConformity',
          data: {
            mainType: 'car',
            mainTypeId: carId
          },
          defaultValue: []
        });
      }

      return models.Cars.deleteMany({ _id: { $in: carIds } });
    }

    /**
     * Merge cars
     */
    public static async mergeCars(subdomain: string, carIds, carFields, user) {
      // Checking duplicated fields of car
      await this.checkDuplication(carFields, carIds);

      // Merging car tags
      for (const carId of carIds) {
        models.Cars.getCar(carId);
        await models.Cars.findByIdAndUpdate(carId, {
          $set: { status: 'Deleted' }
        });
      }

      // Creating car with properties
      const car = await models.Cars.createCar(
        {
          ...carFields,
          mergedIds: carIds
        },
        user
      );

      // Updating customer cars, deals, tasks, tickets
      await sendCoreMessage({
        subdomain: subdomain,
        action: 'conformities.changeConformity',
        data: {
          type: 'car',
          newTypeId: car._id,
          oldTypeIds: carIds
        },
        isRPC: true,
        defaultValue: []
      });

      return car;
    }
  }

  carSchema.loadClass(Cars);
  return carSchema;
};

export const loadCarCategoryClass = models => {
  class CarCategory {
    /**
     *
     * Get Car Cagegory
     */

    public static async getCarCatogery(selector: any) {
      const carCategory = await models.CarCategories.findOne(selector);

      if (!carCategory) {
        throw new Error('Car & service category not found');
      }

      return carCategory;
    }

    /**
     * Create a car categorys
     */
    public static async createCarCategory(doc) {
      const parentCategory = doc.parentId
        ? await models.CarCategories.findOne({
            _id: doc.parentId
          }).lean()
        : undefined;

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.CarCategories.create(doc);
    }

    /**
     * Update Car category
     */
    public static async updateCarCategory(_id, doc) {
      const parentCategory = doc.parentId
        ? await models.CarCategories.findOne({
            _id: doc.parentId
          }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const carCategory = await models.CarCategories.getCarCatogery({
        _id
      });

      const childCategories = await models.CarCategories.find({
        $and: [
          { order: { $regex: new RegExp(carCategory.order, 'i') } },
          { _id: { $ne: _id } }
        ]
      });

      await models.CarCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async category => {
        let order = category.order;

        order = order.replace(carCategory.order, doc.order);

        await models.CarCategories.updateOne(
          { _id: category._id },
          { $set: { order } }
        );
      });

      return models.CarCategories.findOne({ _id });
    }

    /**
     * Remove Car category
     */
    public static async removeCarCategory(_id) {
      await models.CarCategories.getCarCatogery({ _id });

      let count = await models.Cars.countDocuments({ carCategoryId: _id });
      count += await models.CarCategories.countDocuments({
        parentId: _id
      });

      if (count > 0) {
        throw new Error("Can't remove a car category");
      }

      return models.CarCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(parentCategory, doc) {
      const order = parentCategory
        ? `${parentCategory.order}/${doc.code}`
        : `${doc.code}`;

      return order;
    }
  }
  carCategorySchema.loadClass(CarCategory);

  return carCategorySchema;
};
