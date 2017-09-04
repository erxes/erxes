import { Forms } from '../../../db/models';

export default {
  forms(root, { limit }) {
    const forms = Forms.find({});

    if (limit) {
      return forms.limit(limit);
    }

    return forms;
  },

  totalFormsCount() {
    return Forms.find({}).count();
  },
};
