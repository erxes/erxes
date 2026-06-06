import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITemplateCategory, ITemplateCategoryDocument } from '../../@types';
import { templateCategorySchema } from '../definitions/category';

export interface ITemplateCategoryModal extends Model<ITemplateCategoryDocument> {
  getTemplateCategory(_id: string): Promise<ITemplateCategoryDocument>;
  createTemplateCategory(
    category: ITemplateCategory,
    user: IUserDocument,
  ): Promise<ITemplateCategoryDocument>;
  updateTemplateCategory(
    _id: string,
    category: ITemplateCategory,
    user: IUserDocument,
  ): Promise<ITemplateCategoryDocument>;
  removeTemplateCategory(_ids: string[]): Promise<void>;
}

export const loadTemplateCategoryClass = (models: IModels) => {
  class Category {
    public static async getTemplateCategory(_id: string) {
      const category = await models.TemplateCategory.findOne({ _id }).lean();

      if (!category) {
        throw new Error('Template Category not found');
      }

      return category;
    }

    public static async createTemplateCategory(
      category: ITemplateCategory,
      user: IUserDocument,
    ) {
      await this.validateTemplateCategory({ category });

      return await models.TemplateCategory.create({
        ...category,
        createdBy: user._id,
      });
    }

    public static async updateTemplateCategory(
      _id: string,
      category: ITemplateCategory,
      user: IUserDocument,
    ) {
      await this.validateTemplateCategory({ _id, category });

      return await models.TemplateCategory.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...category,
            updatedBy: user?._id,
          },
        },
        { new: true },
      );
    }

    public static async removeTemplateCategory(_ids: string[]) {
      return models.TemplateCategory.deleteMany({
        _id: { $in: _ids },
      });
    }

    public static async validateTemplateCategory({
      _id,
      category,
    }: {
      _id?: string;
      category: ITemplateCategory;
    }) {
      const { code = '', parentId } = category || {};

      if (code) {
        if (code.includes('/')) {
          throw new Error('The "/" character is not allowed in the code');
        }

        const category = await models.TemplateCategory.findOne({ code }).lean();

        if (category) {
          throw new Error('Code must be unique');
        }
      }

      if (parentId && _id) {
        const category = await models.TemplateCategory.findOne({
          parentId,
        }).lean();

        if (_id === category?.parentId) {
          throw new Error('Cannot change category');
        }
      }
    }
  }

  templateCategorySchema.loadClass(Category);

  return templateCategorySchema;
};
