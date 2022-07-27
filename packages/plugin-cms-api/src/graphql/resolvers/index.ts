import customScalars from '@erxes/api-utils/src/customScalars';
import CmsTopic from './CmsTopic';
import CmsCategory from './CmsCategory';

export default function generateResolvers(serviceDiscovery) {
  return {
    ...customScalars,
    CmsTopic,
    CmsCategory
  };
}
