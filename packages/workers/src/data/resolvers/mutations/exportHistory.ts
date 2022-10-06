import { IContext } from '../../../connectionResolvers';
import { receiveExportCreate } from '../../../worker/export/utils';

const exportHistoryMutations = {
  async exportHistoriesCreate(
    _root,
    {
      contentType,
      columnsConfig,
      segmentData
    }: {
      contentType: string;
      columnsConfig: any;
      segmentData: string;
    },
    { user, models, subdomain }: IContext
  ) {
    const exportHistory = await models.ExportHistory.createHistory({
      total: 0,
      contentType,
      columnsConfig,
      segmentData
    });

    try {
      await receiveExportCreate(
        {
          contentType,
          columnsConfig,
          exportHistoryId: exportHistory._id,
          segmentData,
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
