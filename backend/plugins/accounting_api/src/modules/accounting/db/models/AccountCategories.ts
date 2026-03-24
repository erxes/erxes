import { ACCOUNT_STATUSES } from '../../@types/constants';
import { accountCategorySchema } from '../definitions/accountCategory';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IAccountCategory, IAccountCategoryDocument } from '../../@types/accountCategory';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IAccountCategoryModel extends Model<IAccountCategoryDocument> {
  getAccountCategory(selector: any): Promise<IAccountCategoryDocument>;
  createAccountCategory(
    doc: IAccountCategory,
  ): Promise<IAccountCategoryDocument>;
  updateAccountCategory(
    _id: string,
    doc: IAccountCategory,
  ): Promise<IAccountCategoryDocument>;
  removeAccountCategory(_id: string): Promise<void>;
}

export const loadAccountCategoryClass = (models: IModels, _subdomain: string, { sendDbEventLog }: EventDispatcherReturn) => {
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

      // Generating order
      doc.order = await this.generateOrder(doc, parentCategory);

      const category = await models.AccountCategories.create({ ...doc, createdAt: new Date() });

      sendDbEventLog({
        action: 'create',
        docId: category._id,
        currentDocument: category.toObject()
      });

      return category
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

      // Generating order
      doc.order = await this.generateOrder(doc, parentCategory);

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

      sendDbEventLog({
        action: 'update',
        docId: category._id,
        currentDocument: { ...category, ...doc },
        prevDocument: category.toObject(),
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

      const result = await models.AccountCategories.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: _id
      });

      return result;
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      doc: IAccountCategory,
      parentCategory?: IAccountCategory | null | undefined,
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
