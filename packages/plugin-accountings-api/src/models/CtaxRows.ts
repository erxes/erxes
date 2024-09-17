import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ICtaxRow,
  ICtaxRowDocument,
  ctaxRowSchema,
} from './definitions/ctaxRow';
import { ACCOUNT_STATUSES } from './definitions/constants';

export interface ICtaxRowModel extends Model<ICtaxRowDocument> {
  getCtaxRow(selector: any): Promise<ICtaxRowDocument>;
  createCtaxRow(doc: ICtaxRow): Promise<ICtaxRowDocument>;
  updateCtaxRow(_id: string, doc: ICtaxRow): Promise<ICtaxRowDocument>;
  removeCtaxRows(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeCtaxRows(
    accountingIds: string[],
    accountingFields: ICtaxRow,
  ): Promise<ICtaxRowDocument>;
}

export const loadCtaxRowClass = (models: IModels, subdomain: string) => {
  class CtaxRow {
    /**
     *
     * Get CtaxRowing Cagegory
     */

    public static async getCtaxRow(selector: any) {
      const ctaxRow = await models.CtaxRows.findOne(selector).lean();

      if (!ctaxRow) {
        throw new Error('City tax Row not found');
      }

      return ctaxRow;
    }

    /**
     * Create a accounting
     */
    public static async createCtaxRow(doc: ICtaxRow) {
      return models.CtaxRows.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update CtaxRowing
     */
    public static async updateCtaxRow(_id: string, doc: ICtaxRow) {
      await models.CtaxRows.getCtaxRow({ _id });

      await models.CtaxRows.updateOne({ _id }, { $set: doc });

      return await models.CtaxRows.findOne({ _id }).lean();
    }

    /**
     * Remove accountings
     */
    public static async removeCtaxRows(_ids: string[]) {
      const usedIds: string[] = [];
      const unUsedIds: string[] = [];

      const usedCtaxRowIds = await models.Transactions.find({ ctaxRowId: { $in: _ids } }).distinct('ctaxRowId')
      
      for (const id of _ids) {
        if (!usedCtaxRowIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      let response = 'deleted';

      if (usedIds.length > 0) {
        await models.CtaxRows.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: ACCOUNT_STATUSES.DELETED },
          },
        );
        response = 'updated';
      }

      await models.CtaxRows.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    /**
     * Merge accountings
     */

    public static async mergeCtaxRow(
      accountingIds: string[],
      accountingFields: ICtaxRow,
    ) {
      return;
    }
  }

  ctaxRowSchema.loadClass(CtaxRow);

  return ctaxRowSchema;
};

