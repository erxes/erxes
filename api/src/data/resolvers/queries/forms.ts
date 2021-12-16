import {
  Conversations,
  Forms,
  FormSubmissions,
  Integrations
} from '../../../db/models';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

const formQueries = {
  /**
   * Forms list
   */
  forms(_root, _args, { commonQuerySelector }: IContext) {
    return Forms.find(commonQuerySelector).sort({ title: 1 });
  },

  /**
   * Get one form
   */
  formDetail(_root, { _id }: { _id: string }) {
    return Forms.findOne({ _id });
  },

  async formSubmissions(
    _root,
    { formId, tagId }: { formId: string; tagId: string }
  ) {
    if (formId) {
      const form = await Forms.getForm(formId);

      const formSubmissions = await FormSubmissions.find({
        contentType: 'lead',
        formId
      });

      return { formId: form._id, submissions: formSubmissions };
    }

    const integrations = await Integrations.find({
      tagIds: tagId,
      kind: 'lead',
      isActive: true
    });

    const submissions: any[] = [];

    for (const integration of integrations) {
      // const form = await Forms.findOne({_id: integration.formId});
      const convs = await Conversations.find({
        integrationId: integration._id
      }).lean();

      for (const conversation of convs) {
        const submissionsGrouped = await FormSubmissions.find({
          contentType: 'lead',
          contentTypeId: conversation._id
        });

        if (submissionsGrouped) {
          const submission = {
            ...conversation,
            contentTypeId: conversation._id,
            submissions: submissionsGrouped
          };

          submissions.push(submission);
        }
      }
    }

    return submissions;
  }
};

checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;
