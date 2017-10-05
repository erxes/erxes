import { Brands } from '../../db/models';

export default {
  brand(responseTemplate) {
    return Brands.findOne({ _id: responseTemplate.brandId });
  },
};
