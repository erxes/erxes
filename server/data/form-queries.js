import { Forms, FormFields } from './connectors';

export default {
  RootQuery: {
    form(root, { formId }) {
      return Forms.findOne({ _id: formId }).then(form => ({
        title: form.title,
        fields: FormFields.find({ formId }).sort({ order: 1 }),
      }));
    },
  },
};
