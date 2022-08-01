import { IOverallWorkDocument } from './../../../models/definitions/overallWorks';
import { IContext } from '../../../connectionResolver';
import { IPerform } from '../../../models/definitions/performs';
import { IJobRefer } from '../../../models/definitions/jobs';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.OverallWorks.findOne({ _id });
  },

  async overallWork(perform: IPerform, {}, { models }: IContext) {
    const { overallWorkId } = perform;
    const overallWork =
      (await models.OverallWorks.findOne({ _id: overallWorkId })) ||
      ({} as IOverallWorkDocument);

    const { jobId } = overallWork;
    const jobRefer: IJobRefer | null = await models.JobRefers.findOne({
      _id: jobId
    });

    return { label: jobRefer?.name || '', description: jobRefer?.code || '' };
  }
};
