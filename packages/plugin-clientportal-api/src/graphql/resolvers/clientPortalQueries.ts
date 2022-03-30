// TODO: check if related stages are selected in client portal config

import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCardsMessage, sendContactsMessage } from '../../messageBroker';

const configClientPortalQueries = {
  async clientPortalGetConfigs(
    _root,
    args: { page?: number; perPage?: number },
    { models }: IContext
  ) {
    return paginate(models.ClientPortals.find({}), args);
  },

  async clientPortalConfigsTotalCount(_root, _args, { models }: IContext) {
    return models.ClientPortals.countDocuments();
  },

  /**
   * Get last config
   */
  clientPortalGetLast(_root, _args, { models }: IContext) {
    return models.ClientPortals.findOne({}).sort({
      createdAt: -1,
    });
  },

  async clientPortalGetConfig(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ClientPortals.findOne({ _id });
  },

  async clientPortalGetTaskStages(
    _root,
    { taskPublicPipelineId }: { taskPublicPipelineId: string },
    { subdomain }: IContext
  ) {
    return sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: { pipelineId: taskPublicPipelineId },
      isRPC: true,
    });
  },

  async clientPortalGetTasks(
    _root,
    { stageId }: { stageId: string },
    { subdomain }: IContext
  ) {
    return sendCardsMessage({
      subdomain,
      action: 'tasks.find',
      data: stageId,
      isRPC: true,
    });
  },

  async clientPortalTickets(
    _root,
    { email }: { email: string },
    { subdomain }: IContext
  ) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.find',
      data: { primaryEmail: email },
      isRPC: true,
    });

    if (!customer) {
      return [];
    }

    return sendCardsMessage({
      subdomain,
      action: 'tickets.find',
      data: { userId: customer._id },
      isRPC: true,
    });
  },

  async clientPortalTask(
    _root,
    { _id }: { _id: string },
    { subdomain }: IContext
  ) {
    return sendCardsMessage({
      subdomain,
      action: 'tasks.findOne',
      data: { _id },
      isRPC: true,
    });
  },

  async clientPortalTicket(
    _root,
    { _id }: { _id: string },
    { subdomain }: IContext
  ) {
    return sendCardsMessage({
      subdomain,
      action: 'tickets.findOne',
      data: { _id },
      isRPC: true,
    });
  },
};

export default configClientPortalQueries;
