import { Model } from 'mongoose';
import * as validator from 'validator';
import { IModels } from '../connectionResolver';
import { sendCommonMessage, sendContactsMessage } from '../messageBroker';
import { updateOrder, IOrderInput } from '@erxes/api-utils/src/commonUtils';
import {
  fieldGroupSchema,
  fieldSchema,
  IField,
  IFieldDocument,
  IFieldGroup,
  IFieldGroupDocument
} from './definitions/fields';
import configs, { serviceDiscovery } from '../configs';

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
  checkCodeDuplication(code: string): string;
  checkIsDefinedByErxes(_id: string): never;
  createField(doc: IField): Promise<IFieldDocument>;
  updateField(_id: string, doc: IField): Promise<IFieldDocument>;
  removeField(_id: string): void;
  updateOrder(orders: IOrderInput[]): Promise<IFieldDocument[]>;
  clean(_id: string, _value: string | Date | number): string | Date | number;
  cleanMulti(data: { [key: string]: any }): any;
  generateTypedListFromMap(data: { [key: string]: any }): ITypedListItem[];
  generateTypedItem(
    field: string,
    value: string,
    type: string,
    validation?: string
  ): ITypedListItem;
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
    serviceName: string
  ): Promise<IFieldDocument[]>;
  generateCustomFieldsData(
    data: {
      [key: string]: any;
    },
    contentType: string
  ): Promise<any>;
}

