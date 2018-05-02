import { ImportHistory } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const importHistoryMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   * @param {Number} success - Successfully imported customers
   * @param {Number} failed - Failed counts
   * @param {Number} total - total customers in xls file
   * @param {String[]} customerIds - imported customerIds
   *
   * @return {Promise}
   */
  async importHistoriesAdd(root, args, { user }) {
    return await ImportHistory.createHistory(args, user);
  },

  /**
   * Remove a history
   * @param {String} _id - Id of a history
   *
   * @return {Promise}
   */
  importHistoriesRemove(root, { _id }) {
    return ImportHistory.removeHistory(_id);
  },
};

moduleRequireLogin(importHistoryMutations);

export default importHistoryMutations;
