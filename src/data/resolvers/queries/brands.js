import { Brands } from '../../../db/models';

export default {
  brands(root, { limit }) {
    const brands = Brands.find({});

    if (limit) {
      return brands.limit(limit);
    }

    return brands;
  },

  totalBrandsCount() {
    return Brands.find({}).count();
  },
};
