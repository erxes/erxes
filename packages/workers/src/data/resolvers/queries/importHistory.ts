import { ImportHistory } from './../../../db/models';
import { fetchSegment } from '../../../messageBroker';
import { getService, getServices } from '../../../inmemoryStorage';

import { paginate, getImportCsvInfo, getCsvHeadersInfo } from '../../utils';

const importHistoryQueries = {
  async importHistoryGetTypes() {
    // return servicesImportTypes;

    const services = await getServices();
    const importTypes: Array<{ text: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);
      const meta = service.meta ? service.meta.meta : {};

      if (meta && meta.imports) {
        const types = meta.imports.importTypes || [];

        for (const type of types) {
          importTypes.push({
            ...type,
            contentType: `${serviceName}:${type.contentType}`
          });
        }
      }
    }

    return importTypes;
  },

  /**
   * Import history list
   */
  async importHistories(
    _root,
    { type, ...args }: { page: number; perPage: number; type: string }
  ) {
    const filter: { [key: string]: any } = {};
    console.log('sdadjkslaj');

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
    const values = (await getImportCsvInfo(attachmentName)) as any;

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
      const results: any = await getCsvHeadersInfo(attachmentName);

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
    const exportTypes: Array<{ text: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);
      const meta = service.meta ? service.meta.meta : {};

      console.log(JSON.stringify(meta));

      if (meta && meta.imports) {
        const types = meta.imports.exportTypes || [];

        for (const type of types) {
          exportTypes.push({
            ...type,
            contentType: `${serviceName}:${type.contentType}`
          });
        }
      }
    }

    return exportTypes;
  }
};

export default importHistoryQueries;
