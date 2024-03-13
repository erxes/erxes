import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IModels } from '../connectionResolver';
import {
  IAccount,
  IAccountCategory,
  IAccountCategoryDocument,
  IAccountDocument,
  accountCategorySchema,
  accountSchema,
  ACCOUNT_STATUSES,
} from './definitions/accounts';
import {
  checkCodeMask,
} from '../maskUtils';
import { escapeRegExp } from '@erxes/api-utils/src/core';

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

export interface IAccountCategoryModel extends Model<IAccountCategoryDocument> {
  getAccountCategory(selector: any): Promise<IAccountCategoryDocument>;
  createAccountCategory(
    doc: IAccountCategory,
  ): Promise<IAccountCategoryDocument>;
  updateAccountCategory(
    _id: string,
    doc: IAccountCategory,
  ): Promise<IAccountCategoryDocument>;
  removeAccountCategory(_id: string): void;
}

export const loadAccountCategoryClass = (models: IModels) => {
  class AccountingCategory {
    /**
     *
     * Get Accounting Cagegory
     */

    public static async getAccountCategory(selector: any) {
      const accountingCategory =
        await models.AccountCategories.findOne(selector);

      if (!accountingCategory) {
        throw new Error('Accounting & service category not found');
      }

      return accountingCategory;
    }

    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.AccountCategories.findOne({
        code,
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a accounting categorys
     */
    public static async createAccountCategory(doc: IAccountCategory) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await models.AccountCategories.findOne({
        _id: doc.parentId,
      }).lean();

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.AccountCategories.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Accounting category
     */
    public static async updateAccountCategory(
      _id: string,
      doc: IAccountCategory,
    ) {
      const category = await models.AccountCategories.getAccountCategory({
        _id,
      });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await models.AccountCategories.findOne({
        _id: doc.parentId,
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const childCategories = await models.AccountCategories.find({
        $and: [
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: { $ne: _id } },
        ],
      });

      await models.AccountCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async (childCategory) => {
        let order = childCategory.order;

        order = order.replace(category.order, doc.order);

        await models.AccountCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } },
        );
      });

      return models.AccountCategories.findOne({ _id });
    }

    /**
     * Remove Accounting category
     */
    public static async removeAccountCategory(_id: string) {
      await models.AccountCategories.getAccountCategory({ _id });

      let count = await models.Accounts.countDocuments({
        categoryId: _id,
        status: { $ne: ACCOUNT_STATUSES.DELETED },
      });
      count += await models.AccountCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a accounting category");
      }

      return models.AccountCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IAccountCategory,
      doc: IAccountCategory,
    ) {
      const order = parentCategory
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;

      return order;
    }
  }

  accountCategorySchema.loadClass(AccountingCategory);

  return accountCategorySchema;
};
