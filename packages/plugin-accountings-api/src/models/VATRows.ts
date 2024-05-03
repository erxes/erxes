import * as _ from 'lodash';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IVATRow,
  IVATRowDocument,
  vatRowSchema,
} from './definitions/vatRow';
import { ACCOUNT_STATUSES } from './definitions/constants';

export interface IVATRowModel extends Model<IVATRowDocument> {
  getVATRow(selector: any): Promise<IVATRowDocument>;
  createVATRow(doc: IVATRow): Promise<IVATRowDocument>;
  updateVATRow(_id: string, doc: IVATRow): Promise<IVATRowDocument>;
  removeVATRows(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeVATRows(
    accountingIds: string[],
    accountingFields: IVATRow,
  ): Promise<IVATRowDocument>;
}

export const loadVATRowClass = (models: IModels, subdomain: string) => {
  class Account {
    /**
     *
     * Get Accounting Cagegory
     */

    public static async getVATRow(selector: any) {
      const vatRow = await models.VATRows.findOne(selector).lean();

      if (!vatRow) {
        throw new Error('VAT Row not found');
      }

      return vatRow;
    }

    /**
     * Create a accounting
     */
    public static async createVATRow(doc: IVATRow) {
      return models.VATRows.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Accounting
     */
    public static async updateVATRow(_id: string, doc: IVATRow) {
      await models.VATRows.getVATRow({ _id });

      await models.VATRows.updateOne({ _id }, { $set: doc });

      return await models.VATRows.findOne({ _id }).lean();
    }

    /**
     * Remove accountings
     */
    public static async removeAccounts(_ids: string[]) {
      const usedIds: string[] = [];
      const unUsedIds: string[] = [];

      const usedAccountIds = await models.Transactions.find({ 'details.accountId': { $in: _ids } }).distinct('details.accountId')
      
      for (const id of _ids) {
        if (!usedAccountIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      let response = 'deleted';

      // TODO: check records

      if (usedIds.length > 0) {
        await models.VATRows.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: ACCOUNT_STATUSES.DELETED },
          },
        );
        response = 'updated';
      }

      await models.VATRows.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    /**
     * Merge accountings
     */

    public static async mergeAccount(
      accountingIds: string[],
      accountingFields: IVATRow,
    ) {
      return;
    }
  }

  vatRowSchema.loadClass(Account);

  return vatRowSchema;
};

