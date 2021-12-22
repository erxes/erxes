import { ImportHistory } from '../../../db/models';
import messageBroker from '../../../messageBroker';
import { importer } from '../../../middlewares/fileMiddleware';
import { MODULE_NAMES, RABBITMQ_QUEUES } from '../../constants';
import { putDeleteLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

const importHistoryMutations = {
  /**
   * Removes a history
   * @param {string} param1._id ImportHistory id
   */
  async importHistoriesRemove(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const importHistory = await ImportHistory.getImportHistory(_id);

    await ImportHistory.updateOne(
      { _id: importHistory._id },
      { $set: { status: 'Removing' } }
    );

    const response = await messageBroker().sendRPCMessage(
      RABBITMQ_QUEUES.RPC_API_TO_WORKERS,
      {
        action: 'removeImport',
        importHistoryId: importHistory._id
      }
    );

    if (response.status === 'ok') {
      await putDeleteLog(
        { type: MODULE_NAMES.IMPORT_HISTORY, object: importHistory },
        user
      );
    } else {
      throw new Error(response.message);
    }

    return ImportHistory.findOne({ _id: importHistory._id });
  },

  /**
   * Cancel uploading process
   */
  async importHistoriesCancel(_root) {
    await messageBroker().sendMessage(RABBITMQ_QUEUES.WORKERS, {
      type: 'cancelImport'
    });

    return true;
  },

  async importHistoriesCreate(
    _root,
    {
      contentTypes,
      files,
      columnsConfig,
      importName,
      associatedContentType,
      associatedField
    }: {
      contentTypes: string[];
      files: any[];
      columnsConfig: any;
      importName: string;
      associatedContentType: string;
      associatedField: string;
    },
    { user }: IContext
  ) {
    const importHistory = await ImportHistory.createHistory(
      {
        success: 0,
        updated: 0,
        total: 0,
        failed: 0,
        contentTypes,
        name: importName,
        attachments: files
      },
      user
    );

    importer(
      contentTypes,
      files,
      columnsConfig,
      importHistory._id,
      associatedContentType,
      associatedField,
      user
    );

    return 'success';
  }
};

checkPermission(
  importHistoryMutations,
  'importHistoriesRemove',
  'removeImportHistories'
);

export default importHistoryMutations;
