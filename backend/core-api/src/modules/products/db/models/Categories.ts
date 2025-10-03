import { PRODUCT_STATUSES } from '@/products/constants';
import { productCategorySchema } from '@/products/db/definitions/categories';
import {
  IProductCategory,
  IProductCategoryDocument,
} from 'erxes-api-shared/core-types';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IProductCategoryModel extends Model<IProductCategoryDocument> {
  getProductCategory(selector: any): Promise<IProductCategoryDocument>;
  createProductCategory(
    doc: IProductCategory,
  ): Promise<IProductCategoryDocument>;
  updateProductCategory(
    _id: string,
    doc: IProductCategory,
  ): Promise<IProductCategoryDocument>;
  removeProductCategory(_id: string): Promise<IProductCategoryDocument>;
  getChildCategories(
    categoryIds: string[],
  ): Promise<IProductCategoryDocument[]>;
}

export const loadProductCategoryClass = (models: IModels) => {
  class ProductCategory {
    /**
     * Get Product Category
     */
    public static async getProductCategory(selector: any) {
      const productCategory = await models.ProductCategories.findOne(selector);

      if (!productCategory) {
        throw new Error('Product & service category not found');
      }

      return productCategory;
    }

    /**
     * Get child cagegories
     */
    public static async getChildCategories(categoryIds: string[]) {
      if (!categoryIds.length) {
        return [];
      }

      const categories = await models.ProductCategories.find({
        _id: { $in: categoryIds },
      }).lean();

      if (!categories.length) {
        return [];
      }

      const orderQry: any[] = [];
      for (const category of categories) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
        });
      }

      return await models.ProductCategories.find({
        status: { $nin: ['disabled', 'archived'] },
        $or: orderQry,
      })
        .sort({ order: 1 })
        .lean();
    }

    /**
     * Create a product categorys
     */
    public static async createProductCategory(doc: IProductCategory) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await models.ProductCategories.findOne({
        _id: doc.parentId,
      }).lean();

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.ProductCategories.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Product category
     */
    public static async updateProductCategory(
      _id: string,
      doc: IProductCategory,
    ) {
      const category = await models.ProductCategories.getProductCategory({
        _id,
      });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await models.ProductCategories.findOne({
        _id: doc.parentId,
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const childCategories = await models.ProductCategories.find({
        $and: [
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: { $ne: _id } },
        ],
      });

      await models.ProductCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      for (const childCategory of childCategories) {
        let order = childCategory.order;
        order = order.replace(category.order, doc.order);

        await models.ProductCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } },
        );
      }

      return models.ProductCategories.findOne({ _id });
    }

    /**
     * Remove Product category
     */
    public static async removeProductCategory(_id: string) {
      await models.ProductCategories.getProductCategory({ _id });

      let count = await models.Products.countDocuments({
        categoryId: _id,
        status: { $ne: PRODUCT_STATUSES.DELETED },
      });

      count += await models.ProductCategories.countDocuments({
        parentId: _id,
      });

      if (count > 0) {
        throw new Error("Can't remove a product category");
      }

      return await models.ProductCategories.deleteOne({ _id });
    }

    /**
     * Check category duplication
     */
    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.ProductCategories.findOne({
        code,
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IProductCategory | null | undefined,
      doc: IProductCategory,
    ) {
      const order = parentCategory
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;

      return order;
    }
  }

  productCategorySchema.loadClass(ProductCategory);

  return productCategorySchema;
};
