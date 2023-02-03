import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IRiskIndicatorsConfigsDocument,
  riskIndicatorConfigsSchema
} from './definitions/indicator';
export interface IRiskIndicatorsConfigModel
  extends Model<IRiskIndicatorsConfigsDocument> {
  addConfig(doc): Promise<IRiskIndicatorsConfigsDocument>;
  updateConfig(_id, doc): Promise<IRiskIndicatorsConfigsDocument>;
  removeConfigs(ids: string[]): Promise<IRiskIndicatorsConfigsDocument>;
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
    !doc.indicatorsGroupId &&
    !doc.riskIndicatorId &&
    !doc.customFieldId &&
    !doc.configs.some(config => config.riskIndicatorId)
  ) {
    throw new Error(`Select some configration on risk assessment config`);
  }
};

export const loadRiskIndicatorConfig = (models: IModels, subdomain: string) => {
  class RiskIndicatorConfigsClass {
    public static async addConfig(doc) {
      try {
        validDoc(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      return models.RiskIndicatorConfigs.create({ ...doc });
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

      return models.RiskIndicatorConfigs.findByIdAndUpdate(_id, {
        ...doc,
        modifiedAt: new Date()
      });
    }
    public static async removeConfigs(ids: string[]) {
      return await models.RiskIndicatorConfigs.deleteMany({
        _id: { $in: ids }
      });
    }
  }

  riskIndicatorConfigsSchema.loadClass(RiskIndicatorConfigsClass);
  return riskIndicatorConfigsSchema;
};
