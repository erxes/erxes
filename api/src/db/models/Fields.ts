/*
 * Extra fields for form, customer, company
 */

import { Model, model } from 'mongoose';
import * as validator from 'validator';
import { Customers, Forms } from '.';
import {
  COMPANY_INFO,
  CONVERSATION_INFO,
  CUSTOMER_BASIC_INFO,
  DEVICE_PROPERTIES_INFO,
  FIELD_CONTENT_TYPES,
  PRODUCT_INFO,
  PROPERTY_GROUPS
} from '../../data/constants';
import { updateOrder } from './boardUtils';
import { FIELDS_GROUPS_CONTENT_TYPES } from './definitions/constants';
import {
  fieldGroupSchema,
  fieldSchema,
  IField,
  IFieldDocument,
  IFieldGroup,
  IFieldGroupDocument
} from './definitions/fields';

export interface IOrderInput {
  _id: string;
  order: number;
}

export interface ITypedListItem {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export const isValidDate = value => {
  if (
    (value && validator.isISO8601(value.toString())) ||
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(
      value.toString()
    ) ||
    value instanceof Date
  ) {
    return true;
  }

  return false;
};

export interface IFieldModel extends Model<IFieldDocument> {
  checkIsDefinedByErxes(_id: string): never;
  createField(doc: IField): Promise<IFieldDocument>;
  updateField(_id: string, doc: IField): Promise<IFieldDocument>;
  removeField(_id: string): void;
  updateOrder(orders: IOrderInput[]): Promise<IFieldDocument[]>;
  clean(_id: string, _value: string | Date | number): string | Date | number;
  cleanMulti(data: { [key: string]: any }): any;
  generateTypedListFromMap(data: { [key: string]: any }): ITypedListItem[];
  generateTypedItem(field: string, value: string, type: string): ITypedListItem;
  prepareCustomFieldsData(
    customFieldsData?: Array<{ field: string; value: any }>
  ): Promise<ITypedListItem[]>;
  updateFieldsVisible(
    _id: string,
    lastUpdatedUserId: string,
    isVisible?: boolean,
    isVisibleInDetail?: boolean
  ): Promise<IFieldDocument>;
  createSystemFields(
    groupId: string,
    contentType: string
  ): Promise<IFieldDocument[]>;
  generateCustomFieldsData(
    data: {
      [key: string]: any;
    },
    contentType: string
  ): Promise<any>;
}

export const loadFieldClass = () => {
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

    public static async checkCanToggleVisible(_id: string) {
      const fieldObj = await Fields.findOne({ _id });

      // Checking if the field is defined by the erxes
      if (fieldObj && !fieldObj.canHide) {
        throw new Error('Cant update this field');
      }
    }

    /*
     * Create new field
     */
    public static async createField({
      contentType,
      contentTypeId,
      groupId,
      groupName,
      ...fields
    }: IField) {
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

        if (groupName) {
          let group = await FieldsGroups.findOne({ name: groupName });

          if (!group) {
            group = await FieldsGroups.createGroup({
              name: groupName,
              contentType: 'form',
              isDefinedByErxes: false
            });
          }
          groupId = group._id;
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
        ...fields
      });
    }

    /*
     * Update field
     */
    public static async updateField(_id: string, doc: IField) {
      await this.checkIsDefinedByErxes(_id);
      const { groupName } = doc;

      if (groupName) {
        let group = await FieldsGroups.findOne({ name: groupName });

        if (!group) {
          group = await FieldsGroups.createGroup({
            name: groupName,
            contentType: 'form',
            isDefinedByErxes: false
          });
        }

        doc.groupId = group._id;
      }

      await Fields.updateOne({ _id }, { $set: doc });

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
      await Customers.updateMany(
        { [index]: { $exists: true } },
        { $unset: { [index]: 1 } }
      );

      // Removing form associated field
      await Fields.updateMany(
        { associatedFieldId: _id },
        { $unset: { associatedFieldId: '' } }
      );

      return fieldObj.remove();
    }

