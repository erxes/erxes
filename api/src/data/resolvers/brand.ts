import { IBrandDocument } from '../../db/models/definitions/brands';
import { getDocumentList } from './mutations/cacheUtils';

export default {
  integrations(brand: IBrandDocument) {
    return getDocumentList('integrations', {
      brandId: brand._id,
      isActive: { $ne: false }
    });
  }
};
