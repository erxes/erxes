import { Model, model } from 'mongoose';
import {
  IImportHistory,
  IImportHistoryDocument,
  importHistorySchema
} from './definitions/importHistory';
import { IUserDocument } from './definitions/users';

export interface IImportHistoryModel extends Model<IImportHistoryDocument> {
  getImportHistory(_id: string): Promise<IImportHistoryDocument>;
  createHistory(
    doc: IImportHistory,
    user: IUserDocument
  ): Promise<IImportHistoryDocument>;
  removeHistory(_id: string): Promise<string>;
}

export const loadClass = () => {
  class ImportHistory {
    /*
     * Get a import history
     */
    public static async getImportHistory(_id: string) {
      const importHistory = await ImportHistories.findOne({ _id });

      if (!importHistory) {
        throw new Error('Import history not found');
      }

      return importHistory;
    }

    /*
     * Create new history
     */
    public static async createHistory(
      doc: IImportHistory,
      user: IUserDocument
    ) {
      return ImportHistories.create({
        userId: user._id,
        date: new Date(),
        ...doc
      });
    }

    /*
     * Remove Imported history
     */
    public static async removeHistory(_id: string) {
      const historyObj = await ImportHistories.findOne({ _id });

      if (!historyObj) {
        throw new Error('Import history not found');
      }

      await ImportHistories.deleteOne({ _id });

      return _id;
    }
  }

  importHistorySchema.loadClass(ImportHistory);

  return importHistorySchema;
};

loadClass();

// tslint:disable-next-line
const ImportHistories = model<IImportHistoryDocument, IImportHistoryModel>(
  'import_history',
  importHistorySchema
);

export default ImportHistories;
