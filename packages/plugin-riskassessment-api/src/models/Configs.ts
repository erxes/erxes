import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IRiskAssessmentsConfigsDocument,
  riskAssessmentsConfigsSchema
} from './definitions/indicator';
export interface IRiskAssessmentsConfigModel
  extends Model<IRiskAssessmentsConfigsDocument> {
  addConfig(doc): Promise<IRiskAssessmentsConfigsDocument>;
  updateConfig(_id, doc): Promise<IRiskAssessmentsConfigsDocument>;
  removeConfigs(ids: string[]): Promise<IRiskAssessmentsConfigsDocument>;
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
    !doc.groupId &&
    !doc.indicatorId &&
    !doc.customFieldId &&
    !doc.configs.some(config => config.indicatorId || config.groupId)
  ) {
    throw new Error(`Select some configration on risk assessment config`);
  }
};

export const loadRiskAssessmentsConfig = (
  models: IModels,
  subdomain: string
) => {
  class RiskAssessmentsConfigsClass {
    public static async addConfig(doc) {
      try {
        validDoc(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      return models.RiskAssessmentsConfigs.create({ ...doc });
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

      return models.RiskAssessmentsConfigs.findByIdAndUpdate(_id, {
        ...doc,
        modifiedAt: new Date()
      });
    }
    public static async removeConfigs(ids: string[]) {
      return await models.RiskAssessmentsConfigs.deleteMany({
        _id: { $in: ids }
      });
    }
  }

  riskAssessmentsConfigsSchema.loadClass(RiskAssessmentsConfigsClass);
  return riskAssessmentsConfigsSchema;
};
