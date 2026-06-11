import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { workflowRunSchema } from '@/workflow/db/definitions/run';
import {
  IMastraWorkflowRun,
  IMastraWorkflowRunDocument,
} from '@/workflow/@types/workflow';

export interface IMastraWorkflowRunListParams {
  workflowId: string;
  page?: number;
  perPage?: number;
}

export interface IMastraWorkflowRunModel extends Model<IMastraWorkflowRunDocument> {
  getRun(_id: string): Promise<IMastraWorkflowRunDocument>;
  getRunByRunId(runId: string): Promise<IMastraWorkflowRunDocument>;
  createRun(doc: IMastraWorkflowRun): Promise<IMastraWorkflowRunDocument>;
  finishRun(
    _id: string,
    patch: Partial<IMastraWorkflowRun>,
  ): Promise<IMastraWorkflowRunDocument>;
  getRuns(
    params: IMastraWorkflowRunListParams,
  ): Promise<IMastraWorkflowRunDocument[]>;
}

export const loadWorkflowRunClass = (_models: IModels) => {
  class MastraWorkflowRun {
    public static async getRun(_id: string) {
      const run = await _models.MastraWorkflowRun.findOne({ _id });
      if (!run) throw new Error('Workflow run not found');
      return run;
    }

    public static async getRunByRunId(runId: string) {
      const run = await _models.MastraWorkflowRun.findOne({ runId });
      if (!run) throw new Error('Workflow run not found');
      return run;
    }

    public static async createRun(doc: IMastraWorkflowRun) {
      return _models.MastraWorkflowRun.create(doc);
    }

    public static async finishRun(
      _id: string,
      patch: Partial<IMastraWorkflowRun>,
    ) {
      const updated = await _models.MastraWorkflowRun.findOneAndUpdate(
        { _id },
        { $set: patch },
        { new: true },
      );
      if (!updated) throw new Error('Workflow run not found');
      return updated;
    }

    public static async getRuns({
      workflowId,
      page = 1,
      perPage = 30,
    }: IMastraWorkflowRunListParams) {
      const limit = Math.min(Math.max(perPage, 1), 100);
      const skip = (Math.max(page, 1) - 1) * limit;
      return _models.MastraWorkflowRun.find({ workflowId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
  }

  workflowRunSchema.loadClass(MastraWorkflowRun);
  return workflowRunSchema;
};
