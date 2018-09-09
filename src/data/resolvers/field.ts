import { Fields, Users } from '../../db/models';
import { IFieldDocument, IFieldGroupDocument } from '../../db/models/definitions/fields';

const Field = {
  lastUpdatedUser(field: IFieldDocument) {
    const { lastUpdatedUserId } = field;

    // Returning user who updated the field last
    return Users.findOne({ _id: lastUpdatedUserId });
  },
};

const FieldsGroup = {
  fields(fieldGroup: IFieldGroupDocument) {
    // Returning all fields that are related to the group
    return Fields.find({ groupId: fieldGroup._id });
  },

  lastUpdatedUser(fieldGroup: IFieldGroupDocument) {
    const { lastUpdatedUserId } = fieldGroup;

    // Returning user who updated the group last
    return Users.findOne({ _id: lastUpdatedUserId });
  },
};

export { Field, FieldsGroup };
