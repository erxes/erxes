import { Forms } from '../../../db/models';

export default {
  forms(root, { limit }) {
    return Forms.find({}).limit(limit);
  },

  totalFormsCount() {
    return Forms.find({}).count();
  },
};
