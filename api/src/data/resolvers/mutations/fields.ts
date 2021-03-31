import { Fields, FieldsGroups } from '../../../db/models';
import {
  IField,
  IFieldDocument,
  IFieldGroup
} from '../../../db/models/definitions/fields';
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

interface IFieldsBulkAddAndEditParams {
  contentType: string;
  contentTypeId: string;
  addingFields: IField[];
  editingFields: IFieldsEdit[];
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

  async fieldsBulkAddAndEdit(
    _root,
    args: IFieldsBulkAddAndEditParams,
    { user }: IContext
  ) {
    const { contentType, contentTypeId, addingFields, editingFields } = args;
    const temp: { [key: string]: string } = {};
    const response: IFieldDocument[] = [];
    const logicalFields: IField[] = [];

    if (!addingFields && !editingFields) {
      return;
    }

    for (const f of addingFields) {
      if (f.logics && f.logics.length > 0) {
        logicalFields.push(f);
        continue;
      }

      const tempId = f.tempFieldId;

      const field = await Fields.createField({
        ...f,
        contentType,
        contentTypeId,
        lastUpdatedUserId: user._id
      });

      if (tempId) {
        temp[tempId] = field._id;
      }
    }

    for (const f of logicalFields) {
      const logics = f.logics || [];

      for (const logic of logics) {
        if (f.logics && !logic.fieldId && logic.tempFieldId) {
          f.logics[logics.indexOf(logic)].fieldId = temp[logic.tempFieldId];
        }
      }

      const field = await Fields.createField({
        ...f,
        contentType,
        contentTypeId,
        lastUpdatedUserId: user._id
      });

      response.push(field);
    }

    for (const { _id, ...doc } of editingFields) {
      if (!doc.logics || doc.logics.length === 0) {
        continue;
      }

      for (const logic of doc.logics) {
        if (!logic.fieldId && logic.tempFieldId) {
          doc.logics[doc.logics.indexOf(logic)].fieldId =
            temp[logic.tempFieldId];
        }
      }

      const field = await Fields.updateField(_id, {
        ...doc,
        lastUpdatedUserId: user._id
      });
      response.push(field);
    }

    return response;
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
