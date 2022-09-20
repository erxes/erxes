import { receiveImportRemove } from '../../../worker/importHistory/utils';
import { IContext } from '../../../connectionResolvers';
import messageBroker from '../../../messageBroker';
import { RABBITMQ_QUEUES } from '../../constants';

// const importer = async (
//   contentTypes,
//   files,
//   columnsConfig,
//   importHistoryId,
//   associatedContentType,
//   associatedField,
//   user,
//   models,
//   subdomain,
//   scopeBrandIds
// ) => {
//   try {
//     const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

//     await receiveImportCreate(
//       {
//         action: 'createImport',
//         contentTypes,
//         files,
//         uploadType: UPLOAD_SERVICE_TYPE,
//         columnsConfig,
//         user,
//         importHistoryId,
//         associatedContentType,
//         associatedField,
//         scopeBrandIds
//       },
//       models,
//       subdomain
//     );
//   } catch (e) {
//     return models.ImportHistory.updateOne(
//       { _id: 'importHistoryId' },
//       { error: e.message }
//     );
//   }
// };

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
    { models }: IContext
  ) {
    const exportHistory = await models.ExportHistory.createHistory({
      contentType,
      columnsConfig,
      segmentId
    });

    return exportHistory;
  }
};

export default exportHistoryMutations;
