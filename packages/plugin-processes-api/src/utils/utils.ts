import { IFlow, IFlowDocument } from './../models/definitions/flows';
import { IWork, IWorkDocument } from './../models/definitions/works';
import { IContext, IModels } from './../connectionResolver';
import {
  IJobRefer,
  IJobReferDocument,
  IProductsData
} from './../models/definitions/jobs';
import { IJob, IJobDocument } from '../models/definitions/flows';
import { MODULE_NAMES, putCreateLog } from '../logUtils';

export const findLastJob = (
  jobs: IJobDocument[],
  jobRefers: IJobReferDocument[],
  productId: string
) => {
  const lastJobs: IJobDocument[] = [];

  for (const job of jobs) {
    if (!job.nextJobIds.length || job.nextJobIds.length === 0) {
      lastJobs.push(job);
    }
  }

  const lastJobIds = lastJobs.map(last => last.jobReferId);
  const lastJobRefers = jobRefers.filter(job => lastJobIds.includes(job._id));

  let resultProducts: IProductsData[] = [];
  for (const lastJobRefer of lastJobRefers) {
    const resultProduct = lastJobRefer.resultProducts || [];
    resultProducts = resultProducts.length
      ? [...resultProducts, ...(lastJobRefer.resultProducts || [])]
      : resultProduct;
  }

  const checkResult =
    resultProducts.find(pro => pro.productId === productId) ||
    ({} as IProductsData);

  const doubleCheckResult = Object.keys(checkResult ? checkResult : {}).length;

  if (doubleCheckResult) {
    let justLastJobRefer = {} as IJobReferDocument;
    for (const lastJobRefer of lastJobRefers) {
      const lastJobRefersIds = lastJobRefer.resultProducts.map(
        last => last.productId
      );
      justLastJobRefer = lastJobRefersIds.includes(checkResult.productId)
        ? lastJobRefer
        : ({} as IJobReferDocument);
    }

    const justLastJob = Object.keys(justLastJobRefer).length
      ? lastJobs.find(last => last.jobReferId === justLastJobRefer._id)
      : ({} as IJobDocument);

    return {
      lastJob: justLastJob,
      lastJobs,
      flowStatus: doubleCheckResult ? true : false
    };
  } else {
    return {
      lastJob: {} as IJobDocument,
      lastJobs,
      flowStatus: doubleCheckResult ? true : false
    };
  }
};

export const getJobRefers = (
  jobIds: string[],
  jobRefers: IJobReferDocument[]
) => {
  const chosenJobRefers = jobRefers.filter(job => jobIds.includes(job._id));

  return chosenJobRefers;
};

export const getLeftJobs = (jobs: IJobDocument[], jobIds: string[]) => {
  const leftJobs = jobs.filter(job => !jobIds.includes(job.id));

  return leftJobs;
};

export const getBeforeJobs = (leftJobs: IJobDocument[], jobId: string) => {
  const beforeJobs = leftJobs.filter(left => left.nextJobIds.includes(jobId));

  return beforeJobs;
};

export const initDoc = (
  flow: IFlowDocument,
  jobRefer: IJobReferDocument,
  productId: string,
  count: string,
  branchId: string,
  departmentId: string,
  job?: IJobDocument
) => {
  const doc: IWork = {
    name: flow.name,
    status: 'active',
    dueDate: new Date(),
    startAt: new Date(),
    endAt: new Date(),
    jobId: job?.id || '',
    flowId: flow._id,
    productId,
    count,
    branchId,
    departmentId
  };

  return doc;
};

export const worksAdd = async (doc: IWork, models: IModels) => {
  const work = await models.Works.createWork(doc);

  // await putCreateLog(
  //   models,
  //   subdomain,
  //   {
  //     type: MODULE_NAMES.WORK,
  //     newData: {
  //       ...doc
  //     },
  //     object: work
  //   },
  //   user
  // );

  return work;
};

export const recursiveCatchBeforeJobs = async (
  recursiveJobs: IJobDocument[],
  leftJobs,
  level,
  params
) => {
  console.log('Starting recursive ...');

  console.log('level:', level);
  leftJobs =
    getLeftJobs(
      leftJobs,
      recursiveJobs.map(before => before.id)
    ) || [];

  console.log(
    'left jobs: ',
    level,
    leftJobs.map(e => e.label),
    leftJobs.length
  );

  const totalBeforeJobsRecursive: any[] = [];

  for (const recursiveJob of recursiveJobs) {
    const {
      flow,
      productId,
      count,
      branchId,
      departmentId,
      jobRefers,
      models
    } = params;

    const lastJobRefer = getJobRefers(
      [recursiveJob?.jobReferId || ''],
      jobRefers
    );

    const doc: IWork = initDoc(
      flow,
      lastJobRefer[0],
      productId,
      count,
      branchId,
      departmentId,
      recursiveJob
    );

    const work = await worksAdd(doc, models);
    console.log('work:', work);

    const beforeJobsRecursive = getBeforeJobs(leftJobs, recursiveJob.id);

    console.log(
      'beforeJobsRecursive: ',
      level,
      beforeJobsRecursive.map(e => e.label),
      beforeJobsRecursive.length
    );

    if (beforeJobsRecursive.length > 0) {
      totalBeforeJobsRecursive.push(beforeJobsRecursive);
    }
  }

  if (totalBeforeJobsRecursive.length === 0) {
    console.log('Finished before jobs .');
    console.log('Finished before jobs ..');
    console.log('Finished before jobs ...');
  } else {
    let levelCounter = 1;

    let checkJobFrequentlyIds: string[] = [];

    for (const beforeJobsRecursive of totalBeforeJobsRecursive) {
      let checkTempIds = beforeJobsRecursive.map(beforeJob => beforeJob.id);
      checkTempIds = checkTempIds.sort();

      if (
        checkJobFrequentlyIds.length === 0 ||
        JSON.stringify(checkTempIds) !== JSON.stringify(checkJobFrequentlyIds)
      ) {
        console.log(
          'Compare1 ... checkTempIds: ',
          checkTempIds,
          'checkJobFrequentlyIds: ',
          checkJobFrequentlyIds
        );

        checkJobFrequentlyIds = checkTempIds;
        recursiveJobs = beforeJobsRecursive;
        recursiveCatchBeforeJobs(
          recursiveJobs,
          leftJobs,
          level + levelCounter++,
          params
        );
      }
    }
  }
};
