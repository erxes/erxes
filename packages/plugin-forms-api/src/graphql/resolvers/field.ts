import { Users } from "../../apiCollections";
import { Fields, FieldsGroups } from "../../models";
import { IFieldDocument, IFieldGroupDocument } from "../../models/definitions/fields";

export const field = {
  name(root: IFieldDocument) {
    return `erxes-form-field-${root._id}`;
  },

  lastUpdatedUser(root: IFieldDocument) {
    const { lastUpdatedUserId } = root;

    return Users.findOne({ _id: lastUpdatedUserId });
  },

  associatedField(root: IFieldDocument) {
    const { associatedFieldId } = root;

    // Returning field that associated with form field
    return Fields.findOne({ _id: associatedFieldId });
  },

  async groupName(root: IFieldDocument) {
    const { groupId } = root;

    const group = await FieldsGroups.findOne({ _id: groupId });
    return group && group.name;
  }
};

export const fieldsGroup = {
  fields(root: IFieldGroupDocument) {
    // Returning all fields that are related to the group
    return Fields.find({ groupId: root._id }).sort({ order: 1 });
  },

  lastUpdatedUser(fieldGroup: IFieldGroupDocument) {
    const { lastUpdatedUserId } = fieldGroup;

    return Users.findOne({ _id: lastUpdatedUserId });
  }
};
