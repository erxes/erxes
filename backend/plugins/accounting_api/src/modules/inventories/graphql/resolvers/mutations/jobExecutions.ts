import { IContext } from '~/connectionResolvers';
import { IJobExecution } from '../../../@types/jobExecutions';

export const jobExecutionMutations = {
  jobExecutionSave: async (
    _root: unknown,
    { _id, input }: { _id?: string; input: IJobExecution },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobExecutions');
    return models.JobExecutions.saveJobExecution(input, user._id, _id);
  },
  jobExecutionPost: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobExecutions');
    return models.JobExecutions.postJobExecution(_id, user._id);
  },
  jobExecutionUndo: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageJobExecutions');
    return models.JobExecutions.undoJobExecution(_id, user._id);
  },
  jobExecutionRemove: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('removeJobExecutions');
    return models.JobExecutions.removeJobExecution(_id);
  },
};
