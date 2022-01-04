import { Brands, Integrations } from '../../db/models';
import { IBrandDocument } from '../../db/models/definitions/brands';

export default {
  __resolveReference({ _id }) {
    return Brands.findOne({ _id });
  },
  integrations(brand: IBrandDocument) {
    return Integrations.findIntegrations({ brandId: brand._id });
  }
};
