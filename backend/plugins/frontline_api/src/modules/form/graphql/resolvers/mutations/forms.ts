import { markResolvers } from 'erxes-api-shared/utils';
import { AnyBulkWriteOperation } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { IFormSubmission } from '~/modules/form/@types/form';
import { IForm } from '~/modules/form/db/definitions/forms';

export const formMutations = {
  /**
   * Create a new form
   */
  formsAdd: async (_root: unknown, doc: IForm, { user, models }: IContext) => {
    // await registerOnboardHistory({ models, type: 'formCreate', user });

    if (doc.type === 'lead') {
      if (doc.leadData && !Object.keys(doc.leadData).length) {
        throw new Error('leadData must be supplied');
      }

      doc.leadData = {
        ...doc.leadData,
        viewCount: 0,
        contactsGathered: 0,
      };
    }
    console.log('createForm');
    return await models.Forms.createForm(doc, user._id);
  },

  /**
   * Update a form data
   */
  formsEdit: async (
    _root: undefined,
    { _id, ...doc }: IForm,
    { models }: IContext,
  ) => {
    return models.Forms.updateForm(_id, doc);
  },

  /**
   * Duplicate a form
   */

  formsDuplicate: async (
    _root: undefined,
    { _id: id }: { _id: string },
    { models, user }: IContext,
  ) => {
    const form = await models.Forms.duplicate(id, user._id);
    const _id = form.integrationId || '';
    const userId = user._id;

    const newIntegration = await models.Integrations.duplicateLeadIntegration(
      _id,
      userId,
    );

    const newForm = await models.Forms.findOneAndUpdate(
      { _id: form._id },
      { $set: { integrationId: newIntegration._id } },
      { new: true },
    );
    return newForm;
  },

  /**
   * Remove a form
   */
  formsRemove: async (
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) => {
    const integrationIds: string[] = await models.Forms.find({
      _id: { $in: _ids },
    }).distinct('integrationId');

    if (integrationIds?.length) {
      await models.Integrations.removeIntegrations(integrationIds);
    }

    await models.Fields.deleteMany({ contentTypeId: { $in: _ids } });
    await models.FormSubmissions.deleteMany({ formId: { $in: _ids } });

    await models.Forms.deleteMany({ _id: { $in: _ids } });

    return _ids;
  },

  formsToggleStatus: async (
    _root: undefined,
    { _ids, status }: { _ids: string[]; status?: string },
    { models }: IContext,
  ) => {
    const forms = await models.Forms.find({ _id: { $in: _ids } });
    const _forms: AnyBulkWriteOperation<IForm>[] = [];

    forms.forEach((form) => {
      const newStatus = status
        ? status
        : form.status === 'active'
        ? 'archived'
        : 'active';

      _forms.push({
        updateOne: {
          filter: { _id: form._id },
          update: { $set: { status: newStatus } },
        },
      });
    });

    await models.Forms.bulkWrite(_forms);
  },

  /**
   * Create a form submission data
   */
  formSubmissionsSave: async (
    _root: undefined,
    {
      formId,
      contentTypeId,
      contentType,
      formSubmissions,
      userId,
    }: IFormSubmission,
    { models }: IContext,
  ) => {
    const cleanedFormSubmissions = await models.Fields.cleanMulti(
      formSubmissions || {},
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

        await models.FormSubmissions.createFormSubmission(doc);
      }
    }

    return true;
  },

  formSubmissionsEdit: async (
    _root: undefined,
    params,
    { models }: IContext,
  ) => {
    const { contentTypeId, customerId, submissions } = params;

    const conversation = await models.Conversations.findOne({
      _id: contentTypeId,
      customerId,
    }).lean();

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
      contentTypeId: conversation._id.toString(),
      submissions: formSubmissions || [],
    };
  },

  formSubmissionsRemove: async (
    _root: undefined,
    params,
    { models }: IContext,
  ) => {
    const { customerId, contentTypeId } = params;

    await models.ConversationMessages.deleteMany({
      conversationId: contentTypeId,
    });
    await models.Conversations.deleteOne({ _id: contentTypeId });

    await models.FormSubmissions.deleteOne({
      customerId,
      contentTypeId,
    });
    await models.FormSubmissions.deleteOne({
      customerId,
      contentTypeId,
    });

    return true;
  },
};
markResolvers(formMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
// checkPermission(formMutations, 'formsAdd', 'manageForms');
// checkPermission(formMutations, 'formsEdit', 'manageForms');
// checkPermission(formMutations, 'formsRemove', 'manageForms');
// checkPermission(formMutations, 'formsDuplicate', 'manageForms');
// checkPermission(formMutations, 'formSubmissionsSave', 'manageForms');
// checkPermission(formMutations, 'formSubmissionsEdit', 'manageForms');
// checkPermission(formMutations, 'formSubmissionsRemove', 'manageForms');
