import { Brands } from '../../../db/models';

export default {
  brands(root, { limit }) {
    const brands = Brands.find({});
    const sort = { createdAt: -1 };

    if (limit) {
      return brands.sort(sort).limit(limit);
    }

    return brands.sort(sort);
  },

  brandDetail(root, { _id }) {
    return Brands.findOne({ _id });
  },

  brandsTotalCount() {
    return Brands.find({}).count();
  },
};
