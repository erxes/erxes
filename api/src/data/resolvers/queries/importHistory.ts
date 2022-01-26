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
import utils, { paginate } from '../../utils';

const importHistoryQueries = {
  /**
   * Import history list
   */
  importHistories(
    _root,
    { type, ...args }: { page: number; perPage: number; type: string }
  ) {
    const filter: { [key: string]: any } = {};

    if (type) {
      filter.contentTypes = type;
    }

    const list = paginate(ImportHistory.find(filter), args).sort({ date: -1 });

    const count = ImportHistory.find(filter).countDocuments();

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
    const values = (await utils.getImportCsvInfo(attachmentName)) as any;

    const object = {} as any;

    values.map(value => {
      Object.keys(value).forEach(key => {
        if (!object[key]) {
          object[key] = [value[key]];
        } else {
          object[key].push(value[key]);
        }
      });
    });

    return object;
  },

  async importHistoryGetDuplicatedHeaders(
    _root,
    { attachmentNames }: { attachmentNames: string[] }
  ) {
    const headers = [] as any;

    for (const attachmentName of attachmentNames) {
      const results: any = await utils.getCsvHeadersInfo(attachmentName);

      headers.push(...results.split(','));
    }

    const duplicates = headers.filter(
      (item, index) => index !== headers.indexOf(item)
    );

    return duplicates;
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
