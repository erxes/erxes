import { Fields, FieldsGroups } from '../../../db/models';
import { IField, IFieldGroup } from '../../../db/models/definitions/fields';
import { IOrderInput } from '../../../db/models/Fields';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

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
  fieldsAdd(_root, args: IField, { user }: IContext) {
    return Fields.createField({ ...args, lastUpdatedUserId: user._id });
  },

  /**
   * Updates field object
   */
  fieldsEdit(_root, { _id, ...doc }: IFieldsEdit, { user }: IContext) {
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
  fieldsUpdateVisible(_root, { _id, isVisible }: { _id: string; isVisible: boolean }, { user }: IContext) {
    return Fields.updateFieldsVisible(_id, isVisible, user._id);
  },
};

const fieldsGroupsMutations = {
  /**
   * Create a new group for fields
   */
  fieldsGroupsAdd(_root, doc: IFieldGroup, { user }: IContext) {
    return FieldsGroups.createGroup({ ...doc, lastUpdatedUserId: user._id });
  },

  /**
   * Update group for fields
   */
  fieldsGroupsEdit(_root, { _id, ...doc }: IFieldsGroupsEdit, { user }: IContext) {
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
  fieldsGroupsUpdateVisible(_root, { _id, isVisible }: { _id: string; isVisible: boolean }, { user }: IContext) {
    return FieldsGroups.updateGroupVisible(_id, isVisible, user._id);
  },
};

moduleCheckPermission(fieldMutations, 'manageForms');
moduleCheckPermission(fieldsGroupsMutations, 'manageForms');

export { fieldsGroupsMutations, fieldMutations };
