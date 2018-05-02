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
  customerIds: field({ type: [String] }),
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
   * @param {Number} total - total customers in xls file
   * @param {String[]} customerIds - imported customerIds
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
   * Remove internalNote
   * @param {String} _id - internalNote id to remove
   *
   * @return {Promise}
   */
  static async removeHistory(_id) {
    const historyObj = this.findOne({ _id });

    const { customerIds = [] } = historyObj;

    for (let customerId of customerIds) {
      await Customers.remove({ _id: customerId });
    }

    return this.remove({ _id });
  }
}

ImportHistorySchema.loadClass(ImportHistory);

const ImportHistories = mongoose.model('import_history', ImportHistorySchema);

export default ImportHistories;
