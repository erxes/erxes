import { ImportHistory } from '../../../db/models';
import { sendMessage } from '../../../messageBroker';
import { MODULE_NAMES, RABBITMQ_QUEUES } from '../../constants';
import { putDeleteLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

const importHistoryMutations = {
  /**
   * Removes a history
   * @param {string} param1._id ImportHistory id
   */
  async importHistoriesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const importHistory = await ImportHistory.getImportHistory(_id);

    await ImportHistory.updateOne({ _id: importHistory._id }, { $set: { status: 'Removing' } });

    await sendMessage(RABBITMQ_QUEUES.IMPORT_HISTORY_REMOVE, {
      contentType: importHistory.contentType,
      importHistoryId: importHistory._id,
    });

    await putDeleteLog({ type: MODULE_NAMES.IMPORT_HISTORY, object: importHistory }, user);

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

    await sendMessage(RABBITMQ_QUEUES.IMPORT_HISTORY_CANCEL, {});

    return true;
  },
};

checkPermission(importHistoryMutations, 'importHistoriesRemove', 'removeImportHistories');

export default importHistoryMutations;
