import { paginate } from '@erxes/api-utils/src';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IRiskAssessmentsConfigDocument,
  riskAssessmentConfigsSchema
} from './definitions/riskassessment';
export interface IRiskAssessmentsConfigModel
  extends Model<IRiskAssessmentsConfigDocument> {
  addConfig(doc): Promise<IRiskAssessmentsConfigDocument>;
  updateConfig(_id, doc): Promise<IRiskAssessmentsConfigDocument>;
  removeConfigs(ids: string[]): Promise<IRiskAssessmentsConfigDocument>;
}

const validDoc = doc => {
  if (!doc.boardId) {
    throw new Error(`Cannot provide risk assessment config without a boardId`);
  }
  if (!doc.pipelineId) {
    throw new Error(
      `Cannot provide risk assessment config without a pipelineId`
    );
  }

  if (
    !doc.riskAssessmentId &&
    !doc.customFieldId &&
    !doc.configs.some(config => config.riskAssessmentId)
  ) {
    throw new Error(`Select some configration on risk assessment config`);
  }
};

export const loadRiskAssessmentConfig = (
  models: IModels,
  subdomain: string
) => {
  class RiskAssessmentConfigsClass {
    public static async addConfig(doc) {
      try {
        validDoc(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      return models.RiskAssessmentConfigs.create({ ...doc });
    }

    public static async updateConfig(_id: string, doc) {
      try {
        validDoc(doc);
      } catch (e) {
        throw new Error(e.message);
      }
      if (!_id) {
        throw new Error(
          'Cannot update risk assessment configuration without id'
        );
      }

      return models.RiskAssessmentConfigs.findByIdAndUpdate(_id, {
        ...doc,
        modifiedAt: new Date()
      });
    }
    public static async removeConfigs(ids: string[]) {
      return await models.RiskAssessmentConfigs.deleteMany({
        _id: { $in: ids }
      });
    }
  }

  riskAssessmentConfigsSchema.loadClass(RiskAssessmentConfigsClass);
  return riskAssessmentConfigsSchema;
};
