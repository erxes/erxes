import { IContext } from '../../../connectionResolvers';
import { receiveExportCreate } from '../../../worker/export/utils';

const exportHistoryMutations = {
  async exportHistoriesCreate(
    _root,
    {
      contentType,
      columnsConfig,
      segmentData,
      exportName,
      disclaimer
    }: {
      contentType: string;
      columnsConfig: string[];
      segmentData: string[];
      exportName: string;
      disclaimer: boolean;
    },
    { user, models, subdomain }: IContext
  ) {
    console.log(contentType, 'contentTYpe');
    console.log(columnsConfig, 'columnsConfig');
    console.log(segmentData, 'segmentData');

    const exportHistory = await models.ExportHistory.createHistory({
      total: 0,
      contentType,
      columnsConfig,
      segmentData,
      exportName,
      disclaimer
    });

    try {
      await receiveExportCreate(
        {
          contentType,
          columnsConfig,
          exportHistoryId: exportHistory._id,
          segmentData,
          user,
          exportName,
          disclaimer
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
