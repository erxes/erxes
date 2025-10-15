import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import { ICallOperatorDocuments } from '@/integrations/call/@types/operators';
import { operatorSchema } from '@/integrations/call/db/definitions/operators';

export interface ICallOperatorModel extends Model<ICallOperatorDocuments> {
  getOperator(userId: string): Promise<ICallOperatorDocuments>;
  updateOperator(
    userId: string,
    status: string,
  ): Promise<ICallOperatorDocuments>;
}

export const loadCallOperatorClass = (models: IModels) => {
  class Operator {
    public static async getOperator(userId: string) {
      const operator = await models.CallOperators.findOne({
        userId,
      });

      return operator;
    }
    public static async updateOperator(userId: string, status: string) {
      const operator = await models.CallOperators.findOneAndUpdate(
        { userId: userId },
        { $set: { status: status } },
        { new: true },
      );
      return operator;
    }
  }
  operatorSchema.loadClass(Operator);

  return operatorSchema;
};
