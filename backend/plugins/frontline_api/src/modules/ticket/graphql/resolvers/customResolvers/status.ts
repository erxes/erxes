import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { getFormResponsesAbout } from '~/modules/form/formResponses';

// The record type a form link made from a ticket trigger stores.
export const TICKET_RECORD_TYPE = 'frontline:tickets.tickets';

export const Ticket = {
  async formResponses({ _id }: { _id: string }, _params, { models }: IContext) {
    return getFormResponsesAbout(models, { type: TICKET_RECORD_TYPE, id: _id });
  },

  async status({ statusId }, _params, { models }: IContext) {
    if (!statusId) {
      return null;
    }
    return await models.Status.findOne({ _id: statusId });
  },
  async assignee(
    { assigneeId }: { assigneeId: string },
    _params,
    { subdomain }: IContext,
  ) {
    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      method: 'query',
      action: 'findOne',
      input: { query: { _id: assigneeId } },
    });
  },

  async isSubscribed({ subscribedUserIds }, _params, { user }: IContext) {
    if (!subscribedUserIds || subscribedUserIds.length === 0) {
      return false;
    }

    return subscribedUserIds.includes(user?._id);
  },
};
