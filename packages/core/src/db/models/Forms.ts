import { nanoid } from 'nanoid';
import { Model, Query } from 'mongoose';
import validator from 'validator';

import {
  formSchema,
  formSubmissionSchema,
  IForm,
  IFormDocument,
  IFormSubmission,
  IFormSubmissionDocument,
} from './definitions/forms';
import { IModels } from '../../connectionResolver';

interface ISubmission {
  _id: string;
  value: any;
  type?: string;
  validation?: string;
}

interface IError {
  fieldId: string;
  code: string;
  text: string;
}

export interface IFormModel extends Model<IForm> {
  getForm(_id: string): Promise<IFormDocument>;
  generateCode(): string;
  createForm(
    doc: Omit<IForm, '_id' | 'createdUserId' | 'createdDate'>,
    createdUserId: string
  ): Promise<IFormDocument>;

  updateForm(
    _id,
    { title, description, buttonText }: Omit<IForm, '_id'>
  ): Promise<IFormDocument>;

  removeForm(_id: string): void;
  duplicate(_id: string, userId: string): Promise<IFormDocument>;
  increaseViewCount(formId: string, get?: boolean): Promise<IFormDocument>;
  increaseContactsGathered(
    formId: string,
    get?: boolean
  ): Promise<IFormDocument>;
  validateForm(formId: string, submissions: ISubmission[]): Promise<IError[]>;
  findLeadForms(query: any, args: any): Query<IFormDocument[], IFormDocument>;
}

