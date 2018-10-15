import { Model, model } from 'mongoose';
import { Companies, Customers } from '.';
import { IImportHistory, IImportHistoryDocument, importHistorySchema } from './definitions/importHistory';
import { IUserDocument } from './definitions/users';

interface IImportHistoryModel extends Model<IImportHistoryDocument> {
  createHistory(doc: IImportHistory, user: IUserDocument): Promise<IImportHistoryDocument>;
  removeHistory(_id: string): Promise<string>;
}

class ImportHistory {
  /* 
   * Create new history
   */
  public static async createHistory(doc: IImportHistory, user: IUserDocument) {
    return ImportHistories.create({
      userId: user._id,
      date: new Date(),
      ...doc,
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

    const { ids = [], contentType } = historyObj;

    let removeMethod = Customers.removeCustomer;

    if (contentType === 'company') {
      removeMethod = Companies.removeCompany;
    }

    for (const id of ids) {
      await removeMethod(id);
    }

    await ImportHistories.remove({ _id });

    return _id;
  }
}

importHistorySchema.loadClass(ImportHistory);

const ImportHistories = model<IImportHistoryDocument, IImportHistoryModel>('import_history', importHistorySchema);

export default ImportHistories;
