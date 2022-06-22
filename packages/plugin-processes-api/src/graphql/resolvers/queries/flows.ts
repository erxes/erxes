import { IFlow } from './../../../models/definitions/flows';
import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { rf } from '../../../utils/receiveFlow';
import { findLastAction } from '../../../utils/utils';

interface IParam {
  categoryId: string;
  searchValue?: string;
  ids: string[];
  excludeIds: boolean;
}

const generateFilter = (params: IParam, commonQuerySelector) => {
  const { categoryId, searchValue, ids, excludeIds } = params;
  const selector: any = { ...commonQuerySelector };

  if (categoryId) {
    selector.categoryId = categoryId;
  }

  if (searchValue) {
    selector.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (ids && ids.length > 0) {
    selector._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  return selector;
};

const flowQueries = {
  flows(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector }: IContext
  ) {
    console.log('flows step 1');
    const selector = generateFilter(params, commonQuerySelector);

    return paginate(
      models.Flows.find(selector)
        .sort({
          code: 1
        })
        .lean(),
      { ...params }
    );
  },

  flowTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.Flows.find(selector).count();
  },

  /**
   * Get one flow
   */
  flowDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Flows.findOne({ _id });
  },

  /**
   * Get receive data
   */
  async testGetReceiveDatas(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    const data = rf();
    const { branchId, departmentId, time } = data;
    const { timeId } = time;

    for (const timeIdData of timeId) {
      const { productId, count } = timeIdData;
      const flowJobStatus = true;
      const status = 'active';
      const filter = { productId, flowJobStatus, status };
      const flow = (await models.Flows.findOne(filter)) || ({} as IFlow);
      const jobRefers = await models.JobRefers.find({
        status: { $in: ['active', null] }
      });

      if (Object.keys(flow).length > 0) {
        const jobs = flow.jobs || [];
        console.log('Flow jobs: ', jobs.length);
        const response = findLastAction(jobs, jobRefers, productId);
        const { flowStatus, lastJobs, lastJob } = response;
        const lastJobsIds = lastJobs.map(e => e.id);
        const leftJobs = jobs.filter(job => !lastJobsIds.includes(job.id));

        console.log(
          'Last jobs: ',
          flowStatus,
          lastJobs.map(e => e.label),
          lastJob?.label,
          lastJobs.length
        );

        console.log(
          'left jobs: ',
          leftJobs.map(e => e.label),
          leftJobs.length
        );
      } else {
        console.log('not found that case:', filter);
      }
    }

    return data;
  }
};

// checkPermission(flowQueries, 'flowDetail', 'showFlows');
// checkPermission(flowQueries, 'flows', 'showFlows');

export default flowQueries;
