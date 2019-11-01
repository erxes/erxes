import * as Random from 'meteor-random';
import { Model, model } from 'mongoose';
import { FIELD_CONTENT_TYPES } from '../../data/constants';
import { Fields } from './';
import {
  formSchema,
  formSubmissionSchema,
  IForm,
  IFormDocument,
  IFormSubmission,
  IFormSubmissionDocument,
} from './definitions/forms';

export interface IFormModel extends Model<IFormDocument> {
  generateCode(): string;
  createForm(doc: IForm, createdUserId: string): Promise<IFormDocument>;

  updateForm(_id, { title, description, buttonText }: IForm): Promise<IFormDocument>;

  removeForm(_id: string): void;
  duplicate(_id: string): Promise<IFormDocument>;
}

export const loadFormClass = () => {
  class Form {
    /**
     * Generates a random and unique 6 letter code
     */
    public static async generateCode() {
      let code;
      let foundForm = true;

      do {
        code = Random.id().substr(0, 6);
        foundForm = (await Forms.findOne({ code })) ? true : false;
      } while (foundForm);

      return code;
    }

    /**
     * Creates a form document
     */
    public static async createForm(doc: IForm, createdUserId: string) {
      doc.code = await this.generateCode();

      return Forms.create({
        ...doc,
        createdDate: new Date(),
        createdUserId,
      });
    }

    /**
     * Updates a form document
     */
    public static async updateForm(_id: string, doc: IForm) {
      await Forms.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Forms.findOne({ _id });
    }

    /**
     * Remove a form
     */
    public static async removeForm(_id: string) {
      // remove fields
      await Fields.deleteMany({ contentType: 'form', contentTypeId: _id });

      return Forms.deleteOne({ _id });
    }

    /**
     * Duplicates form and form fields of the form
     */
    public static async duplicate(_id: string) {
      const form = await Forms.findOne({ _id });

      if (!form) {
        throw new Error('Form not found');
      }

      // duplicate form ===================
      const newForm = await this.createForm(
        {
          title: `${form.title} duplicated`,
          description: form.description,
          type: form.type,
        },
        form.createdUserId,
      );

      // duplicate fields ===================
      const fields = await Fields.find({ contentTypeId: _id });

      for (const field of fields) {
        await Fields.createField({
          contentType: FIELD_CONTENT_TYPES.FORM,
          contentTypeId: newForm._id,
          type: field.type,
          validation: field.validation,
          text: field.text,
          description: field.description,
          options: field.options,
          isRequired: field.isRequired,
          order: field.order,
        });
      }

      return newForm;
    }
  }

  formSchema.loadClass(Form);

  return formSchema;
};

export interface IFormSubmissionModel extends Model<IFormSubmissionDocument> {
  createFormSubmission(doc: IFormSubmission): Promise<IFormSubmissionDocument>;
}

export const loadFormSubmissionClass = () => {
  class FormSubmission {
    /**
     * Creates a form document
     */
    public static async createFormSubmission(doc: IFormSubmission) {
      return FormSubmissions.create(doc);
    }
  }

  formSubmissionSchema.loadClass(FormSubmission);

  return formSubmissionSchema;
};

loadFormClass();
loadFormSubmissionClass();

// tslint:disable-next-line
const Forms = model<IFormDocument, IFormModel>('forms', formSchema);

// tslint:disable-next-line
const FormSubmissions = model<IFormSubmissionDocument, IFormSubmissionModel>('form_submissions', formSubmissionSchema);

export { Forms, FormSubmissions };
