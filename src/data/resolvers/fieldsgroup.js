import { Fields, Users } from '../../db/models';

export default {
  getFields(FieldGroup) {
    // Returning all fields that are related to the group
    return Fields.find({ groupId: FieldGroup._id });
  },
  lastUpdatedBy(FieldGroup) {
    const { lastUpdatedBy } = FieldGroup;

    // Returning user who updated the group last
    return Users.findOne({ _id: lastUpdatedBy });
  },
};