export const loadFieldClass = (models: IModels, subdomain: string) => {
  class Field {
    static async checkCodeDuplication(code: string) {
      const group = await models.Fields.findOne({
        code
      });

      if (group) {
        throw new Error('Code must be unique');
      }
    }
    /*
     * Check if Group is defined by erxes by default
     */
    public static async checkIsDefinedByErxes(_id: string) {
      const fieldObj = await models.Fields.findOne({ _id });

      // Checking if the field is defined by the erxes
      if (fieldObj && fieldObj.isDefinedByErxes) {
        throw new Error('Cant update this field');
      }
    }

    public static async checkCanToggleVisible(_id: string) {
      const fieldObj = await models.Fields.findOne({ _id });

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
      if (fields.code) {
        await this.checkCodeDuplication(fields.code || '');
      }

      const query: { [key: string]: any } = { contentType };

      if (groupId) {
        query.groupId = groupId;
      }

      if (contentTypeId) {
        query.contentTypeId = contentTypeId;
      }

      if (groupName) {
        let group = await models.FieldsGroups.findOne({ name: groupName });

        if (!group) {
          group = await models.FieldsGroups.createGroup({
            name: groupName,
            contentType,
            isDefinedByErxes: false
          });
        }

        groupId = group._id;
      }

      // Generate order
      // if there is no field then start with 0
      let order = 0;

      const lastField = await models.Fields.findOne(query).sort({ order: -1 });

      if (lastField) {
        order = (lastField.order || 0) + 1;
      }

      return models.Fields.create({
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
        let group = await models.FieldsGroups.findOne({ name: groupName });

        if (!group) {
          group = await models.FieldsGroups.createGroup({
            name: groupName,
            contentType: 'form',
            isDefinedByErxes: false
          });
        }

        doc.groupId = group._id;
      }

      const field = await models.Fields.findOne({ _id });

      if (doc.code && field && field.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      await models.Fields.updateOne({ _id }, { $set: doc });

      return models.Fields.findOne({ _id });
    }

    /*
     * Remove field
     */
    public static async removeField(_id: string) {
      const fieldObj = await models.Fields.findOne({ _id });

      if (!fieldObj) {
        throw new Error(`Field not found with id ${_id}`);
      }

      await this.checkIsDefinedByErxes(_id);

      // Removing field value from customer
      await sendContactsMessage({
        subdomain,
        action: 'customers.updateMany',
        data: {
          selector: {
            'customFieldsData.field': _id
          },
          modifier: {
            $pull: { customFieldsData: { field: _id } }
          }
        }
      });

      // Removing form associated field
      await models.Fields.updateMany(
        { associatedFieldId: _id },
        { $unset: { associatedFieldId: '' } }
      );

      return fieldObj.remove();
    }

    /*
     * Update given fields orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(models.Fields, orders);
    }

    /*
     * Validate per field according to it's validation and type
     * fixes values if necessary
     */
    public static async clean(
      _id: string,
      _value: string | Date | number | any
    ) {
      const field = await models.Fields.findOne({ _id });

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

        // objectList
        if (type === 'objectList') {
          const { objectListConfigs = [] } = field;

          if (!objectListConfigs || !objectListConfigs.length) {
            throwError("Object List don't have any keys");
          }

          const objects = value as any[];

          const validObjects: any[] = [];

          for (const object of objects) {
            const entries = Object.entries(object);
            const keys = objectListConfigs.map(configs => configs.key);

            entries.map(e => {
              const key = e[0];

              if (!keys.includes(key)) {
                delete object[key];
              }
            });

            validObjects.push(object);
          }

          value = validObjects;
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
      type: string,
      validation?: string
    ): ITypedListItem {
      let stringValue;
      let numberValue;
      let dateValue;

      if (value) {
        stringValue = value.toString();

        // string
        if (type === 'input' && !validation) {
          numberValue = null;
          value = stringValue;
          return { field, value, stringValue, numberValue, dateValue };
        }

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
        const field = await models.Fields.findOne({
          $or: [{ _id: customFieldData.field }, { code: customFieldData.field }]
        }).lean();

        if (!field) {
          continue;
        }

        try {
          await models.Fields.clean(field._id, customFieldData.value);
        } catch (e) {
          throw new Error(e.message);
        }
        result.push(
          models.Fields.generateTypedItem(
            field._id,
            customFieldData.value,
            field ? field.type || '' : '',
            field?.validation
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

      await models.Fields.updateOne({ _id }, { $set: set });

      return models.Fields.findOne({ _id });
    }

    public static async createSystemFields(
      groupId: string,
      serviceName: string
    ) {
      const fields = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'systemFields',
        data: {
          groupId
        },
        isRPC: true,
        defaultValue: []
      });

      await models.Fields.insertMany(fields);
    }

    public static async generateCustomFieldsData(
      data: { [key: string]: any },
      contentType: string
    ) {
      const keys = Object.keys(data || {});

      let customFieldsData: any = [];

      for (const key of keys) {
        const customField = await models.Fields.findOne({
          contentType,
          code: key
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
  checkCodeDuplication(code: string): string;
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

export const loadGroupClass = (models: IModels) => {
  class FieldGroup {
    static async checkCodeDuplication(code: string) {
      const group = await models.FieldsGroups.findOne({
        code
      });

      if (group) {
        throw new Error('Code must be unique');
      }
    }
    /*
     * Check if Group is defined by erxes by default
     */
    public static async checkIsDefinedByErxes(_id: string) {
      const groupObj = await models.FieldsGroups.findOne({ _id });

      // Checking if the group is defined by the erxes
      if (groupObj && groupObj.isDefinedByErxes) {
        throw new Error('Cant update this group');
      }
    }

    /*
     * Create new field group
     */
    public static async createGroup(doc: IFieldGroup) {
      if (doc.code) {
        await this.checkCodeDuplication(doc.code || '');
      }

      // Newly created group must be visible
      const isVisible = true;

      const { contentType } = doc;

      // Automatically setting order of group to the bottom
      let order = 1;

      const lastGroup = await models.FieldsGroups.findOne({ contentType }).sort(
        {
          order: -1
        }
      );

      if (lastGroup) {
        order = (lastGroup.order || 0) + 1;
      }

      return models.FieldsGroups.create({
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
      const group = await models.FieldsGroups.findOne({ _id });

      if (doc.code && group && group.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      // Can not edit group that is defined by erxes
      await this.checkIsDefinedByErxes(_id);

      await models.FieldsGroups.updateOne({ _id }, { $set: doc });

      return models.FieldsGroups.findOne({ _id });
    }

    /**
     * Remove field group
     */
    public static async removeGroup(_id: string) {
      const groupObj = await models.FieldsGroups.findOne({ _id });

      if (!groupObj) {
        throw new Error(`Group not found with id of ${_id}`);
      }

      // Can not delete group that is defined by erxes
      await this.checkIsDefinedByErxes(_id);

      // Deleting fields that are associated with this group
      const fields = await models.Fields.find({ groupId: _id });

      for (const field of fields) {
        await models.Fields.removeField(field._id);
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

      await models.FieldsGroups.updateOne({ _id }, { $set: set });

      return models.FieldsGroups.findOne({ _id });
    }

    /**
     * Create system fields & groups
     */
    public static async createSystemGroupsFields() {
      const services = await serviceDiscovery.getServices();

      for (const serviceName of services) {
        const service = await serviceDiscovery.getService(serviceName, true);
        const meta = service.config?.meta || {};

        if (meta && meta.forms && meta.forms.systemFieldsAvailable) {
          const types = meta.forms.types || [];

          for (const type of types) {
            const contentType = `${serviceName}:${type.type}`;

            const doc = {
              name: 'Basic information',
              contentType,
              order: 0,
              isDefinedByErxes: true,
              description: `Basic information of a ${type.type}`,
              isVisible: true
            };

            const existingGroup = await models.FieldsGroups.findOne({
              contentType: doc.contentType,
              isDefinedByErxes: true
            });

            if (existingGroup) {
              continue;
            }

            const fieldGroup = await models.FieldsGroups.create(doc);

            await models.Fields.createSystemFields(fieldGroup._id, serviceName);
          }
        }
      }
    }

    /*
     * Update given fieldsGroups orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(models.FieldsGroups, orders);
    }
  }

  fieldGroupSchema.loadClass(FieldGroup);

  return fieldGroupSchema;
};
