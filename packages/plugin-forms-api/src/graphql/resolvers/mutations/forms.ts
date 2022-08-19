import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IForm } from '../../../models/definitions/forms';

interface IFormsEdit extends IForm {
  _id: string;
}

interface IFormSubmission {
  contentType: string;
  contentTypeId: string;
  formSubmissions: { [key: string]: JSON };
  formId: string;
  userId?: string;
}

const formMutations = {
  /**
   * Create a new form
   */
  formsAdd(_root, doc: IForm, { user, docModifier, models }: IContext) {
    return models.Forms.createForm(docModifier(doc), user._id);
  },

  /**
   * Update a form data
   */
  formsEdit(_root, { _id, ...doc }: IFormsEdit, { models }: IContext) {
    return models.Forms.updateForm(_id, doc);
  },

  /**
   * Create a form submission data
   */
  async formSubmissionsSave(
    _root,
    {
      formId,
      contentTypeId,
      contentType,
      formSubmissions,
      userId
    }: IFormSubmission,
    { models }: IContext
  ) {
    const cleanedFormSubmissions = await models.Fields.cleanMulti(
      formSubmissions || {}
    );

    for (const formFieldId of Object.keys(cleanedFormSubmissions)) {
      const formSubmission = await models.FormSubmissions.findOne({
        contentTypeId,
        contentType,
        formFieldId
      });

      if (formSubmission) {
        formSubmission.value = cleanedFormSubmissions[formFieldId];

        formSubmission.save();
      } else {
        const doc = {
          contentTypeId,
          contentType,
          formFieldId,
          formId,
          userId,
          value: formSubmissions[formFieldId]
        };

        models.FormSubmissions.createFormSubmission(doc);
      }
    }

    return true;
  }
};

moduleCheckPermission(formMutations, 'manageForms');

export default formMutations;
