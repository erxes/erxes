import { fetchSegment } from '../../../messageBroker';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';
import { paginate } from '../../utils';
import { IContext } from '../../../connectionResolvers';

const exportHistoryQueries = {
  async exportHistoryGetTypes() {
    const services = await getServices();
    const exportTypes: Array<{ text: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);
      const meta = service.config?.meta || {};

      if (meta && meta.exporter) {
        const types = meta.exporter.exportTypes || [];

        for (const type of types) {
          exportTypes.push({
            ...type,
            contentType: `${serviceName}:${type.contentType}`
          });
        }
      }
    }

    return exportTypes;
  },

  /**
   * Export history list
   */
  async exportHistories(
    _root,
    { type, ...args }: { page: number; perPage: number; type: string },
    { models }: IContext
  ) {
    const filter: { [key: string]: any } = {};

    if (type) {
      filter['contentTypes.contentType'] = type;
    }

    const list = await paginate(models.ExportHistory.find(filter), args).sort({
      date: -1
    });

    const count = models.ExportHistory.find(filter).countDocuments();

    return { list, count };
  },

  async exportHistoryPreviewExportCount(
    _root,
    { segmentId }: { segmentId: string; contentType: string },
    { subdomain }
  ) {
    if (segmentId) {
      return fetchSegment(subdomain, segmentId, {
        returnCount: true,
        subdomain
      });
    }

    return 'All';
  },

  async exportHistoryGetExportableServices() {
    const services = await getServices();
    const exportTypes: Array<{ text: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);
      const meta = service.config?.meta || {};

      if (meta && meta.exporter) {
        const types = meta.exporter.exportTypes || [];

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

export default exportHistoryQueries;
