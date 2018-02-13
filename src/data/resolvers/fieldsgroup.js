import { Fields } from '../../db/models';

export default {
  getFields(FieldGroup) {
    return Fields.find({ groupId: FieldGroup._id });
  },
};
