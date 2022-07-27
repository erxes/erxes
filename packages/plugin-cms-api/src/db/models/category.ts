import { Document, Schema, Model, Connection } from 'mongoose';
import { IModels } from './index';

export interface ICategory {
  name: string;
  parentCategoryId?: string | null;
  topicId?: string | null;
}

export interface ICategoryDocument extends Document, ICategory {}

export interface ICategoryModel extends Model<ICategoryDocument> {}

export const categorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true },
  parentCategoryId: { type: String },
  topicId: { type: String }
});

export const generateCategoryModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class CategoryModel implements ICategory {
    public name: string;
  }
  categorySchema.loadClass(CategoryModel);

  models.Category = con.model<ICategoryDocument, ICategoryModel>(
    'cms-categories',
    categorySchema
  );
};
