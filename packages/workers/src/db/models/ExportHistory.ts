import { Model } from 'mongoose';
import { IModels } from '../../connectionResolvers';
import {
  IExportHistory,
  IExportHistoryDocument,
  exportHistorySchema
} from './definitions/exportHistory';

export interface IExportHistoryModel extends Model<IExportHistoryDocument> {
  createHistory(doc: IExportHistory): Promise<IExportHistoryDocument>;
}

export const loadExportHistoryClass = (models: IModels) => {
  class ExportHistory {
    /*
     * Create new history
     */

    public static async createHistory(doc: IExportHistory) {
      return models.ExportHistory.create({
        date: new Date(),
        ...doc
      });
    }
  }

  exportHistorySchema.loadClass(ExportHistory);

  return exportHistorySchema;
};
