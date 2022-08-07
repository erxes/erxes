import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IRemainderParams } from './definitions/remainders';
import {
  ISafeRemainderItem,
  ISafeRemainderItemDocument,
  safeRemainderItemSchema
} from './definitions/safeRemainderItems';

export interface ISafeRemainderItemModel
  extends Model<ISafeRemainderItemDocument> {
  getItem(params: IRemainderParams): Promise<Number>;
  getItemObject(_id: string): Promise<ISafeRemainderItemDocument>;
  createItem(doc: ISafeRemainderItem): Promise<ISafeRemainderItemDocument>;
  updateItem(
    _id: string,
    doc: ISafeRemainderItem
  ): Promise<ISafeRemainderItemDocument>;
  removeItem(_id: string): void;
}

export const loadSafeRemainderItemClass = (models: IModels) => {
  class SafeRemainderItem {
    public static async getItem(params: IRemainderParams) {
      const { productId, departmentId, branchId } = params;
      const filter: any = { productId };

      if (departmentId) {
        filter.departmentId = departmentId;
      }

      if (branchId) {
        filter.branchId = branchId;
      }

      const result = await models.SafeRemainderItems.find(filter);

      let remainderItem = 0;
      for (const item of result) {
        remainderItem = remainderItem + item.count;
      }

      return remainderItem;
    }
    /**
     * Get a safe remainder item
     */
    public static async getItemObject(_id: string) {
      const result = await models.SafeRemainderItems.findOne({ _id });

      if (!result) {
        return new Error('Remainder Item not found');
      }

      return result;
    }

    /**
     * Create a remItem
     */
    public static async createItem(doc: ISafeRemainderItem) {
      return await models.SafeRemainderItems.create({
        ...doc,
        createdAt: new Date()
      });
    }

    /**
     * Update RemItem
     */
    public static async updateItem(_id: string, doc: ISafeRemainderItem) {
      await models.SafeRemainderItems.getItemObject(_id);
      await models.SafeRemainderItems.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.SafeRemainderItems.getItemObject(_id);

      return updated;
    }

    /**
     * Remove RemItem
     */
    public static async removeItem(_id: string) {
      await models.SafeRemainderItems.getItemObject(_id);
      return models.SafeRemainderItems.deleteOne({ _id });
    }
  }

  safeRemainderItemSchema.loadClass(SafeRemainderItem);

  return safeRemainderItemSchema;
};
