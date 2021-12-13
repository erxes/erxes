import { Model, model } from 'mongoose';
import {
  IExportHistory,
  IExportHistoryDocument,
  exportHistorySchema
} from './definitions/exportHistory';
import { IUserDocument } from './definitions/users';

export interface IExportHIstoryModel extends Model<IExportHistoryDocument> {
  getExportHistory(_id: string): Promise<IExportHistoryDocument>;
  createHistory(
    doc: IExportHistory,
    user: IUserDocument
  ): Promise<IExportHistoryDocument>;
  removeHistory(_id: string): Promise<string>;
}

export const loadClass = () => {
  class ExportHistory {
    /*
     * Get a import history
     */
    public static async getExportHistory(_id: string) {
      const exportHistory = await ExportHistories.findOne({ _id });

      if (!exportHistory) {
        throw new Error('Export history not found');
      }

      return exportHistory;
    }

    /*
     * Create new history
     */
    public static async createHistory(
      doc: IExportHistory,
      user: IUserDocument
    ) {
      return ExportHistories.create({
        userId: user._id,
        date: new Date(),
        ...doc
      });
    }

    /*
     * Remove Imported history
     */
    public static async removeHistory(_id: string) {
      const historyObj = await ExportHistories.findOne({ _id });

      if (!historyObj) {
        throw new Error('Import history not found');
      }

      await ExportHistories.deleteOne({ _id });

      return _id;
    }
  }

  exportHistorySchema.loadClass(ExportHistory);

  return exportHistorySchema;
};

loadClass();

// tslint:disable-next-line
const ExportHistories = model<IExportHistoryDocument, IExportHIstoryModel>(
  'export_history',
  exportHistorySchema
);

export default ExportHistories;
