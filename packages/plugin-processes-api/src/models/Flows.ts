import * as _ from 'underscore';
import { FLOW_STATUSES, JOB_TYPES } from './definitions/constants';
import { flowSchema, IFlow, IFlowDocument, IJob } from './definitions/flows';
import {
  getLatestJob,
  getLatestLocations,
  getNeedProductsFromFlow,
  getResultProductsFromFlow,
  recursiveChecker
} from './utils';
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
      if (!jobs || !(jobs || []).length) {
        return 'Has not jobs';
      }

      const endJobs = jobs.filter(j => j.type === JOB_TYPES.ENDPOINT);
      if (!endJobs || !(endJobs || []).length) {
        return 'Has not endPoint job';
      }

      if (endJobs.length > 1) {
        return 'Many endPoint jobs';
      }

      const latestJobs = jobs.filter(
        j => !j.nextJobIds || !(j.nextJobIds || []).length
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

      const subFlows = await models.Flows.find({
        _id: { $in: jobs.map(j => j.config && j.config.subFlowId) }
      }).lean();
      const subFlowById = {};
      for (const subFlow of subFlows) {
        subFlowById[subFlow._id] = subFlow;
      }

      const latestJob = latestJobs[0];
      const result = recursiveChecker(
        latestJob,
        jobs,
        jobReferById,
        subFlowById
      );

      if (result) {
        return result;
      }

      return '';
    }

    /**
     * Create a flow
     */
    public static async createFlow(doc: IFlow) {
      const flowValidation = await models.Flows.checkValidation(doc.jobs);

      const latestJob = await getLatestJob(models, doc.jobs || []);
      const { latestBranchId, latestDepartmentId } = getLatestLocations(
        latestJob
      );
      const latestResultProducts = await getResultProductsFromFlow(
        models,
        latestJob
      );
      const latestNeedProducts = await getNeedProductsFromFlow(
        models,
        doc.jobs || []
      );

      const flow = await models.Flows.create({
        ...doc,
        status: FLOW_STATUSES.DRAFT,
        flowValidation,
        latestBranchId,
        latestDepartmentId,
        latestResultProducts,
        latestNeedProducts,
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

      const latestJob = await getLatestJob(models, doc.jobs || []);
      const { latestBranchId, latestDepartmentId } = getLatestLocations(
        latestJob
      );
      const latestResultProducts = await getResultProductsFromFlow(
        models,
        latestJob
      );
      const latestNeedProducts = await getNeedProductsFromFlow(
        models,
        doc.jobs || []
      );

      await models.Flows.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            flowValidation,
            status,
            latestBranchId,
            latestDepartmentId,
            latestResultProducts,
            latestNeedProducts
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
