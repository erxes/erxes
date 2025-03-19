import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  ILoanResearch,
  ILoanResearchDocument,
} from '../../../models/definitions/loansResearch';
import { sendScoreMessage, sendXypMessage } from '../../../messageBroker';
import { salaryToResearch, scoreToResearch } from '../../../utils';

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

  /**
   * Refetch data
   */

  loansResearchRefetch: async (
    _root,
    { customerId, type }: { customerId: string; type: string },
    { models, subdomain }: IContext
  ) => {
    if (type === 'income') {
      const incomeDate = await sendXypMessage({
        subdomain,
        action: 'getCustomerData',
        data: { customerId },
        isRPC: true,
        defaultValue: null,
      });

      if (incomeDate) {
        await salaryToResearch(incomeDate, customerId, models);
      }
    }

    if (type === 'loan') {
      const loanData = await sendScoreMessage({
        subdomain,
        action: 'getCustomerScore',
        data: { customerId },
        isRPC: true,
        defaultValue: null,
      });

      if (loanData) {
        await scoreToResearch(loanData, customerId, models);
      }
    }

    const updated = await models.LoansResearch.findOne({ customerId });

    return updated;
  },
};

checkPermission(
  loanResearchMutations,
  'loansResearchAdd',
  'manageLoanResearch'
);
checkPermission(
  loanResearchMutations,
  'loansResearchEdit',
  'manageLoanResearch'
);
checkPermission(
  loanResearchMutations,
  'loansResearchRemove',
  'manageLoanResearch'
);

export default loanResearchMutations;
