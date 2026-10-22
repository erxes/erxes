import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  IJobListParams,
  IJobOutputListParams,
  IJobOutputRow,
} from '../../../@types/jobs';
import {
  getJobFilter,
  getJobSort,
  getJobOutputsPipeline,
} from '../../../utils/jobFilters';

export const jobQueries = {
  jobs: async (
    _root: undefined,
    params: IJobListParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readJobs');

    const query = getJobFilter(params);
    const sort = getJobSort(params);

    return {
      totalCount: await models.Jobs.find(query).countDocuments(),
      jobs: await paginate(models.Jobs.find(query).sort(sort), {
        ...params,
      }),
    };
  },

  jobOutputs: async (
    _root: undefined,
    params: IJobOutputListParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readJobs');
    const [result] = await models.Jobs.aggregate<{
      rows: IJobOutputRow[];
      totalCount: { count: number }[];
    }>(getJobOutputsPipeline(params));
    return {
      rows: result?.rows ?? [],
      totalCount: result?.totalCount[0]?.count ?? 0,
    };
  },

  jobDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readJobs');

    return await models.Jobs.getJob(_id);
  },
};
