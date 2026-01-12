import { IOrderInput } from 'erxes-api-shared/core-types';
import { updateOrder } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IPipeline, IPipelineDocument, IStageDocument } from '../../@types';
import { SALES_STATUSES } from '../../constants';
import { pipelineSchema } from '../definitions/pipelines';
import {
  createOrUpdatePipelineStages,
  removePipelineStagesWithItems,
} from '~/modules/sales/graphql/resolvers/utils';
import { generateLastNum, watchItem } from '~/modules/sales/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { generatePipelineActivityLogs } from '~/utils/activityLogs';

export interface IPipelineModel extends Model<IPipelineDocument> {
  getPipeline(_id: string): Promise<IPipelineDocument>;
  createPipeline(
    doc: IPipeline,
    stages?: IStageDocument[],
    userId?: string,
  ): Promise<IPipelineDocument>;
  updatePipeline(
    _id: string,
    doc: IPipeline,
    stages?: IStageDocument[],
    userId?: string,
  ): Promise<IPipelineDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IPipelineDocument[]>;
  watchPipeline(_id: string, isAdd: boolean, userId: string): void;
  removePipeline(_id: string, checked?: boolean, userId?: string): object;
  archivePipeline(_id: string, userId?: string): object;
}

export const loadPipelineClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog, createActivityLog} = dispatcher;

  class Pipeline {
    /** Get pipeline */
    public static async getPipeline(_id: string) {
      const pipeline = await models.Pipelines.findOne({ _id });

      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      return pipeline;
    }

    /** Create pipeline */
    public static async createPipeline(
      doc: IPipeline,
      stages?: IStageDocument[],
      userId?: string,
    ) {
      if (doc.numberSize) {
        doc.lastNum = await generateLastNum(models, doc);
      }

      const pipeline = await models.Pipelines.create({ ...doc, userId });

      if (stages) {
        await createOrUpdatePipelineStages(models, stages, pipeline._id);
      }

      sendDbEventLog?.({
        action: 'create',
        docId: pipeline._id,
        currentDocument: pipeline.toObject(),
      });

      return pipeline;
    }

    /** Update pipeline */
    public static async updatePipeline(
      _id: string,
      doc: IPipeline,
      stages?: IStageDocument[],
      userId?: string,
    ) {
      const prevPipeline = await models.Pipelines.getPipeline(_id);

      if (stages) {
        await createOrUpdatePipelineStages(models, stages, _id);
      }

      if (doc.numberSize) {
        if (prevPipeline.numberConfig !== doc.numberConfig) {
          doc.lastNum = await generateLastNum(models, doc);
        }
      }

      await models.Pipelines.updateOne(
        { _id },
        { $set: { ...doc, userId } },
      );

      const updatedPipeline = await models.Pipelines.getPipeline(_id);

      sendDbEventLog?.({
        action: 'update',
        docId: updatedPipeline._id,
        currentDocument: updatedPipeline.toObject(),
        prevDocument: prevPipeline.toObject(),
      });

      await generatePipelineActivityLogs(
        prevPipeline.toObject(),
        updatedPipeline.toObject(),
        models,
        createActivityLog
      );

      return updatedPipeline;
    }

    /** Update pipeline order (UNCHANGED) */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(models.Pipelines, orders);
    }

    /** Remove pipeline */
    public static async removePipeline(
      _id: string,
      checked?: boolean,
      userId?: string,
    ) {
      const pipeline = await models.Pipelines.getPipeline(_id);

      if (!checked) {
        await removePipelineStagesWithItems(models, pipeline._id);
      }

      const stages = await models.Stages.find({ pipelineId: pipeline._id });
      for (const stage of stages) {
        await models.Stages.removeStage(stage._id);
      }

      sendDbEventLog?.({
        action: 'delete',
        docId: pipeline._id,
      });

      await models.Pipelines.deleteOne({ _id });
      return pipeline;
    }

    /** Archive / unarchive pipeline */
    public static async archivePipeline(_id: string, userId?: string) {
      const pipeline = await models.Pipelines.getPipeline(_id);

      const status =
        pipeline.status === SALES_STATUSES.ACTIVE
          ? SALES_STATUSES.ARCHIVED
          : SALES_STATUSES.ACTIVE;

      await models.Pipelines.updateOne(
        { _id },
        { $set: { status, userId } },
      );

      sendDbEventLog?.({
        action: 'update',
        docId: pipeline._id,
        currentDocument: {
          ...pipeline.toObject(),
          status,
        },
        prevDocument: pipeline.toObject(),
      });
    }

    /** Watch pipeline */
    public static watchPipeline(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.Pipelines, _id, isAdd, userId);
    }
  }

  pipelineSchema.loadClass(Pipeline);
  return pipelineSchema;
};
