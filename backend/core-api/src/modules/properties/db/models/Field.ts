import {
  propertyGroupIdFromKey,
  isPropertyGroupKey,
} from 'erxes-api-shared/core-modules';
import {
  ICustomField,
  ILocationOption,
  IPropertyField,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import validator from 'validator';
import { IModels } from '~/connectionResolvers';
import { fieldSchema } from '~/modules/properties/db/definitions/field';
import { IField, IFieldDocument } from '../../@types';

export interface IFieldValueValidationOptions {
  /** Also check the value against the shape its field type implies. */
  strict?: boolean;
}
import { ORDER_GAP } from '../../constants';

const RESERVED_ROW_KEYS = new Set(['_id']);

const MULTI_VALUE_TYPES = new Set(['multiSelect', 'check']);
const SINGLE_CHOICE_TYPES = new Set(['select', 'radio']);

const normalizeChoice = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/**
 * Check a value against the shape its field type implies.
 *
 * The `validations` map is opt-in and most fields leave it empty, so without
 * this a `date` field happily stores `тодорхойгүй` and a `select` field stores
 * an option that does not exist. Callers ask for it explicitly because
 * tightening every existing write path is a separate decision — today the
 * import path is the one that needs it.
 */
const validateValueShape = (field: IFieldDocument, value: any): void => {
  const { type, name } = field;

  if (type === 'number' && !validator.isFloat(String(value))) {
    throw new Error(`${name}: "${value}" is not a number`);
  }

  if (type === 'date' && isNaN(new Date(value).getTime())) {
    throw new Error(`${name}: "${value}" is not a date (expected YYYY-MM-DD)`);
  }

  if (type === 'boolean') {
    const accepted = ['true', 'false', 'yes', 'no', '1', '0'];

    if (!accepted.includes(normalizeChoice(value))) {
      throw new Error(`${name}: "${value}" is not true or false`);
    }
  }

  if (
    !SINGLE_CHOICE_TYPES.has(type || '') &&
    !MULTI_VALUE_TYPES.has(type || '')
  ) {
    return;
  }

  const options = (field.options || []).flatMap((option: any) =>
    typeof option === 'string'
      ? [normalizeChoice(option)]
      : [normalizeChoice(option?.value), normalizeChoice(option?.label)],
  );

  // A field with no options configured accepts anything.
  if (!options.filter(Boolean).length) {
    return;
  }

  const given = MULTI_VALUE_TYPES.has(type || '')
    ? (Array.isArray(value) ? value : String(value).split(',')).map(
        normalizeChoice,
      )
    : [normalizeChoice(value)];

  const unknownValue = given.find(
    (candidate) => candidate && !options.includes(candidate),
  );

  if (unknownValue) {
    throw new Error(
      `${name}: "${unknownValue}" is not one of ${(field.options || [])
        .map((option: any) =>
          typeof option === 'string' ? option : option?.label || option?.value,
        )
        .join(', ')}`,
    );
  }
};

export interface IFieldModel extends Model<IFieldDocument> {
  getField({ _id }: { _id: string }): Promise<IFieldDocument>;
  createField(doc: IField, user: IUserDocument): Promise<IFieldDocument>;
  updateField(
    _id: string,
    doc: IField,
    user: IUserDocument,
  ): Promise<IFieldDocument>;
  removeField(_id: string): Promise<IFieldDocument>;

  validateFieldValue(
    _id: string,
    value: any,
    options?: IFieldValueValidationOptions,
  ): Promise<any>;
  validateFieldValues(
    data: any,
    options?: IFieldValueValidationOptions,
  ): Promise<any>;

  generatePropertiesData(
    data: { [key: string]: any },
    contentType: string,
  ): Promise<{ propertiesData: IPropertyField }>;

  syncFieldValues({
    customFieldsData,
    propertiesData,
  }: {
    customFieldsData?: ICustomField[];
    propertiesData?: IPropertyField;
  }): Promise<{
    customFieldsData: ICustomField[];
    propertiesData: IPropertyField;
  }>;
}

export const loadFieldClass = (models: IModels) => {
  class Field {
    public static async getField({ _id }: { _id: string }) {
      const field = await models.Fields.findOne({ _id }).lean();

      if (!field) {
        throw new Error('Field not found');
      }

      return field;
    }

    public static async createField(doc: IField, user: IUserDocument) {
      await this.validateField(doc);

      const { contentType, contentTypeId, groupId } = doc;

      const order = await this.generateOrder({ contentType, contentTypeId });

      return models.Fields.create({
        ...doc,
        contentType,
        contentTypeId,
        order,
        groupId,
        isDefinedByErxes: false,
        createdBy: user._id,
      });
    }

    public static async updateField(
      _id: string,
      doc: IField,
      user: IUserDocument,
    ) {
      await this.validateField(doc, _id);

      return models.Fields.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeField(_id: string) {
      await this.validateField({} as IField, _id);

      await models.Customers.updateMany(
        { 'customFieldsData.field': _id },
        { $pull: { customFieldsData: { field: _id } } },
      );

      return await models.Fields.findOneAndDelete({ _id });
    }

    public static async generateOrder({
      contentType,
      contentTypeId,
    }: {
      contentType: string;
      contentTypeId?: string;
    }) {
      const query: { [key: string]: any } = { contentType };

      if (contentTypeId) {
        query.contentTypeId = contentTypeId;
      }

      const group = await models.Fields.findOne(query).sort({
        order: -1,
      });

      return (group?.order || 0) + ORDER_GAP;
    }

    public static async validateField(doc: IField, _id?: string) {
      const { code } = doc || {};

      if (code && _id) {
        const field = await models.Fields.getField({ _id });

        if (field.code !== code) {
          const field = await models.Fields.findOne({ code }).lean();

          if (field) {
            throw new Error('Field code already exists');
          }
        }
      }

      if (code && !_id) {
        const field = await models.Fields.findOne({ code }).lean();

        if (field) {
          throw new Error('Field code already exists');
        }
      }
    }

    public static async validateFieldValue(
      _id: string,
      value: any,
      options: IFieldValueValidationOptions = {},
    ) {
      const field = await models.Fields.findOne({ _id });
      const group = await models.FieldsGroups.exists({ _id });

      if (group && value && Array.isArray(value)) {
        const rows: Array<Record<string, any>> = [];
        const seenIds = new Set<string>();

        for (const row of value as Array<Record<string, any>>) {
          for (const [key, entryValue] of Object.entries(row)) {
            if (RESERVED_ROW_KEYS.has(key)) {
              continue;
            }

            await this.validateFieldValue(key, entryValue, options);
          }

          // rows migrated from v2 arrive without an id
          const rowId =
            typeof row._id === 'string' && row._id && !seenIds.has(row._id)
              ? row._id
              : nanoid();

          seenIds.add(rowId);
          rows.push({ ...row, _id: rowId });
        }

        return rows;
      }

      if (!field) {
        throw new Error(`Field not found with the _id of ${_id}`);
      }

      const { type, validations } = field;

      const isEmptyValue =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && !value.length);

      for (const key in validations) {
        const validation = validations[key];

        if (!validation) continue;

        // required
        if (key === 'required') {
          if (isEmptyValue || !value.toString().trim()) {
            throw new Error(`${field.name}: required`);
          }

          continue;
        }

        // clearing a field must not be rejected as malformed
        if (isEmptyValue) {
          continue;
        }

        // email
        if (key === 'email') {
          if (!validator.isEmail(value)) {
            throw new Error(`${field.name}: Invalid email`);
          }
        }

        // number
        if (key === 'number') {
          if (
            !['check', 'radio', 'select'].includes(type || '') &&
            !validator.isFloat(value.toString())
          ) {
            throw new Error(`${field.name}: Invalid number`);
          }
        }

        // date
        if (key === 'date') {
          const dateObj = new Date(value);

          if (isNaN(dateObj.getTime())) {
            throw new Error(`${field.name}: Invalid date`);
          }
        }
      }

      if (options.strict && !isEmptyValue) {
        validateValueShape(field, value);
      }

      return value;
    }

    public static async validateFieldValues(
      data: IPropertyField,
      options: IFieldValueValidationOptions = {},
    ) {
      const result: Record<string, any> = {};

      for (const fieldName in data) {
        const fieldValue = data[fieldName];

        if (!fieldValue) {
          continue;
        }

        const isGroup = isPropertyGroupKey(fieldName);

        const field = isGroup
          ? null
          : await models.Fields.findOne({
              $or: [{ code: fieldName }, { _id: fieldName }],
            }).lean();

        const group = isGroup
          ? await models.FieldsGroups.findOne({
              _id: propertyGroupIdFromKey(fieldName),
            }).lean()
          : null;

        // no longer repeating: keep its rows instead of dropping them
        if (group && !group.configs?.isMultiple) {
          result[fieldName] = fieldValue;
          continue;
        }

        if (!field && !group) {
          continue;
        }

        const fieldId = group?._id || field?._id;

        if (!fieldId) {
          continue;
        }

        try {
          result[fieldId] = await this.validateFieldValue(
            fieldId,
            fieldValue,
            options,
          );
        } catch (e) {
          throw new Error(e.message);
        }
      }

      return result;
    }

    public static async generatePropertiesData(
      data: { [key: string]: any },
      contentType: string,
    ) {
      const keys = Object.keys(data || {});

      let propertiesData: Record<string, any> = {};

      for (const key of keys) {
        const field = await models.Fields.findOne({
          contentType,
          $or: [{ code: key }, { _id: key }],
        }).lean();

        const value = data[key];

        if (field) {
          propertiesData[field._id] = value;
        }
      }

      propertiesData = await models.Fields.validateFieldValues(propertiesData);

      return { propertiesData };
    }

    public static async syncFieldValues({
      customFieldsData,
      propertiesData,
    }: {
      customFieldsData?: ICustomField[];
      propertiesData?: IPropertyField;
    }) {
      const result: {
        customFieldsData: ICustomField[];
        propertiesData: IPropertyField;
      } = {
        customFieldsData: [],
        propertiesData: {},
      };

      const mergedData: Record<string, any> = {};

      for (const customFieldData of customFieldsData || []) {
        const {
          field,
          value,
          stringValue,
          numberValue,
          dateValue,
          locationValue,
          extraValue,
        } = customFieldData;

        if (!field) {
          continue;
        }

        try {
          mergedData[field] =
            value ??
            stringValue ??
            numberValue ??
            dateValue ??
            locationValue ??
            extraValue;
        } catch (e) {
          throw new Error(e.message);
        }
      }

      for (const fieldName in propertiesData || {}) {
        if (!fieldName) {
          continue;
        }

        const fieldValue = propertiesData?.[fieldName];

        if (fieldValue === undefined) {
          continue;
        }

        mergedData[fieldName] = fieldValue;
      }

      for (const mergedItem in mergedData) {
        const mergedValue = mergedData[mergedItem];

        const isGroup = isPropertyGroupKey(mergedItem);

        const field = isGroup
          ? null
          : await models.Fields.findOne({
              $or: [{ _id: mergedItem }, { code: mergedItem }],
            }).lean();

        const group = isGroup
          ? await models.FieldsGroups.findOne({
              _id: propertyGroupIdFromKey(mergedItem),
              'configs.isMultiple': true,
            }).lean()
          : null;

        if (isGroup && !group) {
          result.propertiesData[mergedItem] = mergedValue;
          continue;
        }

        const fieldId = group?._id || field?._id;

        if (!fieldId) {
          const customFieldData = (customFieldsData || []).find(
            (item) => item.field === mergedItem,
          );

          if (!customFieldData) {
            continue;
          }

          result.customFieldsData.push(customFieldData);

          continue;
        }

        const values = {};

        const { type } = field || {};

        if (['text', 'textarea'].includes(type || '')) {
          values['stringValue'] = String(mergedValue);
        }

        if (type === 'number') {
          values['numberValue'] = Number(mergedValue);
        }

        if (type === 'date') {
          values['dateValue'] = mergedValue;
        }

        if (type === 'location') {
          const { lat, lng } = mergedValue as ILocationOption;

          values['stringValue'] = String(mergedValue);
          values['locationValue'] = { type: 'Point', coordinates: [lng, lat] };
        }

        result.customFieldsData.push({
          field: mergedItem,
          value: mergedValue,
          ...values,
        });
      }

      result.propertiesData = await models.Fields.validateFieldValues(
        mergedData,
      );

      return result;
    }
  }

  fieldSchema.loadClass(Field);

  return fieldSchema;
};
