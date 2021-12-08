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
import {
  createAWS,
  getConfig,
  getS3ImportFileInfo,
  paginate
} from '../../utils';

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

  async importHistoryGetColumns(
    _root,
    { attachmentName }: { attachmentName: string }
  ) {
    const AWS_BUCKET = await getConfig('AWS_BUCKET');
    const s3 = await createAWS();

    const params = { Bucket: AWS_BUCKET, Key: attachmentName };

    const values = (await getS3ImportFileInfo({ s3, params })) as any;

    const object = {} as any;

    values.map(value => {
      Object.keys(value).forEach(key => {
        if (!object[key]) {
          object[key] = [value[key]];
        } else object[key].push(value[key]);
      });
    });

    return object;
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

    switch (contentType) {
      case 'customer':
        return Customers.countDocuments({ state: 'customer' });

      case 'lead':
        return Customers.countDocuments({ state: 'lead' });

      case 'visitor':
        return Customers.countDocuments({ state: 'visitor' });

      case 'deal':
        return Deals.countDocuments({});

      case 'task':
        return Tasks.countDocuments({});

      case 'company':
        return Companies.countDocuments({});

      case 'ticket':
        return Tasks.countDocuments({});
    }
  }
};

checkPermission(
  importHistoryQueries,
  'importHistories',
  'importHistoryDetail',
  []
);

export default importHistoryQueries;
