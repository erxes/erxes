import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ICustomerDocument } from '@/insurance/@types/customer';
import { customerSchema } from '../definitions/customer';

export type ICustomerModel = Model<ICustomerDocument>;

export const loadCustomerClass = (_models: IModels) => {
  void _models;
  class Customer {}

  customerSchema.loadClass(Customer);

  return customerSchema;
};
