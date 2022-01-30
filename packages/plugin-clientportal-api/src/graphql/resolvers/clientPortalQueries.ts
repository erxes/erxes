// TODO: check if related stages are selected in client portal config

import { ClientPortals } from '../../models';

import { paginate } from '@erxes/api-utils/src';
import { sendCardsMessage, sendContactsMessage } from '../../messageBroker';

const configClientPortalQueries = {
  async clientPortalGetConfigs(
    _root,
    args: { page?: number; perPage?: number }
  ) {
    return paginate(ClientPortals.find({}), args);
  },

  async clientPortalConfigsTotalCount() {
    return ClientPortals.countDocuments();
  },

  /**
   * Get last config
   */
  clientPortalGetLast(_root) {
    return ClientPortals.findOne({}).sort({
      createdAt: -1,
    });
  },

  async clientPortalGetConfig(_root, { _id }: { _id: string }) {
    return ClientPortals.findOne({ _id });
  },

  async clientPortalGetTaskStages(
    _root,
    { taskPublicPipelineId }: { taskPublicPipelineId: string }
  ) {
    return sendCardsMessage('findStages', { pipelineId: taskPublicPipelineId });
  },

  async clientPortalGetTasks(_root, { stageId }: { stageId: string }) {
    return sendCardsMessage('findTasks', { stageId });
  },

  async clientPortalTickets(_root, { email }: { email: string }) {
    const customer = await sendContactsMessage('findCustomer', {
      primaryEmail: email,
    });

    if (!customer) {
      return [];
    }

    return sendCardsMessage('findTickets', { userId: customer._id });
  },

  async clientPortalTask(_root, { _id }: { _id: string }) {
    return sendCardsMessage('findOneTasks', { _id });
  },

  async clientPortalTicket(_root, { _id }: { _id: string }) {
    return sendCardsMessage('findOneTickets', { _id });
  },
};

export default configClientPortalQueries;