export const loadFormClass = (models: IModels) => {
  class Form {
    public static async getForm(_id: string) {
      const form = await models.Forms.findOne({ _id });

      if (!form) {
        throw new Error('Form not found');
      }

      return form;
    }
    /**
     * Generates a random and unique 6 letter code
     */
    public static async generateCode() {
      let code;
      let foundForm = true;

      do {
        code = nanoid(6);
        foundForm = Boolean(await models.Forms.findOne({ code }));
      } while (foundForm);

      return code;
    }

    /**
     * Creates a form document
     */
    public static async createForm(
      doc: Omit<IForm, '_id' | 'createdUserId' | 'createdDate'>,
      createdUserId: string
    ) {
      doc.code = await this.generateCode();

      return models.Forms.create({
        ...doc,
        createdDate: new Date(),
        createdUserId,
      });
    }

    /**
     * Updates a form document
     */
    public static async updateForm(_id: string, doc: Omit<IForm, '_id'>) {
      await models.Forms.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.Forms.findOne({ _id });
    }

    /**
     * Remove a form
     */
    public static async removeForm(_id: string) {
      // remove fields
      await models.Fields.deleteMany({
        contentType: 'form',
        contentTypeId: _id,
      });

      return models.Forms.deleteOne({ _id });
    }

    /**
     * Duplicates form and form fields of the form
     */
    public static async duplicate(id: string, userId: string) {
      const form = await models.Forms.findOne({ _id: id }).lean();
      if (!form) throw new Error('Form not found');

      const { _id, leadData, ...formData } = form;
      // duplicate form ===================
      const newForm = await this.createForm(
        {
          ...formData,
          leadData: {
            ...leadData,
            viewCount: 0,
            contactsGathered: 0
          },
          type: form.type,
          name: `${form.name} duplicated`,
        },
        userId
      );

      // duplicate fields ===================
      const fields = await models.Fields.find({ contentTypeId: _id });

      for (const field of fields) {
        await models.Fields.createField({
          contentType: 'form',
          contentTypeId: newForm._id,
          type: field.type,
          validation: field.validation,
          text: field.text,
          description: field.description,
          options: field.options,
          isRequired: field.isRequired,
          order: field.order,
          optionsValues: field?.optionsValues,
        });
      }

      return newForm;
    }

    public static async increaseViewCount(formId: string, get = false) {
      const response = await models.Forms.updateOne(
        { _id: formId, leadData: { $exists: true } },
        { $inc: { 'leadData.viewCount': 1 } }
      );
      return get ? models.Forms.findOne({ formId }) : response;
    }

    public static async increaseContactsGathered(formId: string, get = false) {
      const response = await models.Forms.updateOne(
        { _id: formId, leadData: { $exists: true } },
        { $inc: { 'leadData.contactsGathered': 1 } }
      );
      return get ? models.Forms.findOne({ formId }) : response;
    }

    public static async validateForm(
      formId: string,
      submissions: ISubmission[]
    ) {
      const fields = await models.Fields.find({ contentTypeId: formId });
      const errors: Array<{ fieldId: string; code: string; text: string }> = [];

      for (const field of fields) {
        // find submission object by _id
        const submission = submissions.find((sub) => sub._id === field._id);

        if (!submission) {
          continue;
        }

        const value = submission.value || '';

        const type = field.type;
        const validation = field.validation;

        // required
        if (field.isRequired && !value) {
          errors.push({
            fieldId: field._id,
            code: 'required',
            text: 'Required',
          });
        }

        if (value) {
          // email
          if (
            (type === 'email' || validation === 'email') &&
            !validator.isEmail(value)
          ) {
            errors.push({
              fieldId: field._id,
              code: 'invalidEmail',
              text: 'Invalid email',
            });
          }

          // phone
          if (
            (type === 'phone' || validation === 'phone') &&
            !/^\d{8,}$/.test(value.replace(/[\s()+\-\.]|ext/gi, ''))
          ) {
            errors.push({
              fieldId: field._id,
              code: 'invalidPhone',
              text: 'Invalid phone',
            });
          }

          // number
          if (
            validation === 'number' &&
            !validator.isNumeric(value.toString())
          ) {
            errors.push({
              fieldId: field._id,
              code: 'invalidNumber',
              text: 'Invalid number',
            });
          }

          // date
          if (validation === 'date' && !validator.isISO8601(value)) {
            errors.push({
              fieldId: field._id,
              code: 'invalidDate',
              text: 'Invalid Date',
            });
          }

          // regex
          if (validation === 'regex') {
            const regex = new RegExp(field.regexValidation || '');

            if (!regex.test(value)) {
              errors.push({
                fieldId: field._id,
                code: 'invalidRegex',
                text: 'Invalid value',
              });
            }
          }
        }
      }

      return errors;
    }

    public static async findLeadForms(query: any, args: any) {
      const {
        sortField = 'createdDate',
        sortDirection = -1,
        page = 1,
        perPage = 20,
      } = args;

      return models.Forms.aggregate([
        { $match: query },
        {
          $project: {
            name: 1,
            title: 1,
            brandId: 1,
            tagIds: 1,
            formId: 1,
            type: 1,
            leadData: 1,
            createdUserId: 1,
            createdDate: 1,
            status: 1,
            integrationId: 1,
            visibility: 1,
            languageCode: 1,
            departmentIds: 1,
            code: 1,
          },
        },
        {
          $addFields: {
            'leadData.conversionRate': {
              $multiply: [
                {
                  $cond: [
                    { $eq: ['$leadData.viewCount', 0] },
                    0,
                    {
                      $divide: [
                        '$leadData.contactsGathered',
                        '$leadData.viewCount',
                      ],
                    },
                  ],
                },
                100,
              ],
            },
          },
        },
        { $sort: { [sortField]: sortDirection } },
        { $skip: perPage * (page - 1) },
        { $limit: perPage },
      ]);
    }
  }

  formSchema.loadClass(Form);

  return formSchema;
};

export interface IFormSubmissionModel extends Model<IFormSubmissionDocument> {
  createFormSubmission(doc: IFormSubmission): Promise<IFormSubmissionDocument>;
}

export const loadFormSubmissionClass = (models: IModels) => {
  class FormSubmission {
    /**
     * Creates a form document
     */
    public static async createFormSubmission(doc: IFormSubmission) {
      return models.FormSubmissions.create(doc);
    }
  }

  formSubmissionSchema.loadClass(FormSubmission);

  return formSubmissionSchema;
};
