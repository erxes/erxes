import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IModels } from '../connectionResolver';
import {
  IAccount,
  IAccountDocument,
  accountSchema,
  ACCOUNT_STATUSES,
} from './definitions/account';
import {
  checkCodeMask,
} from '../maskUtils';

export interface IAccountModel extends Model<IAccountDocument> {
  getAccount(selector: any): Promise<IAccountDocument>;
  createAccount(doc: IAccount): Promise<IAccountDocument>;
  updateAccount(_id: string, doc: IAccount): Promise<IAccountDocument>;
  removeAccounts(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeAccounts(
    accountingIds: string[],
    accountingFields: IAccount,
  ): Promise<IAccountDocument>;
}

export const loadAccountClass = (models: IModels, subdomain: string) => {
  class Account {
    /**
     *
     * Get Accounting Cagegory
     */

    public static async getAccount(selector: any) {
      const accounting = await models.Accounts.findOne(selector);

      if (!accounting) {
        throw new Error('Accounting not found');
      }

      return accounting;
    }

    static async checkCodeDuplication(code: string) {
      const accounting = await models.Accounts.findOne({
        code,
        status: { $ne: ACCOUNT_STATUSES.DELETED },
      });

      if (accounting) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a accounting
     */
    public static async createAccount(doc: IAccount) {
      doc.code = doc.code
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/ /g, '');
      await this.checkCodeDuplication(doc.code);

      const category = await models.AccountCategories.getAccountCategory({
        _id: doc.categoryId,
      });

      if (!(await checkCodeMask(category, doc.code))) {
        throw new Error('Code is not validate of category mask');
      }

      return models.Accounts.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Accounting
     */
    public static async updateAccount(_id: string, doc: IAccount) {
      doc.code = doc.code
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/ /g, '');
      await this.checkCodeDuplication(doc.code);

      const category = await models.AccountCategories.getAccountCategory({
        _id: doc.categoryId,
      });

      if (!(await checkCodeMask(category, doc.code))) {
        throw new Error('Code is not validate of category mask');
      }

      await models.Accounts.updateOne({ _id }, { $set: doc });

      return await models.Accounts.findOne({ _id }).lean();
    }

    /**
     * Remove accountings
     */
    public static async removeAccounts(_ids: string[]) {
      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      // TODO: check records

      if (usedIds.length > 0) {
        await models.Accounts.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: ACCOUNT_STATUSES.DELETED },
          },
        );
        response = 'updated';
      }

      await models.Accounts.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    /**
     * Merge accountings
     */

    public static async mergeAccount(
      accountingIds: string[],
      accountingFields: IAccount,
    ) {
      const fields = ['name', 'code', 'unitPrice', 'categoryId', 'type'];

      for (const field of fields) {
        if (!accountingFields[field]) {
          throw new Error(
            `Can not merge accountings. Must choose ${field} field.`,
          );
        }
      }

      const name: string = accountingFields.name || '';
      const kind: string = accountingFields.kind || '';
      const description: string = accountingFields.description || '';
      const categoryId: string = accountingFields.categoryId || '';
      
      for (const accountingId of accountingIds) {
        const accountingObj = await models.Accounts.getAccount({
          _id: accountingId,
        });

        await models.Accounts.findByIdAndUpdate(accountingId, {
          $set: {
            status: ACCOUNT_STATUSES.DELETED,
            code: Math.random().toString().concat('^', accountingObj.code),
          },
        });
      }

      // Creating accounting with properties
      const accounting = await models.Accounts.createAccount({
        ...accountingFields,
        mergedIds: accountingIds,
        name,
        kind,
        description,
        categoryId,
      });

      return accounting;
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};

