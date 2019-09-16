import { Fields, Forms, FormSubmissions } from '../../../db/models';
import { IForm } from '../../../db/models/definitions/forms';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IFormsEdit extends IForm {
  _id: string;
}

interface IFormSubmission {
  contentType: string;
  contentTypeId: string;
  formSubmissions: { [key: string]: string };
  formId: string;
}

const formMutations = {
  /**
   * Create a new form
   */
  formsAdd(_root, doc: IForm, { user, docModifier }: IContext) {
    return Forms.createForm(docModifier(doc), user._id);
  },

  /**
   * Update a form data
   */
  formsEdit(_root, { _id, ...doc }: IFormsEdit, { docModifier }: IContext) {
    return Forms.updateForm(_id, docModifier(doc));
  },

  /**
   * Create a form submission data
   */
  async formSubmissionsSave(
    _root,
    { formId, contentTypeId, contentType, formSubmissions }: IFormSubmission,
    { docModifier }: IContext,
  ) {
    const cleanedFormSubmissions = await Fields.cleanMulti(formSubmissions || {});

    for (const formFieldId of Object.keys(cleanedFormSubmissions)) {
      const formSubmission = await FormSubmissions.findOne({ contentTypeId, contentType, formFieldId });

      if (formSubmission) {
        formSubmission.value = cleanedFormSubmissions[formFieldId];

        formSubmission.save();
      } else {
        const doc = {
          contentTypeId,
          contentType,
          formFieldId,
          formId,
          value: formSubmissions[formFieldId],
        };

        FormSubmissions.createFormSubmission(docModifier(doc));
      }
    }

    return true;
  },
};

moduleCheckPermission(formMutations, 'manageForms');

export default formMutations;
