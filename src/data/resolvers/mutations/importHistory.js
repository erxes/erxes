import { ImportHistory } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const importHistoryMutations = {
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
