import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { carSchema } from '~/modules/cars/db/definitions/car';
import { ICar, ICarDocument } from '~/modules/cars/@types/car';
import { validSearchText } from 'erxes-api-shared/utils';
import { any } from 'zod';

export interface ICarModel extends Model<ICarDocument> {
  fillSearchText(doc: ICar);
  carDetail(_id: string): Promise<ICarDocument>;
  cars(): Promise<ICarDocument[]>;
  carsAdd(doc: ICar): Promise<ICarDocument>;
  carsEdit(_id: string, doc: ICar): Promise<ICarDocument>;
  carsRemove(ModuleId: string[]): Promise<{ ok: number }>;
  carDetail(_id: string): Promise<ICarDocument>;
  mergeCars(carIds: string[], carFields: ICar): Promise<ICarDocument>;
}

export const loadCarClass = (models: IModels) => {
  class Cars {
    public static fillSearchText(doc: ICar) {
      return validSearchText([
        doc.plateNumber || '',
        doc.vinNumber || '',
        doc.description || '',
        doc.categoryId || '',
      ]);
    }

    public static async checkDuplication(
      carFields: {
        plateNumber?: string;
        vinNumber?: string;
      },
      idsToExclude?: string[] | string,
    ) {
      const query: { status: {}; [key: string]: any } = {
        status: { $ne: 'Deleted' },
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

    /**
     * Retrieves cars
     */
    public static async carDetail(_id: string) {
      const cars = await models.Cars.findOne({ _id }).lean();

      if (!cars) {
        throw new Error('Car not found');
      }

      return cars;
    }

    /**
     * Retrieves all carss
     */
    public static async cars(): Promise<ICarDocument[]> {
      return models.Cars.find().lean();
    }

    /**
     * Create a cars
     */
    public static async carsAdd(doc: ICar): Promise<ICarDocument> {
      return models.Cars.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: models.Cars.fillSearchText(doc),
      });
    }

    /*
     * Update cars
     */
    public static async carsEdit(_id: string, doc: ICar) {
      const car = await models.Cars.carDetail(_id);

      const searchText: string = models.Cars.fillSearchText(
        Object.assign(car, doc),
      );

      await models.Cars.updateOne(
        { _id },
        { $set: { ...doc, searchText, modifiedAt: new Date() } },
      );

      return models.Cars.findOne({ _id });
    }

    /**
     * Remove cars
     */
    public static async carsRemove(carIds: string[]) {
      return models.Cars.deleteMany({ _id: { $in: carIds } });
    }

    // Merge cars

    public static async mergeCars(carIds: string[], carFields: ICar) {
      await this.checkDuplication(carFields, carIds);

      for (const carId of carIds) {
        models.Cars.carDetail(carId);
        await models.Cars.findByIdAndUpdate(carId, {
          $set: { status: 'Deleted' },
        });
      }

      return await models.Cars.carsAdd({
        ...carFields,
        mergeIds: carIds,
      });
    }
  }

  carSchema.loadClass(Cars);

  return carSchema;
};
