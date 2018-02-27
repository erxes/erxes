import { Fields, Users } from '../../db/models';

export default {
  Fields(FieldGroup) {
    // Returning all fields that are related to the group
    return Fields.find({ groupId: FieldGroup._id });
  },
  lastUpdatedBy(FieldGroup) {
    const { lastUpdatedUserId } = FieldGroup;

    // Returning user who updated the group last
    return Users.findOne({ _id: lastUpdatedUserId });
  },
};
