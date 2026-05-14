import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IContractDocument } from '@/insurance/@types/contract';
import { insuranceContractSchema } from '@/insurance/db/definitions/contract';

export type IContractModel = Model<IContractDocument>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadContractClass = (_models: IModels) => {
  class Contract {}

  insuranceContractSchema.loadClass(Contract);

  return insuranceContractSchema;
};
