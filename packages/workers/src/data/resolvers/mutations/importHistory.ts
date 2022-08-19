import {
  receiveImportCreate,
  receiveImportRemove
} from '../../../worker/utils';
import { IContext } from '../../../connectionResolvers';
import messageBroker, { getFileUploadConfigs } from '../../../messageBroker';
import { RABBITMQ_QUEUES } from '../../constants';

const importer = async (
  contentTypes,
  files,
  columnsConfig,
  importHistoryId,
  associatedContentType,
  associatedField,
  user,
  models,
  subdomain,
  scopeBrandIds
) => {
  try {
    const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

    await receiveImportCreate(
      {
        action: 'createImport',
        contentTypes,
        files,
        uploadType: UPLOAD_SERVICE_TYPE,
        columnsConfig,
        user,
        importHistoryId,
        associatedContentType,
        associatedField,
        scopeBrandIds
      },
      models,
      subdomain
    );
  } catch (e) {
    return models.ImportHistory.updateOne(
      { _id: 'importHistoryId' },
      { error: e.message }
    );
  }
};

const importHistoryMutations = {
  /**
   * Removes a history
   * @param {string} param1._id ImportHistory id
   */
  async importHistoriesRemove(
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
    { user, models, subdomain, scopeBrandIds }: IContext
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
      subdomain,
      scopeBrandIds
    );

    return 'success';
  }
};

export default importHistoryMutations;
