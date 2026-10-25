import { IContext } from '~/connectionResolvers';
import { IJobExecutionListParams } from '../../../@types/jobExecutions';
import { getJobExecutionFilter } from '../../../utils/jobExecutionFilters';

export const jobExecutionQueries = {
  jobExecutions: async (
    _root: unknown,
    params: IJobExecutionListParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readJobExecutions');
    const filter = getJobExecutionFilter(params);
    const perPage = Math.min(
      100,
      Math.max(1, Math.floor(params.perPage ?? 20)),
    );
    const page = Math.max(1, Math.floor(params.page ?? 1));
    const [rows, totalCount] = await Promise.all([
      models.JobExecutions.find(filter)
        .sort({ date: -1, _id: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
      models.JobExecutions.countDocuments(filter),
    ]);
    return { rows, totalCount };
  },
  jobExecutionDetail: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readJobExecutions');
    return models.JobExecutions.getJobExecution(_id);
  },
};
