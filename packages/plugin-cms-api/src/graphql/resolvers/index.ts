import customScalars from '@erxes/api-utils/src/customScalars';
import CmsCategory from './CmsCategory';

export default function generateResolvers(serviceDiscovery) {
  return {
    ...customScalars,
    CmsCategory
  };
}
