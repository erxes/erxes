import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';

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
            contentType: `${serviceName}:${type.contentType}`
          });
        }
      }
    }

    return importExportTypes;
  },
  async historyGetExportableServices() {
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
            contentType: `${serviceName}:${type.contentType}`
          });
        }
      }
    }

    return importExportTypes;
  }
};
export default generalHistoryQueries;
