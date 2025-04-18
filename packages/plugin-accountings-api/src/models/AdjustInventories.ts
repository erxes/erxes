import { Model, connection } from 'mongoose';
import { IModels } from '../connectionResolver';
import { adjustInventoriesSchema, IAdjustInventory, IAdjustInventoryDocument, adjustInvDetailsSchema, IAdjustInvDetail, IAdjustInvDetailDocument, ADJ_INV_STATUSES } from './definitions/adjustInventory';
import { getFullDate } from '@erxes/api-utils/src';

export interface IAdjustInventoriesModel extends Model<IAdjustInventoryDocument> {
  getAdjustInventory(_id: string): Promise<IAdjustInventoryDocument>;
  createAdjustInventory(doc: IAdjustInventory): Promise<IAdjustInventory>;
  updateAdjustInventory(_id: string, doc: IAdjustInventory): Promise<IAdjustInventory>;
  removeAdjustInventory(_id: string): Promise<string>;
}

export const loadAdjustInventoriesClass = (models: IModels, subdomain: string) => {
  class AdjustInventories {
    public static async getAdjustInventory(_id: string) {
      const adjusting = await models.AdjustInventories.findOne({ _id }).lean();
      if (!adjusting) {
        throw new Error('Accounting not found');
      }
      return adjusting;
    }

    public static async createAdjustInventory(doc: IAdjustInventory) {
      doc.date = getFullDate(doc.date)
      return models.AdjustInventories.create({ ...doc, createdAt: new Date() });
    }

    public static async updateAdjustInventory(_id: string, doc: IAdjustInventory) {
      const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
      await models.AdjustInventories.updateOne({ _id }, { $set: { ...doc, modifiedAt: new Date() } });
      return await models.AdjustInventories.getAdjustInventory(_id);
    }

    public static async removeAdjustInventory(_id: string) {
      return await models.AdjustInventories.deleteOne({ _id });
    }
  }

  adjustInventoriesSchema.loadClass(AdjustInventories);

  return adjustInventoriesSchema;
};

export interface IAdjustInvDetailsModel extends Model<IAdjustInvDetailDocument> {
  getAdjustInvDetail(args: {
    productId: string, accountId: string, departmentId: string, branchId: string, adjustId?: string
  }): Promise<IAdjustInvDetailDocument>;
}

export const loadAdjustInvDetailsClass = (models: IModels, subdomain: string) => {
  class AdjustInvDetails {
    public static async getAdjustInvDetail({ productId, accountId, departmentId, branchId, adjustId }: { productId: string, accountId: string, departmentId: string, branchId: string, adjustId?: string }) {
      if (!adjustId) {
        const lastAdjust = await models.AdjustInventories.findOne({ status: ADJ_INV_STATUSES.PUBLISH }).sort({ date: -1 }).lean();
        if (!lastAdjust) {
          return {};
        }
        adjustId = lastAdjust._id;
      }

      return await models.AdjustInvDetails.findOne({ adjustId, productId, accountId, departmentId, branchId }).lean() || {};
    }
  }

  adjustInvDetailsSchema.loadClass(AdjustInvDetails);
  return adjustInvDetailsSchema;

}