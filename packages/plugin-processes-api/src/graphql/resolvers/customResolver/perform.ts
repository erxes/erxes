import { IOverallWorkDocument } from './../../../models/definitions/overallWorks';
import { IContext } from '../../../connectionResolver';
import { IPerform } from '../../../models/definitions/performs';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.OverallWorks.findOne({ _id });
  },

  async overallWork(perform: IPerform, {}, { models }: IContext) {
    const { overallWorkId } = perform;
    const overallWork =
      (await models.OverallWorks.findOne({ _id: overallWorkId })) ||
      ({} as IOverallWorkDocument);
    const { flowId, jobId } = overallWork;
    const flow = await models.Flows.findOne({ _id: flowId });
    const jobs = flow?.jobs || [];
    const job = jobs.find(j => j.id === jobId);

    return { label: job?.label || '', description: job?.description || '' };
  }
};
