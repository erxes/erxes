import { Fields, FieldsGroups } from '../../../db/models';
import { IField, IFieldGroup } from '../../../db/models/definitions/fields';
import { IUserDocument } from '../../../db/models/definitions/users';
import { IOrderInput } from '../../../db/models/Fields';
import { moduleRequireLogin } from '../../permissions';

interface IFieldsEdit extends IField {
  _id: string;
}

interface IFieldsGroupsEdit extends IFieldGroup {
  _id: string;
}

const fieldMutations = {
  /**
   * Adds field object
   */
  fieldsAdd(_root, args: IField, { user }: { user: IUserDocument }) {
    return Fields.createField({ ...args, lastUpdatedUserId: user._id });
  },

  /**
   * Updates field object
   */
  fieldsEdit(_root, { _id, ...doc }: IFieldsEdit, { user }: { user: IUserDocument }) {
    return Fields.updateField(_id, { ...doc, lastUpdatedUserId: user._id });
  },

  /**
   * Remove a channel
   */
  fieldsRemove(_root, { _id }: { _id: string }) {
    return Fields.removeField(_id);
  },

  /**
   * Update field orders
   */
  fieldsUpdateOrder(_root, { orders }: { orders: IOrderInput[] }) {
    return Fields.updateOrder(orders);
  },

  /**
   * Update field's visible
   */
  fieldsUpdateVisible(
    _root,
    { _id, isVisible }: { _id: string; isVisible: boolean },
    { user }: { user: IUserDocument },
  ) {
    return Fields.updateFieldsVisible(_id, isVisible, user._id);
  },
};

const fieldsGroupsMutations = {
  /**
   * Create a new group for fields
   */
  fieldsGroupsAdd(_root, doc: IFieldGroup, { user }: { user: IUserDocument }) {
    return FieldsGroups.createGroup({ ...doc, lastUpdatedUserId: user._id });
  },

  /**
   * Update group for fields
   */
  fieldsGroupsEdit(_root, { _id, ...doc }: IFieldsGroupsEdit, { user }: { user: IUserDocument }) {
    return FieldsGroups.updateGroup(_id, {
      ...doc,
      lastUpdatedUserId: user._id,
    });
  },

  /**
   * Remove group
   */
  fieldsGroupsRemove(_root, { _id }: { _id: string }) {
    return FieldsGroups.removeGroup(_id);
  },

  /**
   * Update field group's visible
   */
  fieldsGroupsUpdateVisible(
    _root,
    { _id, isVisible }: { _id: string; isVisible: boolean },
    { user }: { user: IUserDocument },
  ) {
    return FieldsGroups.updateGroupVisible(_id, isVisible, user._id);
  },
};

moduleRequireLogin(fieldMutations);
moduleRequireLogin(fieldsGroupsMutations);

export { fieldsGroupsMutations, fieldMutations };
