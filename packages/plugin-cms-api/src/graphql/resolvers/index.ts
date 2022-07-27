import customScalars from '@erxes/api-utils/src/customScalars';

export default function generateResolvers(serviceDiscovery) {
  return {
    ...customScalars
  };
}
