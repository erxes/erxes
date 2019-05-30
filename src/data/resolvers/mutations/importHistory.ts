import * as path from 'path';
import { ImportHistory } from '../../../db/models';
import { clearIntervals, createWorkers, removeWorkers, splitToCore } from '../../../workers/utils';
import { checkPermission } from '../../permissions';

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

    const ids: any = importHistory.ids || [];

    const results = splitToCore(ids);

    const workerFile =
      process.env.NODE_ENV === 'production'
        ? `./dist/workers/importHistoryRemove.worker.js`
        : './src/workers/importHistoryRemove.worker.import.js';

    const workerPath = path.resolve(workerFile);

    const workerData = {
      contentType: importHistory.contentType,
      importHistoryId: importHistory._id,
    };

    await createWorkers(workerPath, workerData, results);

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

    clearIntervals();

    removeWorkers();

    return true;
  },
};

checkPermission(importHistoryMutations, 'importHistoriesRemove', 'removeImportHistories');

export default importHistoryMutations;
