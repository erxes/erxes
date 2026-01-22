import { ICategoryDocument } from '../../@types/category';
import { ICategory } from '../../@types/category';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { categorySchema } from '../definitions/category';

export interface ICategoryCreate extends ICategory {
    userId?: string;
  }
  
  export interface ICategoryModel extends Model<ICategoryDocument> {
    getCategory(_id: string): Promise<ICategoryDocument>;
    createDoc(
      docFields: ICategoryCreate,
      userId?: string
    ): Promise<ICategoryDocument>;
    updateDoc(
      _id: string,
      docFields: ICategoryCreate,
      userId?: string
    ): Promise<ICategoryDocument>;
    removeDoc(categoryId: string): void;
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
          modifiedDate: new Date()
        });
  
        return category;
      }

      public static async updateDoc(
        _id: string,
        docFields: ICategoryCreate,
        userId?: string
      ) {
        if (!userId) {
          throw new Error('userId must be supplied');
        }
  
        const parentId = docFields.parentCategoryId;
  
        if (parentId) {
          if (_id === parentId) {
            throw new Error('Cannot change category');
          }
  
          const childrenCounts = await models.Category.countDocuments({
            parentCategoryId: _id
          });
  
          if (childrenCounts > 0) {
            throw new Error('Cannot change category. this is parent tag');
          }
        }
  
        await models.Category.updateOne(
          { _id },
          {
            $set: {
              ...docFields,
              modifiedBy: userId,
              modifiedDate: new Date()
            }
          }
        );
  
        const category = await models.Category.getCategory(_id);
  
        return category;
      }

      public static async removeDoc(_id: string) {
        const category = await models.Category.findOne({ _id });
  
        if (!category) {
          throw new Error('Category not found');
        }
  
        await models.Category.deleteMany({
          categoryId: _id
        });
  
        return models.Category.deleteOne({ _id });
      }
    }
  
    categorySchema.loadClass(Category);
  
    return categorySchema;
  };