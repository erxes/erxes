import { Brands } from '../../db/models';

export default {
  __resolveReference({ _id }) {
    return Brands.findOne({ _id });
  }
};
