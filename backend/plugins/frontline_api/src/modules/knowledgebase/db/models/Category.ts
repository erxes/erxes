import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ICategory, ICategoryDocument } from '../../@types/category';
import { categorySchema } from '../definitions/category';

export interface ICategoryCreate extends ICategory {
  userId?: string;
}

export interface ICategoryModel extends Model<ICategoryDocument> {
  getCategory(_id: string): Promise<ICategoryDocument>;
  createDoc(
    docFields: ICategoryCreate,
    userId?: string,
  ): Promise<ICategoryDocument>;
  updateDoc(
    _id: string,
    docFields: ICategoryCreate,
    userId?: string,
  ): Promise<ICategoryDocument>;
  getSubtreeIds(_id: string): Promise<string[]>;
  removeDoc(categoryId: string): Promise<void>;
}

export const loadCategoryClass = (models: IModels) => {
  class Category {
    public static async getCategory(_id: string) {
      const category = await models.Category.findOne({ _id });

      if (!category) {
        throw new Error('Knowledge base category not found');
      }

      return category;
    }

    public static async createDoc(docFields: ICategoryCreate, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const category = await models.Category.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date(),
      });

      return category;
    }

    public static async updateDoc(
      _id: string,
      docFields: ICategoryCreate,
      userId?: string,
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const current = await models.Category.getCategory(_id);
      const parentId = docFields.parentCategoryId;
      const topicId = docFields.topicId || current.topicId;
      const movesTopic = topicId !== current.topicId;

      if (parentId) {
        if (_id === parentId) {
          throw new Error('Cannot change category');
        }

        const childrenCounts = await models.Category.countDocuments({
          parentCategoryId: _id,
        });

        if (childrenCounts > 0) {
          throw new Error('Cannot change category. this is parent tag');
        }

        const parent = await models.Category.getCategory(parentId);

        if (parent.topicId !== topicId) {
          throw new Error(
            'Parent category must belong to the same knowledge base',
          );
        }
      }

      await models.Category.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            ...(movesTopic && !parentId ? { parentCategoryId: '' } : {}),
            modifiedBy: userId,
            modifiedDate: new Date(),
          },
        },
      );

      if (movesTopic) {
        const subtreeIds = await models.Category.getSubtreeIds(_id);

        await models.Category.updateMany(
          { _id: { $in: subtreeIds } },
          { $set: { topicId } },
        );

        await models.Article.updateMany(
          { categoryId: { $in: subtreeIds } },
          { $set: { topicId } },
        );
      }

      const category = await models.Category.getCategory(_id);

      return category;
    }

    public static async getSubtreeIds(_id: string) {
      const ids = [_id];

      for (let index = 0; index < ids.length; index++) {
        const children = await models.Category.find(
          { parentCategoryId: ids[index] },
          { _id: 1 },
        ).lean();

        children.forEach((child) => {
          if (!ids.includes(child._id)) {
            ids.push(child._id);
          }
        });
      }

      return ids;
    }

    public static async removeDoc(_id: string) {
      const category = await models.Category.findOne({ _id });

      if (!category) {
        throw new Error('Category not found');
      }

      await models.Category.deleteMany({
        categoryId: _id,
      });

      return models.Category.deleteOne({ _id });
    }
  }

  categorySchema.loadClass(Category);

  return categorySchema;
};
