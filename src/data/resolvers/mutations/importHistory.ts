import { ImportHistory } from '../../../db/models';
import { checkPermission } from '../../permissions/wrappers';
import { fetchWorkersApi } from '../../utils';

const importHistoryMutations = {
  /**
   * Remove a history
   */
  async importHistoriesRemove(_root, { _id }: { _id: string }) {
    const importHistory = await ImportHistory.findOne({ _id });

    if (!importHistory) {
      throw new Error('History not found');
    }

    await ImportHistory.updateOne({ _id: importHistory._id }, { $set: { status: 'Removing' } });

    await fetchWorkersApi({
      path: '/import-remove',
      method: 'POST',
      body: {
        targetIds: JSON.stringify(importHistory.ids || []),
        contentType: importHistory.contentType,
        importHistoryId: importHistory._id,
      },
    });

    return ImportHistory.findOne({ _id: importHistory._id });
  },

  /**
   * Cancel uploading process
   */
  async importHistoriesCancel(_root, { _id }: { _id: string }) {
    const importHistory = await ImportHistory.findOne({ _id });

    if (!importHistory) {
      throw new Error('History not found');
    }

    await fetchWorkersApi({ path: '/import-cancel', method: 'POST' });

    return true;
  },
};

checkPermission(importHistoryMutations, 'importHistoriesRemove', 'removeImportHistories');

export default importHistoryMutations;
