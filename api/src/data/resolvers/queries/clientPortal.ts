import { ClientPortals, Stages, Tasks } from '../../../db/models';

const configClientPortalQueries = {
  async configClientPortal(_root) {
    return ClientPortals.getConfig();
  },

  async getTaskStages() {
    const config = await ClientPortals.getConfig();

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

  async getStageTasks(_root, { stageId }: { stageId: string }) {
    return Tasks.find({ stageId });
  }
};

export default configClientPortalQueries;
