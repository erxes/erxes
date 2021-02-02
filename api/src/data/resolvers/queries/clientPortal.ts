import { ClientPortals, Stages, Tasks } from '../../../db/models';
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

  async getTaskStages(_root, { _id }: { _id: string }) {
    const config = await ClientPortals.getConfig(_id);

    if (!config) {
      throw new Error('Client portal configuration not found');
    }

    const { taskPipelineId } = config;

    if (!taskPipelineId) {
      throw new Error('Task pipeline not configured');
    }

    const stages = await Stages.find({ pipelineId: taskPipelineId });

    return stages;
  },

  async getTasks(_root, { stageId }: { stageId: string }) {
    return Tasks.find({ stageId });
  }
};

export default configClientPortalQueries;
