import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { riskTypeSchema } from '@/insurance/db/definitions/riskType';
import { IRiskTypeDocument } from '@/insurance/@types/riskType';

export type IRiskTypeModel = Model<IRiskTypeDocument>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadRiskTypeClass = (_models: IModels) => {
  class RiskType {}

  riskTypeSchema.loadClass(RiskType);

  return riskTypeSchema;
};
