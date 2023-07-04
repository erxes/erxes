import { ICustomField, IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IModels } from '../connectionResolver';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendFormsMessage
} from '../messageBroker';
import {
  IAccount,
  IAccountCategory,
  IAccountCategoryDocument,
  IAccountDocument,
  accountCategorySchema,
  accountSchema,
  ACCOUNT_STATUSES
} from './definitions/accounts';

export interface IAccountModel extends Model<IAccountDocument> {
  getAccount(selector: any): Promise<IAccountDocument>;
  createAccount(doc: IAccount): Promise<IAccountDocument>;
  updateAccount(_id: string, doc: IAccount): Promise<IAccountDocument>;
  removeAccounts(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeAccounts(
    accountIds: string[],
    accountFields: IAccount
  ): Promise<IAccountDocument>;
}

export const loadAccountClass = (models: IModels, subdomain: string) => {
  class Account {
    /**
     *
     * Get Account Cagegory
     */
    public static async getAccount(selector: any) {
      const account = await models.Accounts.findOne(selector);

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    }

    static async checkCodeDuplication(code: string) {
      const account = await models.Accounts.findOne({
        code,
        status: { $ne: ACCOUNT_STATUSES.DELETED }
      });

      if (account) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a account
     */
    public static async createAccount(doc: IAccount) {
      await this.checkCodeDuplication(doc.code);

      if (doc.categoryCode) {
        const category = await models.AccountCategories.getAccountCatogery({
          code: doc.categoryCode
        });
        doc.categoryId = category._id;
      }

      return models.Accounts.create(doc);
    }

    /**
     * Update Account
     */
    public static async updateAccount(_id: string, doc: IAccount) {
      const account = await models.Accounts.getAccount({ _id });

      if (account.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      await models.Accounts.updateOne({ _id }, { $set: doc });

      return await models.Accounts.findOne({ _id }).lean();
    }

    /**
     * Remove accounts
     */
    public static async removeAccounts(_ids: string[]) {
      const dealAccountIds = await sendCardsMessage({
        subdomain,
        action: 'findDealAccountIds',
        data: {
          _ids
        },
        isRPC: true,
        defaultValue: []
      });

      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      for (const id of _ids) {
        if (!dealAccountIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      if (usedIds.length > 0) {
        await models.Accounts.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: ACCOUNT_STATUSES.DELETED }
          }
        );
        response = 'updated';
      }

      await models.Accounts.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    /**
     * Merge accounts
     */

    public static async mergeAccounts(
      accountIds: string[],
      accountFields: IAccount
    ) {
      const fields = ['name', 'code', 'unitPrice', 'categoryId', 'type'];

      for (const field of fields) {
        if (!accountFields[field]) {
          throw new Error(
            `Can not merge accounts. Must choose ${field} field.`
          );
        }
      }

      const name: string = accountFields.name || '';
      const type: string = accountFields.type || '';

      const categoryId: string = accountFields.categoryId || '';
      const usedIds: string[] = [];

      for (const accountId of accountIds) {
        const accountObj = await models.Accounts.getAccount({ _id: accountId });

        await models.Accounts.findByIdAndUpdate(accountId, {
          $set: {
            status: ACCOUNT_STATUSES.DELETED,
            code: Math.random()
              .toString()
              .concat('^', accountObj.code)
          }
        });
      }

      // Creating account with properties
      const account = await models.Accounts.createAccount({
        ...accountFields,
        name,
        type,
        categoryId
      });

      const dealAccountIds = await sendCardsMessage({
        subdomain,
        action: 'findDealAccountIds',
        data: {
          _ids: accountIds
        },
        isRPC: true
      });

      for (const deal of dealAccountIds) {
        if (accountIds.includes(deal)) {
          usedIds.push(deal);
        }
      }

      await sendCardsMessage({
        subdomain,
        action: 'deals.updateMany',
        data: {
          selector: {
            'accountsData.accountId': { $in: usedIds }
          },
          modifier: {
            $set: { 'accountsData.$.accountId': account._id }
          }
        },
        isRPC: true
      });

      return account;
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};

export interface IAccountCategoryModel extends Model<IAccountCategoryDocument> {
  getAccountCatogery(selector: any): Promise<IAccountCategoryDocument>;
  createAccountCategory(
    doc: IAccountCategory
  ): Promise<IAccountCategoryDocument>;
  updateAccountCategory(
    _id: string,
    doc: IAccountCategory
  ): Promise<IAccountCategoryDocument>;
  removeAccountCategory(_id: string): void;
}

export const loadAccountCategoryClass = (models: IModels) => {
  class AccountCategory {
    /**
     *
     * Get Account Cagegory
     */

    public static async getAccountCatogery(selector: any) {
      const accountCategory = await models.AccountCategories.findOne(selector);

      if (!accountCategory) {
        throw new Error('Account category not found');
      }

      return accountCategory;
    }

    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.AccountCategories.findOne({
        code
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a account categorys
     */
    public static async createAccountCategory(doc: IAccountCategory) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await models.AccountCategories.findOne({
        _id: doc.parentId
      }).lean();

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.AccountCategories.create(doc);
    }

    /**
     * Update Account category
     */
    public static async updateAccountCategory(
      _id: string,
      doc: IAccountCategory
    ) {
      const category = await models.AccountCategories.getAccountCatogery({
        _id
      });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await models.AccountCategories.findOne({
        _id: doc.parentId
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const accountCategory = await models.AccountCategories.getAccountCatogery(
        {
          _id
        }
      );

      const childCategories = await models.AccountCategories.find({
        $and: [
          { order: { $regex: new RegExp(accountCategory.order, 'i') } },
          { _id: { $ne: _id } }
        ]
      });

      await models.AccountCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async childCategory => {
        let order = childCategory.order;

        order = order.replace(accountCategory.order, doc.order);

        await models.AccountCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } }
        );
      });

      return models.AccountCategories.findOne({ _id });
    }

    /**
     * Remove Account category
     */
    public static async removeAccountCategory(_id: string) {
      await models.AccountCategories.getAccountCatogery({ _id });

      let count = await models.Accounts.countDocuments({
        categoryId: _id,
        status: { $ne: ACCOUNT_STATUSES.DELETED }
      });
      count += await models.AccountCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a account category");
      }

      return models.AccountCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IAccountCategory,
      doc: IAccountCategory
    ) {
      const order = parentCategory
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;

      return order;
    }
  }

  accountCategorySchema.loadClass(AccountCategory);

  return accountCategorySchema;
};
