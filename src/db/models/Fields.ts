/*
 * Extra fields for form, customer, company
 */

import { Model, model } from 'mongoose';
import * as validator from 'validator';
import { Customers, Forms } from '.';
import { FIELD_CONTENT_TYPES } from '../../data/constants';
import {
  fieldGroupSchema,
  fieldSchema,
  IField,
  IFieldDocument,
  IFieldGroup,
  IFieldGroupDocument,
} from './definitions/fields';

export interface IOrderInput {
  _id: string;
  order: number;
}

interface IFieldModel extends Model<IFieldDocument> {
  checkIsDefinedByErxes(_id: string): never;
  createField(doc: IField): Promise<IFieldDocument>;
  updateField(_id: string, doc: IField): Promise<IFieldDocument>;
  removeField(_id: string): void;
  updateOrder(orders: IOrderInput[]): Promise<IFieldDocument[]>;
  clean(_id: string, _value: string | Date | number): string | Date | number;
  cleanMulti(data: { [key: string]: string }): any;

  updateFieldsVisible(_id: string, isVisible: boolean, lastUpdatedUserId: string): Promise<IFieldDocument>;
}

class Field {
  /* 
   * Check if Group is defined by erxes by default
   */
  public static async checkIsDefinedByErxes(_id: string) {
    const fieldObj = await Fields.findOne({ _id });

    // Checking if the field is defined by the erxes
    if (fieldObj && fieldObj.isDefinedByErxes) {
      throw new Error('Cant update this field');
    }
  }

  /* 
   * Create new field
   */
  public static async createField({ contentType, contentTypeId, groupId, ...fields }: IField) {
    const query: { [key: string]: any } = { contentType };

    if (groupId) {
      query.groupId = groupId;
    }

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    // form checks
    if (contentType === FIELD_CONTENT_TYPES.FORM) {
      if (!contentTypeId) {
        throw new Error('Content type id is required');
      }

      const form = await Forms.findOne({ _id: contentTypeId });

      if (!form) {
        throw new Error(`Form not found with _id of ${contentTypeId}`);
      }
    }

    // Generate order
    // if there is no field then start with 0
    let order = 0;

    const lastField = await Fields.findOne(query).sort({ order: -1 });

    if (lastField) {
      order = (lastField.order || 0) + 1;
    }

    return Fields.create({
      contentType,
      contentTypeId,
      order,
      groupId,
      isDefinedByErxes: false,
      ...fields,
    });
  }

  /*
   * Update field
   */
  public static async updateField(_id: string, doc: IField) {
    await this.checkIsDefinedByErxes(_id);

    await Fields.update({ _id }, { $set: doc });

    return Fields.findOne({ _id });
  }

  /*
   * Remove field
   */
  public static async removeField(_id: string) {
    const fieldObj = await Fields.findOne({ _id });

    if (!fieldObj) {
      throw new Error(`Field not found with id ${_id}`);
    }

    await this.checkIsDefinedByErxes(_id);

    // Removing field value from customer
    const index = `customFieldsData.${_id}`;

    await Customers.updateMany({ [index]: { $exists: true } }, { $unset: { [index]: 1 } });

    return fieldObj.remove();
  }

  /*
   * Update given fields orders
   */
  public static async updateOrder(orders: IOrderInput[]) {
    const ids: string[] = [];

    for (const { _id, order } of orders) {
      ids.push(_id);

      // update each fields order
      await Fields.update({ _id }, { order });
    }

    return Fields.find({ _id: { $in: ids } }).sort({ order: 1 });
  }

  /*
   * Validate per field according to it's validation and type
   * fixes values if necessary
   */
  public static async clean(_id: string, _value: string | Date | number) {
    const field = await Fields.findOne({ _id });

    let value = _value;

    if (!field) {
      throw new Error(`Field not found with the _id of ${_id}`);
    }

    const { type, validation } = field;

    // throw error helper
    const throwError = message => {
      throw new Error(`${field.text}: ${message}`);
    };

    // required
    if (field.isRequired && !value) {
      throwError('required');
    }

    if (value) {
      // email
      if ((type === 'email' || validation === 'email') && !validator.isEmail(value)) {
        throwError('Invalid email');
      }

      // number
      if (validation === 'number' && !validator.isFloat(value.toString())) {
        throwError('Invalid number');
      }

      // date
      if (validation === 'date') {
        if (!validator.isISO8601(value)) {
          throwError('Invalid date');
        }

        value = new Date(value);
      }
    }

    return value;
  }

