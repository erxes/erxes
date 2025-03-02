import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { CDRSchema, ICallCdrDocument } from './definitions/cdr';

export interface ICdrModel extends Model<ICallCdrDocument> {}

export const loadCdrClass = (models: IModels) => {
  class Cdr {
    public static async getOperator(userId: string) {
      const operator = await models.Operators.findOne({
        userId,
      });

      return operator;
    }
  }

  CDRSchema.loadClass(Cdr);

  return CDRSchema;
};
