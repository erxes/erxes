import { Fields, FieldsGroups } from '../../db/models';
import {
  IFieldDocument,
  IFieldGroupDocument
} from '../../db/models/definitions/fields';
import { getDocument } from './mutations/cacheUtils';

export const field = {
  name(root: IFieldDocument) {
    return `erxes-form-field-${root._id}`;
  },

  lastUpdatedUser(root: IFieldDocument) {
    const { lastUpdatedUserId } = root;

    // Returning user who updated the field last
    return getDocument('users', { _id: lastUpdatedUserId });
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

    // Returning user who updated the group last
    return getDocument('users', { _id: lastUpdatedUserId });
  }
};
