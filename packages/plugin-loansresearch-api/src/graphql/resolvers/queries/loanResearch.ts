import { paginate } from '@erxes/api-utils/src';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const lsQueries = {
  /**
   * loan Research for only main list
   */

  loansResearchMain: async (_root, params, { models }: IContext) => {
    return {
      list: await paginate(
        models.LoansResearch.find().sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage,
        }
      ),
      totalCount: await models.LoansResearch.find().countDocuments(),
    };
  },

  loanResearchDetail: async (
    _root,
    { dealId, customerId },
    { models }: IContext
  ) => {
    return models.LoansResearch.getLoanResearch(dealId, customerId);
  },
};

checkPermission(lsQueries, 'loansResearchMain', 'showLoanResearch');

export default lsQueries;
