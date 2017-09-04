import { Brands } from '../../db/models';

export default {
  brand(integration) {
    return Brands.findOne({ _id: integration.brandId });
  },
};
