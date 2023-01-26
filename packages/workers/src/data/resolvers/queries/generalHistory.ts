import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';
import { fetchSegment } from '../../../messageBroker';

const generalHistoryQueries = {
  async historyGetTypes() {
    const services = await getServices();

    const importExportTypes: Array<{ text: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName, true);

      const meta = service.config?.meta || {};

      if (meta && meta.exporter) {
        const types = meta.exporter.importExportTypes || [];

        for (const type of types) {
          importExportTypes.push({
            ...type,
            contentType: `${serviceName}:${type.contentType}`,
            skipFilter: type.skipFilter || false
          });
        }
      }
    }

    return importExportTypes;
  },
  async historyPreviewCount(
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
  }
};
export default generalHistoryQueries;
