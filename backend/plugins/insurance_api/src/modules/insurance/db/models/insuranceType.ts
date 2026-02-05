import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { insuranceTypeSchema } from '@/insurance/db/definitions/insuranceType';
import { IInsuranceTypeDocument } from '@/insurance/@types/insuranceType';

export type IInsuranceTypeModel = Model<IInsuranceTypeDocument>;

export const loadInsuranceTypeClass = (_models: IModels) => {
  void _models;
  class InsuranceType {}

  insuranceTypeSchema.loadClass(InsuranceType);

  return insuranceTypeSchema;
};
