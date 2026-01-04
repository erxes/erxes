import { IOrderInput } from 'erxes-api-shared/core-types';
import { sendTRPCMessage, updateOrder } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IStage, IStageDocument } from '../../@types';
import { removeStageItems } from '~/modules/sales/graphql/resolvers/utils';
import { stageSchema } from '../definitions/stages';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { generateStageActivityLogs } from '~/utils/activityLogs';

export interface IStageModel extends Model<IStageDocument> {
  getStage(_id: string): Promise<IStageDocument>;
  createStage(doc: IStage, userId?: string): Promise<IStageDocument>;
  removeStage(_id: string): Promise<IStageDocument>;
  updateStage(
    _id: string,
    doc: IStage,
    userId?: string,
  ): Promise<IStageDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IStageDocument[]>;
  checkCodeDuplication(code: string): string;
}

export const loadStageClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class Stage {
    /*
     * Get a stage
     */
    public static async getStage(_id: string) {
      const stage = await models.Stages.findOne({ _id });

      if (!stage) {
        throw new Error('Stage not found');
      }

      return stage;
    }

    static async checkCodeDuplication(code: string) {
      const stage = await models.Stages.findOne({
        code,
      });

      if (stage) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a stage
     */
    public static async createStage(doc: IStage, userId?: string) {
      if (doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const stage = await models.Stages.create({
        ...doc,
        userId,
      });

      // Send database event log
      sendDbEventLog({
        action: 'create',
        docId: stage._id,
        currentDocument: stage.toObject(),
      });

      // Create activity log
      createActivityLog({
        activityType: 'create',
        target: {
          _id: stage._id,
          moduleName: 'sales',
          collectionName: 'stages',
        },
        action: {
          type: 'create',
          description: 'Stage created',
        },
        changes: {
          name: stage.name,
          pipelineId: stage.pipelineId,
          type: stage.type,
          createdAt: new Date(),
        },
        metadata: {
          pipelineId: stage.pipelineId,
          userId,
        },
      });

      return stage;
    }

    /**
     * Update Stage
     */
    public static async updateStage(
      _id: string,
      doc: IStage,
      userId?: string,
    ) {
      const prevStage = await models.Stages.findOne({ _id });

      if (!prevStage) {
        throw new Error('Stage not found');
      }

      if (doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      await models.Stages.updateOne(
        { _id },
        { $set: { ...doc, userId } },
      );

      const updatedStage = await models.Stages.findOne({ _id });

      if (!updatedStage) {
        throw new Error('Stage not found after update');
      }

      // Send database event log
      sendDbEventLog({
        action: 'update',
        docId: updatedStage._id,
        currentDocument: updatedStage.toObject(),
        prevDocument: prevStage.toObject(),
      });

      // Generate activity logs for changed fields
      await generateStageActivityLogs(
        prevStage.toObject(),
        updatedStage.toObject(),
        models,
        createActivityLog,
      );

      return updatedStage;

    }

    /*
     * Update given stages orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      const stagesBeforeUpdate = await models.Stages.find({
        _id: { $in: orders.map((order) => order._id) },
      }).lean();

      const result = await updateOrder(models.Stages, orders);

      // Create activity logs for order changes
      for (const order of orders) {
        const stageBefore = stagesBeforeUpdate.find((s) => s._id === order._id);
        if (stageBefore && stageBefore.order !== order.order) {
          createActivityLog({
            activityType: 'reorder',
            target: {
              _id: order._id,
              moduleName: 'sales',
              collectionName: 'stages',
            },
            action: {
              type: 'reorder',
              description: 'Stage order changed',
            },
            changes: {
              order: {
                from: stageBefore.order,
                to: order.order,
              },
              reorderedAt: new Date(),
            },
            metadata: {
              pipelineId: stageBefore.pipelineId,
              userId: stageBefore.userId,
            },
          });
        }
      }

      return result;
    }

    public static async removeStage(_id: string) {
      const stage = await models.Stages.getStage(_id);

      // Send database event log before deletion
      sendDbEventLog({
        action: 'delete',
        docId: stage._id,
      });

      // Create activity log
      createActivityLog({
        activityType: 'delete',
        target: {
          _id: stage._id,
          moduleName: 'sales',
          collectionName: 'stages',
        },
        action: {
          type: 'delete',
          description: 'Stage deleted',
        },
        changes: {
          name: stage.name,
          pipelineId: stage.pipelineId,
          deletedAt: new Date(),
        },
        metadata: {
          pipelineId: stage.pipelineId,
          userId: stage.userId,
        },
      });

      await removeStageItems(models, _id);

      if (stage.formId) {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'forms',
          action: 'removeForm',
          input: {
            formId: stage.formId,
          },
        });
      }

      await models.Stages.deleteOne({ _id });

      return stage;
    }
  }

  stageSchema.loadClass(Stage);

  return stageSchema;
};