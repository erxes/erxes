import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IContractDocument } from '@/insurance/@types/contract';
import { insuranceContractSchema } from '@/insurance/db/definitions/contract';

export type IContractModel = Model<IContractDocument>;

export const loadContractClass = (_models: IModels) => {
  void _models;
  class Contract {}

  insuranceContractSchema.loadClass(Contract);

  return insuranceContractSchema;
};
