import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getConversationFormSubmissions } from '@/form/utils';

/**
 * Logs a conversation's form submissions on a record made from it: a
 * ticket's own activity, or core's activity log for another plugin's record
 * (a deal). Logged once per ticket and conversation. False when the
 * conversation has no submissions or the ticket already has them.
 */
export const logConversationFormSubmission = async ({
  models,
  subdomain,
  conversationId,
  target,
  userId,
}: {
  models: IModels;
  subdomain: string;
  conversationId: string;
  target: { contentType: string; contentId: string };
  userId?: string;
}): Promise<boolean> => {
  const formData = await getConversationFormSubmissions(models, conversationId);

  if (!formData?.submissions?.length) {
    return false;
  }

  if (target.contentType === 'frontline:ticket') {
    const ticketId = target.contentId;
    const alreadyLogged = await models.Activity.findOne({
      contentId: ticketId,
      module: 'FORM_SUBMISSION',
      'metadata.conversationId': conversationId,
    });

    if (alreadyLogged) {
      return false;
    }

    await models.Activity.createActivity({
      action: 'CREATED',
      contentId: ticketId,
      module: 'FORM_SUBMISSION',
      metadata: {
        conversationId,
        ticketId,
        formId: formData.formId,
        formTitle: formData.formTitle,
        submissions: formData.submissions,
      },
      createdBy: userId || '',
    });

    return true;
  }

  const [targetPluginName, targetModuleName] = target.contentType.split(':');

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'activityLog',
    action: 'createActivityLog',
    input: [
      {
        activityType: 'formSubmission',
        sourcePlugin: 'frontline',
        target: { _id: target.contentId },
        action: {
          type: 'create',
          description: 'logged a form submission',
        },
        changes: {},
        metadata: {
          conversationId,
          formId: formData.formId,
          formTitle: formData.formTitle,
          submissions: formData.submissions,
        },
        pluginName: targetPluginName,
        moduleName: targetModuleName,
        collectionName: targetModuleName,
      },
    ],
    context: { userId },
    defaultValue: null,
  });

  return true;
};
