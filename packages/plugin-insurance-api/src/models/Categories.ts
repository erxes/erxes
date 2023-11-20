import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IInsuranceCategory,
  IInsuranceCategoryDocument,
  categorySchema
} from './definitions/category';

export interface IInsuranceCategoryModel
  extends Model<IInsuranceCategoryDocument> {
  getInsuranceCategory(doc: any): IInsuranceCategoryDocument;
  createInsuranceCategory(
    doc: IInsuranceCategory,
    userId?: string
  ): IInsuranceCategoryDocument;
  updateInsuranceCategory(
    doc: IInsuranceCategory,
    userId?: string
  ): IInsuranceCategoryDocument;
}

export const loadCategoryClass = (models: IModels) => {
  class InsuranceCategory {
    public static async getInsuranceCategory(doc: any) {
      const insuranceCategory = await models.Categories.findOne(doc);

      if (!insuranceCategory) {
        throw new Error('Category not found');
      }

      return insuranceCategory;
    }

    public static async createInsuranceCategory(
      doc: IInsuranceCategory,
      userId?: string
    ) {
      return models.Categories.create({
        ...doc,
        lastModifiedBy: userId
      });
    }

    public static async updateInsuranceCategory(
      doc: IInsuranceCategoryDocument,
      userId?: string
    ) {
      await models.Categories.getInsuranceCategory({ _id: doc._id });

      const updatedDoc: any = {
        ...doc
      };

      if (userId) {
        updatedDoc.lastModifiedBy = userId;
        updatedDoc.updatedAt = new Date();
      }

      await models.Categories.updateOne({ _id: doc._id }, { $set: updatedDoc });

      return models.Categories.findOne({ _id: doc._id });
    }
  }

  categorySchema.loadClass(InsuranceCategory);

  return categorySchema;
};
