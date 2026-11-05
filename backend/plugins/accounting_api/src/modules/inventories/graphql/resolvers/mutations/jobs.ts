import { IContext } from '~/connectionResolvers';
import { IJob } from '../../../@types/jobs';

export const jobMutations = {
  jobAdd: async (
    _root: undefined,
    params: IJob,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobs');

    return await models.Jobs.createJob(params, user._id);
  },

  jobEdit: async (
    _root: undefined,
    params: IJob & { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobs');

    return await models.Jobs.updateJob(params, user._id);
  },

  jobRemove: async (
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('removeJobs');

    return await models.Jobs.removeJob(_id);
  },
};
