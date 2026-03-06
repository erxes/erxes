import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { riskTypeSchema } from '@/insurance/db/definitions/riskType';
import { IRiskTypeDocument } from '@/insurance/@types/riskType';

export type IRiskTypeModel = Model<IRiskTypeDocument>;

export const loadRiskTypeClass = (_models: IModels) => {
  void _models;
  class RiskType {}

  riskTypeSchema.loadClass(RiskType);

  return riskTypeSchema;
};
