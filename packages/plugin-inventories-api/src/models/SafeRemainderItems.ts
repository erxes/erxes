import { Model } from 'mongoose';
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
  getItem(_id: string): Promise<ISafeRemainderItemDocument>;
  getItemCount(params: IRemainderParams): Promise<Number>;
  createItem(_id: string, userId: string): Promise<ISafeRemainderItemDocument>;
  updateItem(
    _id: string,
    doc: Partial<ISafeRemainderItem>,
    userId: string
  ): Promise<ISafeRemainderItemDocument>;
  removeItem(_id: string): void;
}

export const loadSafeRemainderItemClass = (models: IModels) => {
  class SafeRemainderItem {
    /**
     * Get safe remainder item
     * @param _id Safe remainder item ID
     * @returns Found object
     */
    public static async getItem(_id: string) {
      const result: any = await models.SafeRemainderItems.findById(_id);

      if (!result) throw new Error('Safe remainder item not found!');

      return result;
    }

    /**
     * Get item count
     * @param params Filter to get safe remainder items
     * @returns Count number
     */
    public static async getItemCount(params: IRemainderParams) {
      const { productId, departmentId, branchId } = params;
      const filter: any = { productId };

      if (departmentId) filter.departmentId = departmentId;
      if (branchId) filter.branchId = branchId;

      const safeRemainderItems: any = await models.SafeRemainderItems.find(
        filter
      );

      let count: number = 0;
      for (const item of safeRemainderItems) count += item.count;

      return count;
    }

    /**
     * Create safe remainder item
     * @param doc New data to create
     * @returns Created response
     */
    public static async createItem(doc: ISafeRemainderItem, userId: string) {
      return await models.SafeRemainderItems.create({
        ...doc,
        modifiedBy: userId
      });
    }

    /**
     * Update safe remainder item
     * @param _id Safe remainder item ID
     * @param doc New data to update
     * @returns Updated object
     */
    public static async updateItem(
      _id: string,
      doc: ISafeRemainderItem,
      userId: string
    ) {
      await models.SafeRemainderItems.findByIdAndUpdate(_id, {
        $set: {
          ...doc,
          modifiedAt: new Date(),
          modifiedBy: userId
        }
      });

      return await this.getItem(_id);
    }

    /**
     * Delete safe remainder item
     * @param _id Safe remainder item ID
     * @returns Deleted response
     */
    public static async removeItem(_id: string) {
      await models.SafeRemainderItems.findByIdAndDelete(_id);
    }
  }

  safeRemainderItemSchema.loadClass(SafeRemainderItem);

  return safeRemainderItemSchema;
};
