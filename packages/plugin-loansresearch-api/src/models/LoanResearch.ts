import {
  ILoanResearch,
  ILoanResearchDocument,
  loanResearchSchema,
} from './definitions/loansResearch';
import { Model, FilterQuery } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface ILoansResearchModel extends Model<ILoanResearchDocument> {
  getLoanResearch(selector: FilterQuery<ILoanResearchDocument>);
  createLoansResearch(doc: ILoanResearch);
  updateLoansResearch(_id: string, doc: ILoanResearch);
  removeLoansResearches(_ids: string[]);
}

export const loadLoansResearchClass = (models: IModels) => {
  class LoanResearch {
    public static async getLoanResearch(
      selector: FilterQuery<ILoanResearchDocument>
    ) {
      const loanResearch = await models.LoansResearch.findOne(selector);

      if (!loanResearch) {
        throw new Error('Loan Research not found');
      }

      return loanResearch;
    }

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

  loanResearchSchema.loadClass(LoanResearch);

  return loanResearchSchema;
};
