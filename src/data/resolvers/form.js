import { FormFields } from '../../db/models';

export default {
  fields(form) {
    return FormFields.find({ formId: form._id }).sort({ order: 1 });
  },
};
