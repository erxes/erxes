import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IInvestment,
  IInvestmentDocument,
  investmentSchema
} from './definitions/investments';

export interface IInvestmentModel extends Model<IInvestmentDocument> {
  createInvestment(doc: IInvestment): Promise<IInvestmentDocument>;
  removeInvestment(investmentIds: string[]): Promise<IInvestmentDocument>;
  updateInvestment(_id: string, doc: IInvestment): Promise<IInvestmentDocument>;
}

export const loadInvestmentClass = (models: IModels) => {
  class Investment {
    public static async createInvestment(doc: IInvestment) {
      return models.Investments.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateInvestment(_id, doc: IInvestment) {
      await models.Investments.updateOne(
        {
          _id
        },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.Investments.findOne({ _id });
    }

    public static async removeInvestment(investmentIds) {
      return models.Investments.deleteMany({ _id: { $in: investmentIds } });
    }
  }

  investmentSchema.loadClass(Investment);

  return investmentSchema;
};
