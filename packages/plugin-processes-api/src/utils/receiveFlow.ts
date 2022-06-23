import { IModels } from './../connectionResolver';
import { IFlow } from '../models/definitions/flows';
import { findLastJob, getJobRefers, getLeftJobs } from './utils';

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

      const response = findLastJob(jobs, jobRefers, productId);
      const { flowStatus, lastJobs, lastJob } = response;
      const leftJobs = getLeftJobs(
        jobs,
        lastJobs.map(e => e.id)
      );

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
        leftJobs.length
      );

      if (Object.keys(lastJob || {}).length > 0) {
        const lastJobRefer = getJobRefers(
          [lastJob?.jobReferId || ''],
          jobRefers
        );

        console.log('lastJobRefer: ', lastJobRefer[0].name);

        // filtering beforeJobs of lastJob on flow
        const beforeJobs = leftJobs.filter(left =>
          left.nextJobIds.includes(lastJob?.id || '')
        );
        const beforeJobIds = beforeJobs.map(before => before.jobReferId);
        const beforeJobRefers = getJobRefers(beforeJobIds, jobRefers);

        console.log(
          'beforeJobRefers: ',
          beforeJobRefers.map(bef => bef.name)
        );
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
