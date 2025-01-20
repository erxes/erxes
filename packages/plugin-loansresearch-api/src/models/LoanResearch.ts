import {
  ILoanResearch,
  ILoanResearchDocument,
  configSchema,
} from './definitions/loansResearch';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface ILoansResearchModel extends Model<ILoanResearchDocument> {
  createLoansResearch(doc: ILoanResearch);
  updateLoansResearch(_id: string, doc: ILoanResearch);
  removeLoansResearches(_ids: string[]);
}

export const loadLoansResearchClass = (models: IModels) => {
  class LoanResearch {
    /**
     * Create a Loans Research
     */
    public static async createLoansResearch(doc: ILoanResearch) {
      return models.LoansResearch.create(doc);
    }

    /**
     * Update Loans Research
     */
    public static async updateLoansResearch(
      _id: string,
      doc: ILoanResearchDocument
    ) {
      await models.LoansResearch.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.LoansResearch.findOne({ _id });
    }

    /**
     * Remove Loans Research
     */
    public static async removeLoansResearches(_ids: string[]) {
      return models.LoansResearch.deleteMany({ _id: { $in: _ids } });
    }
  }

  configSchema.loadClass(LoanResearch);

  return configSchema;
};
