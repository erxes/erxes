import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IVatRow,
  IVatRowDocument,
  vatRowSchema,
} from './definitions/vatRow';
import { ACCOUNT_STATUSES } from './definitions/constants';

export interface IVatRowModel extends Model<IVatRowDocument> {
  getVatRow(selector: any): Promise<IVatRowDocument>;
  createVatRow(doc: IVatRow): Promise<IVatRowDocument>;
  updateVatRow(_id: string, doc: IVatRow): Promise<IVatRowDocument>;
  removeVatRows(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeVatRows(
    accountingIds: string[],
    accountingFields: IVatRow,
  ): Promise<IVatRowDocument>;
}

export const loadVatRowClass = (models: IModels, subdomain: string) => {
  class VatRow {
    /**
     *
     * Get VatRowing Cagegory
     */

    public static async getVatRow(selector: any) {
      const vatRow = await models.VatRows.findOne(selector).lean();

      if (!vatRow) {
        throw new Error('VAT Row not found');
      }

      return vatRow;
    }

    /**
     * Create a accounting
     */
    public static async createVatRow(doc: IVatRow) {
      return models.VatRows.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update VatRowing
     */
    public static async updateVatRow(_id: string, doc: IVatRow) {
      await models.VatRows.getVatRow({ _id });

      await models.VatRows.updateOne({ _id }, { $set: doc });

      return await models.VatRows.findOne({ _id }).lean();
    }

    /**
     * Remove accountings
     */
    public static async removeVatRows(_ids: string[]) {
      const usedIds: string[] = [];
      const unUsedIds: string[] = [];

      const usedVatRowIds = await models.Transactions.find({ vatRowId: { $in: _ids } }).distinct('vatRowId')

      for (const id of _ids) {
        if (!usedVatRowIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      let response = 'deleted';

      if (usedIds.length > 0) {
        await models.VatRows.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: ACCOUNT_STATUSES.DELETED },
          },
        );
        response = 'updated';
      }

      await models.VatRows.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    /**
     * Merge accountings
     */

    public static async mergeVatRow(
      accountingIds: string[],
      accountingFields: IVatRow,
    ) {
      return;
    }
  }

  vatRowSchema.loadClass(VatRow);

  return vatRowSchema;
};

