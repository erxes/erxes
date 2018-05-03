import mongoose from 'mongoose';
import { field } from './utils';
import { Customers } from './';
/*
 * Xls import history
 */
const ImportHistorySchema = mongoose.Schema({
  _id: field({ pkey: true }),
  success: field({
    type: Number,
  }),
  failed: field({
    type: Number,
  }),
  total: field({
    type: Number,
  }),
  ids: field({ type: [String] }),
  contentType: field({ type: String }),
  importedUserId: field({
    type: String,
  }),
  importedDate: field({
    type: Date,
  }),
});

class ImportHistory {
  /** Create new history
   *
   * @param {Number} success - Successfully imported customers
   * @param {Number} failed - Failed counts
   * @param {Number} total - Total customers in xls file
   * @param {String} contentType - Coc type
   * @param {String[]} customerIds - Imported customerIds
   *
   * @return {Promise} newly created history object
   */
  static async createHistory(doc, user) {
    return this.create({
      importedUserId: user._id,
      importedDate: new Date(),
      ...doc,
    });
  }

  /**
   * Remove Imported history
   * @param {String} _id - history id to remove
   *
   * @return {Promise}
   */
  static async removeHistory(_id) {
    const historyObj = await this.findOne({ _id });

    const { customerIds = [] } = historyObj;

    for (let customerId of customerIds) {
      await Customers.remove({ _id: customerId });
    }

    await this.remove({ _id });

    return _id;
  }
}

ImportHistorySchema.loadClass(ImportHistory);

const ImportHistories = mongoose.model('import_history', ImportHistorySchema);

export default ImportHistories;
