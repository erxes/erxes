import * as moment from 'moment';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  checkCodeMask,
} from '../maskUtils';
import {
  IAccount,
  IAccountDocument,
  accountSchema,
} from './definitions/account';
import { ACCOUNT_STATUSES } from './definitions/constants';

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
      const accounting = await models.Accounts.findOne(selector).lean();

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

      if (doc.parentId) {
        const parentAccount = await models.Accounts.getAccount({ _id: doc.parentId })

        const re = new RegExp(`^${parentAccount.code}.*`)
        if (!re.test(doc.code)) {
          throw new Error('Code is not validate of parent account');
        }
        doc.categoryId = parentAccount.categoryId;
        doc.currency = parentAccount.currency;
        doc.kind = parentAccount.kind;
        doc.journal = parentAccount.journal;
        doc.status = parentAccount.status;
      }

      if (!(await checkCodeMask(category, doc.code))) {
        throw new Error('Code is not validate of category mask');
      }

      return models.Accounts.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Accounting
     */
    public static async updateAccount(_id: string, doc: IAccount) {
      const account = await models.Accounts.getAccount({ _id });


      doc.code = doc.code
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/ /g, '');

      if (account.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

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

      const usedAccountIds = await models.Transactions.find({ 'details.accountId': { $in: _ids } }).distinct('details.accountId')

      for (const id of _ids) {
        if (!usedAccountIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      let response = 'deleted';

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
      const description: string = accountingFields.description ?? '';
      const categoryId: string = accountingFields.categoryId ?? '';

      for (const accountingId of accountingIds) {
        const accountingObj = await models.Accounts.getAccount({
          _id: accountingId,
        });

        await models.Accounts.findByIdAndUpdate(accountingId, {
          $set: {
            status: ACCOUNT_STATUSES.DELETED,
            code: moment(new Date).format('"yyyy-MM-dd HH:mm').toString().concat('^', accountingObj.code),
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

