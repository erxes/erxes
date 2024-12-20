import { Model } from 'mongoose';
import {
  cleaningHistorySchema,
  ICleaningHistory,
  ICleaningHistoryDocument,
} from './definitions/cleaning';
import { IModels } from '../connectionResolver';

export interface ICleaningHistoryModel extends Model<ICleaningHistoryDocument> {
  updateHistory(
    _id: string,
    doc: ICleaningHistory
  ): Promise<ICleaningHistoryDocument>;
  createHistory(doc: ICleaningHistory): Promise<ICleaningHistoryDocument>;
  getHistory(_id: string): Promise<ICleaningHistoryDocument>;
  remove(ids: string[]): Promise<any>;
}

export const loadCleaningHistoryClass = (models: IModels, _subdomain) => {
  class CleaningHistory {
    public static async getHistory(_id: string) {
      return await models.History.findById(_id);
    }
    public static async createHistory(doc: ICleaningHistory) {
      const obj = await models.History.create(doc);
      return obj;
    }
    public static async updateHistory(_id, doc) {
      await models.History.updateOne({ _id: _id }, { ...doc });
      return models.History.findOne({ _id });
    }
    public static async remove(ids: string[]) {
      await models.History.deleteMany({ _id: { $in: ids } });
      return 'ok';
    }
  }

  cleaningHistorySchema.loadClass(CleaningHistory);

  return cleaningHistorySchema;
};
