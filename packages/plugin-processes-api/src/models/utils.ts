import { IModels } from '../connectionResolver';
import { JOB_TYPES } from './definitions/constants';
import { IFlowDocument, IJob } from './definitions/flows';
import { IProductsData } from './definitions/jobs';

const getProductIds = (
  job: IJob,
  jobReferById: any,
  subFlowById: { [key: string]: IFlowDocument },
  type = 'need'
) => {
  const jobConfig = job.config;
  const key = type === 'need' ? 'needProducts' : 'resultProducts';
  const fkey = type === 'need' ? 'latestNeedProducts' : 'latestResultProducts';
  let productIds: string[] = [];
  if (jobConfig.jobReferId && JOB_TYPES.JOBS.includes(job.type)) {
    productIds =
      ((jobReferById[jobConfig.jobReferId] || {})[key] || []).map(
        p => p.productId
      ) || [];
  }

  if (jobConfig.subFlowId && JOB_TYPES.FLOW === job.type) {
    productIds =
      ((subFlowById[jobConfig.subFlowId] || {})[fkey] || []).map(
        p => p.productId
      ) || [];
    console.log(productIds);
  }

  if (jobConfig.productId) {
    const types = [JOB_TYPES.MOVE];
    if (type === 'need') {
      types.push(JOB_TYPES.OUTLET);
    } else {
      types.push(JOB_TYPES.INCOME);
    }
    if (types.includes(job.type)) {
      productIds = [jobConfig.productId];
    }
  }
  return productIds;
};

const checkBeforeJobs = (
  job: IJob,
  beforeJobs: IJob[],
  jobReferById: any,
  subFlowById: any
) => {
  const label = `${job.label.substring(0, 10)}... `;
  const jobConfig = job.config;

  const jobNeedProductIds = getProductIds(job, jobReferById, subFlowById);
  let beforeResultProductIds: string[] = [];

  for (const beforeJob of beforeJobs) {
    const beforeConfig = beforeJob.config;

    if (beforeJob.type === JOB_TYPES.FLOW && beforeConfig.subFlowId) {
      const beforeSubFlow = subFlowById[beforeConfig.subFlowId];

      if (jobConfig.inBranchId !== beforeSubFlow.latestBranchId) {
        return `${label}wrong Spend Branch`;
      }
      if (jobConfig.inDepartmentId !== beforeSubFlow.latestDepartmentId) {
        return `${label}wrong Spend Department`;
      }
    } else {
      if (jobConfig.inBranchId !== beforeConfig.outBranchId) {
        return `${label}wrong Spend Branch`;
      }
      if (jobConfig.inDepartmentId !== beforeConfig.outDepartmentId) {
        return `${label}wrong Spend Department`;
      }
    }

    beforeResultProductIds = beforeResultProductIds.concat(
      getProductIds(beforeJob, jobReferById, subFlowById, 'result')
    );
  }

  const lessNeedProductIds = jobNeedProductIds.filter(
    np => !beforeResultProductIds.includes(np)
  );

  if ((lessNeedProductIds || []).length) {
    return `${label}less products`;
  }

  return '';
};

export const recursiveChecker = (
  job: IJob,
  jobs: IJob[],
  jobReferById,
  subFlowById
) => {
  const beforeJobs = jobs.filter(j => (j.nextJobIds || []).includes(job.id));
  const result = checkBeforeJobs(job, beforeJobs, jobReferById, subFlowById);

  if (result) {
    return result;
  }

  if (beforeJobs && beforeJobs.length) {
    for (const beforeJob of beforeJobs) {
      const results = recursiveChecker(
        beforeJob,
        jobs,
        jobReferById,
        subFlowById
      );
      if (results) {
        return results;
      }
    }
  }
  return '';
};

