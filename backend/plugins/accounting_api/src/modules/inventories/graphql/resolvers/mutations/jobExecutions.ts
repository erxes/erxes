import { IContext } from '~/connectionResolvers';
import { IJobExecution } from '../../../@types/jobExecutions';
import {
  postJobExecution,
  saveJobExecution,
  undoJobExecution,
} from '../../../utils/jobExecutions';

export const jobExecutionMutations = {
  jobExecutionSave: async (
    _root: unknown,
    { _id, input }: { _id?: string; input: IJobExecution },
    { models, subdomain, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobExecutions');
    return saveJobExecution(models, subdomain, input, user._id, _id);
  },
  jobExecutionPost: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobExecutions');
    return postJobExecution(models, subdomain, _id, user._id);
  },
  jobExecutionUndo: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobExecutions');
    return undoJobExecution(models, _id, user._id);
  },
  jobExecutionRemove: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('removeJobExecutions');
    const result = await models.JobExecutions.deleteOne({
      _id,
      status: 'draft',
    });
    if (!result.deletedCount)
      throw new Error('Only draft executions can be deleted');
    return true;
  },
};
