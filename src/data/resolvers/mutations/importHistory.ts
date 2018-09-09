import { ImportHistory } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const importHistoryMutations = {
  /**
   * Remove a history
   */
  importHistoriesRemove(_root, { _id }: { _id: string }) {
    return ImportHistory.removeHistory(_id);
  },
};

moduleRequireLogin(importHistoryMutations);

export default importHistoryMutations;
