import { Forms, FormFields } from '../../../db/models';

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

  formFields(root, { formId }) {
    return FormFields.find({ formId });
  },
};
