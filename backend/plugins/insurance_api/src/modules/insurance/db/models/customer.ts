import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ICustomerDocument } from '@/insurance/@types/customer';
import { customerSchema } from '../definitions/customer';

export type ICustomerModel = Model<ICustomerDocument>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadCustomerClass = (_models: IModels) => {
  class Customer {}

  customerSchema.loadClass(Customer);

  return customerSchema;
};
