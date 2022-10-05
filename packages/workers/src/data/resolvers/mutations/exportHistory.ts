import { IContext } from '../../../connectionResolvers';
import { receiveExportCreate } from '../../../worker/export/utils';

const exportHistoryMutations = {
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
