import { Model } from 'mongoose';
import { IFxaOwnerRecordDocument } from '../../@types/fxaOwnerRecord';
import { fxaOwnerRecordSchema } from '../definitions/fxaOwnerRecord';

export interface IFxaOwnerRecordModel extends Model<IFxaOwnerRecordDocument> {
  removeByIds(ownerRecordIds: string[]): Promise<void>;
  findByIds(ownerRecordIds: string[]): Promise<IFxaOwnerRecordDocument[]>;
  countByFilter(filter: Record<string, unknown>): Promise<number>;
  listByFilter(
    filter: Record<string, unknown>,
    page?: number,
    limit?: number,
  ): Promise<IFxaOwnerRecordDocument[]>;
}

export const loadFxaOwnerRecordClass = () => {
  class FxaOwnerRecord {
    public static async removeByIds(
      this: IFxaOwnerRecordModel,
      ownerRecordIds: string[],
    ) {
      if (!ownerRecordIds.length) {
        return;
      }

      await this.deleteMany({ _id: { $in: ownerRecordIds } });
    }

    public static async findByIds(
      this: IFxaOwnerRecordModel,
      ownerRecordIds: string[],
    ) {
      return this.find({ _id: { $in: ownerRecordIds } }).lean();
    }

    public static async countByFilter(
      this: IFxaOwnerRecordModel,
      filter: Record<string, unknown>,
    ) {
      return this.countDocuments(filter);
    }

    public static async listByFilter(
      this: IFxaOwnerRecordModel,
      filter: Record<string, unknown>,
      page = 1,
      limit = 200,
    ) {
      const perPage = Math.max(1, limit);
      const skip = Math.max(0, page - 1) * perPage;

      return this.find(filter).skip(skip).limit(perPage).lean();
    }
  }

  fxaOwnerRecordSchema.loadClass(FxaOwnerRecord);

  return fxaOwnerRecordSchema;
};
