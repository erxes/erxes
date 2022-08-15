import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IRiskConfirmityField } from './definitions/common';
import { IRiskConfirmityDocument, riskConfirmitySchema } from './definitions/riskConfimity';

export interface IRiskConfirmityModel extends Model<IRiskConfirmityDocument> {
  riskConfirmities(): Promise<IRiskConfirmityDocument>;
  riskConfirmyAdd(params: IRiskConfirmityField): Promise<IRiskConfirmityDocument>;
}

export const loadRiskConfirmity = (model: IModels, subdomain: string) => {
  class RiskConfimity {
    async riskConfirmyAdd(params: IRiskConfirmityField) {
      return model.RiskConfimity.create({ ...params });
    }
    async riskConfirmities() {
      return 'ok';
    }
  }
  riskConfirmitySchema.loadClass(RiskConfimity);
  return riskConfirmitySchema;
};
