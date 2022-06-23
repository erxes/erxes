import {
  IJobRefer,
  IJobReferDocument,
  IProductsData
} from './../models/definitions/jobs';
import { IJob } from '../models/definitions/flows';

export const findLastJob = (
  jobs: IJob[],
  jobRefers: IJobReferDocument[],
  productId: string
) => {
  const lastJobs: IJob[] = [];

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
      : ({} as IJob);

    return {
      lastJob: justLastJob,
      lastJobs,
      flowStatus: doubleCheckResult ? true : false
    };
  } else {
    return {
      lastJob: {} as IJob,
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

export const getLeftJobs = (jobs: IJob[], jobIds: string[]) => {
  const leftJobs = jobs.filter(job => !jobIds.includes(job.id));

  return leftJobs;
};

export const getBeforeJobs = (leftJobs: IJob[], jobId: string) => {
  const beforeJobs = leftJobs.filter(left => left.nextJobIds.includes(jobId));

  return beforeJobs;
};

export const recursiveCatchBeforeJobs = (
  recursiveJobs: IJob[],
  leftJobs,
  level
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
    const checkJobFrequently = '';
    for (const beforeJobsRecursive of totalBeforeJobsRecursive) {
      recursiveJobs = beforeJobsRecursive;
      recursiveCatchBeforeJobs(recursiveJobs, leftJobs, level + levelCounter++);
    }
  }
};
