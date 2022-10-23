import * as _ from 'underscore';
import { FLOW_STATUSES, JOB_TYPES } from './definitions/constants';
import { flowSchema, IFlow, IFlowDocument, IJob } from './definitions/flows';
import { IModels } from '../connectionResolver';
import { Model } from 'mongoose';

export interface IFlowModel extends Model<IFlowDocument> {
  getFlow(_id: string): Promise<IFlowDocument>;
  createFlow(doc: IFlow): Promise<IFlowDocument>;
  updateFlow(_id: string, doc: IFlow): Promise<IFlowDocument>;
  removeFlow(_id: string): void;
  removeFlows(flowIds: string[]): void;
  checkValidation(jobs?: IJob[]): Promise<String>;
}

const getProductIds = (job: IJob, jobReferById: any, type = 'need') => {
  const jobConfig = job.config;
  const key = type === 'need' ? 'needProducts' : 'resultProducts';
  let productIds: string[] = [];
  if (jobConfig.jobReferId && JOB_TYPES.JOBS.includes(job.type)) {
    productIds =
      ((jobReferById[jobConfig.jobReferId] || {})[key] || []).map(
        p => p.productId
      ) || [];
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

const checkBeforeJobs = (job: IJob, beforeJobs: IJob[], jobReferById: any) => {
  const label = `${job.label.substring(0, 10)}... `;
  const jobConfig = job.config;

  const jobNeedProductIds = getProductIds(job, jobReferById);
  let beforeResultProductIds: string[] = [];

  for (const beforeJob of beforeJobs) {
    const beforeConfig = beforeJob.config;

    if (jobConfig.inBranchId !== beforeConfig.outBranchId) {
      return `${label}wrong In Branch`;
    }
    if (jobConfig.inDepartmentId !== beforeConfig.outDepartmentId) {
      return `${label}wrong In Department`;
    }

    beforeResultProductIds = beforeResultProductIds.concat(
      getProductIds(beforeJob, jobReferById, 'result')
    );
  }

  const lessNeedProductIds = jobNeedProductIds.filter(
    np => !beforeResultProductIds.includes(np)
  );

  if (lessNeedProductIds.length) {
    return `${label}less products`;
  }

  return '';
};

const recursiveChecker = (job: IJob, jobs: IJob[], jobReferById) => {
  const beforeJobs = jobs.filter(j => (j.nextJobIds || []).includes(job.id));
  const result = checkBeforeJobs(job, beforeJobs, jobReferById);
  if (result) {
    return result;
  }

  if (beforeJobs && beforeJobs.length) {
    for (const beforeJob of beforeJobs) {
      const results = recursiveChecker(beforeJob, jobs, jobReferById);
      if (results) {
        return results;
      }
    }
  }
  return '';
};

export const loadFlowClass = (models: IModels) => {
  class Flow {
    /*
     * Get a flow
     */
    public static async getFlow(_id: string) {
      const flow = await models.Flows.findOne({ _id });

      if (!flow) {
        throw new Error('Flow not found');
      }

      return flow;
    }

    public static async checkValidation(jobs?: IJob[]) {
      if (!jobs || !jobs.length) {
        return 'Has not jobs';
      }

      const endJobs = jobs.filter(j => j.type === JOB_TYPES.ENDPOINT);
      if (!endJobs || !endJobs.length) {
        return 'Has not endPoint job';
      }

      if (endJobs.length > 1) {
        return 'Many endPoint jobs';
      }

      const latestJobs = jobs.filter(
        j => !j.nextJobIds || !j.nextJobIds.length
      );

      if (!latestJobs || !latestJobs.length) {
        return 'Has not latest job';
      }

      if (latestJobs.length > 1) {
        return 'Many latest jobs';
      }

      const jobRefers = await models.JobRefers.find({
        _id: { $in: jobs.map(j => j.config && j.config.jobReferId) }
      }).lean();

      const jobReferById = {};
      for (const jobRefer of jobRefers) {
        jobReferById[jobRefer._id] = jobRefer;
      }

      const latestJob = latestJobs[0];
      const result = recursiveChecker(latestJob, jobs, jobReferById);

      if (result) {
        return result;
      }

      return '';
    }

    /**
     * Create a flow
     */
    public static async createFlow(doc: IFlow) {
      const flow = await models.Flows.create({
        ...doc,
        createdAt: new Date()
      });

      return flow;
    }

    /**
     * Update Flow
     */
    public static async updateFlow(_id: string, doc: IFlow) {
      let status = doc.status;
      const flowValidation = await models.Flows.checkValidation(doc.jobs);

      if (flowValidation !== '' && status === FLOW_STATUSES.ACTIVE) {
        status = FLOW_STATUSES.DRAFT;
      }

      let latestBranchId = '';
      let latestDepartmentId = '';
      const latestJobs = doc.jobs?.filter(j => !j.nextJobIds.length) || [];
      if (latestJobs.length === 1) {
        const latestJob = latestJobs[0];
        latestBranchId = (latestJob.config || {}).outBranchId;
        latestDepartmentId = (latestJob.config || {}).outDepartmentId;
      }

      await models.Flows.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            flowValidation,
            status,
            latestBranchId,
            latestDepartmentId
          }
        }
      );

      const updated = await models.Flows.getFlow(_id);

      return updated;
    }

    /**
     * Remove Flow
     */
    public static async removeFlow(_id: string) {
      await models.Flows.getFlow(_id);
      return models.Flows.deleteOne({ _id });
    }

    /**
     * Remove Flows
     */
    public static async removeFlows(flowIds: string[]) {
      await models.Flows.deleteMany({ _id: { $in: flowIds } });

      return 'deleted';
    }
  }

  flowSchema.loadClass(Flow);

  return flowSchema;
};
