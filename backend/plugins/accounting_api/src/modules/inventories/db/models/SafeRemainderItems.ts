import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { SAFE_REMAINDER_STATUSES } from '../../@types/constants';
import {
  ISafeRemainderItemDocument,
  ISafeRemainderItem,
  IRemainderParams,
} from '../../@types/safeRemainderItems';
import { safeRemainderItemSchema } from '../definitions/safeRemainderItems';

export interface ISafeRemainderItemModel extends Model<ISafeRemainderItemDocument> {
  getItem(_id: string): Promise<ISafeRemainderItemDocument>;
  getItemCount(params: IRemainderParams): Promise<number>;
  createItem(
    doc: ISafeRemainderItem,
    userId: string,
  ): Promise<ISafeRemainderItemDocument>;
  updateItem(
    _id: string,
    doc: Partial<ISafeRemainderItem>,
    userId: string,
  ): Promise<ISafeRemainderItemDocument>;
  removeItems(ids: string[]): void;
}

export const loadSafeRemainderItemClass = (models: IModels) => {
  class SafeRemainderItem {
    /**
     * Get safe remainder item
     * @param _id Safe remainder item ID
     * @returns Found object
     */
    public static async getItem(_id: string) {
      const result = await models.SafeRemainderItems.findOne({
        _id,
      }).lean();

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
      const filter: FilterQuery<ISafeRemainderItemDocument> = { productId };

      if (departmentId) filter.departmentId = departmentId;
      if (branchId) filter.branchId = branchId;

      const safeRemainderItems = await models.SafeRemainderItems.find(filter);

      let count = 0;
      for (const item of safeRemainderItems) {
        count = count + item.count;
      }

      return count;
    }

    /**
     * Create safe remainder item
     * @param doc New data to create
     * @returns Created response
     */
    public static async createItem(doc: ISafeRemainderItem, userId: string) {
      const now = new Date();
      return await models.SafeRemainderItems.create({
        ...doc,
        createdAt: now,
        createdBy: userId,
        modifiedAt: now,
        modifiedBy: userId,
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
      doc: Partial<ISafeRemainderItem>,
      userId: string,
    ) {
      const item = await models.SafeRemainderItems.getItem(_id);
      const safeRemainder = await models.SafeRemainders.getRemainder(
        item.remainderId,
      );
      if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
        throw new Error('Cant edit cause remainder has submited');
      }

      await models.SafeRemainderItems.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
            modifiedBy: userId,
          },
        },
      );

      return await this.getItem(_id);
    }

    /**
     * Delete safe remainder item
     * @param _ids Safe remainder item IDs
     * @returns Deleted response
     */
    public static async removeItems(ids: string[]) {
      if (!ids.length) {
        return;
      }
      const remainderIds = await models.SafeRemainderItems.distinct(
        'remainderId',
        { _id: { $in: ids } },
      );
      const publishedRemainder = await models.SafeRemainders.exists({
        _id: { $in: remainderIds },
        status: SAFE_REMAINDER_STATUSES.PUBLISHED,
      });

      if (publishedRemainder) {
        throw new Error('Cant remove cause remainder has submited');
      }

      await models.SafeRemainderItems.deleteMany({ _id: { $in: ids } });
    }
  }

  safeRemainderItemSchema.loadClass(SafeRemainderItem);

  return safeRemainderItemSchema;
};
