import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { IOperatorDocuments, operatorSchema } from './definitions/operators';

export interface IOperatorModel extends Model<IOperatorDocuments> {}

export const loadCustomerClass = (models: IModels) => {
  class Operator {}
  operatorSchema.loadClass(Operator);

  return operatorSchema;
};
