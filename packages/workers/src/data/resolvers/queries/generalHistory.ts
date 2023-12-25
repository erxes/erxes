import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';
import { fetchSegment } from '../../../messageBroker';

const generalHistoryQueries = {
  async historyGetTypes(_root, { type }: { type: string }) {
    const services = await getServices();

    const importExportTypes: Array<{ text: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName);

      const meta = service.config?.meta || {};

      if (
        meta &&
        ((type === 'export' && meta.exporter) ||
          (type === 'import' && meta.imports))
      ) {
        const types =
          type === 'export'
            ? meta.exporter.importExportTypes
            : meta.imports.importExportTypes || [];

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
