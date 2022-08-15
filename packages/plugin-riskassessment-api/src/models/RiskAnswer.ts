import { IRiskAnswerField } from './definitions/common';
import { Model } from 'mongoose';
import { IRiskAnswerDocument, riskAnswerSchema } from './definitions/riskAnswer';
import { IModels } from '../connectionResolver';

export interface IRiskAnswerModel extends Model<IRiskAnswerDocument> {
  riskAnswers(): Promise<IRiskAnswerDocument>;
  riskAnswerAdd(params: IRiskAnswerField): Promise<IRiskAnswerDocument>;
}

export const loadRiskAnswer = (model: IModels, subdomain: string) => {
  class RiskAnswer {
    async riskAnswerAdd(params: IRiskAnswerField) {
      return 'ok';
    }
    async riskAnswers() {
      return 'ok';
    }
  }
  riskAnswerSchema.loadClass(RiskAnswer);
  return riskAnswerSchema;
};
