import { Fields, FieldsGroups } from '../../../db/models';
import { IField, IFieldGroup } from '../../../db/models/definitions/fields';
import { IOrderInput } from '../../../db/models/Fields';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IFieldsEdit extends IField {
  _id: string;
}

interface IUpdateVisibleParams {
  _id: string;
  isVisible?: boolean;
  isVisibleInDetail?: boolean;
}

interface IFieldsGroupsEdit extends IFieldGroup {
  _id: string;
}

const fieldMutations = {
  /**
   * Adds field object
   */
  async fieldsAdd(_root, args: IField, { user }: IContext) {
    const field = await Fields.createField({
      ...args,
      lastUpdatedUserId: user._id
    });

    await putCreateLog(
      {
        type: MODULE_NAMES.FIELD,
        newData: args,
        object: field
      },
      user
    );

    return field;
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
  fieldsUpdateVisible(
    _root,
    { _id, isVisible, isVisibleInDetail }: IUpdateVisibleParams,
    { user }: IContext
  ) {
    return Fields.updateFieldsVisible(
      _id,
      user._id,
      isVisible,
      isVisibleInDetail
    );
  }
};

const fieldsGroupsMutations = {
  /**
   * Create a new group for fields
   */
  fieldsGroupsAdd(_root, doc: IFieldGroup, { user, docModifier }: IContext) {
    return FieldsGroups.createGroup(
      docModifier({ ...doc, lastUpdatedUserId: user._id })
    );
  },

  /**
   * Update group for fields
   */
  fieldsGroupsEdit(
    _root,
    { _id, ...doc }: IFieldsGroupsEdit,
    { user }: IContext
  ) {
    return FieldsGroups.updateGroup(_id, {
      ...doc,
      lastUpdatedUserId: user._id
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
    { _id, isVisible, isVisibleInDetail }: IUpdateVisibleParams,
    { user }: IContext
  ) {
    return FieldsGroups.updateGroupVisible(
      _id,
      user._id,
      isVisible,
      isVisibleInDetail
    );
  }
};

moduleCheckPermission(fieldMutations, 'manageForms');
moduleCheckPermission(fieldsGroupsMutations, 'manageForms');

export { fieldsGroupsMutations, fieldMutations };
