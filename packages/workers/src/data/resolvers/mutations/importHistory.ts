import { IContext } from '../../../connectionResolvers';
import messageBroker from '../../../messageBroker';
import { importer } from '../../../middlewares/fileMiddleware';
import { RABBITMQ_QUEUES } from '../../constants';

const importHistoryMutations = {
  /**
   * Removes a history
   * @param {string} param1._id ImportHistory id
   */
  async importHistoriesRemove(
    _root,
    { _id, contentType }: { _id: string; contentType },
    { models }: IContext
  ) {
    const importHistory = await models.ImportHistory.getImportHistory(_id);

    await models.ImportHistory.updateOne(
      { _id: importHistory._id },
      { $push: { removed: contentType } }
    );

    return messageBroker().sendMessage(RABBITMQ_QUEUES.RPC_API_TO_WORKERS, {
      contet: {
        action: 'removeImport',
        importHistoryId: importHistory._id,
        contentType
      },
      models
    });
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
    { user, models, subdomain }: IContext
  ) {
    const importHistory = await models.ImportHistory.createHistory(
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
      user,
      models,
      subdomain
    );

    return 'success';
  }
};

export default importHistoryMutations;
