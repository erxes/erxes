import { ImportHistory } from '../../../db/models';
import { checkPermission } from '../../permissions';

const importHistoryMutations = {
  /**
   * Remove a history
   */
  importHistoriesRemove(_root, { _id }: { _id: string }) {
    return ImportHistory.removeHistory(_id);
  },
};

checkPermission(importHistoryMutations, 'importHistoriesRemove', 'removeImportHistories');

export default importHistoryMutations;
