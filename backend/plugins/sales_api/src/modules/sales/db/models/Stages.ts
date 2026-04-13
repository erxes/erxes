import { IOrderInput } from 'erxes-api-shared/core-types';
import { sendTRPCMessage, updateOrder } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IStage, IStageDocument } from '../../@types';
import { removeStageItems } from '~/modules/sales/graphql/resolvers/utils';
import { stageSchema } from '../definitions/stages';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IStageModel extends Model<IStageDocument> {
  getStage(_id: string): Promise<IStageDocument>;
  createStage(doc: IStage, userId?: string): Promise<IStageDocument>;
  updateStage(
    _id: string,
    doc: IStage,
    userId?: string,
  ): Promise<IStageDocument>;
  removeStage(_id: string): Promise<IStageDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IStageDocument[]>;
  checkCodeDuplication(code: string, _id?: string): Promise<void>;
}

export const loadStageClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  class Stage {
    public static async getStage(_id: string) {
      const stage = await models.Stages.findOne({ _id });
      if (!stage) throw new Error('Stage not found');
      return stage;
    }

    public static async checkCodeDuplication(code: string, _id?: string) {
      const filter: any = { code };
      if (_id) filter._id = { $ne: _id };

      const stage = await models.Stages.findOne(filter);
      if (stage) throw new Error('Code must be unique');
    }

    public static async createStage(doc: IStage, userId?: string) {
      if (doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const stage = await models.Stages.create({ ...doc, userId });

      sendDbEventLog?.({
        action: 'create',
        docId: stage._id,
        currentDocument: stage.toObject(),
      });

      return stage;
    }

    public static async updateStage(_id: string, doc: IStage, userId?: string) {
      const prevStage = await models.Stages.findOne({ _id });
      if (!prevStage) throw new Error('Stage not found');

      if (doc.code) {
        await this.checkCodeDuplication(doc.code, _id);
      }

      await models.Stages.updateOne({ _id }, { $set: { ...doc, userId } });

      const updatedStage = await models.Stages.findOne({ _id });
      if (!updatedStage) throw new Error('Stage not found after update');

      sendDbEventLog?.({
        action: 'update',
        docId: updatedStage._id,
        currentDocument: updatedStage.toObject(),
        prevDocument: prevStage.toObject(),
      });

      return updatedStage;
    }

    public static async updateOrder(orders: IOrderInput[]) {
      const stagesBefore = await models.Stages.find({
        _id: { $in: orders.map((o) => o._id) },
      }).lean();

      const result = await updateOrder(models.Stages, orders);

      for (const order of orders) {
        const prev = stagesBefore.find((s) => s._id.toString() === order._id);
        if (prev && prev.order !== order.order) {
          sendDbEventLog?.({
            action: 'update',
            docId: order._id,
          });
        }
      }

      return result;
    }

    public static async removeStage(_id: string) {
      const stage = await models.Stages.getStage(_id);

      sendDbEventLog?.({
        action: 'delete',
        docId: stage._id,
      });

      await removeStageItems(models, _id);

      if (stage.formId) {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'forms',
          action: 'removeForm',
          input: { formId: stage.formId },
        });
      }

      await models.Stages.deleteOne({ _id });
      return stage;
    }
  }

  stageSchema.loadClass(Stage);
  return stageSchema;
};
