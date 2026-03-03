import { ILocationOption, IOrderInput } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import validator from 'validator';
import { fieldSchema, IField, IFieldDocument } from '../definitions/fields';
import { IModels } from '~/connectionResolvers';

export interface ITypedListItem {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
  locationValue?: ILocationOption;
  extraValue?: string;
}

export const isValidDate = (value) => {
  if (
    (value && validator.isISO8601(value.toString())) ||
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(
      value.toString(),
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
  checkHasValue(_id: string, contentType: string): never;
  createField(doc: IField): Promise<IFieldDocument>;
  updateField(_id: string, doc: IField): Promise<IFieldDocument>;
  removeField(_id: string): void;
  updateOrder(orders: IOrderInput[]): Promise<IFieldDocument[]>;
  clean(
    _id: string,
    _value: string | Date | number,
  ): Promise<string | Date | number>;
  cleanMulti(data: { [key: string]: any }): Promise<any>;
  generateTypedListFromMap(data: {
    [key: string]: any;
  }): Promise<ITypedListItem[]>;
  generateTypedItem(
    field: string,
    value: string,
    type: string,
    validation?: string,
    extraValue?: string,
  ): Promise<ITypedListItem>;
  prepareCustomFieldsData(
    customFieldsData?: Array<{ field: string; value: any }>,
  ): Promise<ITypedListItem[]>;
  updateFieldsVisible(
    _id: string,
    lastUpdatedUserId: string,
    isVisible?: boolean,
    isVisibleInDetail?: boolean,
  ): Promise<IFieldDocument>;
  createSystemFields(
    groupId: string,
    serviceName: string,
    type: string,
  ): Promise<IFieldDocument[]>;
  updateSystemFields(
    groupId: string,
    serviceName: string,
    type: string,
  ): Promise<IFieldDocument[]>;
  generateCustomFieldsData(
    data: {
      [key: string]: any;
    },
    contentType: string,
  ): Promise<any>;
}

export const loadFieldClass = (models: IModels, subdomain: string) => {
  class Field {
    static async checkCodeDuplication(code: string) {
      const group = await models.Fields.findOne({
        code,
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
        throw new Error("Can't update this field");
      }
    }

    public static async checkCanToggleVisible(_id: string) {
      const fieldObj = await models.Fields.findOne({ _id });

      // Checking if the field is defined by the erxes
      if (fieldObj && !fieldObj.canHide) {
        throw new Error("You can't update this field");
      }
    }

    /*
     * Check if there are any values for given field
     */
    public static async checkHasValue(_id: string, contentType: string) {
      const [serviceName, type] = contentType.split(':');
      return false;
      // const result = await sendCommonMessage({
      //   subdomain,
      //   serviceName,
      //   action: `${type}s.find`,
      //   data: {
      //     'customFieldsData.field': _id,
      //   },
      //   isRPC: true,
      //   defaultValue: [],
      // });

      // return result.length > 0;
    }

    /*
     * Create new field
     */
    public static async createField({
      contentType,
      contentTypeId,
      groupId,
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
        ...fields,
      });
    }

    /*
     * Update field
     */
    public static async updateField(_id: string, doc: IField) {
      await this.checkIsDefinedByErxes(_id);

      const field = await models.Fields.findOne({ _id });

      if (!field) {
        throw new Error('Field not found');
      }

      if (doc.code && field.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      if (
        field.contentType &&
        field.contentType !== 'form' &&
        (field.type !== doc.type ||
          (doc.validation && doc.validation !== field.validation))
      ) {
        const hasValue = await this.checkHasValue(_id, field.contentType);

        if (hasValue) {
          throw new Error(
            'Cant change type or validation of property with value',
          );
        }
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

      // await models.Customers.updateMany(
      //   { 'customFieldsData.field': _id },
      //   { $pull: { customFieldsData: { field: _id } } },
      // );

      // Removing form associated field
      await models.Fields.updateMany(
        { associatedFieldId: _id },
        { $unset: { associatedFieldId: '' } },
      );

      await fieldObj.deleteOne();
      return fieldObj;
    }

    /*
     * Update given fields orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      // return updateOrder(models.Fields, orders);
    }

    /*
     * Validate per field according to it's validation and type
     * fixes values if necessary
     */
    public static async clean(_id: string, value: any) {
      const field = await models.Fields.findOne({ _id });

      if (value && Array.isArray(value)) {
        for (const fieldValue of value as Array<Record<string, any>>) {
          for (const [key, value] of Object.entries(fieldValue)) {
            await this.clean(key, value);
          }
        }

        return value;
      }

      // let value = _value;

      if (!field) {
        throw new Error(`Field not found with the _id of ${_id}`);
      }

      const { type, validation } = field;

      // throw error helper
      const throwMsg = (message) => {
        return `${field.text}: ${message}`;
      };

      // required
      if (field.isRequired && (!value || !value.toString().trim())) {
        throw new Error(throwMsg('required'));
      }

      if (value) {
        // email
        if (
          (type === 'email' || validation === 'email') &&
          !validator.isEmail(value)
        ) {
          throw new Error(throwMsg('Invalid email'));
        }

        // number
        if (
          !['check', 'radio', 'select'].includes(type || '') &&
          validation === 'number' &&
          !validator.isFloat(value.toString())
        ) {
          throw new Error(throwMsg('Invalid number'));
        }

        // date
        if (validation === 'date') {
          value = new Date(value);

          if (!isValidDate(value)) {
            throw new Error(throwMsg('Invalid date'));
          }
        }

        // objectList
        if (type === 'objectList') {
          const { objectListConfigs = [] } = field;

          if (!objectListConfigs || !objectListConfigs.length) {
            throw new Error(throwMsg("Object List don't have any keys"));
          }

          const objects = value as any[];

          const validObjects: any[] = [];

          for (const object of objects) {
            const entries = Object.entries(object);
            const keys = objectListConfigs.map((configs) => configs.key);

            entries.map((e) => {
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
        try {
          fixedValues[_id] = await this.clean(_id, data[_id]);
        } catch (e) {
          console.log(
            `An error occured in CLEAN while cleanMulti: ${
              e.message
            } ::: customFieldData ::: ${JSON.stringify(data)}`,
          );
          continue;
        }
      }

      return fixedValues;
    }

    public static async generateTypedItem(
      fieldId: string,
      value: string | number | string[] | ILocationOption,
      type: string,
      validation?: string,
      extraValue?: string,
    ): Promise<ITypedListItem> {
      let stringValue;
      let numberValue;
      let dateValue;
      let locationValue;

      if (value) {
        stringValue = value.toString();

        // string
        if (type === 'input' && !validation) {
          numberValue = null;
          value = stringValue;
          return { field: fieldId, value, stringValue, numberValue, dateValue };
        }

        // number
        if (type !== 'check' && validator.isFloat(value.toString())) {
          numberValue = value;
          value = Number(value);
        }

        if (isValidDate(value)) {
          dateValue = value;
        }

        if (type === 'map') {
          const { lat, lng } = value as ILocationOption;

          stringValue = `${lng},${lat}`;
          locationValue = { type: 'Point', coordinates: [lng, lat] };
          return { field: fieldId, value, stringValue, locationValue };
        }
      }
      return {
        field: fieldId,
        value,
        stringValue,
        numberValue,
        dateValue,
        locationValue,
        extraValue,
      };
    }

    public static async generateTypedListFromMap(data: {
      [key: string]: any;
    }): Promise<ITypedListItem[]> {
      const ids = Object.keys(data || {});
      return Promise.all(
        ids.map((_id) => this.generateTypedItem(_id, data[_id], '')),
      );
    }

    public static async prepareCustomFieldsData(
      customFieldsData?: Array<{
        field: string;
        value: any;
        extraValue?: string;
      }>,
    ): Promise<ITypedListItem[]> {
      const result: ITypedListItem[] = [];

      for (const customFieldData of customFieldsData || []) {
        if (!customFieldData?.field) {
          continue;
        }

        const field = await models.Fields.findOne({
          $or: [
            { _id: customFieldData.field },
            { code: customFieldData.field },
          ],
        }).lean();

        if (!field) {
          continue;
        }

        const fieldId = field?._id;

        if (!fieldId) {
          continue;
        }

        try {
          await models.Fields.clean(fieldId, customFieldData.value);
        } catch (e) {
          throw new Error(e.message);
        }

        const customFieldDataItem = await models.Fields.generateTypedItem(
          fieldId,
          customFieldData.value,
          field ? field.type || '' : '',
          field?.validation,
          customFieldData?.extraValue,
        );
        result.push(customFieldDataItem);
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
      isVisibleInDetail?: boolean,
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
      serviceName: string,
      type: string,
    ) {
      // const fields = await sendCommonMessage({
      //   subdomain,
      //   serviceName,
      //   action: 'systemFields',
      //   data: {
      //     groupId,
      //     type,
      //   },
      //   isRPC: true,
      //   defaultValue: [],
      // });
      // await models.Fields.insertMany(fields);
    }
    public static async updateSystemFields(
      groupId: string,
      serviceName: string,
      type: string,
    ) {
      // const fields = await sendCommonMessage({
      //   subdomain,
      //   serviceName,
      //   action: 'systemFields',
      //   data: {
      //     groupId,
      //     type,
      //   },
      //   isRPC: true,
      //   defaultValue: [],
      // });

      const existingFields = await models.Fields.find({
        groupId: groupId,
        isDefinedByErxes: true,
      });

      // if (fields.length > existingFields.length) {
      //   const newFields: any[] = [];
      //   fields.map((x) => {
      //     const isExisted = existingFields.filter(
      //       (d) => d.text === x.text && d.type === x.type,
      //     );
      //     if (isExisted.length === 0) {
      //       newFields.push(x);
      //     }
      //   });
      //   await models.Fields.insertMany(newFields);
      // }
    }
    public static async generateCustomFieldsData(
      data: { [key: string]: any },
      contentType: string,
    ) {
      const keys = Object.keys(data || {});

      let customFieldsData: any = [];

      for (const key of keys) {
        const customField = await models.Fields.findOne({
          contentType,
          code: key,
        }).lean();

        let value = data[key];

        if (customField) {
          if (customField.validation === 'date') {
            value = new Date(data[key]);
          }

          customFieldsData.push({
            field: customField._id,
            value,
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
