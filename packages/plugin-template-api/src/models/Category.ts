import { Model } from 'mongoose';
import {
  ITemplateCategory,
  TemplateCategoryDocument,
  templateCategorySchema
} from './definitions/templates';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IModels } from '../connectionResolver';

type ITemplateCategoryDocument = Omit<
  ITemplateCategory,
  '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export interface ITemplateCategoryModal
  extends Model<TemplateCategoryDocument> {
  getTemplateCategory(_id: string): Promise<TemplateCategoryDocument>;
  createTemplateCategory(
    doc: ITemplateCategoryDocument,
    user?: any
  ): Promise<TemplateCategoryDocument>;
  updateTemplateCategory(
    _id: string,
    doc: ITemplateCategoryDocument,
    user?: any
  ): Promise<TemplateCategoryDocument>;
  removeTemplateCategory(_id: string): Promise<void>;
}

export const loadTemplateCategoryClass = (models: IModels) => {
  class Category {
    /*
     * Get a template category
     */

    public static async getTemplateCategory(_id: string) {
      const category = await models.TemplateCategories.findOne({ _id }).lean();

      if (!category) {
        throw new Error('Template category not found');
      }

      return category;
    }

    /*
     * Create a new template category
     */

    public static async createTemplateCategory(
      doc: ITemplateCategoryDocument,
      user?: any
    ) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await models.TemplateCategories.findOne({
        _id: doc.parentId
      }).lean();

      const order = await this.generateOrder(parentCategory, doc);
      return await models.TemplateCategories.create({
        ...doc,
        order,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?._id
      });
    }

    /*
     * Update a template category
     */

    public static async updateTemplateCategory(
      _id: string,
      doc: ITemplateCategoryDocument,
      user?: any
    ) {
      const { code, parentId } = doc;

      const category = await models.TemplateCategories.findOne({ _id });

      if (!category) {
        throw new Error('Template category not found');
      }

      if (category.code !== code) {
        await this.checkCodeDuplication(code);
      }

      const parentCategory = await models.TemplateCategories.findOne({
        _id: parentId
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      const childCategories = await models.TemplateCategories.find({
        $and: [
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: { $ne: _id } }
        ]
      });

      const updatedCategory = await models.TemplateCategories.findOneAndUpdate(
        { _id },
        {
          ...doc,
          updatedAt: new Date(),
          updatedBy: user?._id
        },
        { new: true }
      );

      childCategories.forEach(async ({ _id, order }) => {
        // let order = childCategory.order;

        order = order.replace(category.order, doc.order);

        await models.TemplateCategories.updateOne({ _id }, { $set: { order } });
      });

      return updatedCategory;
    }

    /*
     * Remove a template category
     */

    public static async removeTemplateCategory(_id: string) {
      const category = await models.TemplateCategories.findOneAndDelete({
        _id
      });

      if (!category) {
        throw new Error(`Template category not found with id ${_id}`);
      }

      return category;
    }

    /*
     * check duplication
     */
    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.TemplateCategories.findOne({
        code
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }

    /*
     * Generating order
     */
    public static async generateOrder(
      parentCategory: ITemplateCategoryDocument | null | undefined,
      doc: ITemplateCategoryDocument
    ) {
      return parentCategory
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;
    }
  }

  templateCategorySchema.loadClass(Category);

  return templateCategorySchema;
};