export const getLatestJob = async (models: IModels, jobs: IJob[]) => {
  if (!(jobs || []).length) {
    return;
  }

  const latestJobs = jobs.filter(j => !(j.nextJobIds || []).length) || [];

  if (latestJobs.length !== 1) {
    return;
  }

  const latestJob = latestJobs[0];
  if (latestJob.type === JOB_TYPES.FLOW && latestJob.config.subFlowId) {
    const subFlow:
      | IFlowDocument
      | undefined
      | null = await models.Flows.findOne({
      _id: latestJob.config.subFlowId
    }).lean();
    if (!subFlow || subFlow === null) {
      return;
    }
    return await getLatestJob(models, subFlow.jobs || []);
  }

  return latestJobs[0];
};

export const getLatestLocations = (latestJob: IJob) => {
  let latestBranchId = '';
  let latestDepartmentId = '';

  if (latestJob) {
    latestBranchId = (latestJob.config || {}).outBranchId;
    latestDepartmentId = (latestJob.config || {}).outDepartmentId;
  }

  return {
    latestBranchId,
    latestDepartmentId
  };
};

export const getResultProductsFromFlow = async (
  models: IModels,
  latestJob: IJob
): Promise<IProductsData[]> => {
  if (!latestJob) {
    return [];
  }

  const config = latestJob.config;
  if ([JOB_TYPES.ENDPOINT, JOB_TYPES.JOB].includes(latestJob.type)) {
    if (config.jobReferId) {
      const jobRefer = await models.JobRefers.findOne({
        _id: config.jobReferId
      }).lean();
      if (jobRefer) {
        return jobRefer.resultProducts;
      }
    }
  }

  if ([JOB_TYPES.MOVE, JOB_TYPES.INCOME].includes(latestJob.type)) {
    if (config.productId) {
      return [
        {
          _id: Math.random().toString(),
          productId: config.productId,
          quantity: config.quantity || 1,
          uom: config.uom || ''
        }
      ];
    }
  }

  return [];
};

export const getBeginJobs = async (models: IModels, jobs: IJob[]) => {
  let calledJobIds: string[] = [];
  for (const job of jobs) {
    calledJobIds = calledJobIds.concat(job.nextJobIds);
  }
  const beginJobs = jobs.filter(j => !calledJobIds.includes(j.id));

  let filteredJobs: IJob[] = [];

  for (const beginJob of beginJobs) {
    if (beginJob.type === JOB_TYPES.FLOW) {
      if (beginJob.config.subFlowId) {
        const subFlow:
          | IFlowDocument
          | undefined
          | null = await models.Flows.findOne({
          _id: beginJob.config.subFlowId
        }).lean();
        if (!subFlow || subFlow === null) {
          return [];
        }
        filteredJobs = filteredJobs.concat(
          await getBeginJobs(models, subFlow.jobs || [])
        );
      }
    } else {
      filteredJobs.push(beginJob);
    }
  }

  return filteredJobs;
};

export const getNeedProductsFromFlow = async (
  models: IModels,
  jobs: IJob[]
): Promise<IProductsData[]> => {
  const beginJobs = await getBeginJobs(models, jobs);

  let needProducts: IProductsData[] = [];
  const jobReferIds = beginJobs
    .filter(bj => bj.config && bj.config.jobReferId)
    .map(bj => bj.config.jobReferId);
  const jobRefers = await models.JobRefers.find({
    _id: { $in: jobReferIds }
  }).lean();
  const jobReferById = {};
  for (const jobRefer of jobRefers) {
    jobReferById[jobRefer._id] = jobRefer;
  }

  for (const job of beginJobs) {
    const config = job.config;

    if ([JOB_TYPES.ENDPOINT, JOB_TYPES.JOB].includes(job.type)) {
      if (config.jobReferId) {
        const jobRefer = jobReferById[config.jobReferId];
        if (jobRefer) {
          needProducts = needProducts.concat(jobRefer.needProducts);
        }
      }
    }

    if ([JOB_TYPES.MOVE, JOB_TYPES.OUTLET].includes(job.type)) {
      if (config.productId) {
        needProducts.push({
          _id: Math.random().toString(),
          productId: config.productId,
          quantity: config.quantity || 1,
          uom: config.uom || ''
        });
      }
    }
  }

  return needProducts;
};