  /*
   * Validates multiple fields, fixes values if necessary
   */
  public static async cleanMulti(data: { [key: string]: string }) {
    const ids = Object.keys(data);

    const fixedValues = {};

    // validate individual fields
    for (const _id of ids) {
      fixedValues[_id] = await this.clean(_id, data[_id]);
    }

    return fixedValues;
  }

  /**
   * Update single field's visible
   */
  public static async updateFieldsVisible(_id: string, isVisible: boolean, lastUpdatedUserId: string) {
    await this.checkIsDefinedByErxes(_id);

    // Updating visible
    await Fields.update({ _id }, { $set: { isVisible, lastUpdatedUserId } });

    return Fields.findOne({ _id });
  }
}

interface IFieldGroupModel extends Model<IFieldGroupDocument> {
  checkIsDefinedByErxes(_id: string): never;
  createGroup(doc: IFieldGroup): Promise<IFieldGroupDocument>;
  updateGroup(_id: string, doc: IFieldGroup): Promise<IFieldGroupDocument>;
  removeGroup(_id: string): Promise<string>;

  updateGroupVisible(_id: string, isVisible: boolean, lastUpdatedUserId: string): Promise<IFieldGroupDocument>;
}

class FieldGroup {
  /* 
   * Check if Group is defined by erxes by default
   */
  public static async checkIsDefinedByErxes(_id: string) {
    const groupObj = await FieldsGroups.findOne({ _id });

    // Checking if the group is defined by the erxes
    if (groupObj && groupObj.isDefinedByErxes) {
      throw new Error('Cant update this group');
    }
  }

  /* 
   * Create new field group
   */
  public static async createGroup(doc: IFieldGroup) {
    // Newly created group must be visible
    const isVisible = true;

    const { contentType } = doc;

    // Automatically setting order of group to the bottom
    let order = 0;

    const lastGroup = await FieldsGroups.findOne({ contentType }).sort({
      order: -1,
    });

    if (lastGroup) {
      order = (lastGroup.order || 0) + 1;
    }

    return FieldsGroups.create({
      ...doc,
      isVisible,
      order,
      isDefinedByErxes: false,
    });
  }

  /*
   * Update field group
   */
  public static async updateGroup(_id: string, doc: IFieldGroup) {
    // Can not edit group that is defined by erxes
    await this.checkIsDefinedByErxes(_id);

    await FieldsGroups.update({ _id }, { $set: doc });

    return FieldsGroups.findOne({ _id });
  }

  /**
   * Remove field group
   */
  public static async removeGroup(_id: string) {
    const groupObj = await FieldsGroups.findOne({ _id });

    if (!groupObj) {
      throw new Error(`Group not found with id of ${_id}`);
    }

    // Can not delete group that is defined by erxes
    await this.checkIsDefinedByErxes(_id);

    // Deleting fields that are associated with this group
    const fields = await Fields.find({ groupId: _id });

    for (const field of fields) {
      await Fields.removeField(field._id);
    }

    groupObj.remove();

    return _id;
  }

  /**
   * Update field group's visible
   */
  public static async updateGroupVisible(_id: string, isVisible: boolean, lastUpdatedUserId: string) {
    // Can not update group that is defined by erxes
    await this.checkIsDefinedByErxes(_id);

    // Updating visible
    await FieldsGroups.update({ _id }, { $set: { isVisible, lastUpdatedUserId } });

    return FieldsGroups.findOne({ _id });
  }
}

fieldGroupSchema.loadClass(FieldGroup);

export const FieldsGroups = model<IFieldGroupDocument, IFieldGroupModel>('fields_groups', fieldGroupSchema);

fieldSchema.loadClass(Field);

export const Fields = model<IFieldDocument, IFieldModel>('fields', fieldSchema);
