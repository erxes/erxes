import { Users, Fields } from '../../db/models';

const Field = {
  lastUpdatedUser(field) {
    const { lastUpdatedUserId } = field;

    // Returning user who updated the field last
    return Users.findOne({ _id: lastUpdatedUserId });
  },
};

const FieldsGroup = {
  fields(fieldGroup) {
    // Returning all fields that are related to the group
    return Fields.find({ groupId: fieldGroup._id });
  },

  lastUpdatedUser(fieldGroup) {
    const { lastUpdatedUserId } = fieldGroup;

    // Returning user who updated the group last
    return Users.findOne({ _id: lastUpdatedUserId });
  },
};

export { Field, FieldsGroup };