    /*
     * Update given fields orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(Fields, orders);
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
      if (field.isRequired && (!value || !value.toString().trim())) {
        throwError('required');
      }

      if (value) {
        // email
        if (
          (type === 'email' || validation === 'email') &&
          !validator.isEmail(value)
        ) {
          throwError('Invalid email');
        }

        // number
        if (
          !['check', 'radio', 'select'].includes(type || '') &&
          validation === 'number' &&
          !validator.isFloat(value.toString())
        ) {
          throwError('Invalid number');
        }

        // date
        if (validation === 'date') {
          if (!isValidDate(value)) {
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
    public static async cleanMulti(data: { [key: string]: any }) {
      const ids = Object.keys(data);
      const fixedValues = {};

      // validate individual fields
      for (const _id of ids) {
        fixedValues[_id] = await this.clean(_id, data[_id]);
      }

      return fixedValues;
    }

    public static generateTypedItem(
      field: string,
      value: string | number | string[],
      type: string
    ): ITypedListItem {
      let stringValue;
      let numberValue;
      let dateValue;

      if (value) {
        stringValue = value.toString();

        // number
        if (type !== 'check' && validator.isFloat(value.toString())) {
          numberValue = value;
          stringValue = null;
          value = Number(value);
        }

        if (isValidDate(value)) {
          dateValue = value;
          stringValue = null;
        }
      }
      return { field, value, stringValue, numberValue, dateValue };
    }

    public static generateTypedListFromMap(data: {
      [key: string]: any;
    }): ITypedListItem[] {
      const ids = Object.keys(data || {});
      return ids.map(_id => this.generateTypedItem(_id, data[_id], ''));
    }

    public static async prepareCustomFieldsData(
      customFieldsData?: Array<{ field: string; value: any }>
    ): Promise<ITypedListItem[]> {
      const result: ITypedListItem[] = [];

      for (const customFieldData of customFieldsData || []) {
        const field = await Fields.findById(customFieldData.field);

        await Fields.clean(customFieldData.field, customFieldData.value);

        result.push(
          Fields.generateTypedItem(
            customFieldData.field,
            customFieldData.value,
            field ? field.type || '' : ''
          )
        );
      }

      return result;
    }

    /**
     * Update single field's visible
     */
    public static async updateFieldsVisible(
      _id: string,
      lastUpdatedUserId: string,
      isVisible?: boolean,
      isVisibleInDetail?: boolean
    ) {
      await this.checkCanToggleVisible(_id);

      // Updating visible
      const set =
        isVisible !== undefined
          ? { isVisible, lastUpdatedUserId }
          : { isVisibleInDetail, lastUpdatedUserId };

      await Fields.updateOne({ _id }, { $set: set });

      return Fields.findOne({ _id });
    }

    public static async createSystemFields(
      groupId: string,
      contentType: string
    ) {
      switch (contentType) {
        case FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER:
          const customerFields = CUSTOMER_BASIC_INFO.ALL.map(e => ({
            text: e.label,
            type: e.field,
            canHide: e.canHide,
            validation: e.validation,
            groupId,
            contentType,
            isDefinedByErxes: true
          }));
          await Fields.insertMany(customerFields);
          break;
        case FIELDS_GROUPS_CONTENT_TYPES.COMPANY:
          const companyFields = COMPANY_INFO.ALL.map(e => ({
            text: e.label,
            type: e.field,
            canHide: e.canHide,
            validation: e.validation,
            groupId,
            contentType,
            isDefinedByErxes: true
          }));
          await Fields.insertMany(companyFields);
          break;
        case FIELDS_GROUPS_CONTENT_TYPES.PRODUCT:
          const productFields = PRODUCT_INFO.ALL.map(e => ({
            text: e.label,
            type: e.field,
            groupId,
            contentType,
            canHide: false,
            isDefinedByErxes: true
          }));
          await Fields.insertMany(productFields);
          break;
        case FIELDS_GROUPS_CONTENT_TYPES.CONVERSATION:
          const conversationFields = CONVERSATION_INFO.ALL.map(e => ({
            text: e.label,
            type: e.field,
            groupId,
            contentType,
            isDefinedByErxes: true
          }));
          await Fields.insertMany(conversationFields);
          break;
        case FIELDS_GROUPS_CONTENT_TYPES.DEVICE:
          const deviceFields = DEVICE_PROPERTIES_INFO.ALL.map(e => ({
            text: e.label,
            type: e.field,
            groupId,
            contentType,
            isDefinedByErxes: true
          }));
          await Fields.insertMany(deviceFields);
          break;
      }
    }

