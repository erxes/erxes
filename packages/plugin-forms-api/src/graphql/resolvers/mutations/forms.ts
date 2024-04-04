import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendInboxMessage } from '../../../messageBroker';
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
  },

  formSubmissionsEdit: async (
    _root,
    params,
    { models, subdomain }: IContext
  ) => {
    const { contentTypeId, customerId, submissions } = params;

    const conversation = await sendInboxMessage({
      subdomain,
      action: 'findOne',
      data: {
        _id: contentTypeId,
        customerId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!conversation) {
      throw new Error('Form submission not found !');
    }

    for (const submission of submissions) {
      const { _id, value } = submission;
      await models.FormSubmissions.updateOne({ _id }, { $set: { value } });
    }

    const formSubmissions = await models.FormSubmissions.find({
      contentTypeId
    }).lean();

    return {
      ...conversation,
      contentTypeId: conversation._id,
      submissions: formSubmissions
    };
  },

  formSubmissionsRemove: async (
    _root,
    params,
    { models, subdomain }: IContext
  ) => {
    const { customerId, contentTypeId } = params;
    sendInboxMessage({
      subdomain,
      action: 'removeConversation',
      data: {
        _id: contentTypeId
      }
    });

    return models.FormSubmissions.remove({ customerId, contentTypeId });
  }
};

checkPermission(formMutations, 'formsAdd', 'manageForms');
checkPermission(formMutations, 'formsEdit', 'manageForms');
checkPermission(formMutations, 'formSubmissionsSave', 'manageForms');
checkPermission(formMutations, 'formSubmissionsEdit', 'manageForms');
checkPermission(formMutations, 'formSubmissionsRemove', 'manageForms');

export default formMutations;
