import { fetchSegment } from '../../../messageBroker';
import { ImportHistory } from '../../../db/models';
import { getService, getServices } from '../../../inmemoryStorage';
import { checkPermission } from '../../permissions/wrappers';
import utils, { paginate } from '../../utils';

const importHistoryQueries = {
  async importHistoryGetTypes() {
    const services = await getServices();

    const servicesImportTypes: any = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);

      if (service.meta && service.meta.importTypes) {
        servicesImportTypes.push(...service.meta.importTypes);
      }
    }

    return servicesImportTypes;
  },

  /**
   * Import history list
   */
  async importHistories(
    _root,
    { type, ...args }: { page: number; perPage: number; type: string }
  ) {
    const filter: { [key: string]: any } = {};

    if (type) {
      filter['contentTypes.contentType'] = type;
    }

    const list = await paginate(ImportHistory.find(filter), args).sort({
      date: -1
    });

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
    { segmentId }: { segmentId: string; contentType: string }
  ) {
    if (segmentId) {
      return fetchSegment(segmentId, { returnCount: true });
    }
  },

  async importHistoryGetExportableServices() {
    const services = await getServices();

    const servicesExportTypes: any = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);

      if (service.meta.exportTypes) {
        servicesExportTypes.push(...service.meta.exportTypes);
      }
    }

    return servicesExportTypes;
  }
};

checkPermission(importHistoryQueries, 'importHistories', 'importHistories', []);

export default importHistoryQueries;
