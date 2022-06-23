import { IModels } from './../connectionResolver';
import { IFlow } from '../models/definitions/flows';
import { findLastAction } from './utils';

// export const rf = (data, list) => {
export const rf = async (models: IModels, params) => {
  let descriptionForWork = '';
  const inputData = params.data;
  const { branchId, departmentId, time } = inputData;
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
        lastJob?.label + `/${lastJob?.id}/`,
        lastJobs.length
      );

      console.log(
        'left jobs: ',
        leftJobs.map(e => e.label),
        leftJobs.map(e => e.nextJobIds),
        leftJobs.length
      );

      if (Object.keys(lastJob || {}).length > 0) {
        const lastJobRefer = jobRefers.find(
          job => job._id === lastJob?.jobReferId
        );

        const needProducts = lastJobRefer?.needProducts
          ? lastJobRefer.needProducts
          : [];

        // need product ids of lastJob on flow
        const needProductIds = needProducts.map(need => need.productId);

        // filtering beforeJobs of lastJob on flow
        const beforeJobs = leftJobs.filter(left =>
          left.nextJobIds.includes(lastJob?.id || '')
        );

        const beforeJobIds = beforeJobs.map(before => before.jobReferId);

        console.log(
          'beforeJobs: ',
          beforeJobs.map(before => before.label)
        );

        const beforeJobRefers = jobRefers.filter(job =>
          beforeJobIds.includes(job._id)
        );

        console.log(
          'beforeJobRefers: ',
          beforeJobRefers.map(bef => bef.name)
        );

        // result product ids of beforeJobs for last job on flow
        let beforeResultProductIds: string[] = [];

        beforeJobRefers.forEach(jobRefer => {
          const resultProducts = jobRefer.resultProducts
            ? jobRefer.resultProducts
            : [];
          const resultProductIds = resultProducts.map(
            result => result.productId
          );

          beforeResultProductIds =
            beforeResultProductIds.length === 0
              ? resultProductIds
              : [...beforeResultProductIds, ...resultProductIds];
        });

        console.log('needProductIds', needProductIds);
        console.log('beforeResultProductIds', beforeResultProductIds);

        // comparing between needProductIds of lastJob and resultProductIds of leftJobs
        if (needProductIds.length <= beforeResultProductIds.length) {
          let checkLastNeeds = false;
          needProductIds.forEach(needId => {
            checkLastNeeds = beforeResultProductIds.includes(needId);
          });

          descriptionForWork = checkLastNeeds
            ? ''
            : `please add and connect required need products of last job on flow / ${flow.name} /`;
        } else {
          descriptionForWork = `please add and connect required need products of last job on flow / ${flow.name} /`;
        }
      } else {
        descriptionForWork = `last job not defined on flow / ${flow.name} / `;
      }
    } else {
      descriptionForWork = 'not found that case: ' + filter;
    }

    descriptionForWork
      ? console.log('Description for work: ', descriptionForWork)
      : console.log('Done!');
  }

  return inputData;
};
