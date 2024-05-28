import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IQuarter,
  IQuarterDocument,
  quarterSchema
} from './definitions/quarters';

export interface IQuarterModel extends Model<IQuarterDocument> {
  createQuarter(doc: IQuarter): Promise<IQuarterDocument>;
  updateQuarter(_id: string, doc: IQuarter): void;
  getQuarter(doc: any): Promise<IQuarterDocument>;
  removeQuarter(_id: string): void;
}

export const loadQuarterClass = (models: IModels) => {
  class Quarter {
    public static async createQuarter(doc: IQuarter) {
      return models.Quarters.create(doc);
    }

    public static async updateQuarter(_id: string, doc: IQuarter) {
      await models.Quarters.getQuarter({ _id });
      await models.Quarters.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } }
      );

      return models.Quarters.getQuarter({ _id });
    }

    public static async removeQuarter(_id: string) {
      return models.Quarters.deleteOne({ _id });
    }

    public static async getQuarter(doc: any) {
      const quarter = await models.Quarters.findOne(doc);

      if (!quarter) {
        throw new Error('Quarter not found');
      }

      return quarter;
    }
  }

  quarterSchema.loadClass(Quarter);

  return quarterSchema;
};
