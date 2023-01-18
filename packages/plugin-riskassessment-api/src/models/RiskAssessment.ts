import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IRiskAssessmentsDocument,
  IRiskAssessmentIndicatorsDocument,
  IRiskAssessmentIndicatorFormsDocument,
  riskAssessmentsSchema,
  riskAssessmentIndicatorsSchema,
  riskAssessmentIndicatorFormsSchema
} from './definitions/riskassessment';
export interface IRiskAssessmentsModel extends Model<IRiskAssessmentsDocument> {
  addRiskAssessment(params): Promise<IRiskAssessmentsDocument>;
}

export const loadRiskAssessments = (models: IModels, subdomain: string) => {
  class RiskAssessment {
    public static async addRiskAssessment(params) {
      const {
        riskIndicatorIds,
        branchIds,
        departmentIds,
        operationIds
      } = params;

      const riskAssessment = await models.RiskAssessments.create({
        indicatorIds: riskIndicatorIds,
        branchIds,
        departmentIds,
        operationIds
      });

      const indicators = await models.RiskIndicators.find({
        _id: { $in: riskIndicatorIds }
      });
      console.log({ indicators });
      for (const indicator of indicators) {
        const { _id, forms } = indicator;
        const assessmentIndicators = await models.RiskAssessmentIndicators.create(
          { assessmentId: riskAssessment._id, indicatorId: _id }
        );
        for (const form of forms || []) {
          await models.RiskAssessmentIndicatorForms.create({
            assessmentId: riskAssessment._id,
            indicatorId: assessmentIndicators._id,
            formId: form.formId
          });
        }
      }
      return riskAssessment;
    }
  }
  riskAssessmentsSchema.loadClass(RiskAssessment);
  return riskAssessmentsSchema;
};

export interface IRiskAssessmentIndicatorsModel
  extends Model<IRiskAssessmentIndicatorsDocument> {
  addIndicator(): Promise<IRiskAssessmentIndicatorsDocument>;
  updateIndicator(): Promise<IRiskAssessmentIndicatorsDocument>;
}

export const loadRiskAssessmentIndicator = (
  models: IModels,
  subdomain: string
) => {
  class RiskAssessmentIndicator {
    public static async addIndicator() {
      return '';
    }
    public static async updateIndicator() {
      return '';
    }
  }
  riskAssessmentIndicatorsSchema.loadClass(RiskAssessmentIndicator);
  return riskAssessmentIndicatorsSchema;
};
export interface IRiskAssessmentIndicatorFormsModel
  extends Model<IRiskAssessmentIndicatorFormsDocument> {
  addIndicator(): Promise<IRiskAssessmentIndicatorFormsDocument>;
  updateIndicator(): Promise<IRiskAssessmentIndicatorFormsDocument>;
}

export const loadRiskAssessmentIndicatorForms = (
  models: IModels,
  subdomain: string
) => {
  class RiskAssessmentIndicatorForms {
    public static async addIndicator() {
      return '';
    }
    public static async updateIndicator() {
      return '';
    }
  }
  riskAssessmentIndicatorFormsSchema.loadClass(RiskAssessmentIndicatorForms);
  return riskAssessmentIndicatorFormsSchema;
};
