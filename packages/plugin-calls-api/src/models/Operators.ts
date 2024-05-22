import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { IOperatorDocuments, operatorSchema } from './definitions/operators';

export interface IOperatorModel extends Model<IOperatorDocuments> {
  getOperator(userId: string): Promise<IOperatorDocuments>;
  updateOperator(userId: string, status: string): Promise<IOperatorDocuments>;
}

export const loadOperatorClass = (models: IModels) => {
  class Operator {
    public static async getOperator(userId: string) {
      const operator = await models.Operators.findOne({
        userId,
      });

      return operator;
    }
    public static async updateOperator(userId: string, status: string) {
      const operator = await models.Operators.updateOne(
        { userId: userId },
        { $set: { status: status } },
      );

      return operator;
    }
  }
  operatorSchema.loadClass(Operator);

  return operatorSchema;
};
