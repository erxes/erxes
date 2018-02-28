import { Users, Fields } from '../../db/models';

const Field = {
  lastUpdatedUser(Field) {
    const { lastUpdatedUserId } = Field;

    // Returning user who updated the field last
    return Users.findOne({ _id: lastUpdatedUserId });
  },
};

const FieldsGroup = {
  fields(FieldGroup) {
    // Returning all fields that are related to the group
    return Fields.find({ groupId: FieldGroup._id });
  },

  lastUpdatedUser(FieldGroup) {
    const { lastUpdatedUserId } = FieldGroup;

    // Returning user who updated the group last
    return Users.findOne({ _id: lastUpdatedUserId });
  },
};

export { Field, FieldsGroup };
