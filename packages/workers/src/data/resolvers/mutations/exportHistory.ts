import { receiveImportRemove } from '../../../worker/import/utils';
import { IContext } from '../../../connectionResolvers';
import messageBroker from '../../../messageBroker';
import { RABBITMQ_QUEUES } from '../../constants';
import { receiveExportCreate } from '../../../worker/export/utils';

const exportHistoryMutations = {
  /**
   * Removes a history
   * @param {string} param1._id ImportHistory id
   */
  async exportHistoriesRemove(
    _root,
    { _id, contentType }: { _id: string; contentType },
    { models, subdomain }: IContext
  ) {
    const importHistory = await models.ImportHistory.getImportHistory(_id);

    await models.ImportHistory.updateOne(
      { _id: importHistory._id },
      { $push: { removed: contentType } }
    );
    const content = {
      action: 'removeImport',
      importHistoryId: importHistory._id,
      contentType
    };

    return receiveImportRemove(content, models, subdomain);
  },

  /**
   * Cancel uploading process
   */
  async exportHistoriesCancel(_root) {
    await messageBroker().sendMessage(RABBITMQ_QUEUES.WORKERS, {
      type: 'cancelImport'
    });

    return true;
  },

  async exportHistoriesCreate(
    _root,
    {
      contentType,
      columnsConfig,
      segmentId
    }: {
      contentType: string;
      columnsConfig: any;
      segmentId: string;
    },
    { user, models, subdomain }: IContext
  ) {
    const exportHistory = await models.ExportHistory.createHistory({
      total: 0,
      contentType,
      columnsConfig,
      segmentId
    });

    try {
      await receiveExportCreate(
        {
          contentType,
          columnsConfig,
          exportHistoryId: exportHistory._id,
          segmentId,
          user
        },
        models,
        subdomain
      );
    } catch (e) {
      return models.ExportHistory.updateOne(
        { _id: 'exportHistoryId' },
        { error: e.message }
      );
    }

    return 'success';
  }
};

export default exportHistoryMutations;
