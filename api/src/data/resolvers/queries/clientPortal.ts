import {
  ClientPortals,
  Customers,
  Stages,
  Tasks,
  Tickets
} from '../../../db/models';
import { paginate } from '../../utils';

const configClientPortalQueries = {
  async getConfigs(_root, args: { page?: number; perPage?: number }) {
    return paginate(ClientPortals.find({}), args);
  },

  async getClientPortalTotalCount() {
    return ClientPortals.countDocuments();
  },

  async getConfig(_root, { _id }: { _id: string }) {
    return ClientPortals.getConfig(_id);
  },

  async getTaskStages(
    _root,
    { taskPublicPipelineId }: { taskPublicPipelineId: string }
  ) {
    return Stages.find({ pipelineId: taskPublicPipelineId });
  },

  async getTasks(_root, { stageId }: { stageId: string }) {
    return Tasks.find({ stageId });
  },

  async customerTickets(_root, { email }: { email: string }) {
    const customer = await Customers.findOne({ primaryEmail: email }).lean();

    if (!customer) {
      throw new Error('Customer not registered');
    }

    return Tickets.find({ userId: customer._id });
  }
};

export default configClientPortalQueries;
