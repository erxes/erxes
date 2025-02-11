import { Model } from 'mongoose';
import {
  cleaningSchema,
  ICleaning,
  ICleaningDocument,
} from './definitions/cleaning';
import { IModels } from '../connectionResolver';

export interface ICleaningModel extends Model<ICleaningDocument> {
  updateCleaning(_id: string, doc: ICleaning): Promise<ICleaningDocument>;
  createCleaning(doc: ICleaning): Promise<ICleaningDocument>;
  getCleaning(_id: string): Promise<ICleaningDocument>;
  remove(ids: string[]): Promise<any>;
}

export const loadCleaningClass = (models: IModels, _subdomain) => {
  class Cleaning {
    public static async getCleaning(_id: string) {
      return await models.Cleaning.findById(_id);
    }
    public static async createCleaning(doc: ICleaning) {
      const obj = await models.Cleaning.create(doc);
      return obj;
    }
    public static async updateCleaning(_id, doc) {
      await models.Cleaning.updateOne({ _id: _id }, { ...doc });
      return models.Cleaning.findOne({ _id });
    }
    public static async remove(ids: string[]) {
      await models.Cleaning.deleteMany({ _id: { $in: ids } });
      return 'ok';
    }
  }

  cleaningSchema.loadClass(Cleaning);

  return cleaningSchema;
};
