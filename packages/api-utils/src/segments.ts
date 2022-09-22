import { getService } from './serviceDiscovery';

export const getEsIndexByContentType = async (contentType: string) => {
  const [serviceName, type] = contentType.split(':');

  const service = await getService(serviceName, true);

  const segmentMeta = (service.config.meta || {}).segments;

  if (segmentMeta) {
    const { contentTypes } = segmentMeta;

    for (const contentType of contentTypes) {
      if (contentType.type === type && contentType.esIndex) {
        return contentType.esIndex;
      }
    }
  }

  return '';
};
