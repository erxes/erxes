import { Forms } from '../../../db/models';

export default {
  forms(root, { limit }) {
    const forms = Forms.find({});
    const sort = { name: 1 };

    if (limit) {
      return forms.sort(sort).limit(limit);
    }

    return forms.sort(sort);
  },

  formDetail(root, { _id }) {
    return Forms.findOne({ _id });
  },

  totalFormsCount() {
    return Forms.find({}).count();
  },
};
