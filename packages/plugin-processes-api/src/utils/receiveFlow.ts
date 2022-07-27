import { IWork, IWorkDocument } from './../models/definitions/works';
import { IModels } from '../connectionResolver';
import { IFlowDocument } from '../models/definitions/flows';
import {
  findLastJob,
  getBeforeJobs,
  getJobRefers,
  getLeftJobs,
  initDocOverallWork,
  initDocWork,
  overallWorksAdd,
  overallWorksUpdate,
  recursiveCatchBeforeJobs,
  worksAdd
} from './utils';
import { sendSalesplansMessage } from '../messageBroker';

// export const rf = (data, list) => {
export const rf = async (models: IModels, subdomain: string, params) => {
  let descriptionForWork = '';
  const inputData = params.data;
  const { branchId, departmentId, interval, salesLogId } = inputData;
  const { intervals } = interval;

  let intervalId = 'intervalId';

  for (const intervalData of intervals) {
    const { productId, count, label } = intervalData;
    intervalId = label;
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

      const response = findLastJob(
        jobs,
        jobRefers,
        productId,
        branchId,
        departmentId
      );
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
          lastJob,
          intervalId
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
          },
          intervalId
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
            responseleftjob,
            intervalId
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

  // OverallWorks
  // OverallWorks
  // OverallWorks

  const works = await models.Works.find({ status: 'new', intervalId });
  if (works.length > 0) {
    for (const work of works) {
      const {
        jobId,
        outBranchId,
        outDepartmentId,
        inBranchId,
        inDepartmentId
      } = work;

      const filter = {
        jobId,
        outBranchId,
        outDepartmentId,
        inBranchId,
        inDepartmentId,
        intervalId
      };

      const overallWork = await models.OverallWorks.findOne(filter);

      if (overallWork) {
        await overallWorksUpdate(overallWork, work, models);
        console.log('updated overall ...');
      } else {
        const doc = initDocOverallWork(work);
        await overallWorksAdd(doc, models);
        console.log('created overall ...');
      }
    }

    await models.Works.updateMany(
      { status: 'new', intervalId },
      { $set: { status: 'done' } }
    );
  }

  try {
    sendSalesplansMessage({
      subdomain,
      action: 'saleslogs.statusUpdate',
      data: {
        _id: salesLogId,
        status: 'published'
      }
    });
  } catch (error) {
    console.log(error);
  }

  return inputData;
};
