import * as Random from 'meteor-random';
import { Model, model } from 'mongoose';
import * as validator from 'validator';
import { IModels } from '../connectionResolver';
import {
  formSchema,
  formSubmissionSchema,
  IForm,
  IFormDocument,
  IFormSubmission,
  IFormSubmissionDocument
} from './definitions/forms';

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

export interface IFormModel extends Model<IFormDocument> {
  getForm(_id: string): Promise<IFormDocument>;
  generateCode(): string;
  createForm(doc: IForm, createdUserId: string): Promise<IFormDocument>;

  updateForm(
    _id,
    { title, description, buttonText }: IForm
  ): Promise<IFormDocument>;

  removeForm(_id: string): void;
  duplicate(_id: string): Promise<IFormDocument>;

  validate(formId: string, submissions: ISubmission[]): Promise<IError[]>;
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
        code = Random.id().substr(0, 6);
        foundForm = Boolean(await models.Forms.findOne({ code }));
      } while (foundForm);

      return code;
    }

    /**
     * Creates a form document
     */
    public static async createForm(doc: IForm, createdUserId: string) {
      doc.code = await this.generateCode();

      return models.Forms.create({
        ...doc,
        createdDate: new Date(),
        createdUserId
      });
    }

    /**
     * Updates a form document
     */
    public static async updateForm(_id: string, doc: IForm) {
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
        contentTypeId: _id
      });

      return models.Forms.deleteOne({ _id });
    }

    /**
     * Duplicates form and form fields of the form
     */
    public static async duplicate(_id: string) {
      const form = await models.Forms.getForm(_id);

      // duplicate form ===================
      const newForm = await this.createForm(
        {
          title: `${form.title} duplicated`,
          description: form.description,
          type: form.type
        },
        form.createdUserId
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
          order: field.order
        });
      }

      return newForm;
    }

    public static async validate(formId: string, submissions: ISubmission[]) {
      const fields = await models.Fields.find({ contentTypeId: formId });
      const errors: Array<{ fieldId: string; code: string; text: string }> = [];

      for (const field of fields) {
        // find submission object by _id
        const submission = submissions.find(sub => sub._id === field._id);

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
            text: 'Required'
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
              text: 'Invalid email'
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
              text: 'Invalid phone'
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
              text: 'Invalid number'
            });
          }

          // date
          if (validation === 'date' && !validator.isISO8601(value)) {
            errors.push({
              fieldId: field._id,
              code: 'invalidDate',
              text: 'Invalid Date'
            });
          }
        }
      }

      return errors;
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