    public static async generateCustomFieldsData(
      data: { [key: string]: any },
      contentType: string
    ) {
      const keys = Object.keys(data || {});

      let customFieldsData: any = [];

      for (const key of keys) {
        const customField = await Fields.findOne({
          contentType,
          text: key
        });

        let value = data[key];

        if (customField) {
          if (customField.validation === 'date') {
            value = new Date(data[key]);
          }

          customFieldsData.push({
            field: customField._id,
            value
          });

          delete data[key];
        }
      }

      const trackedData = await this.generateTypedListFromMap(data);

      customFieldsData = await this.prepareCustomFieldsData(customFieldsData);

      return { customFieldsData, trackedData };
    }
  }

  fieldSchema.loadClass(Field);

  return fieldSchema;
};

export interface IFieldGroupModel extends Model<IFieldGroupDocument> {
  checkIsDefinedByErxes(_id: string): never;
  createGroup(doc: IFieldGroup): Promise<IFieldGroupDocument>;
  updateGroup(_id: string, doc: IFieldGroup): Promise<IFieldGroupDocument>;
  removeGroup(_id: string): Promise<string>;
  updateOrder(orders: IOrderInput[]): Promise<IFieldGroupDocument[]>;
  updateGroupVisible(
    _id: string,
    lastUpdatedUserId: string,
    isVisible?: boolean,
    isVisibleInDetail?: boolean
  ): Promise<IFieldGroupDocument>;
  createSystemGroupsFields(): Promise<IFieldGroupDocument[]>;
}

export const loadGroupClass = () => {
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
      let order = 1;

      const lastGroup = await FieldsGroups.findOne({ contentType }).sort({
        order: -1
      });

      if (lastGroup) {
        order = (lastGroup.order || 0) + 1;
      }

      return FieldsGroups.create({
        ...doc,
        isVisible,
        order,
        isDefinedByErxes: false
      });
    }

    /*
     * Update field group
     */
    public static async updateGroup(_id: string, doc: IFieldGroup) {
      // Can not edit group that is defined by erxes
      await this.checkIsDefinedByErxes(_id);

      await FieldsGroups.updateOne({ _id }, { $set: doc });

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

      await groupObj.remove();

      return _id;
    }

    /**
     * Update field group's visible
     */
    public static async updateGroupVisible(
      _id: string,
      lastUpdatedUserId: string,
      isVisible?: boolean,
      isVisibleInDetail?: boolean
    ) {
      // Can not update group that is defined by erxes
      await this.checkIsDefinedByErxes(_id);

      // Updating visible
      const set =
        isVisible !== undefined
          ? { isVisible, lastUpdatedUserId }
          : { isVisibleInDetail, lastUpdatedUserId };

      await FieldsGroups.updateOne({ _id }, { $set: set });

      return FieldsGroups.findOne({ _id });
    }

    /**
     * Create system fields & groups
     */
    public static async createSystemGroupsFields() {
      for (const group of PROPERTY_GROUPS) {
        if (['ticket', 'task', 'lead', 'visitor'].includes(group.value)) {
          continue;
        }

        for (const subType of group.types) {
          if (subType.value === 'deal') {
            continue;
          }

          const doc = {
            name: 'Basic information',
            contentType: subType.value,
            order: 0,
            isDefinedByErxes: true,
            description: `Basic information of a ${subType.value}`,
            isVisible: true
          };

          const existingGroup = await FieldsGroups.findOne({
            contentType: doc.contentType,
            isDefinedByErxes: true
          });

          if (existingGroup) {
            continue;
          }

          if (['ticket', 'task', 'lead', 'visitor'].includes(doc.contentType)) {
            continue;
          }

          const fieldGroup = await FieldsGroups.create(doc);

          await Fields.createSystemFields(fieldGroup._id, subType.value);
        }
      }
    }

    /*
     * Update given fieldsGroups orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(FieldsGroups, orders);
    }
  }

  fieldGroupSchema.loadClass(FieldGroup);

  return fieldGroupSchema;
};

loadFieldClass();
loadGroupClass();

// tslint:disable-next-line
export const FieldsGroups = model<IFieldGroupDocument, IFieldGroupModel>(
  'fields_groups',
  fieldGroupSchema
);

// tslint:disable-next-line
export const Fields = model<IFieldDocument, IFieldModel>('fields', fieldSchema);
