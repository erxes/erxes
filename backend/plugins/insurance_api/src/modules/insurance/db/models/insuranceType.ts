import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { insuranceTypeSchema } from '@/insurance/db/definitions/insuranceType';
import { IInsuranceTypeDocument } from '@/insurance/@types/insuranceType';

export type IInsuranceTypeModel = Model<IInsuranceTypeDocument>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadInsuranceTypeClass = (_models: IModels) => {
  class InsuranceType {}

  insuranceTypeSchema.loadClass(InsuranceType);

  return insuranceTypeSchema;
};
