// TODO: check if related stages are selected in client portal config

import {
  ClientPortals,
  Customers,
  Stages,
  Tasks,
  Tickets
} from '../../../db/models';

import { paginate } from '../../utils';

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
      createdAt: -1
    });
  },

  async clientPortalGetConfig(_root, { _id }: { _id: string }) {
    return ClientPortals.findOne({ _id });
  },

  async clientPortalGetTaskStages(
    _root,
    { taskPublicPipelineId }: { taskPublicPipelineId: string }
  ) {
    return Stages.find({ pipelineId: taskPublicPipelineId });
  },

  async clientPortalGetTasks(_root, { stageId }: { stageId: string }) {
    return Tasks.find({ stageId });
  },

  async clientPortalTickets(_root, { email }: { email: string }) {
    const customer = await Customers.findOne({ primaryEmail: email }).lean();

    if (!customer) {
      return [];
    }

    return Tickets.find({ userId: customer._id });
  },

  async clientPortalTask(_root, { _id }: { _id: string }) {
    return Tasks.findOne({ _id });
  },

  async clientPortalTicket(_root, { _id }: { _id: string }) {
    return Tickets.findOne({ _id });
  }
};

export default configClientPortalQueries;
