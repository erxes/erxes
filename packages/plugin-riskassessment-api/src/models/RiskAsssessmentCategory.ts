import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IRiskAssessmentCategoryField } from './definitions/common';
import { IRiskAssessmentCategoryDocument, riskAssessmentCategorySchema } from './definitions/riskassessment';

export interface IRiskAssessmentCategoryModel extends Model<IRiskAssessmentCategoryDocument> {
  addAssessmentCategory(params: IRiskAssessmentCategoryField): Promise<IRiskAssessmentCategoryDocument>;
  getAssessmentCategory(): Promise<IRiskAssessmentCategoryDocument>;
}

export const loadAssessmentCategory = (models: IModels, subdomain: string) => {
  class AssessmentClass {
    public static addAssessmentCategory = (params: IRiskAssessmentCategoryField) => {
      if (!params) {
        throw new Error('please type the assessment category fields');
      }

      const result = models.RiskAssessmentCategory.create({ ...params });
      return result;
    };

    public static getAssessmentCategory = () => {
      return models.RiskAssessmentCategory.find();
    };
  }
  riskAssessmentCategorySchema.loadClass(AssessmentClass);
  return riskAssessmentCategorySchema;
};
