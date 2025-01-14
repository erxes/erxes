import { IContext } from '../../../connectionResolver';
import {
  ILoanResearch,
  ILoanResearchDocument,
} from '../../../models/definitions/loansResearch';

const loanResearchMutations = {
  loansResearchAdd: async (_root, doc: ILoanResearch, { models }: IContext) => {
    const loanResearch = await models.LoansResearch.createLoansResearch(doc);

    return loanResearch;
  },
  /**
   * Updates a invoice
   */

  loansResearchEdit: async (
    _root,
    { _id, ...doc }: ILoanResearchDocument,
    { models }: IContext
  ) => {
    const updated = await models.LoansResearch.updateLoansResearch(_id, doc);

    return updated;
  },

  /**
   * Removes invoices
   */

  loansResearchRemove: async (
    _root,
    { loanResearchIds }: { loanResearchIds: string[] },
    { models }: IContext
  ) => {
    await models.LoansResearch.removeLoansResearches(loanResearchIds);

    return loanResearchIds;
  },
};

export default loanResearchMutations;
