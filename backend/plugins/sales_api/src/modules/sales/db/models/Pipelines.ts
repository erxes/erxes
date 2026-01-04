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
  removePipeline(_id: string, checked?: boolean): Promise<any>;
  archivePipeline(_id: string, userId?: string): Promise<any>;
}

export const loadPipelineClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class Pipeline {
    /*
     * Get a pipeline
     */
    public static async getPipeline(_id: string) {
      const pipeline = await models.Pipelines.findOne({ _id }).lean();

      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      return pipeline;
    }

    /**
     * Create a pipeline
     */
    public static async createPipeline(
      doc: IPipeline,
      stages?: IStageDocument[],
      userId?: string,
    ) {
      if (doc.numberSize) {
        doc.lastNum = await generateLastNum(models, doc);
      }

      const pipeline = await models.Pipelines.create({
        ...doc,
        userId,
      });

      // Send database event log
      sendDbEventLog({
        action: 'create',
        docId: pipeline._id,
        currentDocument: pipeline.toObject(),
      });

      // Create activity log
      createActivityLog({
        activityType: 'create',
        target: {
          _id: pipeline._id,
          moduleName: 'sales',
          collectionName: 'pipelines',
        },
        action: {
          type: 'create',
          description: 'Pipeline created',
        },
        changes: {
          name: pipeline.name,
          boardId: pipeline.boardId,
          type: pipeline.type,
          status: pipeline.status,
          createdAt: new Date(),
        },
        metadata: {
          boardId: pipeline.boardId,
          userId,
        },
      });

      if (stages) {
        await createOrUpdatePipelineStages(models, stages, pipeline._id);
      }

      return pipeline;
    }

    /**
     * Update a pipeline
     */
    public static async updatePipeline(
      _id: string,
      doc: IPipeline,
      stages?: IStageDocument[],
      userId?: string,
    ) {
      const prevPipeline = await models.Pipelines.findOne({ _id });

      if (!prevPipeline) {
        throw new Error('Pipeline not found');
      }

      if (stages) {
        await createOrUpdatePipelineStages(models, stages, _id);
      }

      if (doc.numberSize) {
        const pipeline = await models.Pipelines.getPipeline(_id);

        if (pipeline.numberConfig !== doc.numberConfig) {
          doc.lastNum = await generateLastNum(models, doc);
        }
      }

      await models.Pipelines.updateOne(
        { _id },
        { $set: { ...doc, userId } },
      );

      const updatedPipeline = await models.Pipelines.findOne({ _id });

      if (!updatedPipeline) {
        throw new Error('Pipeline not found after update');
      }

      // Send database event log
      sendDbEventLog({
        action: 'update',
        docId: updatedPipeline._id,
        currentDocument: updatedPipeline.toObject(),
        prevDocument: prevPipeline.toObject(),
      });

      // Generate activity logs for changed fields
      await generatePipelineActivityLogs(
        prevPipeline.toObject(),
        updatedPipeline.toObject(),
        models,
        createActivityLog,
      );

      return updatedPipeline;

    }

    /*
     * Update given pipelines orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      const pipelinesBeforeUpdate = await models.Pipelines.find({
        _id: { $in: orders.map((order) => order._id) },
      }).lean();

      const result = await updateOrder(models.Pipelines, orders);

      // Create activity logs for order changes
      for (const order of orders) {
        const pipelineBefore = pipelinesBeforeUpdate.find(
          (p) => p._id.toString() === order._id,
        );
        if (pipelineBefore && pipelineBefore.order !== order.order) {
          createActivityLog({
            activityType: 'reorder',
            target: {
              _id: order._id,
              moduleName: 'sales',
              collectionName: 'pipelines',
            },
            action: {
              type: 'reorder',
              description: 'Pipeline order changed',
            },
            changes: {
              order: {
                from: pipelineBefore.order,
                to: order.order,
              },
              reorderedAt: new Date(),
            },
            metadata: {
              boardId: pipelineBefore.boardId,
              userId: pipelineBefore.userId,
            },
          });
        }
      }

      return result;
    }

    /**
     * Remove a pipeline
     */
    public static async removePipeline(_id: string, checked?: boolean) {
      const pipeline = await models.Pipelines.getPipeline(_id);

      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      // Send database event log before deletion
      sendDbEventLog({
        action: 'delete',
        docId: pipeline._id,
      });

      // Create activity log for pipeline deletion
      createActivityLog({
        activityType: 'delete',
        target: {
          _id: pipeline._id,
          moduleName: 'sales',
          collectionName: 'pipelines',
        },
        action: {
          type: 'delete',
          description: 'Pipeline deleted',
        },
        changes: {
          name: pipeline.name,
          boardId: pipeline.boardId,
          deletedAt: new Date(),
        },
        metadata: {
          boardId: pipeline.boardId,
          userId: pipeline.userId,
        },
      });

      if (!checked) {
        await removePipelineStagesWithItems(models, pipeline._id);
      }

      const stages = await models.Stages.find({ pipelineId: pipeline._id });

      for (const stage of stages) {
        await models.Stages.removeStage(stage._id);
      }

      await models.Pipelines.deleteOne({ _id });

      return pipeline;
    }

    /**
     * Archive a pipeline
     */
    public static async archivePipeline(_id: string, userId?: string) {
      const pipeline = await models.Pipelines.getPipeline(_id);
      const status =
        pipeline.status === SALES_STATUSES.ACTIVE
          ? SALES_STATUSES.ARCHIVED
          : SALES_STATUSES.ACTIVE;

      const prevStatus = pipeline.status;

      await models.Pipelines.updateOne(
        { _id },
        { $set: { status, userId } },
      );

      const updatedPipeline = await models.Pipelines.findOne({ _id }).lean();

      if (updatedPipeline) {
        // Send database event log
        sendDbEventLog({
          action: 'update',
          docId: updatedPipeline._id,
          currentDocument: updatedPipeline,
          prevDocument: pipeline,
        });

        // Create activity log for archive/unarchive
        createActivityLog({
          activityType: 'archive',
          target: {
            _id: updatedPipeline._id,
            moduleName: 'sales',
            collectionName: 'pipelines',
          },
          action: {
            type: status === SALES_STATUSES.ARCHIVED ? 'archive' : 'unarchive',
            description:
              status === SALES_STATUSES.ARCHIVED
                ? 'Pipeline archived'
                : 'Pipeline unarchived',
          },
          changes: {
            status: {
              from: prevStatus,
              to: status,
            },
            changedAt: new Date(),
          },
          metadata: {
            boardId: updatedPipeline.boardId,
            userId,
          },
        });
      }

      return updatedPipeline;
    }

    public static watchPipeline(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.Pipelines, _id, isAdd, userId);
    }
  }

  pipelineSchema.loadClass(Pipeline);

  return pipelineSchema;
};