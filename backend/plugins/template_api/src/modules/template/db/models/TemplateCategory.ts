import { Model, Schema } from 'mongoose';
import {
  ITemplateCategory,
  TemplateCategoryDocument,
  templateCategorySchema,
} from '../definitions/template';

export interface ITemplateCategoryModel
  extends Model<TemplateCategoryDocument> {
  getCategory(_id: string): Promise<TemplateCategoryDocument>;
  createCategory(doc: ITemplateCategory): Promise<TemplateCategoryDocument>;
  updateCategory(
    _id: string,
    doc: Partial<ITemplateCategory>,
  ): Promise<TemplateCategoryDocument>;
  removeCategory(_id: string): Promise<TemplateCategoryDocument>;
}

export class TemplateCategoryClass {
  /**
   * Get a template category by ID
   */
  public static async getCategory(this: ITemplateCategoryModel, _id: string) {
    const category = await this.findOne({ _id });

    if (!category) {
      throw new Error('Template category not found');
    }

    return category;
  }

  /**
   * Create a new template category
   */
  public static async createCategory(
    this: ITemplateCategoryModel,
    doc: ITemplateCategory,
  ) {
    const category = await this.create({
      ...doc,
      createdAt: new Date(),
      status: doc.status || 'active',
    });

    return category;
  }

  /**
   * Update an existing template category
   */
  public static async updateCategory(
    this: ITemplateCategoryModel,
    _id: string,
    doc: Partial<ITemplateCategory>,
  ) {
    await this.updateOne(
      { _id },
      {
        $set: {
          ...doc,
        },
      },
    );

    return this.getCategory(_id);
  }

  /**
   * Remove a template category
   */
  public static async removeCategory(
    this: ITemplateCategoryModel,
    _id: string,
  ) {
    const category = await this.getCategory(_id);
    await this.deleteOne({ _id });

    return category;
  }
}

export const loadTemplateCategoryClass = (
  models,
): Schema<TemplateCategoryDocument, ITemplateCategoryModel> => {
  templateCategorySchema.loadClass(TemplateCategoryClass);
  return templateCategorySchema;
};
