import { Model } from 'mongoose';
import { IModels } from '../../connectionResolvers';
import {
  IImportHistory,
  IImportHistoryDocument,
  importHistorySchema
} from './definitions/importHistory';

export interface IImportHistoryModel extends Model<IImportHistoryDocument> {
  getImportHistory(_id: string): Promise<IImportHistoryDocument>;
  createHistory(
    doc: IImportHistory,
    user: any
  ): Promise<IImportHistoryDocument>;
  removeHistory(_id: string): Promise<string>;
}

export const loadImportHistoryClass = (models: IModels) => {
  class ImportHistory {
    /*
     * Get a Import history
     */
    public static async getImportHistory(_id: string) {
      const importHistory = await models.ImportHistory.findOne({ _id });

      if (!importHistory) {
        throw new Error('Import history not found');
      }

      return importHistory;
    }

    /*
     * Create new history
     */
    public static async createHistory(doc: IImportHistory, user: any) {
      return models.ImportHistory.create({
        userId: user._id,
        date: new Date(),
        ...doc
      });
    }

    /*
     * Remove Imported history
     */
    public static async removeHistory(_id: string) {
      const historyObj = await models.ImportHistory.findOne({ _id });

      if (!historyObj) {
        throw new Error('Import history not found');
      }

      await models.ImportHistory.deleteOne({ _id });

      return _id;
    }
  }

  importHistorySchema.loadClass(ImportHistory);

  return importHistorySchema;
};
