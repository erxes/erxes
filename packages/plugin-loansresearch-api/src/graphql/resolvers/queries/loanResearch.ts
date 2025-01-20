import { paginate } from '@erxes/api-utils/src';
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
};

export default lsQueries;
