import { Brands } from '../../../db/models';

export default {
  brands(root, { limit }) {
    return Brands.find({}).limit(limit);
  },

  totalBrandsCount() {
    return Brands.find({}).count();
  },
};
