import { IContext } from "../../connectionResolver";
import { IFieldDocument, IFieldGroupDocument } from "../../models/definitions/fields";

export const field = {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Fields.findOne({ _id });
  },
  name(root: IFieldDocument) {
    return `erxes-form-field-${root._id}`;
  },

  lastUpdatedUser(root: IFieldDocument, _params, { coreModels }: IContext) {
    const { lastUpdatedUserId } = root;

    return coreModels.Users.findOne({ _id: lastUpdatedUserId });
  },

  associatedField(root: IFieldDocument, _params, { models }: IContext) {
    const { associatedFieldId } = root;

    // Returning field that associated with form field
    return models.Fields.findOne({ _id: associatedFieldId });
  },

  async groupName(root: IFieldDocument, _params, { models }: IContext) {
    const { groupId } = root;

    const group = await models.FieldsGroups.findOne({ _id: groupId });
    return group && group.name;
  }
};

export const fieldsGroup = {
  fields(root: IFieldGroupDocument, _params, { models }: IContext) {
    // Returning all fields that are related to the group
    return models.Fields.find({ groupId: root._id }).sort({ order: 1 });
  },

  lastUpdatedUser(fieldGroup: IFieldGroupDocument, _params, { coreModels }: IContext) {
    const { lastUpdatedUserId } = fieldGroup;

    return coreModels.Users.findOne({ _id: lastUpdatedUserId });
  }
};
