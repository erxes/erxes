import {
  Companies,
  Customers,
  Deals,
  ImportHistory,
  Segments,
  Tasks
} from '../../../db/models';
import { ISegment } from '../../../db/models/definitions/segments';
import { fetchSegment } from '../../modules/segments/queryBuilder';
import { checkPermission } from '../../permissions/wrappers';
import { paginate } from '../../utils';

const importHistoryQueries = {
  /**
   * Import history list
   */
  importHistories(
    _root,
    { type, ...args }: { page: number; perPage: number; type: string }
  ) {
    const list = paginate(
      ImportHistory.find({ contentType: type }),
      args
    ).sort({ date: -1 });
    const count = ImportHistory.find({ contentType: type }).countDocuments();

    return { list, count };
  },

  async importHistoryDetail(_root, { _id }: { _id: string }) {
    const importHistory = await ImportHistory.getImportHistory(_id);

    importHistory.errorMsgs = (importHistory.errorMsgs || []).slice(0, 100);

    return importHistory;
  },

  async importHistoryPreviewExportCount(
    _root,
    { segmentId, contentType }: { segmentId: string; contentType: string }
  ) {
    if (segmentId) {
      const segment = (await Segments.findOne({
        _id: segmentId
      })) as ISegment;

      return fetchSegment(segment, { returnCount: true });
    }

    let count = 0;

    switch (contentType) {
      case 'customer':
        count = await Customers.countDocuments({ state: 'customer' });

        break;
      case 'lead':
        count = await Customers.countDocuments({ state: 'lead' });

        break;
      case 'visitor':
        count = await Customers.countDocuments({ state: 'visitor' });

        break;
      case 'deal':
        count = await Deals.countDocuments();

        break;

      case 'task':
        count = await Tasks.countDocuments();

        break;

      case 'company':
        count = await Companies.countDocuments();

        break;

      case 'ticket':
        count = await Tasks.countDocuments();

        break;
    }

    return count;
  }
};

checkPermission(
  importHistoryQueries,
  'importHistories',
  'importHistoryDetail',
  []
);

export default importHistoryQueries;
