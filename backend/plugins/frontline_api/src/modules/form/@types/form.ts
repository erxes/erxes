import { IForm } from '../db/definitions/forms';

export interface IFormsEdit extends IForm {
  _id: string;
}

export interface IFormSubmission {
  contentType: string;
  contentTypeId: string;
  formSubmissions: { [key: string]: JSON };
  formId: string;
  userId?: string;
}
