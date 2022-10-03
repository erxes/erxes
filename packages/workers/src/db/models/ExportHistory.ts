import { Model } from 'mongoose';
import { IModels } from '../../connectionResolvers';
import {
  IExportHistory,
  IExportHistoryDocument,
  exportHistorySchema
} from './definitions/exportHistory';

export interface IExportHistoryModel extends Model<IExportHistoryDocument> {
  getExportHistory(_id: string): Promise<IExportHistoryDocument>;
  createHistory(doc: IExportHistory): Promise<IExportHistoryDocument>;
  removeHistory(_id: string): Promise<string>;
}

export const loadExportHistoryClass = (models: IModels) => {
  class ExportHistory {
    /*
     * Get a Export history
     */
    public static async getExportHistory(_id: string) {
      const exportHistory = await models.ExportHistory.findOne({ _id });

      if (!exportHistory) {
        throw new Error('Export history not found');
      }

      return exportHistory;
    }

    /*
     * Create new history
     */

    public static async createHistory(doc: IExportHistory) {
      return models.ExportHistory.create({
        date: new Date(),
        ...doc
      });
    }

    /*
     * Remove Exported history
     */
    public static async removeHistory(_id: string) {
      const historyObj = await models.ExportHistory.findOne({ _id });

      if (!historyObj) {
        throw new Error('Export history not found');
      }

      await models.ExportHistory.deleteOne({ _id });

      return _id;
    }
  }

  exportHistorySchema.loadClass(ExportHistory);

  return exportHistorySchema;
};
