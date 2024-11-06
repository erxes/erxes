import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendInboxMessage } from '../../../messageBroker';
import { IForm } from '../../../db/models/definitions/forms';
import { registerOnboardHistory } from '../../utils';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

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
  async formsAdd(
    _root,
    doc: IForm,
    { user, docModifier, models, subdomain }: IContext
  ) {
    await registerOnboardHistory({ models, type: 'formCreate', user });
    let document = docModifier(doc);

    if (doc.type === 'lead') {
      if (!Object.keys(document.leadData).length) {
        throw new Error('leadData must be supplied');
      }

      document.leadData = {
        ...document.leadData,
        viewCount: 0,
        contactsGathered: 0,
      };
    }

    return models.Forms.createForm(document, user._id);
  },

  /**
   * Update a form data
   */
  async formsEdit(_root, { _id, ...doc }: IFormsEdit, { models }: IContext) {
    return models.Forms.updateForm(_id, doc);
  },

  /**
   * Duplicate a form
   */

  async formsDuplicate(
    _root,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext
  ) {
    const form = await models.Forms.duplicate(_id, user._id);

    if (isEnabled('inbox')) {
      const integration = await sendInboxMessage({
        subdomain,
        action: 'integrations.copyLeadIntegration',
        data: { _id: form.integrationId, userId: user._id },
        isRPC: true,
        defaultValue: null,
      });

      if (integration) {
        form.integrationId = integration._id;
        form.save();
      }
    }

    return form;
  },

  /**
   * Remove a form
   */
  async formsRemove(_root, { _id }: { _id: string }, { models, subdomain }: IContext) {
    const form = await models.Forms.getForm(_id);

    if (isEnabled('inbox')) {
      sendInboxMessage({
        subdomain,
        action: 'integrations.remove',
        data: { _id: form.integrationId },
      });
    }

    await models.Fields.deleteMany({ contentTypeId: _id })
    await models.FormSubmissions.deleteMany({ formId: _id })

    return models.Forms.removeForm(_id);
  },

  async formsToggleStatus(_root, { _id }: { _id: string; status: boolean }, { models }: IContext) {
    const form = await models.Forms.getForm(_id);
    const status = form.status === 'active' ? 'archived' : 'active';

    form.status = status;

    form.save();
    return form;
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
      userId,
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
        formFieldId,
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
          value: formSubmissions[formFieldId],
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
        customerId,
      },
      isRPC: true,
      defaultValue: null,
    });

    if (!conversation) {
      throw new Error('Form submission not found !');
    }

    for (const submission of submissions) {
      const { _id, value } = submission;
      await models.FormSubmissions.updateOne({ _id }, { $set: { value } });
    }

    const formSubmissions = await models.FormSubmissions.find({
      contentTypeId,
    }).lean();

    return {
      ...conversation,
      contentTypeId: conversation._id,
      submissions: formSubmissions,
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
        _id: contentTypeId,
      },
    });

    return models.FormSubmissions.deleteOne({ customerId, contentTypeId });
  },
};

checkPermission(formMutations, 'formsAdd', 'manageForms');
checkPermission(formMutations, 'formsEdit', 'manageForms');
checkPermission(formMutations, 'formsRemove', 'manageForms');
checkPermission(formMutations, 'formsDuplicate', 'manageForms');
checkPermission(formMutations, 'formSubmissionsSave', 'manageForms');
checkPermission(formMutations, 'formSubmissionsEdit', 'manageForms');
checkPermission(formMutations, 'formSubmissionsRemove', 'manageForms');

export default formMutations;
