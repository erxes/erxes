import { IContext } from '~/connectionResolvers';
import { getConversationFormSubmissions } from '@/form/utils';

export const activityMutations = {
  ticketLogConversationForm: async (
    _parent: undefined,
    { ticketId, conversationId }: { ticketId: string; conversationId: string },
    { models, user }: IContext,
  ) => {
    const ticket = await models.Ticket.findOne({ _id: ticketId });

    if (!ticket) {
      return { logged: false };
    }

    const formData = await getConversationFormSubmissions(
      models,
      conversationId,
    );

    if (!formData?.submissions?.length) {
      return { logged: false };
    }

    const alreadyLogged = await models.Activity.findOne({
      contentId: ticketId,
      module: 'FORM_SUBMISSION',
      'metadata.conversationId': conversationId,
    });

    if (alreadyLogged) {
      return { logged: false };
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
      createdBy: user?._id,
    });

    return { logged: true };
  },
};
