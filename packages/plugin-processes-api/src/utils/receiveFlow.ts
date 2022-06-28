import { IWork, IWorkDocument } from './../models/definitions/works';
import { IModels } from '../connectionResolver';
import { IFlowDocument } from '../models/definitions/flows';
import {
  findLastJob,
  getBeforeJobs,
  getJobRefers,
  getLeftJobs,
  initDocWork,
  recursiveCatchBeforeJobs,
  worksAdd
} from './utils';

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
    const flow = (await models.Flows.findOne(filter)) || ({} as IFlowDocument);
    const jobRefers = await models.JobRefers.find({
      status: { $in: ['active', null] }
    });

    if (Object.keys(flow).length > 0) {
      const jobs = flow.jobs || [];

      console.log('Flow jobs: ', jobs.length);

      const response = findLastJob(jobs, jobRefers, productId);
      const { flowStatus, lastJobs, lastJob } = response;
      const leftJobs = getLeftJobs(jobs, [lastJob?.id || '']);

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

      if (Object.keys(lastJob || {}).length > 0 && flowStatus) {
        const lastJobRefer = getJobRefers(
          [lastJob?.jobReferId || ''],
          jobRefers
        );

        console.log('lastJobRefer: ', lastJobRefer[0].name);

        const doc: IWork = initDocWork(
          flow,
          lastJobRefer[0],
          productId,
          count,
          lastJob
        );

        const work = await worksAdd(doc, models);
        // console.log('work:', work);

        // filtering beforeJobs of lastJob on flow
        const beforeJobs = getBeforeJobs(leftJobs, lastJob?.id || '');
        const beforeJobRefers = getJobRefers(
          beforeJobs.map(before => before.jobReferId),
          jobRefers
        );

        console.log(
          'beforeJobRefers: ',
          beforeJobRefers.map(bef => bef.name)
        );

        const level = 2;
        const recursiveJobs = beforeJobs;

        const responseleftjobs = await recursiveCatchBeforeJobs(
          recursiveJobs,
          leftJobs,
          level,
          {
            flow,
            productId,
            count,
            branchId,
            departmentId,
            jobRefers,
            models
          }
        );

        for await (const responseleftjob of responseleftjobs) {
          const leftJobRefer = getJobRefers(
            [responseleftjob.jobReferId || ''],
            jobRefers
          );

          const docLeft: IWork = initDocWork(
            flow,
            leftJobRefer[0],
            productId,
            count,
            responseleftjob
          );

          await worksAdd(docLeft, models);
        }

        console.log('responseleftjobs: ', responseleftjobs);
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
