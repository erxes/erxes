import { IPropertyField, IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import validator from 'validator';
import { IModels } from '~/connectionResolvers';
import { fieldSchema } from '~/modules/properties/db/definitions/field';
import { IField, IFieldDocument } from '../../@types';
import { ORDER_GAP } from '../../constants';

export interface IFieldModel extends Model<IFieldDocument> {
  getField({ _id }: { _id: string }): Promise<IFieldDocument>;
  createField(doc: IField, user: IUserDocument): Promise<IFieldDocument>;
  updateField(
    _id: string,
    doc: IField,
    user: IUserDocument,
  ): Promise<IFieldDocument>;
  removeField(_id: string): Promise<IFieldDocument>;

  validateFieldValue(_id: string, value: any): Promise<any>;
  validateFieldValues(customFieldsData: any): Promise<any>;
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

      if (_id) {
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

    public static async validateFieldValue(_id: string, value: any) {
      const field = await models.Fields.getField({ _id });
      const group = await models.FieldsGroups.exists({ _id });

      if (group && value && Array.isArray(value)) {
        for (const fieldValue of value as Array<Record<string, any>>) {
          for (const [key, value] of Object.entries(fieldValue)) {
            await this.validateFieldValue(key, value);
          }
        }

        return value;
      }

      if (!field) {
        throw new Error(`Field not found with the _id of ${_id}`);
      }

      const { type, validations } = field;

      for (const key in validations) {
        const validation = validations[key];

        if (!validation) continue;

        // required
        if (key === 'required') {
          if (!value || !value.toString().trim()) {
            throw new Error(`${field.name}: required`);
          }
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

      return value;
    }

    public static async validateFieldValues(customFieldsData: IPropertyField) {
      for (const fieldName in customFieldsData) {
        const fieldValue = customFieldsData[fieldName];

        if (!fieldValue) {
          continue;
        }

        const field = await models.Fields.findOne({
          $or: [{ code: fieldName }, { _id: fieldName }],
        }).lean();

        const group = await models.FieldsGroups.findOne({
          _id: fieldName,
          isMultiple: true,
        }).lean();

        if (!field && !group) {
          continue;
        }

        const fieldId = group?._id || field?._id;

        if (!fieldId) {
          continue;
        }

        try {
          await this.validateFieldValue(fieldId.toString(), fieldValue);
        } catch (e) {
          throw new Error(e.message);
        }
      }
    }
  }

  fieldSchema.loadClass(Field);

  return fieldSchema;
};
